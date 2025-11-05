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
    <div className="p-6 rounded-3xl shadow-sm bg-white w-80 border border-emerald-100/50">
      {stage === "form" && (
        <form onSubmit={handleSend} className="flex flex-col gap-4">
          <h3 className="font-semibold text-gray-800 text-center text-lg">
            Subscribe to outage alerts
          </h3>
          <div className="flex gap-4 items-center justify-center">
            <label className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-emerald-700 transition-colors duration-200">
              <input
                type="radio"
                value="email"
                checked={method === "email"}
                onChange={() => setMethod("email")}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 focus:ring-2"
              />
              <span className="font-medium">Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-emerald-700 transition-colors duration-200">
              <input
                type="radio"
                value="sms"
                checked={method === "sms"}
                onChange={() => setMethod("sms")}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 focus:ring-2"
              />
              <span className="font-medium">SMS</span>
            </label>
          </div>

          {method === "email" ? (
            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-emerald-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all duration-300"
            />
          ) : (
            <input
              type="tel"
              value={phone}
              placeholder="+905xxxxxxxxx"
              onChange={(e) => setPhone(e.target.value)}
              required
              className="border border-emerald-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all duration-300"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
      )}

      {stage === "code" && (
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <h3 className="font-semibold text-gray-800 text-center text-lg">Enter code</h3>
          <input
            type="text"
            value={code}
            placeholder="123456"
            onChange={(e) => setCode(e.target.value)}
            required
            maxLength={6}
            className="border border-emerald-200 rounded-2xl px-4 py-3 text-sm text-center text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all duration-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      )}

      {stage === "done" && (
        <div className="text-center py-2">
          <p className="text-emerald-700 text-center font-semibold text-lg">
            ✅ You are successfully subscribed!
          </p>
        </div>
      )}
    </div>
  );
};

export default EmailSubscription;
