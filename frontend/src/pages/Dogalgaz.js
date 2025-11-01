import React, { useEffect, useMemo, useRef, useState } from "react";
import { Flame, Search } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const normalizeTr = (str) =>
  (str || "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c");

const Dogalgaz = ({ selectedNeighborhood }) => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selected, setSelected] = useState(selectedNeighborhood || null);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/neighborhoods");
        const data = await res.json();
        setNeighborhoods(data || []);
        setFiltered(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    const nq = normalizeTr(q);
    const res = neighborhoods.filter((n) =>
      normalizeTr(n.name).includes(nq)
    );
    setFiltered(res.slice(0, 8));
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  const handleSelect = (n) => {
    setSelected(n);
    setSearchQuery(n.name);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i < filtered.length - 1 ? i + 1 : i));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(filtered[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const summary = useMemo(() => {
    if (!selected?.gas || selected.gas.length === 0) return null;
    const arr = selected.gas;
    const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const change = (((arr[arr.length - 1] - arr[0]) / arr[0]) * 100).toFixed(1);
    return { value: `${avg.toLocaleString()} m³`, change: `${change}%`, inc: parseFloat(change) >= 0 };
  }, [selected]);

  const chartData = useMemo(() => {
    if (!selected?.gas) return [];
    return selected.gas.map((v, i) => ({ week: `Hafta ${i + 1}`, value: v }));
  }, [selected]);

  if (loading) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        <p className="text-gray-600">Veriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
      <div className="animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-600" />
            Doğalgaz Tüketim Analizi
          </h2>
          <p className="text-gray-600">Mahalle bazında haftalık doğalgaz tüketimi</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-8" ref={searchRef}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mahalle Ara</h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Mahalle ara..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Mahalle ara"
            />
            {showDropdown && filtered.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
                {filtered.map((n, idx) => (
                  <button
                    key={n.name + idx}
                    onClick={() => handleSelect(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                      idx === highlightedIndex ? "bg-blue-50" : ""
                    } ${idx === 0 ? "rounded-t-xl" : ""} ${
                      idx === filtered.length - 1 ? "rounded-b-xl" : "border-b border-gray-100"
                    }`}
                  >
                    {n.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!selected && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-gray-600">
            Lütfen bir mahalle seçiniz.
          </div>
        )}

        {selected && summary && (
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm text-gray-600">Ortalama Doğalgaz Tüketimi</h4>
                  <p className="text-3xl font-bold text-gray-900">{summary.value}</p>
                </div>
                <div className={`text-sm font-medium ${summary.inc ? "text-green-600" : "text-red-600"}`}>
                  {summary.change}
                </div>
              </div>
            </div>
          </div>
        )}

        {selected && chartData.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 chart-container">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#111827' }}>Doğalgaz Tüketim Trendi (m³)</h3>
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#6b7280" tickMargin={8} />
                  <YAxis stroke="#6b7280" tickMargin={8} />
                  <Tooltip 
                    cursor={{ stroke: '#fed7aa', strokeWidth: 1 }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                      padding: '8px 10px',
                      color: '#111827',
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#6b7280', marginBottom: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="url(#colorGas)" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
                    isAnimationActive={true}
                    animationDuration={800}
                    name="Doğalgaz (m³)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .chart-container { box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-radius: 1rem; background: #ffffff; }
        .chart-container svg { background: transparent !important; }
      `}</style>
    </div>
  );
};

export default Dogalgaz;


