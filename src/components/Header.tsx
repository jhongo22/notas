import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Plus, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { setQuickCaptureOpen, resetAllData, theme, toggleTheme, activeTab } = useApp();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  // Al cambiar de pestaña, resetear visibilidad del header
  useEffect(() => {
    setHidden(false);
    lastScrollY.current = window.scrollY;
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Si estamos en la parte superior o cerca del tope (<= 24px), siempre visible
      if (currentScrollY <= 24) {
        setHidden(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      // Scrolleando hacia abajo -> esconder
      if (diff > 8 && currentScrollY > 40) {
        setHidden(true);
      } else if (diff < -8) {
        // Scrolleando hacia arriba -> mostrar
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const todayFormatted = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  }).format(new Date());

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <header className={`top-header ${hidden ? 'header-hidden' : ''}`}>
      <div className="header-user-badge">
        <div className="user-avatar">
          J
        </div>
        <div className="header-title-box">
          <h1>Jhongo</h1>
          <p>{capitalize(todayFormatted)}</p>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="icon-btn"
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          className="icon-btn"
          title="Recargar datos iniciales"
          onClick={() => {
            if (window.confirm('¿Deseas restablecer los datos quemados?')) {
              resetAllData();
            }
          }}
        >
          <RotateCcw size={15} />
        </button>

        <button
          className="icon-btn"
          title="Captura rápida"
          onClick={() => setQuickCaptureOpen(true)}
        >
          <Plus size={18} />
        </button>
      </div>
    </header>
  );
};
