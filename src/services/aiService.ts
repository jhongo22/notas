import {
  TaskItem,
  CalendarEvent,
  FinanceTransaction,
  AgentAction,
} from "../types";
import { parseUserInput } from "./aiParser";

const AI_API_BASE =
  import.meta.env.VITE_AI_API_BASE ||
  import.meta.env.NEXT_PUBLIC_AI_API_BASE ||
  "https://api.xkiro.com/v1";

const AI_API_KEY =
  import.meta.env.VITE_AI_API_KEY ||
  import.meta.env.NEXT_PUBLIC_AI_API_KEY ||
  "sk-xt-e668f5cb902c272cb97020a29a7d8ee4eb3af5fb9c2c3662";

const AI_MODEL =
  import.meta.env.VITE_AI_MODEL ||
  import.meta.env.NEXT_PUBLIC_AI_MODEL ||
  "mistralai/mistral-large-4-0";

export interface AIResponse {
  reply: string;
  action?: AgentAction;
  isAction: boolean;
}

export async function askKairoAI(
  userInput: string,
  context: {
    tasks: TaskItem[];
    events: CalendarEvent[];
    transactions: FinanceTransaction[];
    currentProjectId: string;
  },
): Promise<AIResponse> {
  // Primero corremos el parser local ultrarrápido para gastos directos muy claros como "-3000 gaseosa"
  const localResult = parseUserInput(userInput, context);

  // Si es un comando directo tipo "-3000 gaseosa" o "+50000 abono", lo ejecutamos inmediatamente para que sea instantáneo
  if (localResult.isAction && localResult.action?.type === "expense") {
    return {
      reply: localResult.replyMessage,
      action: localResult.action,
      isAction: true,
    };
  }

  // Preparamos el resumen del contexto para el modelo Mistral Large
  const todayStr = new Date().toISOString().split("T")[0];
  const pendingTasks = context.tasks
    .filter((t) => !t.completed)
    .slice(0, 10)
    .map(
      (t) =>
        `• [ID: ${t.id}] ${t.text} (Prioridad: ${t.priority}, Fecha: ${t.dueDate || "Sin fecha"})`,
    )
    .join("\n");

  const upcomingEvents = context.events
    .slice(0, 8)
    .map((e) => `• ${e.date} ${e.time || ""} - ${e.title} [${e.category}]`)
    .join("\n");

  const totalExpense = context.transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncome = context.transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const systemPrompt = `Eres Kairos, el asistente personal de Jhongo.
REGLAS OBLIGATORIAS:
- Sé EXTREMADAMENTE CONCISO, DIRECTO y al grano.
- Máximo 1 o 2 frases cortas por respuesta.
- NUNCA uses saludos largos, introducciones ni despedidas (nada de "¡Hola Jhongo! Claro que sí").
- Si te piden un dato (ej: cuánto he gastado hoy, qué parciales tengo), responde directamente con el dato exacto formateado en viñetas limpias si son varios.
- Si te piden registrar algo, confírmalo en una sola frase breve.

CONTEXTO ACTUAL DE JHONGO:
- Fecha de hoy: ${todayStr}
- Balance actual disponible: $${balance.toLocaleString("es-CO")} COP (Gastos mes: $${totalExpense.toLocaleString("es-CO")}, Ingresos: $${totalIncome.toLocaleString("es-CO")})
- Eventos/Parciales agendados:
${upcomingEvents || "Ninguno"}
- Tareas pendientes principales:
${pendingTasks || "Ninguna"}

INSTRUCCIÓN DE ACCIONES:
Si el usuario te pide crear una tarea, agendar un examen/evento o registrar un gasto/ingreso, responde con tu breve confirmación y añade al final el bloque JSON con la acción:
\`\`\`json
{
  "action": {
    "type": "expense" | "task" | "event",
    "summary": "Breve resumen",
    "detail": {
      // Si expense: { "amount": -3000 (negativo si gasto, positivo si ingreso), "description": "Gaseosa", "category": "comida"|"transporte"|"universidad"|"ocio"|"servicios"|"ingresos"|"otros" }
      // Si task: { "text": "Comprar cartulina", "priority": "high"|"medium"|"low", "dueDate": "YYYY-MM-DD" }
      // Si event: { "title": "Parcial de Física", "date": "YYYY-MM-DD", "time": "08:00", "category": "exam"|"assignment"|"meeting"|"personal" }
    }
  }
}
\`\`\``;

  try {
    const response = await fetch(`${AI_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      console.warn("API error, usando fallback local:", response.status);
      return {
        reply: localResult.replyMessage,
        action: localResult.action,
        isAction: localResult.isAction,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Buscar si hay bloque JSON de acción
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    let extractedAction: AgentAction | undefined;

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.action) {
          extractedAction = parsed.action;
          // Normalizar detalles
          if (extractedAction?.type === "expense") {
            extractedAction.detail = {
              id: "tx-" + Date.now(),
              date: todayStr,
              type: extractedAction.detail.amount >= 0 ? "income" : "expense",
              ...extractedAction.detail,
            };
          } else if (extractedAction?.type === "task") {
            extractedAction.detail = {
              id: "t-" + Date.now(),
              projectId: context.currentProjectId || "proj-daily",
              completed: false,
              tags: ["IA"],
              subtasks: [],
              createdAt: new Date().toISOString(),
              ...extractedAction.detail,
            };
          } else if (extractedAction?.type === "event") {
            extractedAction.detail = {
              id: "ev-" + Date.now(),
              reminderMinutes: 60,
              ...extractedAction.detail,
            };
          }
        }
      } catch (err) {
        console.error("Error parseando JSON de IA:", err);
      }
    }

    // Limpiar el JSON de la respuesta visual que se muestra al usuario
    const cleanReply = content.replace(/```json[\s\S]*?```/, "").trim();

    return {
      reply: cleanReply || "Acción procesada con éxito.",
      action: extractedAction,
      isAction: !!extractedAction,
    };
  } catch (error) {
    console.warn("Error de conexión a la IA, activando fallback local:", error);
    return {
      reply: localResult.replyMessage,
      action: localResult.action,
      isAction: localResult.isAction,
    };
  }
}
