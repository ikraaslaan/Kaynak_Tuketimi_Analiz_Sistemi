import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, MapPin, Database, TrendingUp, Zap, Droplets, Flame } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCSVData } from "../hooks/useCSVData";

const HomePage = ({ selectedNeighborhood, setSelectedNeighborhood }) => {
  const { neighborhoods, searchNeighborhoods, getNeighborhoodAverages, loading, error } = useCSVData();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef(null);

  const filteredNeighborhoods = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchNeighborhoods(searchQuery).slice(0, 5);
  }, [searchQuery, neighborhoods]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
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
      setHighlightedIndex((prev) =>
        prev < filteredNeighborhoods.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
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
        } catch (err) {
          console.error("Error loading saved neighborhood:", err);
        }
      }
    }
  }, [loading, neighborhoods]);

  useEffect(() => {
    if (selectedNeighborhood) {
      localStorage.setItem("lastSelectedNeighborhood", JSON.stringify(selectedNeighborhood));
    }
  }, [selectedNeighborhood]);

  const stats = [
    { icon: MapPin, label: "Toplam Mahalle", value: neighborhoods.length.toString(), color: "blue" },
    { icon: Database, label: "Aktif Veri Kaynakları", value: "8", color: "green" },
    { icon: TrendingUp, label: "Toplam Tüketim", value: "4.7M", color: "purple" },
    { icon: MapPin, label: "Son Güncelleme", value: "2dk önce", color: "orange" },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
    };
    return colors[color] || colors.blue;
  };
  
  if (loading) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Veriler yükleniyor...</p>
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
            <p className="text-red-600 mb-2">Hata: {error}</p>
            <p className="text-gray-700">Lütfen sayfayı yenileyin.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
      <div className="animate-fade-in">

        {/* System Overview Cards (↓  moved down) */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm transition-all duration-200 border border-pink-200"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border-2 ${getColorClasses(stat.color)}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{stat.label}</h3>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Neighborhood Search Section (↓ slight spacing adjustment) */}
        <div className="mt-12 bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-pink-200 mb-16" ref={searchContainerRef}>
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 flex items-center gap-3">
            <Search className="w-7 h-7 text-emerald-600" />
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
                placeholder="Mahalle ara..."
                className="w-full pl-14 pr-5 py-5 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all duration-300 text-gray-800 placeholder:text-gray-400"
                aria-label="Mahalle ara"
              />
            </div>

            {showDropdown && filteredNeighborhoods.length > 0 && (
              <div className="absolute z-10 w-full mt-3 bg-white rounded-2xl shadow-sm border border-pink-200 max-h-64 overflow-y-auto">
                {filteredNeighborhoods.map((neighborhoodName, index) => (
                  <button
                    key={neighborhoodName}
                    onClick={() => handleSelectNeighborhood(neighborhoodName)}
                    className={`w-full text-left px-5 py-4 hover:bg-pink-50 transition-all duration-200 ${
                      index === highlightedIndex ? "bg-pink-50" : ""
                    } ${index === 0 ? "rounded-t-2xl" : ""} ${
                      index === filteredNeighborhoods.length - 1 ? "rounded-b-2xl" : "border-b border-pink-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-gray-800">{neighborhoodName}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showDropdown && searchQuery && filteredNeighborhoods.length === 0 && (
              <div className="absolute z-10 w-full mt-3 bg-white rounded-2xl shadow-sm border border-pink-200 p-5">
                <p className="text-gray-600 text-center">Bu mahalleye ait veri bulunamadı.</p>
              </div>
            )}
          </div>

          {selectedNeighborhood && (
            <div className="mt-10 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-8 border border-pink-200 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {selectedNeighborhood.name} - Ortalama Tüketim Verileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-pink-200 transition-all duration-200">
                  <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                    <Zap className="w-7 h-7 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Ortalama Elektrik</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedNeighborhood.electricity.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      kWh
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-pink-200 transition-all duration-200">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Droplets className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Ortalama Su</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedNeighborhood.water.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      m³
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-pink-200 transition-all duration-200">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <Flame className="w-7 h-7 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Ortalama Doğalgaz</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedNeighborhood.gas.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      m³
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Animated Wave-like Line Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-200 mt-6 animate-fade-in">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Tüketim Özeti</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={[
                      { name: "Elektrik", value: parseFloat(selectedNeighborhood.electricity.toFixed(2)) },
                      { name: "Su", value: parseFloat(selectedNeighborhood.water.toFixed(2)) },
                      { name: "Doğalgaz", value: parseFloat(selectedNeighborhood.gas.toFixed(2)) },
                    ]}
                  >
                    <defs>
                      <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0.06} />
                      </linearGradient>
                      <linearGradient id="lineWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} tickMargin={8} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickMargin={8} />
                    <Tooltip
                      cursor={{ stroke: '#fecdd3', strokeWidth: 1 }}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #f3f4f6',
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        padding: '10px 12px',
                      }}
                      labelStyle={{ color: '#6b7280', marginBottom: 4 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="url(#lineWave)"
                      strokeWidth={3}
                      fill="url(#colorWave)"
                      isAnimationActive={true}
                      animationDuration={800}
                      dot={false}
                      activeDot={{ r: 5, stroke: '#f43f5e', strokeWidth: 2, fill: '#ffffff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 pt-6 border-t border-pink-200">
                <p className="text-sm text-gray-700">
                  Trend analizi ve detaylı raporlar için ilgili kaynak sekmelerini ziyaret edin.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sistem İstatistikleri (spacing balanced) */}
        <div className="mt-20">
          <h3 className="text-xl font-bold text-gray-800 mb-8">Sistem İstatistikleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-pink-200 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Toplam Kayıt</span>
                <Database className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">156K</p>
              <p className="text-sm text-gray-600">Veritabanında</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-pink-200 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Sistem Durumu</span>
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">100%</p>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-pink-200 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Güncelleme</span>
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">5dk</p>
              <p className="text-sm text-gray-600">Önce</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
