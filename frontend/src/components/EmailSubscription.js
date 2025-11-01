import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001";

const EmailSubscription = () => {
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState("form");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("API_URL =", API_URL);
      const payload = { method, email: method === "email" ? email : "", phone: method === "sms" ? phone : "" };
      const res = await fetch(`${API_URL}/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status} - ${body}`);
      }
      const data = await res.json();
      if (data.success) {
        alert("✅ Verification code sent. Check your email!");
        setIdentifier(method === "email" ? email : phone);
        setStage("code");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert(`⚠️ Network/CORS error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status} - ${body}`);
      }
      const data = await res.json();
      if (data.success) {
        alert("🎉 Successfully verified!");
        setStage("done");
        setEmail("");
        setPhone("");
        setCode("");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Verify error:", err);
      alert(`⚠️ Network/CORS error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl shadow-md bg-white w-80">
      {stage === "form" && (
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <h3 className="font-semibold text-gray-800 text-center">
            Subscribe to outage alerts
          </h3>
          <div className="flex gap-2 items-center">
            <label>
              <input
                type="radio"
                value="email"
                checked={method === "email"}
                onChange={() => setMethod("email")}
              />{" "}
              Email
            </label>
            <label>
              <input
                type="radio"
                value="sms"
                checked={method === "sms"}
                onChange={() => setMethod("sms")}
              />{" "}
              SMS
            </label>
          </div>

          {method === "email" ? (
            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 text-sm"
            />
          ) : (
            <input
              type="tel"
              value={phone}
              placeholder="+905xxxxxxxxx"
              onChange={(e) => setPhone(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 text-sm"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold"
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
      )}

      {stage === "code" && (
        <form onSubmit={handleVerify} className="flex flex-col gap-2">
          <h3 className="font-semibold text-gray-800 text-center">Enter code</h3>
          <input
            type="text"
            value={code}
            placeholder="123456"
            onChange={(e) => setCode(e.target.value)}
            required
            maxLength={6}
            className="border rounded-lg px-3 py-2 text-sm text-center"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded-lg font-semibold"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      )}

      {stage === "done" && (
        <p className="text-green-700 text-center font-semibold">
          ✅ You are successfully subscribed!
        </p>
      )}
    </div>
  );
};

export default EmailSubscription;
