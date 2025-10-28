import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Electricity() {
  const electricityData = [
    { time: '00:00', consumption: 1200, cost: 240 },
    { time: '04:00', consumption: 800, cost: 160 },
    { time: '08:00', consumption: 1800, cost: 360 },
    { time: '12:00', consumption: 2200, cost: 440 },
    { time: '16:00', consumption: 2000, cost: 400 },
    { time: '20:00', consumption: 1600, cost: 320 },
  ];


  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Elektrik Analizi</h1>
          <p className="dashboard-subtitle">Belediyeniz genelinde elektrik tüketimi ve maliyetlerini izleyin</p>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="summary-card blue">
            <div className="summary-card-header">
              <svg className="summary-card-icon blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
              <p className="summary-card-title">Mevcut Kullanım</p>
            </div>
            <p className="summary-card-value">2,847 kWh</p>
            <div className="summary-card-change">
              <span className="summary-card-change-value increase">+12.5%</span>
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
            <p className="summary-card-value">€5,694</p>
            <div className="summary-card-change">
              <span className="summary-card-change-value increase">+8.2%</span>
              <span className="summary-card-change-text">geçen aya göre</span>
            </div>
          </div>

          <div className="summary-card yellow">
            <div className="summary-card-header">
              <svg className="summary-card-icon yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="summary-card-title">Zirve Talep</p>
            </div>
            <p className="summary-card-value">3.2 MW</p>
            <div className="summary-card-change">
              <span className="summary-card-change-value decrease">-5.1%</span>
              <span className="summary-card-change-text">geçen aya göre</span>
            </div>
          </div>

          <div className="summary-card" style={{ backgroundColor: '#faf5ff', borderColor: '#d8b4fe' }}>
            <div className="summary-card-header">
              <svg className="summary-card-icon" style={{ color: '#9333ea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="summary-card-title">Verimlilik</p>
            </div>
            <p className="summary-card-value">94.2%</p>
            <div className="summary-card-change">
              <span className="summary-card-change-value increase">+2.3%</span>
              <span className="summary-card-change-text">geçen aya göre</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="chart-container">
          <h3 className="chart-title">Günlük Tüketim Paterni</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={electricityData}>
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
              <Area type="monotone" dataKey="consumption" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Electricity;