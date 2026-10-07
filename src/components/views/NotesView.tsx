import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Calendar as CalIcon,
  Search,
  Layers,
  Edit2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Priority } from '../../types';

export const NotesView: React.FC = () => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    updateTaskText,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addProject,
    setQuickCaptureOpen
  } = useApp();

  // 'general' es la vista principal por defecto donde se ven todas las tareas
  const [selectedFilter, setSelectedFilter] = useState<string>('general');

  // Modal "+ Nueva Nota" Completa
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [modalNoteText, setModalNoteText] = useState('');
  const [modalProject, setModalProject] = useState<string>('proj-uni');
  const [modalPriority, setModalPriority] = useState<Priority>('medium');
  const [modalDueDate, setModalDueDate] = useState('');

  // Subtareas y edición
  const [activeSubtaskInputId, setActiveSubtaskInputId] = useState<string | null>(null);
  const [subtaskText, setSubtaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Nueva lista modal y completadas
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [showCompletedHistory, setShowCompletedHistory] = useState(false);

  const isGeneral = selectedFilter === 'general';
  const activeProject = projects.find((p) => p.id === selectedFilter);

  // Tareas pendientes (ESTRICTAMENTE SOLO LAS NO MARCADAS !completed)
  const pendingTasks = tasks.filter((t) => {
    if (t.completed) return false;
    if (isGeneral) return true;
    return t.projectId === selectedFilter;
  });

  // Tareas completadas (ocultas por defecto)
  const completedTasks = tasks.filter((t) => {
    if (!t.completed) return false;
    if (isGeneral) return true;
    return t.projectId === selectedFilter;
  });

  const allPendingCount = tasks.filter((t) => !t.completed).length;

  // 2. Agregar nota detallada desde el Modal Principal
  const handleModalAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNoteText.trim()) return;
    addTask(modalNoteText, modalProject, modalPriority, modalDueDate || undefined);
    setModalNoteText('');
    setModalDueDate('');
    setShowNewNoteModal(false);
  };

  const handleAddSubtask = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskText.trim()) return;
    addSubtask(taskId, subtaskText);
    setSubtaskText('');
    setActiveSubtaskInputId(null);
  };

  const handleSaveEdit = (taskId: string) => {
    if (editingText.trim()) {
      updateTaskText(taskId, editingText.trim());
    }
    setEditingTaskId(null);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    addProject(newProjectTitle, 'Folder', '#007aff', 'Notas y tareas');
    setNewProjectTitle('');
    setShowNewProjectModal(false);
  };

  const getProjectName = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    return proj ? proj.title : 'General';
  };

  const getProjectColor = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    return proj ? proj.color : '#007aff';
  };

  return (
    <div className="main-content">
      {/* iOS Large Title & Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <h1 className="ios-large-title" style={{ marginBottom: 2 }}>Notas</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {allPendingCount} notas pendientes en total
          </p>
        </div>

        {/* Botón Principal "+ Nueva Nota" que SIEMPRE funciona */}
        <button
          onClick={() => {
            setModalProject(isGeneral ? (projects[0]?.id || 'proj-uni') : selectedFilter);
            setShowNewNoteModal(true);
          }}
          style={{
            background: 'var(--system-blue)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 122, 255, 0.25)'
          }}
        >
          <Plus size={16} /> Nueva Nota
        </button>
      </div>

      {/* iOS Spotlight Quick Capture */}
      <div className="quick-bar" onClick={() => setQuickCaptureOpen(true)}>
        <Search size={15} className="quick-bar-icon" />
        <span className="quick-bar-placeholder">
          Escribe un gasto (-3000 gaseosa) o pregunta al copiloto...
        </span>
        <span className="quick-bar-badge">Copiloto</span>
      </div>

      {/* Horizontal Folders / Projects Carousel */}
      <div className="projects-scroll">
        {/* Pestaña Principal: GENERAL (Por defecto) */}
        <button
          className={`project-chip ${isGeneral ? 'active' : ''}`}
          onClick={() => {
            setSelectedFilter('general');
            setActiveProjectId('general');
          }}
        >
          <Layers size={13} style={{ marginRight: 2 }} />
          <span>General</span>
          {allPendingCount > 0 && (
            <span style={{ fontSize: 11, opacity: 0.75, marginLeft: 2 }}>
              {allPendingCount}
            </span>
          )}
        </button>

        {/* Categorías específicas */}
        {projects.map((proj) => {
          const isActive = selectedFilter === proj.id;
          const count = tasks.filter((t) => t.projectId === proj.id && !t.completed).length;
          return (
            <button
              key={proj.id}
              className={`project-chip ${isActive ? 'active' : ''}`}
              onClick={() => {
                setSelectedFilter(proj.id);
                setActiveProjectId(proj.id);
              }}
            >
              <span
                className="chip-dot"
                style={{ backgroundColor: isActive ? 'var(--bg-surface)' : proj.color || '#007aff' }}
              />
              <span>{proj.title}</span>
              {count > 0 && (
                <span style={{ fontSize: 11, opacity: 0.75, marginLeft: 2 }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <button
          className="project-chip"
          onClick={() => setShowNewProjectModal(true)}
          style={{ opacity: 0.8 }}
        >
          <Plus size={13} />
          <span>Nueva Lista</span>
        </button>
      </div>

      {/* Inset Grouped Card (Tasks Container) */}
      <div className="taskade-card">
        <div className="card-header">
          <div className="card-title-group">
            <h2>
              {isGeneral ? 'General (Todas las notas pendientes)' : activeProject?.title}
            </h2>
            <p>
              {pendingTasks.length === 0
                ? 'No hay notas pendientes'
                : `${pendingTasks.length} pendiente(s) por hacer`}
            </p>
          </div>
        </div>

        {/* Lista de Tareas - SOLO PENDIENTES SIN CHECK */}
        <div className="tasks-list">
          {pendingTasks.length === 0 ? (
            <div className="empty-state">
              <p>🎉 ¡No tienes notas pendientes aquí!</p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                Usa el botón "+ Nueva Nota" arriba o escribe en la barra superior.
              </p>
            </div>
          ) : (
            pendingTasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-main-row">
                  {/* Apple Reminders Style Circular Checkbox */}
                  <button
                    className="custom-checkbox"
                    onClick={() => toggleTask(task.id)}
                    title="Marcar como hecha"
                    aria-label="Marcar como hecha"
                  />

                  {/* Task Content / Edit mode */}
                  <div className="task-content">
                    {editingTaskId === task.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          type="text"
                          autoFocus
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(task.id);
                            if (e.key === 'Escape') setEditingTaskId(null);
                          }}
                          style={{
                            flex: 1,
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--bg-app)',
                            border: '1px solid var(--system-blue)',
                            color: 'var(--text-primary)',
                            fontSize: 14,
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          style={{
                            background: 'var(--system-blue)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '3px 8px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <div
                        className="task-text"
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditingText(task.text);
                        }}
                        title="Toca para editar"
                        style={{ cursor: 'pointer' }}
                      >
                        {task.text}
                      </div>
                    )}

                    <div className="task-meta">
                      {/* Badge de Categoría en vista General */}
                      {isGeneral && (
                        <span
                          className="meta-badge"
                          style={{
                            background: 'var(--bg-fill)',
                            color: 'var(--text-secondary)',
                            fontWeight: 600
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: getProjectColor(task.projectId),
                              marginRight: 4
                            }}
                          />
                          {getProjectName(task.projectId)}
                        </span>
                      )}

                      {task.priority === 'high' && (
                        <span className="meta-badge priority-high">
                          Urgente
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="meta-badge due-badge">
                          <CalIcon size={10} /> {task.dueDate}
                        </span>
                      )}
                      {task.tags?.map((tag, i) => (
                        <span key={i} className="meta-badge" style={{ color: 'var(--text-tertiary)' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Acciones: Editar y Borrar */}
                  <div className="task-actions">
                    <button
                      className="action-icon-btn"
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditingText(task.text);
                      }}
                      title="Editar nota"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="action-icon-btn"
                      onClick={() => deleteTask(task.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subtasks (Taskade Indented Outline) */}
                <div className="subtasks-container">
                  {task.subtasks.map((st) => (
                    <div key={st.id} className={`subtask-row ${st.completed ? 'completed' : ''}`}>
                      <button
                        className={`subtask-checkbox ${st.completed ? 'checked' : ''}`}
                        onClick={() => toggleSubtask(task.id, st.id)}
                      />
                      <span className="subtask-text">{st.text}</span>
                      <button
                        className="action-icon-btn"
                        style={{ padding: 2 }}
                        onClick={() => deleteSubtask(task.id, st.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Input para agregar subtarea */}
                  {activeSubtaskInputId === task.id ? (
                    <form
                      onSubmit={(e) => handleAddSubtask(task.id, e)}
                      style={{ display: 'flex', gap: 6, marginTop: 4 }}
                    >
                      <input
                        type="text"
                        autoFocus
                        value={subtaskText}
                        onChange={(e) => setSubtaskText(e.target.value)}
                        placeholder="Subtarea..."
                        style={{
                          flex: 1,
                          background: 'var(--bg-app)',
                          border: 'none',
                          borderRadius: 'var(--radius-xs)',
                          color: 'var(--text-primary)',
                          fontSize: 12,
                          padding: '4px 8px',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          background: 'var(--system-blue)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 'var(--radius-xs)',
                          padding: '2px 8px',
                          fontSize: 11,
                          fontWeight: 600
                        }}
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSubtaskInputId(null)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-tertiary)',
                          fontSize: 11
                        }}
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <button
                      className="add-subtask-btn"
                      onClick={() => {
                        setActiveSubtaskInputId(task.id);
                        setSubtaskText('');
                      }}
                    >
                      <Plus size={11} /> Añadir subtarea
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Historial de Notas Completadas (Colapsado por defecto) */}
        {completedTasks.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '0.5px solid var(--border-divider)' }}>
            <button
              onClick={() => setShowCompletedHistory((prev) => !prev)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              {showCompletedHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{completedTasks.length} nota(s) completada(s) archivadas</span>
            </button>

            {showCompletedHistory && (
              <div className="tasks-list" style={{ marginTop: 8 }}>
                {completedTasks.map((task) => (
                  <div key={task.id} className="task-item completed">
                    <div className="task-main-row">
                      <button
                        className="custom-checkbox checked"
                        onClick={() => toggleTask(task.id)}
                        title="Desmarcar y devolver a pendientes"
                      />
                      <div className="task-content">
                        <div className="task-text">{task.text}</div>
                      </div>
                      <button
                        className="action-icon-btn"
                        onClick={() => deleteTask(task.id)}
                        title="Eliminar permanentemente"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL PRINCIPAL: + NUEVA NOTA (Robusto con categoría, fecha y prioridad) */}
      {showNewNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNewNoteModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>Nueva Nota / Recordatorio</h3>
              <button
                onClick={() => setShowNewNoteModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  ¿Qué tienes que hacer o recordar?
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Ej: Comprar cuaderno de cálculo, repasar límites..."
                  value={modalNoteText}
                  onChange={(e) => setModalNoteText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-app)',
                    border: '0.5px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: 15,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                    Lista / Cuaderno
                  </label>
                  <select
                    value={modalProject}
                    onChange={(e) => setModalProject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-app)',
                      border: '0.5px solid var(--border-divider)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                    Prioridad
                  </label>
                  <select
                    value={modalPriority}
                    onChange={(e) => setModalPriority(e.target.value as Priority)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-app)',
                      border: '0.5px solid var(--border-divider)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  >
                    <option value="high">🔴 Urgente</option>
                    <option value="medium">🟡 Normal</option>
                    <option value="low">🟢 Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Fecha Límite (Opcional)
                </label>
                <input
                  type="date"
                  value={modalDueDate}
                  onChange={(e) => setModalDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-app)',
                    border: '0.5px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowNewNoteModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 14px',
                    color: 'var(--text-secondary)',
                    fontSize: 14,
                    cursor: 'pointer'
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
                    padding: '9px 18px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Guardar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear Nueva Lista */}
      {showNewProjectModal && (
        <div className="modal-overlay" onClick={() => setShowNewProjectModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>Nueva Lista</h3>
            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                autoFocus
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Nombre de la lista..."
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-app)',
                  border: '0.5px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: 15,
                  outline: 'none',
                  marginBottom: 14
                }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 14px',
                    color: 'var(--system-blue)',
                    fontSize: 14,
                    cursor: 'pointer'
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
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
