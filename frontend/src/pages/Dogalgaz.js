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
        <p className="text-gray-700">Veriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
      <div className="animate-fade-in">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-3">
            <Flame className="w-7 h-7 text-emerald-600" />
            Doğalgaz Tüketim Analizi
          </h2>
          <p className="text-gray-700">Mahalle bazında haftalık doğalgaz tüketimi</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100/50 mb-10" ref={searchRef}>
          <h3 className="text-lg font-semibold text-gray-800 mb-5">Mahalle Ara</h3>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Mahalle ara..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              className="w-full pl-14 pr-5 py-4 border border-emerald-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all duration-300 text-gray-800 placeholder:text-gray-400"
              aria-label="Mahalle ara"
            />
            {showDropdown && filtered.length > 0 && (
              <div className="absolute z-10 w-full mt-3 bg-white rounded-2xl shadow-md border border-emerald-100/50 max-h-64 overflow-y-auto">
                {filtered.map((n, idx) => (
                  <button
                    key={n.name + idx}
                    onClick={() => handleSelect(n)}
                    className={`w-full text-left px-5 py-4 hover:bg-emerald-50 transition-all duration-200 ${
                      idx === highlightedIndex ? "bg-emerald-50" : ""
                    } ${idx === 0 ? "rounded-t-2xl" : ""} ${
                      idx === filtered.length - 1 ? "rounded-b-2xl" : "border-b border-emerald-100/50"
                    }`}
                  >
                    <span className="font-medium text-gray-800">{n.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!selected && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100/50 text-gray-700">
            Lütfen bir mahalle seçiniz.
          </div>
        )}

        {selected && summary && (
          <div className="grid grid-cols-1 gap-6 mb-10">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100/50 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ortalama Doğalgaz Tüketimi</h4>
                  <p className="text-3xl font-bold text-gray-800">{summary.value}</p>
                </div>
                <div className={`text-sm font-semibold ${summary.inc ? "text-emerald-600" : "text-red-500"}`}>
                  {summary.change}
                </div>
              </div>
            </div>
          </div>
        )}

        {selected && chartData.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100/50 chart-container">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Doğalgaz Tüketim Trendi (m³)</h3>
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                  <XAxis dataKey="week" stroke="#6b7280" tickMargin={8} />
                  <YAxis stroke="#6b7280" tickMargin={8} />
                  <Tooltip 
                    cursor={{ stroke: '#a7f3d0', strokeWidth: 1 }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1fae5',
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      padding: '10px 12px',
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
                    activeDot={{ r: 5, stroke: '#059669', strokeWidth: 2, fill: '#ffffff' }}
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
        .chart-container { box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-radius: 1.5rem; background: #ffffff; }
        .chart-container svg { background: transparent !important; }
      `}</style>
    </div>
  );
};

export default Dogalgaz;


