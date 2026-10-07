import { supabase } from './supabaseClient';
import {
  Project,
  TaskItem,
  CalendarEvent,
  FinanceTransaction,
  AgentMessage,
  ChatSession
} from '../types';

/**
 * Servicio de sincronización bidireccional con Supabase
 * Nombres de tablas y columnas completamente en español
 */

// ==========================================
// 1. PROYECTOS (public.proyectos)
// ==========================================
export const dbFetchProjects = async (): Promise<Project[] | null> => {
  try {
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .order('creado_en', { ascending: true });

    if (error) {
      console.warn('[Supabase] No se pudieron cargar proyectos:', error.message);
      return null;
    }

    if (!data) return null;

    return data.map((p) => ({
      id: p.id,
      title: p.titulo,
      icon: p.icono || 'Folder',
      color: p.color || '#007aff',
      description: p.descripcion || ''
    }));
  } catch (err) {
    console.warn('[Supabase] Error en dbFetchProjects:', err);
    return null;
  }
};

export const dbUpsertProject = async (proj: Project) => {
  try {
    const payload = {
      id: proj.id,
      titulo: proj.title,
      icono: proj.icon,
      color: proj.color,
      descripcion: proj.description
    };
    await supabase.from('proyectos').upsert(payload);
  } catch (err) {
    console.warn('[Supabase] Error en dbUpsertProject:', err);
  }
};

export const dbDeleteProject = async (id: string) => {
  try {
    await supabase.from('proyectos').delete().eq('id', id);
  } catch (err) {
    console.warn('[Supabase] Error en dbDeleteProject:', err);
  }
};

// ==========================================
// 2. TAREAS (public.tareas)
// ==========================================
export const dbFetchTasks = async (): Promise<TaskItem[] | null> => {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .order('creado_en', { ascending: false });

    if (error) {
      console.warn('[Supabase] No se pudieron cargar tareas:', error.message);
      return null;
    }

    if (!data) return null;

    return data.map((t) => ({
      id: t.id,
      projectId: t.proyecto_id || 'general',
      text: t.texto,
      completed: Boolean(t.completada),
      priority: (t.prioridad as any) || 'medium',
      dueDate: t.fecha_vencimiento || undefined,
      dueTime: t.hora_vencimiento || undefined,
      tags: Array.isArray(t.etiquetas) ? t.etiquetas : [],
      subtasks: Array.isArray(t.subtareas) ? t.subtareas : [],
      createdAt: t.creado_en
    }));
  } catch (err) {
    console.warn('[Supabase] Error en dbFetchTasks:', err);
    return null;
  }
};

export const dbUpsertTask = async (task: TaskItem) => {
  try {
    const payload = {
      id: task.id,
      proyecto_id: task.projectId === 'general' ? null : task.projectId,
      texto: task.text,
      completada: task.completed,
      prioridad: task.priority,
      fecha_vencimiento: task.dueDate || null,
      hora_vencimiento: task.dueTime || null,
      etiquetas: task.tags || [],
      subtareas: task.subtasks || []
    };
    await supabase.from('tareas').upsert(payload);
  } catch (err) {
    console.warn('[Supabase] Error en dbUpsertTask:', err);
  }
};

export const dbDeleteTask = async (id: string) => {
  try {
    await supabase.from('tareas').delete().eq('id', id);
  } catch (err) {
    console.warn('[Supabase] Error en dbDeleteTask:', err);
  }
};

// ==========================================
// 3. EVENTOS (public.eventos)
// ==========================================
export const dbFetchEvents = async (): Promise<CalendarEvent[] | null> => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) {
      console.warn('[Supabase] No se pudieron cargar eventos:', error.message);
      return null;
    }

    if (!data) return null;

    return data.map((e) => ({
      id: e.id,
      title: e.titulo,
      date: e.fecha,
      time: e.hora || '09:00',
      category: e.categoria || 'assignment',
      location: e.lugar || undefined,
      reminderMinutes: e.minutos_recordatorio || 60
    }));
  } catch (err) {
    console.warn('[Supabase] Error en dbFetchEvents:', err);
    return null;
  }
};

export const dbUpsertEvent = async (ev: CalendarEvent) => {
  try {
    const payload = {
      id: ev.id,
      titulo: ev.title,
      fecha: ev.date,
      hora: ev.time || '09:00',
      categoria: ev.category,
      lugar: ev.location || '',
      minutos_recordatorio: ev.reminderMinutes || 60
    };
    await supabase.from('eventos').upsert(payload);
  } catch (err) {
    console.warn('[Supabase] Error en dbUpsertEvent:', err);
  }
};

export const dbDeleteEvent = async (id: string) => {
  try {
    await supabase.from('eventos').delete().eq('id', id);
  } catch (err) {
    console.warn('[Supabase] Error en dbDeleteEvent:', err);
  }
};

// ==========================================
// 4. TRANSACCIONES (public.transacciones)
// ==========================================
export const dbFetchTransactions = async (): Promise<FinanceTransaction[] | null> => {
  try {
    const { data, error } = await supabase
      .from('transacciones')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.warn('[Supabase] No se pudieron cargar transacciones:', error.message);
      return null;
    }

    if (!data) return null;

    return data.map((tx) => ({
      id: tx.id,
      amount: Number(tx.monto),
      description: tx.descripcion,
      category: tx.categoria || 'otros',
      date: tx.fecha,
      type: tx.tipo || 'expense'
    }));
  } catch (err) {
    console.warn('[Supabase] Error en dbFetchTransactions:', err);
    return null;
  }
};

export const dbUpsertTransaction = async (tx: FinanceTransaction) => {
  try {
    const payload = {
      id: tx.id,
      monto: tx.amount,
      descripcion: tx.description,
      categoria: tx.category,
      fecha: tx.date,
      tipo: tx.type
    };
    await supabase.from('transacciones').upsert(payload);
  } catch (err) {
    console.warn('[Supabase] Error en dbUpsertTransaction:', err);
  }
};

export const dbDeleteTransaction = async (id: string) => {
  try {
    await supabase.from('transacciones').delete().eq('id', id);
  } catch (err) {
    console.warn('[Supabase] Error en dbDeleteTransaction:', err);
  }
};

// ==========================================
// 5. SESIONES & MENSAJES DE CHAT
// ==========================================
export const dbFetchChatSessions = async (): Promise<ChatSession[] | null> => {
  try {
    const { data: sessions, error: sErr } = await supabase
      .from('sesiones_chat')
      .select('*')
      .order('actualizado_en', { ascending: false });

    if (sErr || !sessions) return null;

    const { data: messages, error: mErr } = await supabase
      .from('mensajes_chat')
      .select('*')
      .order('creado_en', { ascending: true });

    if (mErr) return null;

    return sessions.map((s) => {
      const sessionMessages: AgentMessage[] = (messages || [])
        .filter((m) => m.sesion_id === s.id)
        .map((m) => ({
          id: m.id,
          role: m.rol,
          content: m.contenido,
          timestamp: m.marca_tiempo || 'Ahora',
          actionExecuted: m.accion_ejecutada || undefined
        }));

      return {
        id: s.id,
        title: s.titulo,
        createdAt: s.creado_en,
        updatedAt: s.actualizado_en,
        messages: sessionMessages
      };
    });
  } catch (err) {
    console.warn('[Supabase] Error en dbFetchChatSessions:', err);
    return null;
  }
};

export const dbUpsertChatSession = async (session: ChatSession) => {
  try {
    await supabase.from('sesiones_chat').upsert({
      id: session.id,
      titulo: session.title,
      actualizado_en: session.updatedAt
    });
  } catch (err) {
    console.warn('[Supabase] Error en dbUpsertChatSession:', err);
  }
};

export const dbUpsertChatMessage = async (sessionId: string, msg: AgentMessage) => {
  try {
    await supabase.from('mensajes_chat').upsert({
      id: msg.id,
      sesion_id: sessionId,
      rol: msg.role,
      contenido: msg.content,
      marca_tiempo: msg.timestamp,
      accion_ejecutada: msg.actionExecuted || null
    });
  } catch (err) {
    console.warn('[Supabase] Error en dbUpsertChatMessage:', err);
  }
};

export const dbDeleteChatSession = async (id: string) => {
  try {
    await supabase.from('sesiones_chat').delete().eq('id', id);
  } catch (err) {
    console.warn('[Supabase] Error en dbDeleteChatSession:', err);
  }
};
