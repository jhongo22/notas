import React from 'react';
import {
  Clock,
  AlertCircle,
  ArrowRight,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TodayView: React.FC = () => {
  const { tasks, events, transactions, toggleTask, setActiveTab } = useApp();

  const todayStr = '2026-10-07';

  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || (!t.dueDate && !t.completed));
  const completedTodayTasks = todayTasks.filter((t) => t.completed).length;

  const todayEvents = events.filter((e) => e.date === todayStr);

  const todayTransactions = transactions.filter((t) => t.date === todayStr && t.type === 'expense');
  const todaySpent = todayTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  return (
    <div className="main-content">
      {/* iOS Large Title */}
      <h1 className="ios-large-title">Hoy</h1>

      {/* Date Subtitle */}
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: -8, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
        Miércoles, 7 de Octubre
      </p>

      {/* Parcial / Event Alert if any */}
      {todayEvents.length > 0 && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255, 69, 58, 0.15)',
              color: 'var(--system-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertCircle size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {todayEvents[0].title}
            </h4>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {todayEvents[0].time} • {todayEvents[0].location || 'Presencial'}
            </p>
          </div>
        </div>
      )}

      {/* Desktop 2 Columns Grid */}
      <div className="desktop-two-cols">
        {/* Column 1: Today Tasks Section */}
        <div className="taskade-card" style={{ margin: 0 }}>
          <div className="card-header">
            <div className="card-title-group">
              <h2>Recordatorios de Hoy</h2>
              <p>{completedTodayTasks} de {todayTasks.length} completados</p>
            </div>
            <button
              onClick={() => setActiveTab('notes')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--system-blue)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              Ver todos <ArrowRight size={13} />
            </button>
          </div>

          <div className="tasks-list">
            {todayTasks.length === 0 ? (
              <div className="empty-state">
                <p>No tienes tareas asignadas a hoy.</p>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-main-row">
                    <button
                      className={`custom-checkbox ${task.completed ? 'checked' : ''}`}
                      onClick={() => toggleTask(task.id)}
                    >
                      {task.completed && <Check size={12} strokeWidth={3} />}
                    </button>
                    <div className="task-content">
                      <div className="task-text">{task.text}</div>
                      <div className="task-meta">
                        {task.priority === 'high' && (
                          <span className="meta-badge priority-high">Urgente</span>
                        )}
                        {task.dueTime && (
                          <span className="meta-badge due-badge">
                            <Clock size={10} /> {task.dueTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Today Expenses Section */}
        <div className="taskade-card" style={{ margin: 0 }}>
          <div className="card-header">
            <div className="card-title-group">
              <h2>Gastos de Hoy</h2>
              <p>Total: ${todaySpent.toLocaleString('es-CO')}</p>
            </div>
            <button
              onClick={() => setActiveTab('finance')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--system-blue)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              Billetera <ArrowRight size={13} />
            </button>
          </div>

          <div>
            {todayTransactions.length === 0 ? (
              <div className="empty-state">
                <p>No has registrado gastos hoy.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {todayTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '11px 0',
                      borderBottom: '0.5px solid var(--border-divider)'
                    }}
                  >
                    <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{tx.description}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--system-red)' }}>
                      -${Math.abs(tx.amount).toLocaleString('es-CO')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
