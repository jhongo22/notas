import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Coffee,
  Bus,
  BookOpen,
  Gamepad2,
  Zap,
  CreditCard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FinanceCategory } from '../../types';

export const FinanceView: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, setQuickCaptureOpen } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<FinanceCategory>('comida');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const categoryTotals: Record<FinanceCategory, number> = {
    comida: 0,
    transporte: 0,
    universidad: 0,
    ocio: 0,
    servicios: 0,
    ingresos: 0,
    otros: 0
  };

  transactions.forEach((t) => {
    if (t.type === 'expense') {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    }
  });

  const getCategoryDetails = (cat: FinanceCategory) => {
    switch (cat) {
      case 'comida':
        return { label: 'Comida & Bebidas', color: '#ff9f0a', icon: <Coffee size={14} /> };
      case 'transporte':
        return { label: 'Transporte', color: '#0a84ff', icon: <Bus size={14} /> };
      case 'universidad':
        return { label: 'Universidad', color: '#bf5af2', icon: <BookOpen size={14} /> };
      case 'ocio':
        return { label: 'Ocio', color: '#ff453a', icon: <Gamepad2 size={14} /> };
      case 'servicios':
        return { label: 'Servicios', color: '#30d158', icon: <Zap size={14} /> };
      default:
        return { label: 'Otros', color: '#8e8e93', icon: <CreditCard size={14} /> };
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(/[^\d.]/g, ''));
    if (!desc.trim() || isNaN(num) || num <= 0) return;

    const finalAmount = type === 'expense' ? -num : num;
    addTransaction(finalAmount, desc, category, new Date().toISOString().split('T')[0], type);

    setAmount('');
    setDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="main-content">
      {/* iOS Large Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 className="ios-large-title" style={{ marginBottom: 2 }}>Gastos</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Resumen Financiero Personal</p>
        </div>

        <button
          onClick={() => {
            setType('expense');
            setShowAddModal(true);
          }}
          style={{
            background: 'var(--system-blue)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '7px 14px',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Registrar Movimiento
        </button>
      </div>

      {/* Desktop 2 Columns Layout */}
      <div className="desktop-two-cols">
        {/* Column 1: Balance and Categories Breakdown */}
        <div>
          {/* Apple Wallet Style Clean Balance Card */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 18px',
              marginBottom: 16
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Saldo Disponible
            </span>

            <h2
              style={{
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: -0.8,
                marginTop: 4,
                color: 'var(--text-primary)'
              }}
            >
              ${balance.toLocaleString('es-CO')}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px'
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Ingresos
                </span>
                <p style={{ fontSize: 15, fontWeight: 600, marginTop: 2, color: 'var(--system-green)' }}>
                  +${totalIncome.toLocaleString('es-CO')}
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px'
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Gastos
                </span>
                <p style={{ fontSize: 15, fontWeight: 600, marginTop: 2, color: 'var(--system-red)' }}>
                  -${totalExpense.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          </div>

          {/* Desglose por Categorías */}
          <div className="taskade-card" style={{ margin: 0 }}>
            <div className="card-header">
              <div className="card-title-group">
                <h2>Categorías</h2>
                <p>Gastos de este mes</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(['comida', 'transporte', 'universidad', 'ocio', 'servicios', 'otros'] as FinanceCategory[]).map((cat) => {
                const spent = categoryTotals[cat] || 0;
                if (spent === 0) return null;
                const percent = totalExpense > 0 ? Math.round((spent / totalExpense) * 100) : 0;
                const details = getCategoryDetails(cat);

                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: details.color }}>{details.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{details.label}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>${spent.toLocaleString('es-CO')}</span>
                    </div>

                    <div style={{ width: '100%', height: 4, background: 'var(--bg-fill)', borderRadius: 2, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: details.color,
                          borderRadius: 2
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Movements List */}
        <div className="taskade-card" style={{ margin: 0 }}>
          <div className="card-header">
            <div className="card-title-group">
              <h2>Movimientos Recientes</h2>
              <p>{transactions.length} registros</p>
            </div>
          </div>

          <div className="tasks-list">
            {transactions.map((tx) => {
              const isInc = tx.type === 'income';
              const details = getCategoryDetails(tx.category);

              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '0.5px solid var(--border-divider)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: 'var(--bg-fill)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: details.color
                      }}
                    >
                      {details.icon}
                    </div>

                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {tx.description}
                      </h4>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {tx.date} • {details.label}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: isInc ? 'var(--system-green)' : 'var(--text-primary)'
                      }}
                    >
                      {isInc ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('es-CO')}
                    </span>

                    <button
                      className="action-icon-btn"
                      onClick={() => deleteTransaction(tx.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Registrar */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>
              {type === 'expense' ? 'Registrar Gasto' : 'Registrar Ingreso'}
            </h3>

            <div
              style={{
                display: 'flex',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-xs)',
                padding: 2,
                marginBottom: 14
              }}
            >
              <button
                type="button"
                onClick={() => setType('expense')}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 4,
                  border: 'none',
                  background: type === 'expense' ? 'var(--bg-fill)' : 'transparent',
                  color: type === 'expense' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 4,
                  border: 'none',
                  background: type === 'income' ? 'var(--bg-fill)' : 'transparent',
                  color: type === 'income' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Ingreso
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>
                  Monto ($ COP)
                </label>
                <input
                  type="number"
                  autoFocus
                  required
                  placeholder="3000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface-elevated)',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: 16,
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>
                  Concepto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Gaseosa, Almuerzo..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface-elevated)',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FinanceCategory)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface-elevated)',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none'
                  }}
                >
                  <option value="comida" style={{ background: '#1c1c1e' }}>Comida & Bebidas</option>
                  <option value="transporte" style={{ background: '#1c1c1e' }}>Transporte</option>
                  <option value="universidad" style={{ background: '#1c1c1e' }}>Universidad</option>
                  <option value="ocio" style={{ background: '#1c1c1e' }}>Ocio</option>
                  <option value="servicios" style={{ background: '#1c1c1e' }}>Servicios</option>
                  <option value="ingresos" style={{ background: '#1c1c1e' }}>Ingresos</option>
                  <option value="otros" style={{ background: '#1c1c1e' }}>Otros</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 14px',
                    color: 'var(--system-blue)',
                    fontSize: 14
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'var(--system-blue)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
