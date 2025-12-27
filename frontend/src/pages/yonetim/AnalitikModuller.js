import React, { useState } from "react";

const AnalitikModuller = () => {
  const [activePage, setActivePage] = useState("belgeler");

  return (
    <div className="pt-24 px-8 min-h-screen bg-[#DDEEE3]">
      
      {/* 🔹 ANALİTİK MODÜLLER ÜST MENÜ (Navbar değişmeden, altında) */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActivePage("belgeler")}
          className={`px-6 py-2 rounded-full font-bold transition-all
            ${
              activePage === "belgeler"
                ? "bg-emerald-600 text-white shadow"
                : "bg-white text-emerald-700 hover:bg-emerald-100"
            }`}
        >
          Belgeler
        </button>

        <button
          onClick={() => setActivePage("istatistik")}
          className={`px-6 py-2 rounded-full font-bold transition-all
            ${
              activePage === "istatistik"
                ? "bg-emerald-600 text-white shadow"
                : "bg-white text-emerald-700 hover:bg-emerald-100"
            }`}
        >
          İstatistik Özeti
        </button>

        <button
          onClick={() => setActivePage("zaman")}
          className={`px-6 py-2 rounded-full font-bold transition-all
            ${
              activePage === "zaman"
                ? "bg-emerald-600 text-white shadow"
                : "bg-white text-emerald-700 hover:bg-emerald-100"
            }`}
        >
          Zaman Serisi Analizi
        </button>
      </div>

      {/* 🔹 SAYFA İÇERİĞİ (ŞİMDİLİK BOŞ) */}
      <div className="bg-white rounded-2xl p-10 shadow-lg">
        {activePage === "belgeler" && (
          <div className="text-gray-600 text-lg">
            Belgeler sayfası (şimdilik boş)
          </div>
        )}

        {activePage === "istatistik" && (
          <div className="text-gray-600 text-lg">
            İstatistik Özeti sayfası (şimdilik boş)
          </div>
        )}

        {activePage === "zaman" && (
          <div className="text-gray-600 text-lg">
            Zaman Serisi Analizi sayfası (şimdilik boş)
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalitikModuller;