import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchContainerRef = useRef(null);

  const fetchNeighborhoods = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/neighborhoods");
      if (!res.ok) throw new Error("Veri alınamadı");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Mahalle verileri alınamadı:", err);
      return [];
    }
  };

  useEffect(() => {
    const loadNeighborhoods = async () => {
      const data = await fetchNeighborhoods();
      setNeighborhoods(data);
      setFilteredNeighborhoods(data);
      setLoading(false);
    };
    loadNeighborhoods();
  }, []);

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

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(e.target.value);
    const filtered = neighborhoods.filter((n) =>
      n.name.toLowerCase().includes(query)
    );
    setFilteredNeighborhoods(filtered);
    setShowDropdown(true);
  };

  const handleNeighborhoodSelect = (neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    setSearchQuery(neighborhood.name);
    setShowDropdown(false);
  };

  const getSummaryData = () => {
    if (!selectedNeighborhood) return null;
    const { electricity, water, gas } = selectedNeighborhood;

    const avgElectricity = Math.round(
      electricity.reduce((a, b) => a + b, 0) / electricity.length
    );
    const avgWater = Math.round(water.reduce((a, b) => a + b, 0) / water.length);
    const avgGas = Math.round(gas.reduce((a, b) => a + b, 0) / gas.length);

    const electricityChange = (
      ((electricity[3] - electricity[0]) / electricity[0]) *
      100
    ).toFixed(1);
    const waterChange = (
      ((water[3] - water[0]) / water[0]) *
      100
    ).toFixed(1);
    const gasChange = (((gas[3] - gas[0]) / gas[0]) * 100).toFixed(1);

    return {
      electricity: {
        value: `${avgElectricity.toLocaleString()} kWh`,
        change: `${electricityChange > 0 ? "+" : ""}${electricityChange}%`,
        changeType: electricityChange > 0 ? "increase" : "decrease",
      },
      water: {
        value: `${avgWater.toLocaleString()} m³`,
        change: `${waterChange > 0 ? "+" : ""}${waterChange}%`,
        changeType: waterChange > 0 ? "increase" : "decrease",
      },
      gas: {
        value: `${avgGas.toLocaleString()} m³`,
        change: `${gasChange > 0 ? "+" : ""}${gasChange}%`,
        changeType: gasChange > 0 ? "increase" : "decrease",
      },
    };
  };

  const getChartData = () => {
    if (!selectedNeighborhood) return [];
    return selectedNeighborhood.electricity.map((_, index) => ({
      week: `Hafta ${index + 1}`,
      electricity: selectedNeighborhood.electricity[index],
      water: selectedNeighborhood.water[index],
      gas: selectedNeighborhood.gas[index],
    }));
  };

  const summaryData = getSummaryData();
  const chartData = getChartData();

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-wrapper">
          <p>Mahalle verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Kentsel Tüketim Analizi</h1>
          <p className="dashboard-subtitle">
            Mahalle bazında enerji, su ve doğalgaz tüketimini izleyin ve analiz edin.
          </p>
        </div>

        {/* 🔍 Arama */}
        <div className="neighborhood-search-container" ref={searchContainerRef}>
          <label className="search-label">Mahalle Ara</label>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Mahalle adı yazın..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              className="search-input"
            />
            {showDropdown && filteredNeighborhoods.length > 0 && (
              <div className="search-dropdown">
                {filteredNeighborhoods.map((neighborhood, index) => (
                  <div
                    key={index}
                    className="search-dropdown-item"
                    onClick={() => handleNeighborhoodSelect(neighborhood)}
                  >
                    {neighborhood.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!selectedNeighborhood && (
          <div className="empty-state">
            <p>Lütfen bir mahalle seçiniz.</p>
          </div>
        )}

        {selectedNeighborhood && summaryData && (
          <div className="summary-cards">
            <div className="summary-card blue">
              <span className="summary-card-icon">⚡</span>
              <p className="summary-card-title">Elektrik</p>
              <p className="summary-card-value">{summaryData.electricity.value}</p>
              <p className={`summary-card-change ${summaryData.electricity.changeType}`}>
                {summaryData.electricity.change} vs önceki hafta
              </p>
            </div>
            <div className="summary-card green">
              <span className="summary-card-icon">💧</span>
              <p className="summary-card-title">Su</p>
              <p className="summary-card-value">{summaryData.water.value}</p>
              <p className={`summary-card-change ${summaryData.water.changeType}`}>
                {summaryData.water.change} vs önceki hafta
              </p>
            </div>
            <div className="summary-card yellow">
              <span className="summary-card-icon">🔥</span>
              <p className="summary-card-title">Doğalgaz</p>
              <p className="summary-card-value">{summaryData.gas.value}</p>
              <p className={`summary-card-change ${summaryData.gas.changeType}`}>
                {summaryData.gas.change} vs önceki hafta
              </p>
            </div>
          </div>
        )}

        {selectedNeighborhood && chartData.length > 0 && (
          <div className="chart-container">
            <h3>{selectedNeighborhood.name} - Haftalık Tüketim Trendi</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="electricity"
                  stroke="#3b82f6"
                  name="Elektrik"
                />
                <Line
                  type="monotone"
                  dataKey="water"
                  stroke="#10b981"
                  name="Su"
                />
                <Line
                  type="monotone"
                  dataKey="gas"
                  stroke="#f59e0b"
                  name="Doğalgaz"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="subscribe-widget">
          <h4>Elektrik kesintisi bildirimleri almak ister misiniz?</h4>
          <p>E-posta adresinizi girin ve bildirim alın.</p>
          <input type="email" placeholder="ornek@mail.com" />
          <button>Kaydol</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
