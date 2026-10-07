import { FinanceCategory, EventCategory, TaskItem, CalendarEvent, FinanceTransaction, AgentAction } from '../types';

export interface ParseResult {
  isAction: boolean;
  action?: AgentAction;
  replyMessage: string;
}

export function parseUserInput(
  input: string,
  context: {
    tasks: TaskItem[];
    events: CalendarEvent[];
    transactions: FinanceTransaction[];
    currentProjectId: string;
  }
): ParseResult {
  const text = input.trim();
  const lower = text.toLowerCase();

  // 1. VERIFICAR SI ES UNA CONSULTA EN LENGUAJE NATURAL
  if (
    lower.includes('cuanto') ||
    lower.includes('cuánto') ||
    lower.includes('gastado') ||
    lower.includes('balance') ||
    lower.includes('mis gastos')
  ) {
    // Consulta de finanzas
    const today = new Date().toISOString().split('T')[0];
    const todayExpenses = context.transactions
      .filter((t) => t.date === today && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalIncome = context.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = context.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const balance = totalIncome - totalExpense;

    return {
      isAction: false,
      replyMessage: `📊 **Resumen Financiero:**\n• **Gastos de hoy:** $${todayExpenses.toLocaleString('es-CO')}\n• **Total gastos del mes:** $${totalExpense.toLocaleString('es-CO')}\n• **Balance disponible:** $${balance.toLocaleString('es-CO')}`
    };
  }

  if (
    lower.includes('que tengo') ||
    lower.includes('qué tengo') ||
    lower.includes('hoy') ||
    lower.includes('pendiente') ||
    lower.includes('tareas') ||
    lower.includes('agenda')
  ) {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = context.tasks.filter((t) => !t.completed && (t.dueDate === today || !t.dueDate));
    const todayEvents = context.events.filter((e) => e.date === today);

    let reply = `⚡ **Tu agenda para hoy:**\n`;
    if (todayEvents.length > 0) {
      reply += `\n📅 **Eventos / Parciales (${todayEvents.length}):**\n` +
        todayEvents.map((e) => `• ${e.time ? `[${e.time}] ` : ''}${e.title}`).join('\n');
    } else {
      reply += `\n📅 No tienes exámenes o citas agendadas para hoy.`;
    }

    if (todayTasks.length > 0) {
      reply += `\n\n📝 **Tareas pendientes prioritarias (${todayTasks.length}):**\n` +
        todayTasks.slice(0, 4).map((t) => `• [ ] ${t.text}`).join('\n');
    } else {
      reply += `\n\n🎉 ¡No tienes tareas pendientes urgentes para hoy!`;
    }

    return {
      isAction: false,
      replyMessage: reply
    };
  }

  if (lower.includes('parcial') || lower.includes('examen') || lower.includes('examenes')) {
    const exams = context.events.filter((e) => e.category === 'exam');
    if (exams.length > 0) {
      return {
        isAction: false,
        replyMessage: `🎓 **Tus próximos exámenes y parciales:**\n` +
          exams.map((e) => `• **${e.date}${e.time ? ` a las ${e.time}` : ''}**: ${e.title} (${e.location || 'Presencial'})`).join('\n')
      };
    }
  }

  // 2. PARSER DE GASTO O INGRESO (Ej: -3000 gaseosa, +500000 pago, gaste 15000 almuerzo)
  // Match patterns like: "-3000 gaseosa", "- 3000 gaseosa", "+50000 pago", "gaste 12000 en taxi", "pague 4500 cafe"
  const expenseRegex = /^(-|\+)?\s*(\$?[\d.,]+)\s*(?:en\s+|de\s+)?(.+)$/i;
  const verbExpenseRegex = /(?:gaste|gasté|pague|pagué|compre|compré)\s*(\$?[\d.,]+)\s*(?:en\s+|de\s+)?(.+)/i;

  let amount = 0;
  let isIncome = false;
  let description = '';

  const verbMatch = text.match(verbExpenseRegex);
  const directMatch = text.match(expenseRegex);

  if (verbMatch) {
    const cleanNum = verbMatch[1].replace(/[^\d]/g, '');
    amount = parseInt(cleanNum, 10);
    description = verbMatch[2].trim();
  } else if (directMatch && (!isNaN(parseInt(directMatch[2].replace(/[^\d]/g, ''), 10)))) {
    const sign = directMatch[1];
    const cleanNum = directMatch[2].replace(/[^\d]/g, '');
    amount = parseInt(cleanNum, 10);
    isIncome = sign === '+';
    description = directMatch[3].trim();
  }

  if (amount > 0 && description.length > 1) {
    // Clasificar categoría
    let category: FinanceCategory = 'otros';
    const dLower = description.toLowerCase();

    if (isIncome || dLower.includes('pago') || dLower.includes('sueldo') || dLower.includes('transferencia') || dLower.includes('ingreso')) {
      category = 'ingresos';
      isIncome = true;
    } else if (
      dLower.includes('gaseosa') ||
      dLower.includes('cafe') ||
      dLower.includes('café') ||
      dLower.includes('almuerzo') ||
      dLower.includes('empanada') ||
      dLower.includes('comida') ||
      dLower.includes('pan') ||
      dLower.includes('pizza') ||
      dLower.includes('hamburguesa') ||
      dLower.includes('cena') ||
      dLower.includes('desayuno')
    ) {
      category = 'comida';
    } else if (
      dLower.includes('bus') ||
      dLower.includes('uber') ||
      dLower.includes('taxi') ||
      dLower.includes('pasaje') ||
      dLower.includes('gasolina') ||
      dLower.includes('didi') ||
      dLower.includes('metro')
    ) {
      category = 'transporte';
    } else if (
      dLower.includes('fotocopia') ||
      dLower.includes('libro') ||
      dLower.includes('cuaderno') ||
      dLower.includes('taller') ||
      dLower.includes('universidad') ||
      dLower.includes('matricula') ||
      dLower.includes('lapiz')
    ) {
      category = 'universidad';
    } else if (
      dLower.includes('cine') ||
      dLower.includes('cerveza') ||
      dLower.includes('fiesta') ||
      dLower.includes('juego') ||
      dLower.includes('salida')
    ) {
      category = 'ocio';
    } else if (
      dLower.includes('internet') ||
      dLower.includes('luz') ||
      dLower.includes('agua') ||
      dLower.includes('plan') ||
      dLower.includes('recibo')
    ) {
      category = 'servicios';
    }

    const finalAmount = isIncome ? amount : -amount;
    const todayStr = new Date().toISOString().split('T')[0];

    const newTx: FinanceTransaction = {
      id: 'tx-' + Date.now(),
      amount: finalAmount,
      description: description.charAt(0).toUpperCase() + description.slice(1),
      category,
      date: todayStr,
      type: isIncome ? 'income' : 'expense'
    };

    return {
      isAction: true,
      action: {
        type: 'expense',
        summary: `${isIncome ? 'Ingreso' : 'Gasto'} registrado: $${amount.toLocaleString('es-CO')} en ${category}`,
        detail: newTx
      },
      replyMessage: `✅ Registré tu ${isIncome ? 'ingreso' : 'gasto'} de **$${amount.toLocaleString('es-CO')}** en *${category.toUpperCase()}* (${newTx.description}). Tu balance se ha actualizado instantáneamente.`
    };
  }

  // 3. PARSER DE EVENTOS / PARCIALES (ej: "Parcial de física el jueves a las 9am", "Cita medica el viernes")
  if (
    lower.includes('parcial') ||
    lower.includes('examen') ||
    lower.includes('cita') ||
    lower.includes('reunion') ||
    lower.includes('reunión') ||
    lower.includes('entrega')
  ) {
    let category: EventCategory = 'exam';
    if (lower.includes('entrega') || lower.includes('taller')) category = 'assignment';
    else if (lower.includes('cita') || lower.includes('medico') || lower.includes('médica')) category = 'personal';
    else if (lower.includes('reunion') || lower.includes('reunión')) category = 'meeting';

    // Extracción básica de hora (ej: "8am", "8:30am", "15:00", "a las 10")
    let time = '08:00';
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] || '00';
      const ampm = timeMatch[3]?.toLowerCase();
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      time = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    // Fecha aproximada (hoy, mañana o en días de la semana)
    const targetDate = new Date();
    if (lower.includes('mañana')) {
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (lower.includes('pasado mañana')) {
      targetDate.setDate(targetDate.getDate() + 2);
    } else if (lower.includes('jueves')) {
      targetDate.setDate(targetDate.getDate() + 1); // aprox
    } else if (lower.includes('viernes')) {
      targetDate.setDate(targetDate.getDate() + 2);
    } else if (lower.includes('sabado') || lower.includes('sábado')) {
      targetDate.setDate(targetDate.getDate() + 3);
    }

    const dateStr = targetDate.toISOString().split('T')[0];

    const newEvent: CalendarEvent = {
      id: 'ev-' + Date.now(),
      title: text.charAt(0).toUpperCase() + text.slice(1),
      date: dateStr,
      time,
      category,
      reminderMinutes: 60
    };

    return {
      isAction: true,
      action: {
        type: 'event',
        summary: `Evento agendado: ${newEvent.title} para el ${dateStr}`,
        detail: newEvent
      },
      replyMessage: `📅 **Agendado con éxito:**\n• **${newEvent.title}**\n• Fecha: ${dateStr} a las ${time}\n• Categoría: ${category.toUpperCase()}\nTe enviaré una notificación previa.`
    };
  }

  // 4. SI NO ES GASTO NI EVENTO ESPECÍFICO, SE AGREGA COMO TAREA AL BLOC TIPO TASKADE
  const newTask: TaskItem = {
    id: 't-' + Date.now(),
    projectId: context.currentProjectId || 'proj-daily',
    text: text.charAt(0).toUpperCase() + text.slice(1),
    completed: false,
    priority: lower.includes('urgente') || lower.includes('importante') ? 'high' : 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    tags: ['Rápido'],
    subtasks: [],
    createdAt: new Date().toISOString()
  };

  return {
    isAction: true,
    action: {
      type: 'task',
      summary: `Tarea añadida a tus notas: "${newTask.text}"`,
      detail: newTask
    },
    replyMessage: `📝 Añadí la tarea **"${newTask.text}"** con checkbox a tu bloc activo. ¡Ya puedes tacharla cuando la completes!`
  };
}
