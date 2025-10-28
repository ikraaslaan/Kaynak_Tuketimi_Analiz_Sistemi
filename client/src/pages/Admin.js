import { useState, useEffect } from 'react';

function Admin() {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Backend'den mahalle verilerini çekme fonksiyonu
  const fetchNeighborhoods = async () => {
    try {
      // ⬇️ Backend'teki endpoint'i burada belirt (örnek: /api/neighborhoods veya /api/energy)
      const response = await fetch("/api/neighborhoods");

      if (!response.ok) throw new Error("Veri alınamadı");
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("API isteği başarısız:", error);
      return [];
    }
  };

  // ✅ Component yüklendiğinde veriyi çek
  useEffect(() => {
    const loadNeighborhoods = async () => {
      try {
        const data = await fetchNeighborhoods();
        setNeighborhoods(data);
      } catch (error) {
        console.error("Error loading neighborhoods:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNeighborhoods();
  }, []);

  // ✅ Loading screen
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-wrapper">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Yönetici paneli yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Main content
  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Yönetici Paneli</h1>
          <p className="dashboard-subtitle">Sistem yönetimi ve mahalle verileri</p>
        </div>

        <div className="admin-content">
          {/* 🔹 Neighborhood Management */}
          <div className="admin-section">
            <h2 className="admin-section-title">Mahalle Yönetimi</h2>
            <div className="neighborhoods-grid">
              {neighborhoods.map((neighborhood, index) => (
                <div key={index} className="neighborhood-card">
                  <h3 className="neighborhood-name">{neighborhood.name}</h3>
                  <div className="neighborhood-stats">
                    <div className="stat-item">
                      <span className="stat-label">Ort. Elektrik:</span>
                      <span className="stat-value">
                        {Math.round(
                          neighborhood.electricity.reduce((a, b) => a + b, 0) /
                            neighborhood.electricity.length
                        ).toLocaleString()}{" "}
                        kWh
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Ort. Su:</span>
                      <span className="stat-value">
                        {Math.round(
                          neighborhood.water.reduce((a, b) => a + b, 0) /
                            neighborhood.water.length
                        ).toLocaleString()}{" "}
                        m³
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Ort. Doğalgaz:</span>
                      <span className="stat-value">
                        {Math.round(
                          neighborhood.gas.reduce((a, b) => a + b, 0) /
                            neighborhood.gas.length
                        ).toLocaleString()}{" "}
                        m³
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🔹 System Statistics */}
          <div className="admin-section">
            <h2 className="admin-section-title">Sistem İstatistikleri</h2>
            <div className="system-stats">
              <div className="system-stat-card">
                <div className="system-stat-icon">🏘️</div>
                <div className="system-stat-content">
                  <h3 className="system-stat-title">Toplam Mahalle</h3>
                  <p className="system-stat-value">{neighborhoods.length}</p>
                </div>
              </div>

              <div className="system-stat-card">
                <div className="system-stat-icon">📊</div>
                <div className="system-stat-content">
                  <h3 className="system-stat-title">Aktif Veri Kaynağı</h3>
                  <p className="system-stat-value">3</p>
                </div>
              </div>

              <div className="system-stat-card">
                <div className="system-stat-icon">⚡</div>
                <div className="system-stat-content">
                  <h3 className="system-stat-title">Toplam Elektrik Tüketimi</h3>
                  <p className="system-stat-value">
                    {neighborhoods
                      .reduce(
                        (total, n) =>
                          total + n.electricity.reduce((a, b) => a + b, 0),
                        0
                      )
                      .toLocaleString()}{" "}
                    kWh
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
