import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Gas() {
  const gasData = [
    { time: '00:00', consumption: 1800, temperature: 18 },
    { time: '04:00', consumption: 1600, temperature: 16 },
    { time: '08:00', consumption: 2200, temperature: 20 },
    { time: '12:00', consumption: 2000, temperature: 22 },
    { time: '16:00', consumption: 2400, temperature: 24 },
    { time: '20:00', consumption: 2600, temperature: 26 },
  ];


  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Doğalgaz Analizi</h1>
          <p className="dashboard-subtitle">Belediyeniz genelinde doğalgaz tüketimi ve ısıtma verimliliğini izleyin</p>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="summary-card blue">
            <div className="summary-card-header">
              <svg className="summary-card-icon blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
              <p className="summary-card-title">Mevcut Kullanım</p>
            </div>
            <p className="summary-card-value">2,134 m³</p>
            <div className="summary-card-change">
              <span className="summary-card-change-value decrease">-3.1%</span>
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
            <p className="summary-card-value">€4,268</p>
            <div className="summary-card-change">
              <span className="summary-card-change-value decrease">-5.2%</span>
              <span className="summary-card-change-text">geçen aya göre</span>
            </div>
          </div>

          <div className="summary-card yellow">
            <div className="summary-card-header">
              <svg className="summary-card-icon yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <p className="summary-card-title">Ortalama Sıcaklık</p>
            </div>
            <p className="summary-card-value">21°C</p>
            <div className="summary-card-change">
              <span className="summary-card-change-value increase">Optimal aralık</span>
            </div>
          </div>

          <div className="summary-card" style={{ backgroundColor: '#faf5ff', borderColor: '#d8b4fe' }}>
            <div className="summary-card-header">
              <svg className="summary-card-icon" style={{ color: '#9333ea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="summary-card-title">Verimlilik</p>
            </div>
            <p className="summary-card-value">92.8%</p>
            <div className="summary-card-change">
              <span className="summary-card-change-value increase">+1.5%</span>
              <span className="summary-card-change-text">geçen aya göre</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="chart-container">
          <h3 className="chart-title">Günlük Doğalgaz Tüketimi</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={gasData}>
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
              <Area type="monotone" dataKey="consumption" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Gas;