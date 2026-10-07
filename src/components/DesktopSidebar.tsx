import React from 'react';
import {
  CheckCircle2,
  Calendar,
  CreditCard,
  Sparkles,
  Sun,
  Moon,
  Plus,
  RotateCcw,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const DesktopSidebar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    projects,
    activeProjectId,
    setActiveProjectId,
    tasks,
    transactions,
    chatSessions,
    activeSessionId,
    createNewSession,
    selectSession,
    deleteSession,
    setQuickCaptureOpen,
    resetAllData
  } = useApp();

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'notes',
      label: 'Notas',
      icon: <CheckCircle2 size={18} />,
      badge: tasks.filter((t) => !t.completed).length
    },
    {
      id: 'today',
      label: 'Hoy',
      icon: <Sun size={18} />
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: <Calendar size={18} />
    },
    {
      id: 'finance',
      label: 'Gastos & Balance',
      icon: <CreditCard size={18} />
    },
    {
      id: 'copilot',
      label: 'Copiloto IA',
      icon: <Sparkles size={18} />
    }
  ];

  return (
    <aside className="desktop-sidebar">
      {/* Brand / Profile Header */}
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="sidebar-avatar">J</div>
          <div>
            <h2 className="sidebar-name">Jhongo</h2>
            <p className="sidebar-sub">Kairós Workspace</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="sidebar-quick-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            className="sidebar-quick-btn"
            onClick={() => setQuickCaptureOpen(true)}
            title="Captura Rápida (Atajo)"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">Vistas Principales</p>
        <div className="sidebar-nav-list">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-label">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="sidebar-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lists / Notebooks */}
      <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p className="sidebar-section-title" style={{ margin: 0 }}>Mis Listas</p>
        </div>

        <div className="sidebar-nav-list">
          {/* General (todas las notas) */}
          <button
            className={`sidebar-nav-item ${activeTab === 'notes' && (activeProjectId === 'general' || !activeProjectId) ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('notes');
              setActiveProjectId('general');
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--system-blue)',
                marginRight: 4
              }}
            />
            <span className="sidebar-nav-label">General (Todas)</span>
            {tasks.filter((t) => !t.completed).length > 0 && (
              <span className="sidebar-nav-badge">
                {tasks.filter((t) => !t.completed).length}
              </span>
            )}
          </button>

          {projects.map((proj) => {
            const isProjActive = activeTab === 'notes' && activeProjectId === proj.id;
            const count = tasks.filter((t) => t.projectId === proj.id && !t.completed).length;

            return (
              <button
                key={proj.id}
                className={`sidebar-nav-item ${isProjActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('notes');
                  setActiveProjectId(proj.id);
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: proj.color || '#007aff',
                    marginRight: 4
                  }}
                />
                <span className="sidebar-nav-label">{proj.title}</span>
                {count > 0 && <span className="sidebar-nav-badge">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer Widget (Balance Summary) */}
      <div className="sidebar-footer">
        <div className="sidebar-balance-card" onClick={() => setActiveTab('finance')}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Saldo Disponible</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              ${balance.toLocaleString('es-CO')}
            </p>
          </div>
          <CreditCard size={18} style={{ color: 'var(--system-blue)', opacity: 0.8 }} />
        </div>

        <button
          className="sidebar-reset-btn"
          onClick={() => {
            if (window.confirm('¿Deseas restablecer los datos de prueba iniciales?')) {
              resetAllData();
            }
          }}
          title="Restablecer datos de prueba"
        >
          <RotateCcw size={13} />
          <span>Restablecer datos</span>
        </button>
      </div>
    </aside>
  );
};
