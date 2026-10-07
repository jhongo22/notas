import React, { useState } from 'react';
import {
  Plus,
  Clock,
  MapPin,
  Trash2,
  Calendar as CalIcon,
  CheckCircle2,
  Check,
  AlertCircle,
  HelpCircle,
  ListFilter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventCategory, CalendarEvent, TaskItem } from '../../types';

export const CalendarView: React.FC = () => {
  const { events, tasks, toggleTask, addEvent, deleteEvent } = useApp();

  const [selectedDate, setSelectedDate] = useState('2026-10-07');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'selected'>('all'); // 'all' muestra todas las cosas, 'selected' solo el día

  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('08:00');
  const [eventDate, setEventDate] = useState('2026-10-07');
  const [eventCat, setEventCat] = useState<EventCategory>('exam');
  const [eventLoc, setEventLoc] = useState('');

  const daysInMonth = 31;
  const startDayOffset = 3;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    addEvent(eventTitle, eventDate, eventTime, eventCat, eventLoc);
    setEventTitle('');
    setEventLoc('');
    setShowAddModal(false);
  };

  const getCategoryColor = (category: EventCategory) => {
    switch (category) {
      case 'exam':
        return 'var(--system-red)';
      case 'assignment':
        return 'var(--system-blue)';
      case 'meeting':
        return 'var(--system-orange)';
      case 'personal':
        return 'var(--system-green)';
    }
  };

  const getCategoryLabel = (category: EventCategory) => {
    switch (category) {
      case 'exam':
        return 'Parcial / Examen';
      case 'assignment':
        return 'Entrega Taller';
      case 'meeting':
        return 'Reunión / Tutoría';
      case 'personal':
        return 'Cita Personal';
    }
  };

  // 1. Tareas con fecha pendientes
  const pendingTasksWithDate = tasks.filter((t) => !t.completed && t.dueDate);

  // 2. Tareas sin fecha pendientes
  const pendingTasksWithoutDate = tasks.filter((t) => !t.completed && !t.dueDate);

  // 3. Unificar todos los ítems programados (Eventos + Tareas con fecha)
  interface ScheduledItem {
    id: string;
    type: 'event' | 'task';
    title: string;
    date: string;
    time?: string;
    category?: EventCategory;
    priority?: string;
    location?: string;
    taskRef?: TaskItem;
    eventRef?: CalendarEvent;
  }

  const allScheduledItems: ScheduledItem[] = [
    ...events.map((e) => ({
      id: e.id,
      type: 'event' as const,
      title: e.title,
      date: e.date,
      time: e.time,
      category: e.category,
      location: e.location,
      eventRef: e
    })),
    ...pendingTasksWithDate.map((t) => ({
      id: t.id,
      type: 'task' as const,
      title: t.text,
      date: t.dueDate!,
      time: t.dueTime,
      priority: t.priority,
      taskRef: t
    }))
  ];

  // Ordenar cronológicamente por fecha y hora
  allScheduledItems.sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return (a.time || '').localeCompare(b.time || '');
  });

  // Filtrar según el modo de visualización
  const displayedItems = filterMode === 'selected'
    ? allScheduledItems.filter((item) => item.date === selectedDate)
    : allScheduledItems;

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    // Al tocar un día, si el usuario quiere ver solo ese día puede cambiar o mantenemos el selector
  };

  return (
    <div className="main-content">
      {/* iOS Large Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <h1 className="ios-large-title" style={{ marginBottom: 2 }}>Calendario</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Agenda unificada de exámenes, entregas y tareas
          </p>
        </div>

        <button
          onClick={() => {
            setEventDate(selectedDate);
            setShowAddModal(true);
          }}
          style={{
            background: 'var(--system-blue)',
            color: '#ffffff',
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            padding: '7px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Agendar
        </button>
      </div>

      {/* Desktop 2 Columns Grid */}
      <div className="desktop-two-cols">
        {/* Column 1: Month Grid */}
        <div>
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '0.5px solid var(--border-divider)',
              boxShadow: 'var(--shadow-card)',
              marginBottom: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Octubre 2026
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Día seleccionado: {selectedDate}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                marginBottom: 10
              }}
            >
              <span>L</span>
              <span>M</span>
              <span>M</span>
              <span>J</span>
              <span>V</span>
              <span>S</span>
              <span>D</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={'empty-' + i} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `2026-10-${dayNum.toString().padStart(2, '0')}`;
                const isSelected = selectedDate === dateStr;
                const hasEvents = allScheduledItems.some((e) => e.date === dateStr);
                const hasExam = allScheduledItems.some((e) => e.date === dateStr && e.category === 'exam');

                return (
                  <button
                    key={dayNum}
                    onClick={() => handleDateClick(dateStr)}
                    style={{
                      aspectRatio: '1',
                      background: isSelected ? 'var(--text-primary)' : 'transparent',
                      border: 'none',
                      borderRadius: '50%',
                      color: isSelected ? 'var(--bg-surface)' : 'var(--text-primary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <span>{dayNum}</span>
                    {hasEvents && !isSelected && (
                      <span
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: hasExam ? 'var(--system-red)' : 'var(--system-blue)',
                          marginTop: 2
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Filtro de Lista */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface)',
              border: '0.5px solid var(--border-divider)',
              borderRadius: 'var(--radius-sm)',
              padding: 3,
              marginBottom: 14
            }}
          >
            <button
              onClick={() => setFilterMode('all')}
              style={{
                flex: 1,
                padding: '6px 0',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                background: filterMode === 'all' ? 'var(--bg-fill)' : 'transparent',
                color: filterMode === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Todo lo programado ({allScheduledItems.length})
            </button>
            <button
              onClick={() => setFilterMode('selected')}
              style={{
                flex: 1,
                padding: '6px 0',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                background: filterMode === 'selected' ? 'var(--bg-fill)' : 'transparent',
                color: filterMode === 'selected' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Solo día {selectedDate.slice(8)} ({allScheduledItems.filter((i) => i.date === selectedDate).length})
            </button>
          </div>
        </div>

        {/* Column 2: UNIFIED AGENDA LIST (ALL THINGS TO DO & UNASSIGNED DATES) */}
        <div>
          {/* Section: Cosas con Fecha */}
          <div className="taskade-card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title-group">
                <h2>
                  {filterMode === 'all' ? 'Cosas por hacer (Con fecha fijada)' : `Agenda del ${selectedDate}`}
                </h2>
                <p>
                  {displayedItems.length === 0
                    ? 'No hay pendientes programados'
                    : `${displayedItems.length} compromiso(s) y tarea(s)`}
                </p>
              </div>
            </div>

            {displayedItems.length === 0 ? (
              <div className="empty-state">
                <p>No tienes actividades programadas para este filtro.</p>
              </div>
            ) : (
              <div className="tasks-list">
                {displayedItems.map((item) => {
                  const isTask = item.type === 'task';
                  const catColor = item.category ? getCategoryColor(item.category) : 'var(--system-blue)';

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '11px 0',
                        borderBottom: '0.5px solid var(--border-divider)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12
                      }}
                    >
                      {/* Checkbox si es tarea, o barra de color si es evento */}
                      {isTask ? (
                        <button
                          className="custom-checkbox"
                          style={{ marginTop: 2 }}
                          onClick={() => toggleTask(item.id)}
                          title="Marcar como hecha"
                        />
                      ) : (
                        <div
                          style={{
                            width: 3,
                            height: 38,
                            borderRadius: 2,
                            background: catColor,
                            flexShrink: 0,
                            marginTop: 2
                          }}
                        />
                      )}

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--text-primary)' }}>
                            {item.title}
                          </h3>

                          {/* Badge de tipo */}
                          {item.category && (
                            <span
                              className="meta-badge"
                              style={{
                                background: 'var(--bg-fill)',
                                color: catColor,
                                fontWeight: 600,
                                fontSize: 10
                              }}
                            >
                              {getCategoryLabel(item.category)}
                            </span>
                          )}

                          {isTask && (
                            <span
                              className="meta-badge"
                              style={{
                                background: 'var(--bg-fill)',
                                color: 'var(--text-secondary)',
                                fontSize: 10
                              }}
                            >
                              Tarea
                            </span>
                          )}
                        </div>

                        {/* Fecha y detalles */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, color: 'var(--system-blue)' }}>
                            <CalIcon size={11} /> {item.date}
                          </span>

                          {item.time && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={11} /> {item.time}
                            </span>
                          )}

                          {item.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <MapPin size={11} /> {item.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botón borrar solo en eventos */}
                      {!isTask && (
                        <button
                          className="action-icon-btn"
                          onClick={() => deleteEvent(item.id)}
                          title="Eliminar evento"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: COSAS PENDIENTES SIN FECHA ASIGNADA */}
          <div className="taskade-card" style={{ margin: 0 }}>
            <div className="card-header">
              <div className="card-title-group">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HelpCircle size={16} style={{ color: 'var(--system-orange)' }} />
                  Pendientes sin fecha asignada
                </h2>
                <p>
                  {pendingTasksWithoutDate.length === 0
                    ? 'Todas tus tareas tienen fecha fijada'
                    : `${pendingTasksWithoutDate.length} tarea(s) pendientes de programar`}
                </p>
              </div>
            </div>

            {pendingTasksWithoutDate.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 10px' }}>
                <p>Excelente: no tienes tareas flotantes sin fecha.</p>
              </div>
            ) : (
              <div className="tasks-list">
                {pendingTasksWithoutDate.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '10px 0',
                      borderBottom: '0.5px solid var(--border-divider)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <button
                      className="custom-checkbox"
                      onClick={() => toggleTask(task.id)}
                      title="Marcar como hecha"
                    />

                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                        {task.text}
                      </span>
                      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                        <span
                          className="meta-badge"
                          style={{
                            background: 'rgba(255, 149, 0, 0.12)',
                            color: 'var(--system-orange)',
                            fontSize: 10
                          }}
                        >
                          Sin fecha
                        </span>
                        {task.priority === 'high' && (
                          <span className="meta-badge priority-high" style={{ fontSize: 10 }}>
                            Urgente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Agendar Evento */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>
              Nuevo Compromiso o Examen
            </h3>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>
                  Título
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Ej: Parcial de Matemáticas Aula 302..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-app)',
                    border: '0.5px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-app)',
                      border: '0.5px solid var(--border-divider)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>
                    Hora
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-app)',
                      border: '0.5px solid var(--border-divider)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>
                  Tipo
                </label>
                <select
                  value={eventCat}
                  onChange={(e) => setEventCat(e.target.value as EventCategory)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-app)',
                    border: '0.5px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none'
                  }}
                >
                  <option value="exam">Parcial / Examen Universitario</option>
                  <option value="assignment">Entrega de Taller / Trabajo</option>
                  <option value="meeting">Reunión / Asesoría</option>
                  <option value="personal">Cita Personal / Médico</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>
                  Lugar o Enlace (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Aula 302..."
                  value={eventLoc}
                  onChange={(e) => setEventLoc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-app)',
                    border: '0.5px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
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
                    borderRadius: 'var(--radius-sm)',
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
