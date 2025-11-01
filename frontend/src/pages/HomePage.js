import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, MapPin, Database, TrendingUp, Zap, Droplets, Flame } from "lucide-react";
import { useCSVData } from "../hooks/useCSVData";

const HomePage = ({ selectedNeighborhood, setSelectedNeighborhood }) => {
  const { neighborhoods, searchNeighborhoods, getNeighborhoodAverages, loading, error } = useCSVData();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef(null);

  // Filter neighborhoods with debounced search
  const filteredNeighborhoods = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchNeighborhoods(searchQuery).slice(0, 5);
  }, [searchQuery, neighborhoods]);

  // Click outside handler
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

  // Keyboard navigation
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

  // Initialize from localStorage
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

  // Save to localStorage
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            <p className="text-red-600 mb-2">Hata: {error}</p>
            <p className="text-gray-600">Lütfen sayfayı yenileyin.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
      <div className="animate-fade-in">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <span className="text-5xl">🏙️</span>
            <span>Kentsel Tüketim Analizi Platformu</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sürdürülebilir şehirler için tüketim verilerini analiz edin.
          </p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-100"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border-2 ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.label}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Neighborhood Search Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-100 mb-8" ref={searchContainerRef}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            Mahalle Ara
          </h2>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder="Mahalle ara..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                aria-label="Mahalle ara"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && filteredNeighborhoods.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
                {filteredNeighborhoods.map((neighborhoodName, index) => (
                  <button
                    key={neighborhoodName}
                    onClick={() => handleSelectNeighborhood(neighborhoodName)}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                      index === highlightedIndex ? "bg-blue-50" : ""
                    } ${index === 0 ? "rounded-t-xl" : ""} ${
                      index === filteredNeighborhoods.length - 1 ? "rounded-b-xl" : "border-b border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{neighborhoodName}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {showDropdown && searchQuery && filteredNeighborhoods.length === 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <p className="text-gray-500 text-center">Bu mahalleye ait veri bulunamadı.</p>
              </div>
            )}
          </div>

          {/* Selected Neighborhood Details */}
          {selectedNeighborhood && (
            <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {selectedNeighborhood.name} - Ortalama Tüketim Verileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ortalama Elektrik</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedNeighborhood.electricity.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      kWh
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ortalama Su</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedNeighborhood.water.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      m³
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ortalama Doğalgaz</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedNeighborhood.gas.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      m³
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span>📈</span>
                  Trend analizi ve detaylı raporlar için ilgili kaynak sekmelerini ziyaret edin.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sistem İstatistikleri */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Sistem İstatistikleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Toplam Kayıt</span>
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">156K</p>
              <p className="text-sm text-gray-500 mt-1">Veritabanında</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Sistem Durumu</span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">100%</p>
              <p className="text-sm text-gray-500 mt-1">Uptime</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Güncelleme</span>
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">5dk</p>
              <p className="text-sm text-gray-500 mt-1">Önce</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
