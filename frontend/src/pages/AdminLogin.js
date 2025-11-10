// src/pages/AdminLogin.js
import React, { useState, useEffect } from "react";
import { ShieldCheck, KeyRound, IdCard, ArrowLeft } from "lucide-react";

export default function AdminLogin({ onSuccess, onCancel }) {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const idValid = /^\d{6}$/.test(adminId);
  const passValid = /^\d{6}$/.test(password);
  const formValid = idValid && passValid;

  useEffect(() => {
    setTouched(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!formValid) return;

    // Burada gerçek backend doğrulaması yok; sadece biçim kontrolü yapıyoruz.
    // Başarılı giriş bayrağını üst bileşene ilet.
    localStorage.setItem("isAdminAuthed", "true");
    onSuccess?.();
  };

  return (
    <div className="min-h-[calc(100vh-88px)] bg-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 border border-emerald-100">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-800">Yönetici Girişi</h1>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Lütfen 6 haneli <b>ID</b> ve <b>Şifre</b> giriniz.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID
            </label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="000000"
                value={adminId}
                onChange={(e) =>
                  setAdminId(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className={`w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none
                  ${touched && !idValid ? "border-rose-300" : "border-gray-200"}
                  focus:ring-2 focus:ring-emerald-200`}
              />
            </div>
            {touched && !idValid && (
              <p className="text-xs text-rose-500 mt-1">
                ID 6 haneli sayı olmalıdır.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="******"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className={`w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none
                  ${touched && !passValid ? "border-rose-300" : "border-gray-200"}
                  focus:ring-2 focus:ring-emerald-200`}
              />
            </div>
            {touched && !passValid && (
              <p className="text-xs text-rose-500 mt-1">
                Şifre 6 haneli sayı olmalıdır.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!formValid}
            className={`w-full py-3 rounded-xl font-semibold transition
              ${formValid ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            Giriş Yap
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 rounded-xl text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
