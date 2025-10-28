import React, { useState, useEffect } from "react";
import { Mail, X } from "lucide-react";

const SubscriptionBox = () => {
  const [email, setEmail] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed the box
    const dismissed = localStorage.getItem("subscriptionBoxDismissed");
    if (!dismissed) {
      setTimeout(() => setIsVisible(true), 500);
    } else {
      setIsVisible(false);
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem("subscriptionBoxDismissed", "true");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Lütfen e-posta adresinizi giriniz.");
      return;
    }
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Lütfen geçerli bir e-posta adresi giriniz.");
      return;
    }
    // Simulate subscription
    console.log("Email subscribed:", email);
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail("");
      alert("Başarıyla abone oldunuz! Kesintilerden haberdar olacaksınız.");
    }, 2000);
  };

  if (isDismissed) return null;

  return (
    <div
      className={`fixed bottom-6 right-4 md:right-6 z-40 transition-all duration-500 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 w-[calc(100vw-2rem)] max-w-[22rem] sm:w-80 md:w-96 hover:shadow-xl transition-all duration-200 relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 mb-4 pr-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Kesintilerden haberdar olun 📩
            </h3>
            <p className="text-sm text-gray-600">
              E-posta adresinizi girin ve kesinti bildirimleri alın
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresinizi giriniz..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              disabled={isSubscribed}
            />
          </div>
          <button
            type="submit"
            disabled={isSubscribed}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubscribed ? (
              "✓ Abone Olundu"
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Abone Ol
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionBox;

