import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Genişletilmiş CORS (localhost, 127.0.0.1, yerel ağ)
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.101:3000",
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // ✅ Express 5 uyumlu preflight

app.use(express.json());

// ✅ Kod geçerlilik süresi (10 dk)
const CODE_TTL_MS = Number(process.env.CODE_TTL_MS || 10 * 60 * 1000);
const codes = new Map();

// ✅ Abone dosyası
const SUBSCRIBERS_FILE = path.join(__dirname, "aboneler.json");

const loadSubscribers = () => {
  try {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) return [];
    const raw = fs.readFileSync(SUBSCRIBERS_FILE, "utf8");
    return JSON.parse(raw) || [];
  } catch (error) {
    console.error("⚠️ Abone dosyası okunamadı:", error);
    return [];
  }
};

const persistSubscribers = (subscribers) => {
  try {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), "utf8");
  } catch (error) {
    console.error("⚠️ Abone dosyası kaydedilemedi:", error);
  }
};

const buildKey = (email, phone) => {
  const trimmedEmail = (email || "").trim().toLowerCase();
  const trimmedPhone = (phone || "").trim();
  if (trimmedEmail) return { key: `email:${trimmedEmail}`, channel: "email", email: trimmedEmail };
  if (trimmedPhone) return { key: `phone:${trimmedPhone}`, channel: "sms", phone: trimmedPhone };
  throw new Error("Either email or phone must be provided.");
};

const mask = (id) =>
  id?.includes("@")
    ? `${id.slice(0, 2)}***@${id.split("@")[1]}`
    : `${id?.slice(0, 2)}***${id?.slice(-2)}`;

// ✅ SMTP yapılandırması (Gmail TLS)
const EMAIL_CONFIGURED = process.env.SMTP_SERVER && process.env.SMTP_USER && process.env.SMTP_PASS;
let mailTransporter = null;

if (EMAIL_CONFIGURED) {
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  mailTransporter.verify((err) => {
    if (err) console.error("❌ Gmail bağlantı hatası:", err.message);
    else console.log("✅ Gmail SMTP bağlantısı başarılı.");
  });
} else {
  console.warn("⚠️ SMTP ayarları eksik, e-posta devre dışı.");
}

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

// ✅ Log middleware
app.use((req, _res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ✅ Test endpoint
app.get("/", (_req, res) => res.json({ success: true, message: "Backend çalışıyor 🚀" }));


// ✅ Kod gönderme
app.post("/send-code", async (req, res) => {
  try {
    const { email, phone } = req.body;
    console.log("📩 Gelen istek:", req.body);

    if (!email && !phone)
      return res.status(400).json({ success: false, message: "Email veya telefon gerekli." });

    const { key, channel, email: e } = buildKey(email, phone);
    const code = generateCode();
    codes.set(key, { code, expiresAt: Date.now() + CODE_TTL_MS });
    console.log("📨 Kod oluşturuldu:", key, code);

    if (channel === "email" && mailTransporter) {
      await mailTransporter.sendMail({
        from: `"Kentsel Platform" <${process.env.SMTP_USER}>`,
        to: e,
        subject: "Doğrulama Kodu",
        html: `<p>Doğrulama kodunuz: <b>${code}</b></p><p>Bu kod 10 dakika içinde geçerliliğini yitirir.</p>`,
      });
      console.log("✅ Mail gönderildi:", mask(e));
      return res.json({ success: true, message: "Mail gönderildi." });
    }

    return res.status(400).json({ success: false, message: "Geçersiz kanal." });
  } catch (error) {
    console.error("❌ /send-code hatası:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
});

// ✅ Kod doğrulama
// ✅ Kod doğrulama ve abone kaydı
app.post("/verify-code", (req, res) => {
  try {
    const { identifier, code } = req.body;
    const key = identifier.includes("@")
      ? `email:${identifier}`
      : `phone:${identifier}`;
    const record = codes.get(key);

    if (!record)
      return res.status(400).json({ success: false, message: "Kod bulunamadı." });
    if (Date.now() > record.expiresAt)
      return res.status(400).json({ success: false, message: "Kodun süresi doldu." });
    if (record.code !== code)
      return res.status(400).json({ success: false, message: "Kod geçersiz." });

    // ✅ Doğrulama başarılıysa kaydet
    const subscribers = loadSubscribers();
    const alreadyExists = subscribers.some(
      (s) => s.email === identifier || s.phone === identifier
    );

    if (!alreadyExists) {
      subscribers.push({
        email: identifier.includes("@") ? identifier : "",
        phone: identifier.includes("@") ? "" : identifier,
        verifiedAt: new Date().toISOString(),
      });
      persistSubscribers(subscribers);
      console.log("🗂️ Yeni abone eklendi:", identifier);
    } else {
      console.log("ℹ️ Abone zaten kayıtlı:", identifier);
    }

    // ✅ Kod artık geçerli değil
    codes.delete(key);

    res.json({ success: true, message: "Doğrulama başarılı ✅" });
  } catch (error) {
    console.error("❌ /verify-code hatası:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
});


// ✅ Sunucu başlatma
const port = process.env.PORT || 5001;
app.listen(port, "0.0.0.0", () =>
  console.log(`🚀 Backend aktif: http://localhost:${port}`)
);
