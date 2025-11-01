import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Water() {
  const waterData = [
    { time: '00:00', consumption: 800, pressure: 2.4 },
    { time: '04:00', consumption: 600, pressure: 2.6 },
    { time: '08:00', consumption: 1200, pressure: 2.2 },
    { time: '12:00', consumption: 1500, pressure: 2.0 },
    { time: '16:00', consumption: 1400, pressure: 2.1 },
    { time: '20:00', consumption: 1000, pressure: 2.3 },
  ];


  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Su Analizi</h1>
          <p className="dashboard-subtitle">Belediyeniz genelinde su tüketimi ve sistem performansını izleyin</p>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="summary-card blue">
            <div className="summary-card-header">
              <svg className="summary-card-icon blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <p className="summary-card-title">Mevcut Kullanım</p>
            </div>
            <p className="summary-card-value">1,456 m³</p>
            <div className="summary-card-change">
              <span className="summary-card-change-value increase">+8.2%</span>
              <span className="summary-card-change-text">geçen aya göre</span>
            </div>
          </div>

          <div className="summary-card green">
            <div className="summary-card-header">
              <svg className="summary-card-icon green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <p className="summary-card-title">Aylık Maliyet</p>
            </div>
            <p className="summary-card-value">€2,912</p>
            <div className="summary-card-change">
              <span className="summary-card-change-value increase">+6.8%</span>
              <span className="summary-card-change-text">geçen aya göre</span>
            </div>
          </div>

          <div className="summary-card yellow">
            <div className="summary-card-header">
              <svg className="summary-card-icon yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="summary-card-title">Sistem Basıncı</p>
            </div>
            <p className="summary-card-value">2.3 bar</p>
            <div className="summary-card-change">
              <span className="summary-card-change-value increase">Optimal aralık</span>
            </div>
          </div>

          <div className="summary-card" style={{ backgroundColor: '#faf5ff', borderColor: '#d8b4fe' }}>
            <div className="summary-card-header">
              <svg className="summary-card-icon" style={{ color: '#9333ea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="summary-card-title">Kalite Skoru</p>
            </div>
            <p className="summary-card-value">98.7%</p>
            <div className="summary-card-change">
              <span className="summary-card-change-value increase">Mükemmel</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="chart-container">
          <h3 className="chart-title">Günlük Su Tüketimi</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="consumption" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Water;