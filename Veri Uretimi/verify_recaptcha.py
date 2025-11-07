import json
import logging
import os
import smtplib
import time
from email.message import EmailMessage
from secrets import SystemRandom
from typing import Optional

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from twilio.base.exceptions import TwilioException
from twilio.rest import Client

# Load configuration from .env early so module-level constants are populated.
load_dotenv()

# --------------------------------------------------------------------------------------
# Flask setup
# --------------------------------------------------------------------------------------
app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}},
    supports_credentials=True,
)

# --------------------------------------------------------------------------------------
# Logging
# --------------------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def error_response(message: str, status: int = 400, *, reason: Optional[str] = None):
    payload = {"success": False, "message": message}
    if reason:
        payload["reason"] = reason
    return jsonify(payload), status


def success_response(message: str, **extra):
    payload = {"success": True, "message": message}
    if extra:
        payload.update(extra)
    return jsonify(payload)


# --------------------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------------------
RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET")
SUBSCRIBERS_FILE = os.getenv("SUBSCRIBERS_FILE", "aboneler.json")
CODE_TTL_SECONDS = int(os.getenv("CODE_TTL_SECONDS", "600"))

# SMTP configuration
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
EMAIL_CONFIGURED = all([SMTP_SERVER, SMTP_USER, SMTP_PASS])

# Twilio configuration
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_FROM")
SMS_CONFIGURED = all([TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM])

logger.info(
    "Configuration loaded | reCAPTCHA=%s SMTP=%s Twilio=%s",
    bool(RECAPTCHA_SECRET),
    EMAIL_CONFIGURED,
    SMS_CONFIGURED,
)

# In-memory store for verification codes. For production consider Redis or a database.
verification_codes = {}
secure_random = SystemRandom()


# --------------------------------------------------------------------------------------
# Helper utilities
# --------------------------------------------------------------------------------------
def generate_code() -> str:
    return f"{secure_random.randint(0, 999_999):06d}"


def mask_identifier(identifier: str) -> str:
    if not identifier:
        return ""
    if "@" in identifier:
        local, _, domain = identifier.partition("@")
        return f"{local[:2]}***@{domain}"
    return f"{identifier[:2]}***{identifier[-2:]}"


def cleanup_expired_codes() -> None:
    now = time.time()
    expired = [key for key, record in verification_codes.items() if now > record["expires_at"]]
    for key in expired:
        logger.info("Removing expired verification code for %s", mask_identifier(key))
        verification_codes.pop(key, None)


def ensure_subscribers_file() -> None:
    if not os.path.exists(SUBSCRIBERS_FILE):
        with open(SUBSCRIBERS_FILE, "w", encoding="utf-8") as handle:
            json.dump([], handle, indent=2)
        logger.info("Created subscriber store at %s", SUBSCRIBERS_FILE)


def load_subscribers() -> list:
    ensure_subscribers_file()
    with open(SUBSCRIBERS_FILE, "r", encoding="utf-8") as handle:
        try:
            data = json.load(handle)
        except json.JSONDecodeError:
            logger.warning("Subscriber file corrupted, resetting store.")
            data = []
    if not isinstance(data, list):
        logger.warning("Unexpected subscriber data shape, resetting store.")
        data = []
    normalized = []
    for entry in data:
        if isinstance(entry, dict):
            normalized.append(
                {
                    "email": (entry.get("email") or "").strip(),
                    "phone": (entry.get("phone") or "").strip(),
                }
            )
        elif isinstance(entry, str):
            normalized.append({"email": entry.strip(), "phone": ""})
    return normalized


def write_subscribers(subscribers: list) -> None:
    with open(SUBSCRIBERS_FILE, "w", encoding="utf-8") as handle:
        json.dump(subscribers, handle, indent=2, ensure_ascii=True)


def save_subscriber(email: str, phone: str) -> None:
    subscribers = load_subscribers()
    email = (email or "").strip()
    phone = (phone or "").strip()
    for entry in subscribers:
        if email and entry.get("email") == email:
            logger.info("Subscriber %s already stored.", mask_identifier(email))
            return
        if phone and entry.get("phone") == phone:
            logger.info("Subscriber %s already stored.", mask_identifier(phone))
            return
    subscribers.append({"email": email, "phone": phone})
    write_subscribers(subscribers)
    logger.info("Persisted subscriber email=%s phone=%s", mask_identifier(email), mask_identifier(phone))


def send_email_code(recipient: str, code: str) -> None:
    if not EMAIL_CONFIGURED:
        raise RuntimeError("SMTP credentials are not fully configured.")
    message = EmailMessage()
    message["Subject"] = "Your verification code"
    message["From"] = SMTP_USER
    message["To"] = recipient
    message.set_content(
        f"Your verification code is: {code}\n\n"
        "This code will expire in 10 minutes. If you did not request it, please ignore this email."
    )
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASS)
        smtp.send_message(message)
    logger.info("Sent verification email to %s", mask_identifier(recipient))


def send_sms_code(recipient: str, code: str) -> None:
    if not SMS_CONFIGURED:
        raise RuntimeError("Twilio credentials are not fully configured.")
    client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=f"Your verification code is: {code}. It expires in 10 minutes.",
        from_=TWILIO_FROM,
        to=recipient,
    )
    logger.info("Sent verification SMS to %s", mask_identifier(recipient))


def build_identifier(email: str, phone: str) -> tuple[str, str]:
    email = (email or "").strip()
    phone = (phone or "").strip()
    if email and phone:
        return email, "email"
    if email:
        return email, "email"
    if phone:
        return phone, "sms"
    raise ValueError("Either email or phone must be provided.")


# --------------------------------------------------------------------------------------
# Error handling
# --------------------------------------------------------------------------------------
@app.errorhandler(Exception)
def handle_unhandled_exception(error):
    logger.exception("Unhandled exception: %s", error)
    return error_response("Unexpected server error", status=500, reason="unhandled_exception")


# --------------------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------------------
@app.route("/verify-recaptcha", methods=["POST"])
def verify_recaptcha():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    if not token:
        return error_response("No token provided", status=400, reason="missing_token")

    if not RECAPTCHA_SECRET:
        logger.warning("RECAPTCHA_SECRET is not configured.")
        return error_response("Server configuration error", status=500, reason="recaptcha_not_configured")

    verify_url = "https://www.google.com/recaptcha/api/siteverify"
    payload = {"secret": RECAPTCHA_SECRET, "response": token}

    try:
        response = requests.post(verify_url, data=payload, timeout=10)
        response.raise_for_status()
        result = response.json()
    except requests.RequestException as exc:
        logger.exception("Error verifying reCAPTCHA: %s", exc)
        return error_response("Server error", status=500, reason="recaptcha_request_failed")

    if result.get("success"):
        logger.info("reCAPTCHA verification succeeded.")
        return success_response("reCAPTCHA verified")
    logger.info("reCAPTCHA verification failed: %s", result)
    return error_response("Verification failed", status=400, reason="recaptcha_failed")


@app.route("/send-code", methods=["POST"])
def send_code():
    try:
        cleanup_expired_codes()
        data = request.get_json(silent=True) or {}
        email = data.get("email")
        phone = data.get("phone")
        try:
            identifier, channel = build_identifier(email, phone)
        except ValueError as exc:
            return error_response(str(exc), status=400, reason="invalid_contact")

        code = generate_code()
        record = {
            "code": code,
            "email": (email or "").strip(),
            "phone": (phone or "").strip(),
            "channel": channel,
            "timestamp": time.time(),
            "expires_at": time.time() + CODE_TTL_SECONDS,
        }

        try:
            if channel == "email":
                if not EMAIL_CONFIGURED:
                    logger.error("SMTP credentials missing while sending to %s", mask_identifier(identifier))
                    return error_response("Email delivery is not configured on the server", status=500, reason="smtp_not_configured")
                send_email_code(identifier, code)
            else:
                if not SMS_CONFIGURED:
                    logger.error("Twilio credentials missing while sending to %s", mask_identifier(identifier))
                    return error_response("SMS delivery is not configured on the server", status=500, reason="sms_not_configured")
                send_sms_code(identifier, code)
        except (RuntimeError, smtplib.SMTPException, TwilioException, Exception) as exc:
            logger.exception("Failed to deliver verification code to %s: %s", mask_identifier(identifier), exc)
            return error_response("Failed to send verification code", status=502, reason="delivery_failed")

        verification_codes[identifier] = record
        logger.info("Verification code generated for %s via %s", mask_identifier(identifier), channel)
        return success_response("Verification code sent")
    except Exception as exc:
        logger.exception("Unexpected error in /send-code: %s", exc)
        return error_response("Unexpected server error while sending the code", status=500, reason="send_code_exception")


@app.route("/verify-code", methods=["POST"])
def verify_code():
    try:
        cleanup_expired_codes()
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip()
        phone = (data.get("phone") or "").strip()
        code = (data.get("code") or "").strip()

        if not code:
            return error_response("Verification code is required", status=400, reason="missing_code")

        try:
            identifier, _ = build_identifier(email, phone)
        except ValueError as exc:
            return error_response(str(exc), status=400, reason="invalid_contact")

        record = verification_codes.get(identifier)
        if not record:
            logger.info("Verification attempt without pending code for %s", mask_identifier(identifier))
            return error_response("No active verification code for this contact", status=400, reason="code_not_found")

        if time.time() > record["expires_at"]:
            logger.info("Verification code expired for %s", mask_identifier(identifier))
            verification_codes.pop(identifier, None)
            return error_response("Verification code expired", status=400, reason="code_expired")

        if record["code"] != code:
            logger.info("Invalid verification code submitted for %s", mask_identifier(identifier))
            return error_response("Invalid verification code", status=400, reason="code_mismatch")

        save_subscriber(record.get("email"), record.get("phone"))
        verification_codes.pop(identifier, None)
        logger.info("Verification complete for %s", mask_identifier(identifier))
        return success_response("Verification successful")
    except Exception as exc:
        logger.exception("Unexpected error in /verify-code: %s", exc)
        return error_response("Unexpected server error while verifying the code", status=500, reason="verify_code_exception")


@app.route("/get-subscribers", methods=["GET"])
def get_subscribers():
    subscribers = load_subscribers()
    return success_response("Subscribers fetched", subscribers=subscribers)


# --------------------------------------------------------------------------------------
# Entry point
# --------------------------------------------------------------------------------------
def run_app():
    preferred_port = int(os.getenv("PORT", "5000"))
    fallback_port = 5001 if preferred_port == 5000 else 5000
    try:
        app.run(host="127.0.0.1", port=preferred_port)
    except OSError as exc:
        if getattr(exc, "errno", None) != 98:
            raise
        logger.warning("Port %s in use, falling back to %s", preferred_port, fallback_port)
        app.run(host="127.0.0.1", port=fallback_port)


if __name__ == "__main__":
    run_app()
