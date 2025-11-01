import React, { useState } from "react";
import { Flame, TrendingUp, TrendingDown } from "lucide-react";

const NEIGHBORHOOD_DATA = [
  { name: "Bahçelievler", electricity: 2.542, water: 1.271, gas: 1.674 },
  { name: "Çankaya", electricity: 3.097, water: 1.348, gas: 2.271 },
  { name: "Batıkent", electricity: 2.516, water: 1.311, gas: 2.057 },
  { name: "Keçiören", electricity: 2.057, water: 1.009, gas: 1.780 },
  { name: "Mamak", electricity: 2.001, water: 0.896, gas: 1.439 },
  { name: "Sincan", electricity: 2.420, water: 1.138, gas: 1.792 },
];

const Dogalgaz = ({ selectedNeighborhood }) => {
  const [neighborhoods] = useState(
    NEIGHBORHOOD_DATA.map((n) => ({
      name: n.name,
      value: `${(n.gas * 1000).toLocaleString("tr-TR")} m³`,
      change: `${((n.gas - 1.5) / 1.5 * 100).toFixed(1)}%`,
      isIncrease: n.gas > 1.5,
    }))
  );

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
      <div className="animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-600" />
            Doğalgaz Tüketim Yönetimi
          </h2>
          <p className="text-gray-600">Mahalle bazında ortalama doğalgaz tüketim değerleri</p>
        </div>

        {/* Mahalle Yönetimi Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Mahalle Yönetimi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {neighborhoods.map((neighborhood, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 cursor-pointer ${
                  selectedNeighborhood?.name === neighborhood.name
                    ? "border-orange-500 ring-2 ring-orange-200"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{neighborhood.name}</h4>
                    <p className="text-2xl font-bold text-orange-600 mt-2">{neighborhood.value}</p>
                  </div>
                  <div className={`flex items-center text-sm font-medium ${neighborhood.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                    {neighborhood.isIncrease ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {neighborhood.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sistem İstatistikleri */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Sistem İstatistikleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Toplam Mahalle</span>
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">24</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Aktif Veri Kaynakları</span>
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">8</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Toplam Doğalgaz Tüketimi</span>
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">1.58M m³</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dogalgaz;
