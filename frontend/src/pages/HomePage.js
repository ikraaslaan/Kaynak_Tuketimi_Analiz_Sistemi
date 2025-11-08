import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, MapPin, Database, TrendingUp, Zap, Droplets, Flame, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
// ✅ DÜZELTME: import { } (süslü parantezli) kullanıldı
import { useConsumptionAPI } from "../hooks/useConsumptionAPI";
import bgVideo from "../assets/background.mp4";

// ✅ HATA DÜZELTİLDİ: Props ({...}) kaldırıldı.
const HomePage = () => {
  // ✅ HATA DÜZELTİLDİ: State (selectedNeighborhood) component'in içine taşındı.
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  const { neighborhoods, loading, error, getNeighborhoodAverages } = useConsumptionAPI();

  // Performans için useCallback ile sarmalandı
  const searchNeighborhoods = useCallback((query) =>
    neighborhoods.filter((n) => n.toLowerCase().includes(query.toLowerCase())),
    [neighborhoods]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef(null);

  const [filterPeriod, setFilterPeriod] = useState("all");
  const [currentNeighborhoodName, setCurrentNeighborhoodName] = useState(null);

  const filteredNeighborhoods = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchNeighborhoods(searchQuery).slice(0, 5);
  }, [searchQuery, searchNeighborhoods]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Performans için useCallback ile sarmalandı
  const handleSelectNeighborhood = useCallback(async (neighborhoodName) => {
    const averages = await getNeighborhoodAverages(neighborhoodName, filterPeriod);
    if (averages) {
      setSelectedNeighborhood(averages);
      setSearchQuery(neighborhoodName);
      setCurrentNeighborhoodName(neighborhoodName);
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  }, [getNeighborhoodAverages, filterPeriod]); // setSelectedNeighborhood state setter olduğu için bağımlılığa gerek yok

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredNeighborhoods.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((p) => (p < filteredNeighborhoods.length - 1 ? p + 1 : p));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((p) => (p > 0 ? p - 1 : -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectNeighborhood(filteredNeighborhoods[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  // --- ✅ YENİ ÖZELLİK: İLK AÇILIŞTA MAHALLE SEÇME ---
  useEffect(() => {
    // Sadece veri yüklendiyse, mahalle listesi varsa ve HENÜZ bir mahalle seçilmemişse çalışır
    if (!loading && neighborhoods.length > 0 && !selectedNeighborhood) {
      
      const saved = localStorage.getItem("lastSelectedNeighborhood");
      
      // 1. Durum: Kayıtlı bir mahalle varsa, onu yükle
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) {
             handleSelectNeighborhood(parsed.name); // Kayıtlı olanı seç
          } else {
             handleSelectNeighborhood("Çayda Çıra"); // Kayıt bozuksa varsayılanı seç
          }
        } catch (_) {
          handleSelectNeighborhood("Çayda Çıra"); // Kayıt bozuksa varsayılanı seç
        }
      } else {
        // 2. Durum: Kayıtlı mahalle YOKSA, "Çayda Çıra"yı seç
        handleSelectNeighborhood("Çayda Çıra"); 
      }
    }
  }, [loading, neighborhoods, selectedNeighborhood, handleSelectNeighborhood]);
  // --- YENİ ÖZELLİK SONU ---

  // Filtre değiştiğinde veriyi güncelleyen hook
  useEffect(() => {
    const updateAverages = async () => {
      // Sadece zaten bir mahalle seçiliyse çalış
      if (currentNeighborhoodName) {
        const averages = await getNeighborhoodAverages(currentNeighborhoodName, filterPeriod);
        if (averages) {
          setSelectedNeighborhood(averages);
        }
      }
    };
    updateAverages();
  }, [filterPeriod, currentNeighborhoodName, getNeighborhoodAverages]); 


  useEffect(() => {
    if (selectedNeighborhood) {
      localStorage.setItem("lastSelectedNeighborhood", JSON.stringify(selectedNeighborhood));
    }
  }, [selectedNeighborhood]);

  const stats = [
    { icon: MapPin, label: "Toplam Mahalle", value: neighborhoods.length > 0 ? neighborhoods.length.toString() : "0", color: "emerald" },
    { icon: Database, label: "Aktif Veri Kaynakları", value: "8", color: "purple" },
    { icon: TrendingUp, label: "Toplam Tüketim", value: "4.7M", color: "orange" },
    { icon: Clock, label: "Son Güncelleme", value: "2dk önce", color: "rose" },
  ];

  const getColorClasses = (color) => {
    const colors = {
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
      rose: "bg-rose-50 text-rose-600 border-rose-200",
    };
    return colors[color] || colors.emerald;
  };

  if (loading) {
    return (
      <div className="pt-20 px-4 text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        Veriler yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 px-4 text-center text-red-500">
        Hata: {error}
      </div>
    );
  }

  // JSX (Arayüz) kodunun tamamı
  return (
    <div className="relative min-h-screen overflow-hidden">
      <video className="absolute inset-0 w-full h-full object-cover" src={bgVideo} autoPlay loop muted playsInline />
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px] saturate-150"></div>

      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="animate-fade-in-up">

          {/* ---- HERO ---- */}
          <div className="text-center mb-16 mt-8">
            <h1 className="text-5xl font-extrabold text-white drop-shadow-[0_0_22px_rgba(0,0,0,0.85)] leading-tight mb-4">
              Kentsel Tüketim Verilerini Keşfedin
            </h1>
            <p className="text-xl text-gray-200 drop-shadow-[0_0_18px_rgba(0,0,0,0.65)] max-w-2xl mx-auto mb-8">
              Mahalle bazında elektrik, su ve doğalgaz tüketimlerini anlık olarak takip edin.
            </p>
            {/* ✅ "Hemen Başla" butonu */}
            <button
              onClick={() => window.scrollTo({ top: searchContainerRef.current.offsetTop - 100, behavior: "smooth" })}
              className="inline-flex items-center px-8 py-4 text-base font-medium rounded-full shadow-lg text-white bg-emerald-500 hover:bg-emerald-600 transition-transform duration-200 hover:scale-105"
            >
              <Search className="w-5 h-5 mr-3" />
              Hemen Başla
            </button>
          </div>

          {/* ---- ÜST İSTATİSTİK KARTLARI ---- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/25 backdrop-blur-xl rounded-3xl p-7 shadow-lg hover:shadow-emerald-300/40 transition-all duration-300 border border-white/30 transform hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 border-2 ${getColorClasses(stat.color)}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">{stat.label}</h3>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* ---- MAHALLE ARAMA + FİLTRE ---- */}
          <div id="search-section" ref={searchContainerRef} className="bg-white/25 backdrop-blur-xl rounded-3xl p-7 shadow-lg border border-white/30">
            
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Search className="w-8 h-8 text-emerald-500" />
                Mahalle Ara
              </h2>

              <div className="flex gap-2 bg-black/5 p-1 rounded-xl border border-white/30">
                {["all", "last_week", "last_month"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setFilterPeriod(period)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filterPeriod === period ? "bg-white text-emerald-700 shadow-md" : "text-gray-600 hover:bg-white/50"
                    }`}
                  >
                    {period === "all" && "Tüm Zamanlar"}
                    {period === "last_week" && "Son Hafta"}
                    {period === "last_month" && "Son Ay (4 Hafta)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Bir mahalle ismi yazın..."
                  className="w-full pl-14 pr-5 py-4 border border-white/40 rounded-2xl bg-white/20 backdrop-blur-md text-gray-900 placeholder:text-gray-700 focus:outline-none"
                />
              </div>

              {showDropdown && filteredNeighborhoods.length > 0 && (
                <div className="absolute w-full mt-3 bg-white/30 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 max-h-64 overflow-y-auto">
                  {filteredNeighborhoods.map((n, index) => (
                    <button
                      key={n}
                      onClick={() => handleSelectNeighborhood(n)}
                      className={`w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-white/40 transition ${
                        index === highlightedIndex ? "bg-white/60" : ""
                      }`}
                    >
                      <MapPin className="w-5 h-5 text-emerald-500" />
                      <span className="font-medium text-gray-700 text-lg">{n}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ Burası artık "Çayda Çıra" seçilince (veya kayıtlı mahalle seçilince) görünecek */}
            {selectedNeighborhood && (
              <div className="mt-12 bg-white/25 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-lg">
                <h3 className="text-3xl font-bold text-gray-800 mb-7">
                  <span className="text-emerald-700">{selectedNeighborhood.name}</span> - Ortalama Tüketim Verileri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <DataCard icon={Zap} label="Ortalama Elektrik" value={selectedNeighborhood.electricity} unit="kWh" colorBg="bg-yellow-100" colorIcon="text-yellow-600" />
                  <DataCard icon={Droplets} label="Ortalama Su" value={selectedNeighborhood.water} unit="m³" colorBg="bg-blue-100" colorIcon="text-blue-600" />
                  <DataCard icon={Flame} label="Ortalama Doğalgaz" value={selectedNeighborhood.gas} unit="m³" colorBg="bg-orange-100" colorIcon="text-orange-600" />
                </div>

                <ConsumptionChart selectedNeighborhood={selectedNeighborhood} />

                <div className="mt-8 pt-7 border-t border-emerald-300">
                  <p className="text-md text-gray-600">
                    Bu veriler, {selectedNeighborhood.name} mahallesinin genel tüketim eğilimlerini göstermektedir.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ---- EN ALT KARTLAR ---- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            <FooterCard icon={Database} value="156K" text="Veritabanında" />
            <FooterCard icon={TrendingUp} value="100%" text="Sistem Uptime" />
            <FooterCard icon={Clock} value="5dk" text="Önce Güncellendi" />
          </div>

        </div>
      </div>
    </div>
  );
};

/* --- ALT BİLEŞENLER (Kodunda zaten vardı) --- */

const DataCard = ({ icon: Icon, label, value, unit, colorBg, colorIcon }) => (
  <div className="bg-white/25 backdrop-blur-xl rounded-2xl p-7 flex items-center gap-5 shadow-lg border border-white/30">
    <div className={`w-16 h-16 ${colorBg} rounded-full flex items-center justify-center shadow-inner`}>
      <Icon className={`w-8 h-8 ${colorIcon}`} />
    </div>
    <div>
      <p className="text-md font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800">
        {/* Değerin null/undefined olma ihtimaline karşı ? eklendi */}
        {value?.toFixed(2)} <span className="text-xl font-normal text-gray-600">{unit}</span>
      </p>
    </div>
  </div>
);

const ConsumptionChart = ({ selectedNeighborhood }) => (
  <div className="bg-white rounded-3xl p-7 shadow-md border border-emerald-300 mt-8">
    <h4 className="text-lg font-semibold text-gray-700 mb-5">Tüketim Özeti Grafiği</h4>
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart
        data={[
          { name: "Elektrik", value: Number(selectedNeighborhood.electricity) },
          { name: "Su", value: Number(selectedNeighborhood.water) },
          { name: "Doğalgaz", value: Number(selectedNeighborhood.gas) },
        ]}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="name" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#059669"
          fill="#a7f3d0"
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);


const FooterCard = ({ icon: Icon, value, text }) => (
  <div className="bg-white/25 backdrop-blur-xl rounded-3xl p-7 text-center shadow-lg border border-white/30">
    <Icon className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-600">{text}</p>
  </div>
);

export default HomePage;