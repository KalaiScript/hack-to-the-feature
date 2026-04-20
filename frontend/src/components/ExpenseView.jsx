import React, { useState } from 'react';
import { Upload, AlertCircle, IndianRupee } from 'lucide-react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8000/api/analyze-expenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the file. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = data ? {
    labels: data.breakdown.map(b => b.category),
    datasets: [{
      data: data.breakdown.map(b => b.percentage),
      backgroundColor: [
        '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  } : null;

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#f8fafc', font: { family: 'Outfit' } }
      }
    },
    cutout: '70%',
    maintainAspectRatio: false
  };

  return (
    <div className="expense-container">
      <div className="view-header">
        <h1>Expense Dashboard</h1>
        <p>Upload a bank statement (CSV) to get AI categorized insights instantly.</p>
      </div>

      {!data && !loading && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          justifyContent: 'center', flex: 1, border: '2px dashed var(--border)', 
          borderRadius: '20px', padding: '60px 20px', marginTop: '20px', background: 'rgba(0,0,0,0.1)'
        }}>
          <Upload size={48} color="#94a3b8" style={{ marginBottom: '20px' }} />
          <h3 style={{ marginBottom: '10px' }}>Upload your latest statement</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>CSV format only for the MVP demo</p>
          
          <label className="btn-primary" style={{ cursor: 'pointer', padding: '12px 24px' }}>
            Choose CSV File
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <h3>Crunching numbers with AI...</h3>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '16px', borderRadius: '12px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
          <AlertCircle />
          {error}
        </div>
      )}

      {data && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            {/* Left Col: Summary & Insight */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(167, 139, 250, 0.1))', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '20px', padding: '30px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '1.1rem' }}>Total Spent</p>
                <h2 style={{ fontSize: '3rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IndianRupee size={36} />
                  {data.total_spent.toLocaleString()}
                </h2>
              </div>
              
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '20px', padding: '24px', display: 'flex', gap: '16px' }}>
                <div style={{ color: 'var(--warning)', marginTop: '4px' }}><AlertCircle size={24} /></div>
                <div>
                  <h3 style={{ color: 'var(--warning)', marginBottom: '8px' }}>AI Insight</h3>
                  <p style={{ lineHeight: '1.6' }}>{data.insights}</p>
                </div>
              </div>
            </div>

            {/* Right Col: Chart */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', height: '400px' }}>
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
          
          <button onClick={() => setData(null)} className="btn-primary" style={{ width: 'fit-content', background: 'transparent', border: '1px solid var(--border)', marginTop: 'auto' }}>
            Upload another file
          </button>
        </div>
      )}
    </div>
  );
}
