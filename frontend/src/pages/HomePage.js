import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, MapPin, Database, TrendingUp, Zap, Droplets, Flame, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCSVData } from "../hooks/useCSVData";
import bgVideo from "../assets/background.mp4";

const HomePage = ({ selectedNeighborhood, setSelectedNeighborhood }) => {
  const { neighborhoods, searchNeighborhoods, getNeighborhoodAverages, loading, error } = useCSVData();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef(null);

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

  const handleSelectNeighborhood = (neighborhoodName) => {
    const averages = getNeighborhoodAverages(neighborhoodName);
    if (averages) {
      setSelectedNeighborhood(averages);
      setSearchQuery(neighborhoodName);
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  useEffect(() => {
    if (!loading && neighborhoods.length > 0) {
      const saved = localStorage.getItem("lastSelectedNeighborhood");
      if (saved && !selectedNeighborhood) {
        try {
          const parsed = JSON.parse(saved);
          const found = getNeighborhoodAverages(parsed.name);
          if (found) {
            setSelectedNeighborhood(found);
            setSearchQuery(found.name);
          }
        } catch (_) {}
      }
    }
  }, [loading, neighborhoods, selectedNeighborhood, getNeighborhoodAverages, setSelectedNeighborhood]);

  useEffect(() => {
    if (selectedNeighborhood) {
      localStorage.setItem("lastSelectedNeighborhood", JSON.stringify(selectedNeighborhood));
    }
  }, [selectedNeighborhood]);

  const stats = [
    { icon: MapPin, label: "Toplam Mahalle", value: neighborhoods.length.toString(), color: "emerald" },
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
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Veriler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-2">Hata: {error}</p>
            <p className="text-gray-600">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Arka Plan Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={bgVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Blur + Koyu Overlay */}
     <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px] saturate-150"></div>

      {/* İçerik */}
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="animate-fade-in-up">

          {/* Hero */}
          <div className="text-center mb-16 mt-8">
            <h1 className="text-5xl font-extrabold text-white drop-shadow-[0_0_22px_rgba(0,0,0,0.85)] leading-tight mb-4">
              Kentsel Tüketim Verilerini Keşfedin
            </h1>
            <p className="text-xl text-gray-200 drop-shadow-[0_0_18px_rgba(0,0,0,0.65)] max-w-2xl mx-auto mb-8">
              Mahalle bazında elektrik, su ve doğalgaz tüketimlerini anlık olarak takip edin.
            </p>
            <button
              onClick={() => window.scrollTo({ top: searchContainerRef.current.offsetTop - 100, behavior: "smooth" })}
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-emerald-500 hover:bg-emerald-600 transition-transform duration-200 hover:scale-105"
            >
              <Search className="w-5 h-5 mr-3" />
              Hemen Başla
            </button>
          </div>

          {/* Üst İstatistik Kartları */}
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

          {/* Mahalle Arama */}
          <div id="search-section" className="bg-white/25 backdrop-blur-xl rounded-3xl p-7 shadow-lg hover:shadow-emerald-300/40 transition-all duration-300 border border-white/30 transform hover:-translate-y-1" ref={searchContainerRef}>
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <Search className="w-8 h-8 text-emerald-500" />
              Mahalle Ara
            </h2>

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
                  className="w-full pl-14 pr-5 py-4 border border-white/40 rounded-2xl bg-white/20 backdrop-blur-md text-gray-900 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300 shadow-md"
                />
              </div>

              {showDropdown && filteredNeighborhoods.length > 0 && (
                <div className="absolute z-10 w-full mt-3 bg-white/30 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 max-h-64 overflow-y-auto transform scale-98 animate-fade-in">
                  {filteredNeighborhoods.map((neighborhoodName, index) => (
                    <button
                      key={neighborhoodName}
                      onClick={() => handleSelectNeighborhood(neighborhoodName)}
                      className={`w-full text-left px-5 py-4 hover:bg-white/30 hover:backdrop-blur-xl transition-all duration-200 flex items-center gap-4 ${
                        index === highlightedIndex ? "bg-pink-50" : ""
                      } ${index === 0 ? "rounded-t-2xl" : ""} ${
                        index === filteredNeighborhoods.length - 1 ? "rounded-b-2xl" : "border-b border-pink-100"
                      }`}
                    >
                      <MapPin className="w-5 h-5 text-emerald-500" />
                      <span className="font-medium text-gray-700 text-lg">{neighborhoodName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedNeighborhood && (
              <div className="mt-12 bg-white/25 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-lg animate-fade-in-up hover:shadow-emerald-300/40 transition-all duration-300">
                <h3 className="text-3xl font-bold text-gray-800 mb-7">
                  <span className="text-emerald-700">{selectedNeighborhood.name}</span> - Ortalama Tüketim Verileri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/25 backdrop-blur-xl rounded-2xl p-7 flex items-center gap-5 shadow-lg border border-white/30 hover:shadow-emerald-300/30 transition-all duration-300">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center shadow-inner">
                      <Zap className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-md font-medium text-gray-700 mb-1">Ortalama Elektrik</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {selectedNeighborhood.electricity.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                        <span className="text-xl font-normal text-gray-600">kWh</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/25 backdrop-blur-xl rounded-2xl p-7 flex items-center gap-5 shadow-lg border border-white/30 hover:shadow-emerald-300/30 transition-all duration-300">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
                      <Droplets className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-md font-medium text-gray-700 mb-1">Ortalama Su</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {selectedNeighborhood.water.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                        <span className="text-xl font-normal text-gray-600">m³</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/25 backdrop-blur-xl rounded-2xl p-7 flex items-center gap-5 shadow-lg border border-white/30 hover:shadow-emerald-300/30 transition-all duration-300">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center shadow-inner">
                      <Flame className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-md font-medium text-gray-700 mb-1">Ortalama Doğalgaz</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {selectedNeighborhood.gas.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                        <span className="text-xl font-normal text-gray-600">m³</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Yeşil Grafik */}
                <div className="bg-white rounded-3xl p-7 shadow-md border border-emerald-300 mt-8 animate-fade-in-up">
                  <h4 className="text-lg font-semibold text-gray-700 mb-5">Tüketim Özeti Grafiği</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart
                      data={[
                        { name: "Elektrik", value: parseFloat(selectedNeighborhood.electricity.toFixed(2)) },
                        { name: "Su", value: parseFloat(selectedNeighborhood.water.toFixed(2)) },
                        { name: "Doğalgaz", value: parseFloat(selectedNeighborhood.gas.toFixed(2)) },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.08} />
                        </linearGradient>
                        <linearGradient id="lineWave" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 13 }} tickMargin={10} axisLine={false} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 13 }} tickMargin={10} axisLine={false} />
                      <Tooltip
                        cursor={{ stroke: "#d1fae5", strokeWidth: 1 }}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: 16,
                          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                          padding: "12px 16px",
                        }}
                        labelStyle={{ color: "#4b5563", marginBottom: 6, fontWeight: "bold", fontSize: 15 }}
                        itemStyle={{ color: "#1f2937", fontSize: 14 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="url(#lineWave)"
                        strokeWidth={3}
                        fill="url(#colorWave)"
                        isAnimationActive={true}
                        animationDuration={1000}
                        dot={{ r: 4, stroke: "#059669", strokeWidth: 2, fill: "#ffffff" }}
                        activeDot={{ r: 6, stroke: "#059669", strokeWidth: 3, fill: "#ffffff" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8 pt-7 border-t border-emerald-300">
                  <p className="text-md text-gray-600 leading-relaxed">
                    Bu veriler, {selectedNeighborhood.name} mahallesinin genel tüketim eğilimlerini göstermektedir.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* En Alttaki 3 Kart */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/25 backdrop-blur-xl rounded-3xl p-7 shadow-lg border border-white/30 text-center hover:shadow-emerald-300/40 transition-all duration-300">
              <Database className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">156K</p>
              <p className="text-sm text-gray-600">Veritabanında</p>
            </div>
            <div className="bg-white/25 backdrop-blur-xl rounded-3xl p-7 shadow-lg border border-white/30 text-center hover:shadow-emerald-300/40 transition-all duration-300">
              <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">100%</p>
              <p className="text-sm text-gray-600">Sistem Uptime</p>
            </div>
            <div className="bg-white/25 backdrop-blur-xl rounded-3xl p-7 shadow-lg border border-white/30 text-center hover:shadow-emerald-300/40 transition-all duration-300">
              <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">5dk</p>
              <p className="text-sm text-gray-600">Önce Güncellendi</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
