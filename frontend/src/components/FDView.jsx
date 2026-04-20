import React, { useState } from 'react';
import { Target, ArrowRight, Wallet } from 'lucide-react';
import axios from 'axios';

export default function FDView() {
  const [formData, setFormData] = useState({
    amount: 10000,
    duration_months: 12,
    goal: 'Emergency Fund'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/predict-fd', formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="view-header">
        <h1>FD Advisor</h1>
        <p>Simple and safe investment planning based on your goals.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '40px', marginTop: '20px' }}>
        
        {/* Form Layer */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'rgba(0,0,0,0.2)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Investment Amount (₹)</label>
            <input 
              type="number" 
              className="input-field" 
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Duration (Months)</label>
            <select 
              className="input-field"
              value={formData.duration_months}
              onChange={(e) => setFormData({...formData, duration_months: Number(e.target.value)})}
            >
              <option value={6}>6 Months</option>
              <option value={12}>1 Year</option>
              <option value={36}>3 Years</option>
              <option value={60}>5 Years</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>What are you saving for?</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
              placeholder="e.g. Dream Bike, Emergency"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Calculating...' : 'Get Advice'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Results Layer */}
        <div>
          {result ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))', padding: '30px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <Target size={32} color="#10b981" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Target: {formData.goal}</h3>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                  {result.explanation}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Guaranteed Interest ({result.interest_rate_percent}%)</p>
                  <h3 style={{ fontSize: '1.8rem', color: '#10b981' }}>+ ₹{result.estimated_returns.toLocaleString()}</h3>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Maturity Amount</p>
                  <h3 style={{ fontSize: '1.8rem', color: '#60a5fa' }}>₹{result.maturity_amount.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: '20px', color: 'var(--text-muted)' }}>
              <Wallet size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Enter your savings goal to see how FDs can help.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
