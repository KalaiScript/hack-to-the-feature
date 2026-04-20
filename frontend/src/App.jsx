import React, { useState } from 'react';
import { Home, PieChart, TrendingUp } from 'lucide-react';
import ChatView from './components/ChatView';
import ExpenseView from './components/ExpenseView';
import FDView from './components/FDView';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('chat');

  const renderContent = () => {
    switch (activeTab) {
      case 'chat': return <ChatView />;
      case 'expenses': return <ExpenseView />;
      case 'fd': return <FDView />;
      default: return <ChatView />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="glass-panel sidebar">
        <div className="logo">
          <h2>MoneyCoach</h2>
        </div>
        <div className="nav-items">
          <button 
            className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <Home size={20} />
            <span>Assistant</span>
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            <PieChart size={20} />
            <span>Expenses</span>
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'fd' ? 'active' : ''}`}
            onClick={() => setActiveTab('fd')}
          >
            <TrendingUp size={20} />
            <span>FD Advisor</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="glass-panel content-wrapper animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
