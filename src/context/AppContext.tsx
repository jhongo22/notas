import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Project,
  TaskItem,
  CalendarEvent,
  FinanceTransaction,
  AgentMessage,
  ChatSession,
  ActiveTab
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_EVENTS,
  INITIAL_TRANSACTIONS
} from '../data/initialData';
import { askKairoAI } from '../services/aiService';
import { triggerHaptic } from '../utils/haptics';
import {
  dbFetchProjects,
  dbUpsertProject,
  dbDeleteProject,
  dbFetchTasks,
  dbUpsertTask,
  dbDeleteTask,
  dbFetchEvents,
  dbUpsertEvent,
  dbDeleteEvent,
  dbFetchTransactions,
  dbUpsertTransaction,
  dbDeleteTransaction,
  dbFetchChatSessions,
  dbUpsertChatSession,
  dbDeleteChatSession,
  dbUpsertChatMessage
} from '../services/dbSync';

export type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  projects: Project[];
  tasks: TaskItem[];
  events: CalendarEvent[];
  transactions: FinanceTransaction[];
  
  // Sesiones de Chat IA
  chatSessions: ChatSession[];
  activeSessionId: string;
  createNewSession: () => string;
  deleteSession: (sessionId: string) => void;
  selectSession: (sessionId: string) => void;
  renameSession: (sessionId: string, newTitle: string) => void;
  messages: AgentMessage[]; // Mensajes de la sesión activa
  deleteMessage: (messageId: string) => void;
  regenerateLastResponse: () => Promise<void>;

  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  quickCaptureOpen: boolean;
  setQuickCaptureOpen: (open: boolean) => void;
  isAILoading: boolean;

  // Acciones de Tareas
  addTask: (text: string, projectId?: string, priority?: 'high' | 'medium' | 'low', dueDate?: string) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTaskText: (taskId: string, text: string) => void;
  addSubtask: (taskId: string, text: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Acciones de Proyectos
  addProject: (title: string, icon: string, color: string, description: string) => void;
  deleteProject: (id: string) => void;

  // Acciones de Calendario
  addEvent: (title: string, date: string, time?: string, category?: any, location?: string) => void;
  deleteEvent: (id: string) => void;

  // Acciones de Finanzas
  addTransaction: (amount: number, description: string, category: any, date?: string, type?: 'expense' | 'income') => void;
  deleteTransaction: (id: string) => void;

  // Agente IA / Captura Rápida
  processCommand: (text: string) => Promise<{ reply: string; success: boolean }>;
  sendMessageToAgent: (content: string) => Promise<void>;
  clearChatMessages: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Tema: MODO CLARO POR DEFECTO
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('kairos_theme_v1') as Theme;
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('kairos_theme_v1', theme);
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    triggerHaptic('light');
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Cargar estado inicial desde localStorage o datos quemados
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('kairos_projects_v1');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('kairos_tasks_v1');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('kairos_events_v1');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => {
    const saved = localStorage.getItem('kairos_transactions_v1');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // GESTIÓN DE SESIONES MÚLTIPLES DE CHAT IA
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('kairos_chat_sessions_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Fallback
      }
    }
    // Sesión inicial limpia
    const initialSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'Nueva conversación',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedActive = localStorage.getItem('kairos_active_session_v2');
    return savedActive || (chatSessions[0]?.id || 'session-default');
  });

  const activeSession = chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const [activeTab, setActiveTabState] = useState<ActiveTab>('notes');
  const [activeProjectId, setActiveProjectId] = useState<string>('proj-uni');
  const [quickCaptureOpen, setQuickCaptureOpen] = useState<boolean>(false);
  const [isAILoading, setIsAILoading] = useState<boolean>(false);

  const setActiveTab = (tab: ActiveTab) => {
    triggerHaptic('light');
    setActiveTabState(tab);
  };

  // Sincronización en LocalStorage
  useEffect(() => {
    localStorage.setItem('kairos_projects_v1', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('kairos_tasks_v1', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('kairos_events_v1', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('kairos_transactions_v1', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kairos_chat_sessions_v2', JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem('kairos_active_session_v2', activeSessionId);
  }, [activeSessionId]);

  // Sincronización inicial con Supabase (hidrata datos si existen en BD)
  useEffect(() => {
    const initSync = async () => {
      try {
        const [dbProjs, dbTs, dbEvs, dbTxs, dbChats] = await Promise.all([
          dbFetchProjects(),
          dbFetchTasks(),
          dbFetchEvents(),
          dbFetchTransactions(),
          dbFetchChatSessions()
        ]);

        if (dbProjs && dbProjs.length > 0) setProjects(dbProjs);
        if (dbTs && dbTs.length > 0) setTasks(dbTs);
        if (dbEvs && dbEvs.length > 0) setEvents(dbEvs);
        if (dbTxs && dbTxs.length > 0) setTransactions(dbTxs);
        if (dbChats && dbChats.length > 0) {
          setChatSessions(dbChats);
          setActiveSessionId(dbChats[0].id);
        }
      } catch (err) {
        console.warn('Error inicializando Supabase sync:', err);
      }
    };
    initSync();
  }, []);

  // Funciones de Sesiones de Chat
  const createNewSession = (): string => {
    triggerHaptic('medium');
    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'Nueva conversación',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    dbUpsertChatSession(newSession);
    return newSession.id;
  };

  const deleteSession = (sessionId: string) => {
    triggerHaptic('warning');
    dbDeleteChatSession(sessionId);
    setChatSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: 'session-' + Date.now(),
          title: 'Nueva conversación',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: []
        };
        setActiveSessionId(fresh.id);
        dbUpsertChatSession(fresh);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const selectSession = (sessionId: string) => {
    triggerHaptic('light');
    setActiveSessionId(sessionId);
  };

  const renameSession = (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    triggerHaptic('light');
    const updated = chatSessions.map((s) =>
      s.id === sessionId
        ? { ...s, title: newTitle.trim(), updatedAt: new Date().toISOString() }
        : s
    );
    setChatSessions(updated);
    const renamed = updated.find((s) => s.id === sessionId);
    if (renamed) dbUpsertChatSession(renamed);
  };

  const deleteMessage = (messageId: string) => {
    triggerHaptic('warning');
    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: s.messages.filter((m) => m.id !== messageId),
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      })
    );
  };

  const clearChatMessages = () => {
    triggerHaptic('warning');
    setChatSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [] } : s))
    );
  };

  // Acciones de Tareas
  const addTask = (text: string, projId?: string, priority: 'high' | 'medium' | 'low' = 'medium', dueDate?: string) => {
    if (!text.trim()) return;
    triggerHaptic('medium');
    const newTask: TaskItem = {
      id: 't-' + Date.now(),
      projectId: projId || activeProjectId || 'proj-uni',
      text: text.trim(),
      completed: false,
      priority,
      dueDate: dueDate || undefined,
      tags: ['General'],
      subtasks: [],
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
    dbUpsertTask(newTask);
  };

  const toggleTask = (taskId: string) => {
    triggerHaptic('success');
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            confetti({
              particleCount: 25,
              spread: 50,
              origin: { y: 0.8 },
              colors: ['#007aff', '#34c759', '#ff9500', '#af52de']
            });
          }
          const updated = { ...t, completed: nextCompleted };
          dbUpsertTask(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    triggerHaptic('warning');
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    dbDeleteTask(taskId);
  };

  const updateTaskText = (taskId: string, text: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, text };
          dbUpsertTask(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const addSubtask = (taskId: string, text: string) => {
    if (!text.trim()) return;
    triggerHaptic('light');
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            subtasks: [
              ...t.subtasks,
              { id: 'st-' + Date.now() + Math.random(), text: text.trim(), completed: false }
            ]
          };
          dbUpsertTask(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    triggerHaptic('light');
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            subtasks: t.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            )
          };
          dbUpsertTask(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    triggerHaptic('warning');
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) };
          dbUpsertTask(updated);
          return updated;
        }
        return t;
      })
    );
  };

  // Proyectos
  const addProject = (title: string, icon: string, color: string, description: string) => {
    if (!title.trim()) return;
    triggerHaptic('medium');
    const newProj: Project = {
      id: 'proj-' + Date.now(),
      title: title.trim(),
      icon,
      color,
      description
    };
    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    dbUpsertProject(newProj);
  };

  const deleteProject = (id: string) => {
    triggerHaptic('warning');
    setProjects((prev) => prev.filter((p) => p.id !== id));
    dbDeleteProject(id);
    if (activeProjectId === id && projects.length > 1) {
      const remaining = projects.filter((p) => p.id !== id);
      setActiveProjectId(remaining[0].id);
    }
  };

  // Calendario
  const addEvent = (title: string, date: string, time?: string, category: any = 'assignment', location?: string) => {
    if (!title.trim()) return;
    triggerHaptic('medium');
    const newEv: CalendarEvent = {
      id: 'ev-' + Date.now(),
      title: title.trim(),
      date,
      time: time || '09:00',
      category,
      location,
      reminderMinutes: 60
    };
    setEvents((prev) => [...prev, newEv]);
    dbUpsertEvent(newEv);
  };

  const deleteEvent = (id: string) => {
    triggerHaptic('warning');
    setEvents((prev) => prev.filter((e) => e.id !== id));
    dbDeleteEvent(id);
  };

  // Finanzas
  const addTransaction = (amount: number, description: string, category: any, date?: string, type: 'expense' | 'income' = 'expense') => {
    if (!description.trim() || amount === 0) return;
    triggerHaptic('success');
    const newTx: FinanceTransaction = {
      id: 'tx-' + Date.now(),
      amount,
      description: description.trim(),
      category,
      date: date || new Date().toISOString().split('T')[0],
      type
    };
    setTransactions((prev) => [newTx, ...prev]);
    dbUpsertTransaction(newTx);
  };

  const deleteTransaction = (id: string) => {
    triggerHaptic('warning');
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    dbDeleteTransaction(id);
  };

  // Procesador con Inteligencia Artificial Mistral Large
  const processCommand = async (text: string): Promise<{ reply: string; success: boolean }> => {
    if (!text.trim()) return { reply: '', success: false };

    setIsAILoading(true);

    try {
      const aiResult = await askKairoAI(text, {
        tasks,
        events,
        transactions,
        currentProjectId: activeProjectId
      });

      if (aiResult.isAction && aiResult.action) {
        const action = aiResult.action;
        if (action.type === 'expense') {
          const tx = action.detail as FinanceTransaction;
          setTransactions((prev) => [tx, ...prev]);
        } else if (action.type === 'event') {
          const ev = action.detail as CalendarEvent;
          setEvents((prev) => [...prev, ev]);
        } else if (action.type === 'task') {
          const t = action.detail as TaskItem;
          setTasks((prev) => [t, ...prev]);
        }
        triggerHaptic('success');
      }

      // Mensajes generados
      const userMsg: AgentMessage = {
        id: 'msg-u-' + Date.now(),
        role: 'user',
        content: text,
        timestamp: 'Ahora'
      };

      const agentMsg: AgentMessage = {
        id: 'msg-a-' + (Date.now() + 1),
        role: 'assistant',
        content: aiResult.reply,
        timestamp: 'Ahora',
        actionExecuted: aiResult.action
      };

      // Guardar en la sesión de chat activa y actualizar su título si es el primer mensaje
      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            const isFirst = s.messages.length === 0;
            const newTitle = isFirst
              ? (text.length > 28 ? text.slice(0, 28) + '...' : text)
              : s.title;

            const updatedSession = {
              ...s,
              title: newTitle,
              updatedAt: new Date().toISOString(),
              messages: [...s.messages, userMsg, agentMsg]
            };
            dbUpsertChatSession(updatedSession);
            return updatedSession;
          }
          return s;
        })
      );

      dbUpsertChatMessage(activeSessionId, userMsg);
      dbUpsertChatMessage(activeSessionId, agentMsg);

      return { reply: aiResult.reply, success: true };
    } finally {
      setIsAILoading(false);
    }
  };

  const regenerateLastResponse = async () => {
    const curSession = chatSessions.find((s) => s.id === activeSessionId);
    if (!curSession || curSession.messages.length === 0 || isAILoading) return;

    const lastUserMsg = [...curSession.messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    // Pop the last assistant message if there is one at the end
    const lastMessage = curSession.messages[curSession.messages.length - 1];
    let baseMessages = curSession.messages;
    if (lastMessage.role === 'assistant') {
      baseMessages = curSession.messages.slice(0, -1);
      setChatSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: baseMessages } : s))
      );
    }

    setIsAILoading(true);
    try {
      const aiResult = await askKairoAI(lastUserMsg.content, {
        tasks,
        events,
        transactions,
        currentProjectId: activeProjectId
      });

      if (aiResult.isAction && aiResult.action) {
        const action = aiResult.action;
        if (action.type === 'expense') {
          const tx = action.detail as FinanceTransaction;
          setTransactions((prev) => [tx, ...prev]);
        } else if (action.type === 'event') {
          const ev = action.detail as CalendarEvent;
          setEvents((prev) => [ev, ...prev]);
        } else if (action.type === 'task') {
          const t = action.detail as TaskItem;
          setTasks((prev) => [t, ...prev]);
        }
        triggerHaptic('success');
      }

      const newAgentMsg: AgentMessage = {
        id: 'msg-a-' + Date.now(),
        role: 'assistant',
        content: aiResult.reply,
        timestamp: 'Ahora',
        actionExecuted: aiResult.action
      };

      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              updatedAt: new Date().toISOString(),
              messages: [...baseMessages, newAgentMsg]
            };
          }
          return s;
        })
      );
    } finally {
      setIsAILoading(false);
    }
  };

  const sendMessageToAgent = async (content: string) => {
    await processCommand(content);
  };

  const resetAllData = () => {
    localStorage.removeItem('kairos_projects_v1');
    localStorage.removeItem('kairos_tasks_v1');
    localStorage.removeItem('kairos_events_v1');
    localStorage.removeItem('kairos_transactions_v1');
    localStorage.removeItem('kairos_chat_sessions_v2');
    localStorage.removeItem('kairos_active_session_v2');
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setEvents(INITIAL_EVENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    const freshSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'Nueva conversación',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    setChatSessions([freshSession]);
    setActiveSessionId(freshSession.id);
    setActiveProjectId(INITIAL_PROJECTS[0].id);
    triggerHaptic('success');
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        projects,
        tasks,
        events,
        transactions,
        chatSessions,
        activeSessionId,
        createNewSession,
        deleteSession,
        selectSession,
        renameSession,
        messages,
        deleteMessage,
        regenerateLastResponse,
        activeTab,
        setActiveTab,
        activeProjectId,
        setActiveProjectId,
        quickCaptureOpen,
        setQuickCaptureOpen,
        isAILoading,
        addTask,
        toggleTask,
        deleteTask,
        updateTaskText,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        addProject,
        deleteProject,
        addEvent,
        deleteEvent,
        addTransaction,
        deleteTransaction,
        processCommand,
        sendMessageToAgent,
        clearChatMessages,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
