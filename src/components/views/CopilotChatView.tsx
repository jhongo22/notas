import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Sparkles,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  MessageSquare,
  ChevronDown,
  X,
  Copy,
  Check,
  Edit2,
  RotateCcw,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MarkdownRenderer } from '../MarkdownRenderer';

export const CopilotChatView: React.FC = () => {
  const {
    chatSessions,
    activeSessionId,
    createNewSession,
    deleteSession,
    selectSession,
    renameSession,
    messages,
    deleteMessage,
    regenerateLastResponse,
    sendMessageToAgent,
    isAILoading,
    clearChatMessages
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [showSessionsDrawer, setShowSessionsDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Edición directa del título activo desde el header
  const [isEditingActiveTitle, setIsEditingActiveTitle] = useState(false);
  const [activeTitleInput, setActiveTitleInput] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSession = chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAILoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAILoading) return;
    const textToSend = inputText.trim();
    setInputText('');
    await sendMessageToAgent(textToSend);
    inputRef.current?.focus();
  };

  const handlePromptClick = (prompt: string) => {
    if (isAILoading) return;
    sendMessageToAgent(prompt);
  };

  const handleNewChat = () => {
    createNewSession();
    setShowSessionsDrawer(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const startRenameSession = (id: string, currentTitle: string) => {
    setEditingSessionId(id);
    setEditingTitle(currentTitle);
  };

  const saveRenameSession = (id: string) => {
    if (editingTitle.trim()) {
      renameSession(id, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  const saveActiveTitle = () => {
    if (activeSession && activeTitleInput.trim()) {
      renameSession(activeSession.id, activeTitleInput.trim());
    }
    setIsEditingActiveTitle(false);
  };

  // Filtrado de sesiones por búsqueda
  const filteredSessions = chatSessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      className="main-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 140px)',
        paddingBottom: 10,
        position: 'relative'
      }}
    >
      {/* iOS Style Header con Selector de Sesiones, Edición de Título y + Nuevo Chat */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 10,
          border: '0.5px solid var(--border-divider)',
          boxShadow: 'var(--shadow-card)',
          gap: 8
        }}
      >
        {/* Título de la sesión con desplegable de chats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <button
            onClick={() => setShowSessionsDrawer((prev) => !prev)}
            style={{
              background: 'var(--bg-fill)',
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--system-blue)',
              flexShrink: 0,
              cursor: 'pointer'
            }}
            title="Ver historial de conversaciones"
          >
            <Sparkles size={16} />
          </button>

          {isEditingActiveTitle ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
              <input
                type="text"
                value={activeTitleInput}
                onChange={(e) => setActiveTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveActiveTitle();
                  if (e.key === 'Escape') setIsEditingActiveTitle(false);
                }}
                autoFocus
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--system-blue)',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 13.5,
                  color: 'var(--text-primary)',
                  width: '100%',
                  outline: 'none'
                }}
              />
              <button
                onClick={saveActiveTitle}
                style={{
                  background: 'var(--system-blue)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditingActiveTitle(false)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: 'none',
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={{ minWidth: 0, flex: 1, cursor: 'pointer' }} onClick={() => setShowSessionsDrawer(true)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3
                  style={{
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    maxWidth: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {activeSession?.title || 'Nueva conversación'}
                </h3>
                <ChevronDown size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {chatSessions.length} {chatSessions.length === 1 ? 'chat guardado' : 'chats guardados'}
              </p>
            </div>
          )}
        </div>

        {/* Acciones del Header: Renombrar, + Nuevo Chat, Vaciar y Eliminar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {!isEditingActiveTitle && (
            <button
              onClick={() => {
                setActiveTitleInput(activeSession?.title || '');
                setIsEditingActiveTitle(true);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Renombrar este chat"
            >
              <Edit2 size={14} />
            </button>
          )}

          <button
            onClick={handleNewChat}
            style={{
              background: 'var(--system-blue)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
            title="Crear nueva sesión de chat"
          >
            <Plus size={14} /> Nuevo
          </button>

          {/* Menú de Opciones para la sesión activa */}
          {messages.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('¿Deseas vaciar los mensajes de este chat?')) {
                  clearChatMessages();
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Vaciar mensajes del chat actual"
            >
              <RotateCcw size={14} />
            </button>
          )}

          {chatSessions.length > 1 && (
            <button
              onClick={() => {
                if (window.confirm(`¿Deseas eliminar la conversación "${activeSession?.title}"?`)) {
                  deleteSession(activeSession.id);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--system-red)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Eliminar esta sesión de chat"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area - Apple iMessage Style */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '6px 2px',
          scrollbarWidth: 'none'
        }}
      >
        {/* Vista Vacía Limpia por Defecto */}
        {messages.length === 0 && !isAILoading && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-secondary)'
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                border: '0.5px solid var(--border-divider)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--system-blue)',
                marginBottom: 12,
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
              Nueva Conversación
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 340 }}>
              Pregunta lo que sea o registra tareas, parciales y gastos en lenguaje natural.
            </p>
          </div>
        )}

        {/* Lista de Mensajes */}
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isLastAssistant = !isUser && idx === messages.length - 1;
          const isCopied = copiedMessageId === msg.id;

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                alignSelf: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  background: isUser ? 'var(--system-blue)' : 'var(--bg-surface)',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '10px 14px',
                  color: isUser ? '#ffffff' : 'var(--text-primary)',
                  fontSize: 14,
                  lineHeight: 1.45,
                  border: isUser ? 'none' : '0.5px solid var(--border-divider)',
                  boxShadow: 'var(--shadow-card)',
                  wordBreak: 'break-word'
                }}
              >
                <MarkdownRenderer content={msg.content} isUser={isUser} />
              </div>

              {/* Acción Ejecutada (Badge verde) */}
              {msg.actionExecuted && (
                <div
                  style={{
                    marginTop: 4,
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface)',
                    border: '0.5px solid var(--border-divider)',
                    fontSize: 12,
                    color: 'var(--system-green)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <CheckCircle2 size={12} />
                  <span>{msg.actionExecuted.summary}</span>
                </div>
              )}

              {/* Barra de Herramientas del Mensaje (Copiar, Regenerar, Eliminar) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 3,
                  padding: '0 4px',
                  fontSize: 11,
                  color: 'var(--text-tertiary)'
                }}
              >
                <span>{msg.timestamp}</span>

                {/* Botón Copiar */}
                <button
                  onClick={() => handleCopyMessage(msg.id, msg.content)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isCopied ? 'var(--system-green)' : 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: 10.5
                  }}
                  title="Copiar texto"
                >
                  {isCopied ? <Check size={11} /> : <Copy size={11} />}
                  <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                </button>

                {/* Botón Regenerar Respuesta (solo en última respuesta del asistente) */}
                {isLastAssistant && !isAILoading && (
                  <button
                    onClick={() => regenerateLastResponse()}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--system-blue)',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 10.5
                    }}
                    title="Regenerar respuesta"
                  >
                    <RotateCcw size={11} />
                    <span>Regenerar</span>
                  </button>
                )}

                {/* Botón Eliminar Mensaje */}
                <button
                  onClick={() => deleteMessage(msg.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Eliminar mensaje"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          );
        })}

        {/* AI Loading Bubble */}
        {isAILoading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-surface)',
              borderRadius: '18px 18px 18px 4px',
              padding: '10px 14px',
              maxWidth: '85%',
              alignSelf: 'flex-start',
              border: '0.5px solid var(--border-divider)',
              fontSize: 13,
              color: 'var(--text-secondary)'
            }}
          >
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Consultando...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Suggestions Chips */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '6px 0', scrollbarWidth: 'none' }}>
        {[
          '¿Qué tengo pendiente hoy?',
          '¿Cuánto he gastado hoy?',
          '¿Cuáles son mis parciales?',
          '-3000 gaseosa',
          'Parcial de física el viernes'
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handlePromptClick(prompt)}
            disabled={isAILoading}
            style={{
              flexShrink: 0,
              background: 'var(--bg-surface)',
              border: '0.5px solid var(--border-divider)',
              borderRadius: 'var(--radius-full)',
              padding: '5px 12px',
              fontSize: 12,
              color: 'var(--text-secondary)',
              cursor: isAILoading ? 'default' : 'pointer',
              opacity: isAILoading ? 0.6 : 1
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form - iMessage Text Field */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, marginTop: 4, position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          disabled={isAILoading}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isAILoading ? 'Esperando respuesta...' : 'Mensaje o comando...'}
          style={{
            flex: 1,
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border-divider)',
            borderRadius: 'var(--radius-full)',
            padding: '10px 42px 10px 16px',
            color: 'var(--text-primary)',
            fontSize: 14,
            outline: 'none'
          }}
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isAILoading}
          style={{
            position: 'absolute',
            right: 5,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: inputText.trim() && !isAILoading ? 'var(--system-blue)' : 'var(--bg-fill)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() && !isAILoading ? 'pointer' : 'default',
            transition: 'opacity 0.15s'
          }}
        >
          {isAILoading ? (
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <ArrowUp size={16} strokeWidth={2.5} />
          )}
        </button>
      </form>

      {/* MODAL / DRAWER DE GESTIÓN COMPLETA DE SESIONES */}
      {showSessionsDrawer && (
        <div className="modal-overlay" onClick={() => setShowSessionsDrawer(false)}>
          <div
            className="bottom-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="sheet-handle" />

            {/* Cabecera del Gestor de Sesiones */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 600 }}>Tus Conversaciones</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {chatSessions.length} sesión(es) registrada(s)
                </p>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleNewChat}
                  style={{
                    background: 'var(--system-blue)',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Plus size={14} /> Nueva
                </button>
                <button
                  onClick={() => setShowSessionsDrawer(false)}
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
            </div>

            {/* Buscador de Sesiones */}
            <div
              style={{
                position: 'relative',
                marginBottom: 12
              }}
            >
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)'
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conversación..."
                style={{
                  width: '100%',
                  background: 'var(--bg-app)',
                  border: '0.5px solid var(--border-divider)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px 8px 30px',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Lista Scrollable de Sesiones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1, paddingRight: 2 }}>
              {filteredSessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                  No se encontraron conversaciones
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const isEditing = editingSessionId === session.id;
                  const msgCount = session.messages.length;

                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        if (!isEditing) {
                          selectSession(session.id);
                          setShowSessionsDrawer(false);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isActive ? 'rgba(0, 122, 255, 0.12)' : 'var(--bg-app)',
                        border: isActive ? '1px solid var(--system-blue)' : '0.5px solid var(--border-divider)',
                        cursor: isEditing ? 'default' : 'pointer',
                        transition: 'background 0.15s',
                        gap: 8
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <MessageSquare
                          size={16}
                          style={{ color: isActive ? 'var(--system-blue)' : 'var(--text-secondary)', flexShrink: 0 }}
                        />

                        {isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveRenameSession(session.id);
                                if (e.key === 'Escape') setEditingSessionId(null);
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--system-blue)',
                                borderRadius: 4,
                                padding: '4px 6px',
                                fontSize: 13,
                                color: 'var(--text-primary)',
                                width: '100%',
                                outline: 'none'
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveRenameSession(session.id);
                              }}
                              style={{
                                background: 'var(--system-blue)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                padding: '4px 8px',
                                fontSize: 11,
                                cursor: 'pointer'
                              }}
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h4
                              style={{
                                fontSize: 13.5,
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? 'var(--system-blue)' : 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {session.title}
                            </h4>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                              {msgCount} mensaje(s) • {new Date(session.updatedAt).toLocaleDateString('es-CO')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Acciones de cada fila de sesión */}
                      {!isEditing && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          {/* Botón Renombrar */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startRenameSession(session.id, session.title);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-tertiary)',
                              cursor: 'pointer',
                              padding: 6,
                              borderRadius: 4
                            }}
                            title="Renombrar conversación"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Botón Eliminar sesión */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`¿Deseas eliminar "${session.title}"?`)) {
                                deleteSession(session.id);
                              }
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-tertiary)',
                              cursor: 'pointer',
                              padding: 6,
                              borderRadius: 4
                            }}
                            title="Eliminar sesión"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

