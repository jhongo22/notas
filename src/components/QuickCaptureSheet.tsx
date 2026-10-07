import React, { useState } from 'react';
import { X, ArrowUp, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MarkdownRenderer } from './MarkdownRenderer';

export const QuickCaptureSheet: React.FC = () => {
  const { quickCaptureOpen, setQuickCaptureOpen, processCommand, setActiveTab, isAILoading } = useApp();
  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!quickCaptureOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isAILoading) return;

    const res = await processCommand(inputVal);
    if (res.success) {
      setFeedback(res.reply);
      setInputVal('');
    }
  };

  const handleShortcutClick = (text: string) => {
    setInputVal(text);
  };

  return (
    <div className="modal-overlay" onClick={() => setQuickCaptureOpen(false)}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Captura Rápida</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Escribe como en WhatsApp para registrar</p>
          </div>

          <button
            onClick={() => setQuickCaptureOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 4
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Form iOS Style */}
        <form onSubmit={handleSubmit} style={{ position: 'relative', marginBottom: 12 }}>
          <input
            type="text"
            autoFocus
            disabled={isAILoading}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={isAILoading ? 'Procesando con IA...' : 'Ej: -3000 gaseosa o Parcial el viernes 8am...'}
            style={{
              width: '100%',
              padding: '11px 40px 11px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-app)',
              border: '0.5px solid var(--border-divider)',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || isAILoading}
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: inputVal.trim() && !isAILoading ? 'var(--system-blue)' : 'var(--bg-fill)',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputVal.trim() && !isAILoading ? 'pointer' : 'default',
              transition: 'opacity 0.15s'
            }}
          >
            {isAILoading ? (
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <ArrowUp size={15} strokeWidth={2.5} />
            )}
          </button>
        </form>

        {/* Feedback Box */}
        {feedback && (
          <div
            style={{
              background: 'var(--bg-app)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              marginBottom: 12,
              fontSize: 13,
              lineHeight: 1.4,
              color: 'var(--text-primary)',
              border: '0.5px solid var(--border-divider)'
            }}
          >
            <MarkdownRenderer content={feedback} />
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: 6 }}>
            Ejemplos de captura:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              '-3000 gaseosa',
              '-14500 almuerzo',
              'Parcial de física el viernes a las 9am',
              'Comprar cartulina para maqueta',
              '¿Cuánto he gastado hoy?'
            ].map((shortcut, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleShortcutClick(shortcut)}
                style={{
                  background: 'var(--bg-app)',
                  border: '0.5px solid var(--border-divider)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '5px 9px',
                  color: 'var(--text-secondary)',
                  fontSize: 11.5,
                  cursor: 'pointer'
                }}
              >
                {shortcut}
              </button>
            ))}
          </div>
        </div>

        {/* Link to Full Chat */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '0.5px solid var(--border-divider)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>¿Deseas consultar más detalles?</span>
          <button
            type="button"
            onClick={() => {
              setQuickCaptureOpen(false);
              setActiveTab('copilot');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--system-blue)',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
          >
            Abrir chat <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
