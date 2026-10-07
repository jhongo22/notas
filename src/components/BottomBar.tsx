import React from 'react';
import { CheckCircle2, Calendar, CreditCard, Sparkles, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomBar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="bottom-tab-bar">
      <div className="tab-bar-inner">
        <button
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <CheckCircle2 size={22} strokeWidth={activeTab === 'notes' ? 2.3 : 1.8} />
          <span className="tab-label">Notas</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <Sun size={22} strokeWidth={activeTab === 'today' ? 2.3 : 1.8} />
          <span className="tab-label">Hoy</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <Calendar size={22} strokeWidth={activeTab === 'calendar' ? 2.3 : 1.8} />
          <span className="tab-label">Calendario</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`}
          onClick={() => setActiveTab('finance')}
        >
          <CreditCard size={22} strokeWidth={activeTab === 'finance' ? 2.3 : 1.8} />
          <span className="tab-label">Gastos</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'copilot' ? 'active' : ''}`}
          onClick={() => setActiveTab('copilot')}
        >
          <Sparkles size={22} strokeWidth={activeTab === 'copilot' ? 2.3 : 1.8} />
          <span className="tab-label">Copiloto</span>
        </button>
      </div>
    </nav>
  );
};
