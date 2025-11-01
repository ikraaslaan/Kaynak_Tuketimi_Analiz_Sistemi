import React, { useState, useEffect } from 'react';
import { fetchElectricityData, fetchWaterData, fetchGasData, getNeighborhoods } from '../api';

/**
 * Demo component showing how to use the Municipal Energy API
 * This component demonstrates data fetching, loading states, and error handling
 */
function EnergyDataDemo() {
  const [electricityData, setElectricityData] = useState([]);
  const [waterData, setWaterData] = useState([]);
  const [gasData, setGasData] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel for better performance
        const [electricityResponse, waterResponse, gasResponse, neighborhoodsResponse] = await Promise.all([
          fetchElectricityData(),
          fetchWaterData(),
          fetchGasData(),
          getNeighborhoods()
        ]);

        // Check if all requests were successful
        if (electricityResponse.success && waterResponse.success && gasResponse.success && neighborhoodsResponse.success) {
          setElectricityData(electricityResponse.data);
          setWaterData(waterResponse.data);
          setGasData(gasResponse.data);
          setNeighborhoods(neighborhoodsResponse.data);
        } else {
          setError('Failed to load some data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Calculate summary statistics
  const calculateSummary = (data, field) => {
    if (!data.length) return { total: 0, average: 0, min: 0, max: 0 };
    
    const values = data.map(item => item[field]);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = Math.round(total / values.length);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { total, average, min, max };
  };

  const electricitySummary = calculateSummary(electricityData, 'electricity');
  const waterSummary = calculateSummary(waterData, 'water');
  const gasSummary = calculateSummary(gasData, 'gas');

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-wrapper">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Loading Energy Data...</h1>
            <p className="dashboard-subtitle">Fetching data from municipal energy systems</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1.2rem', color: '#6b7280' }}>Please wait while we load the data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-wrapper">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Error Loading Data</h1>
            <p className="dashboard-subtitle">There was a problem fetching the energy data</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1.2rem', color: '#dc2626' }}>Error: {error}</div>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                marginTop: '1rem', 
                padding: '0.5rem 1rem', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Municipal Energy Data Demo</h1>
          <p className="dashboard-subtitle">
            Real-time data from {neighborhoods.length} neighborhoods across the municipality
          </p>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card blue">
            <div className="summary-card-header">
              <svg className="summary-card-icon blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
              <p className="summary-card-title">Electricity</p>
            </div>
            <p className="summary-card-value">{electricitySummary.total.toLocaleString()} kWh</p>
            <div className="summary-card-change">
              <span className="summary-card-change-text">
                Avg: {electricitySummary.average} kWh | Range: {electricitySummary.min}-{electricitySummary.max} kWh
              </span>
            </div>
          </div>

          <div className="summary-card green">
            <div className="summary-card-header">
              <svg className="summary-card-icon green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <p className="summary-card-title">Water</p>
            </div>
            <p className="summary-card-value">{waterSummary.total.toLocaleString()} m³</p>
            <div className="summary-card-change">
              <span className="summary-card-change-text">
                Avg: {waterSummary.average} m³ | Range: {waterSummary.min}-{waterSummary.max} m³
              </span>
            </div>
          </div>

          <div className="summary-card yellow">
            <div className="summary-card-header">
              <svg className="summary-card-icon yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
              <p className="summary-card-title">Gas</p>
            </div>
            <p className="summary-card-value">{gasSummary.total.toLocaleString()} m³</p>
            <div className="summary-card-change">
              <span className="summary-card-change-text">
                Avg: {gasSummary.average} m³ | Range: {gasSummary.min}-{gasSummary.max} m³
              </span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="chart-container">
          <h3 className="chart-title">Sample Data (First 10 Records)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Neighborhood</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Month</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Electricity (kWh)</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Water (m³)</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Gas (m³)</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Total Cost (€)</th>
                </tr>
              </thead>
              <tbody>
                {electricityData.slice(0, 10).map((record, index) => {
                  const waterRecord = waterData[index];
                  const gasRecord = gasData[index];
                  const totalCost = (record.cost || 0) + (waterRecord?.cost || 0) + (gasRecord?.cost || 0);
                  
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem' }}>{record.neighborhood}</td>
                      <td style={{ padding: '0.75rem' }}>{record.month}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>{record.electricity}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>{waterRecord?.water || 0}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>{gasRecord?.gas || 0}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                        €{totalCost.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Showing 10 of {electricityData.length} total records
          </div>
        </div>

        {/* API Information */}
        <div className="chart-container">
          <h3 className="chart-title">API Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <strong>Total Records:</strong> {electricityData.length}
            </div>
            <div>
              <strong>Neighborhoods:</strong> {neighborhoods.length}
            </div>
            <div>
              <strong>Data Period:</strong> 12 months (2025)
            </div>
            <div>
              <strong>API Delay:</strong> 500ms (simulated)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnergyDataDemo;

