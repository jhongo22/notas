-- ==============================================================================
-- KAIRÓS WORKSPACE - ESQUEMA DE BASE DE DATOS EN ESPAÑOL PARA SUPABASE
-- Proyecto: nvwcdmxiwmvxgpwjntxc
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- FUNCIÓN PARA ACTUALIZAR TIMESTAMP AUTOMÁTICO
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABLA: proyectos (Listas / Libretas organizadoras)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.proyectos (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    icono TEXT DEFAULT 'Folder',
    color TEXT DEFAULT '#007aff',
    descripcion TEXT DEFAULT '',
    creado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. TABLA: tareas (Notas con checkboxes y subtareas jerárquicas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tareas (
    id TEXT PRIMARY KEY,
    proyecto_id TEXT REFERENCES public.proyectos(id) ON DELETE SET NULL,
    texto TEXT NOT NULL,
    completada BOOLEAN DEFAULT FALSE NOT NULL,
    prioridad TEXT CHECK (prioridad IN ('alta', 'media', 'baja', 'high', 'medium', 'low')) DEFAULT 'media',
    fecha_vencimiento DATE,
    hora_vencimiento TIME,
    etiquetas TEXT[] DEFAULT '{}'::TEXT[],
    subtareas JSONB DEFAULT '[]'::JSONB NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de optimización para tareas
CREATE INDEX IF NOT EXISTS idx_tareas_proyecto_id ON public.tareas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_tareas_completada ON public.tareas(completada);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_vencimiento ON public.tareas(fecha_vencimiento);

-- ==============================================================================
-- 4. TABLA: eventos (Calendario académico y compromisos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.eventos (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME DEFAULT '09:00',
    categoria TEXT CHECK (categoria IN ('exam', 'assignment', 'meeting', 'personal', 'parcial', 'entrega', 'reunion', 'personal')) DEFAULT 'entrega',
    lugar TEXT DEFAULT '',
    minutos_recordatorio INTEGER DEFAULT 60,
    creado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de calendario
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON public.eventos(fecha);

-- ==============================================================================
-- 5. TABLA: transacciones (Control express de gastos e ingresos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transacciones (
    id TEXT PRIMARY KEY,
    monto NUMERIC NOT NULL,
    descripcion TEXT NOT NULL,
    categoria TEXT DEFAULT 'otros' NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE NOT NULL,
    tipo TEXT CHECK (tipo IN ('expense', 'income', 'gasto', 'ingreso')) DEFAULT 'gasto' NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de transacciones
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON public.transacciones(fecha);
CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON public.transacciones(tipo);

-- ==============================================================================
-- 6. TABLA: sesiones_chat (Conversaciones con el Copiloto IA)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sesiones_chat (
    id TEXT PRIMARY KEY,
    titulo TEXT DEFAULT 'Nueva conversación' NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sesiones_chat_actualizado ON public.sesiones_chat(actualizado_en DESC);

-- ==============================================================================
-- 7. TABLA: mensajes_chat (Historial de mensajes de cada sesión)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mensajes_chat (
    id TEXT PRIMARY KEY,
    sesion_id TEXT REFERENCES public.sesiones_chat(id) ON DELETE CASCADE NOT NULL,
    rol TEXT CHECK (rol IN ('user', 'assistant')) NOT NULL,
    contenido TEXT NOT NULL,
    accion_ejecutada JSONB,
    marca_tiempo TEXT DEFAULT 'Ahora',
    creado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índice de mensajes por sesión
CREATE INDEX IF NOT EXISTS idx_mensajes_chat_sesion ON public.mensajes_chat(sesion_id);

-- ==============================================================================
-- 8. TABLA: notificaciones_cron (Para alertas y recordatorios automáticos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notificaciones_cron (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_programada TIMESTAMPTZ NOT NULL,
    enviada BOOLEAN DEFAULT FALSE NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_cron_programada ON public.notificaciones_cron(fecha_programada, enviada);

-- ==============================================================================
-- 9. TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA DE TIMESTAMP
-- ==============================================================================
DROP TRIGGER IF EXISTS trg_actualizar_proyectos ON public.proyectos;
CREATE TRIGGER trg_actualizar_proyectos
    BEFORE UPDATE ON public.proyectos
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS trg_actualizar_tareas ON public.tareas;
CREATE TRIGGER trg_actualizar_tareas
    BEFORE UPDATE ON public.tareas
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS trg_actualizar_eventos ON public.eventos;
CREATE TRIGGER trg_actualizar_eventos
    BEFORE UPDATE ON public.eventos
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS trg_actualizar_sesiones ON public.sesiones_chat;
CREATE TRIGGER trg_actualizar_sesiones
    BEFORE UPDATE ON public.sesiones_chat
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- ==============================================================================
-- 10. SEGURIDAD Y PERMISOS (ROW LEVEL SECURITY & GRANTS)
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_cron ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para clave pública/anónima y autenticada (workspace personal)
CREATE POLICY "Permitir acceso completo proyectos" ON public.proyectos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso completo tareas" ON public.tareas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso completo eventos" ON public.eventos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso completo transacciones" ON public.transacciones FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso completo sesiones_chat" ON public.sesiones_chat FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso completo mensajes_chat" ON public.mensajes_chat FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso completo notificaciones_cron" ON public.notificaciones_cron FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Permisos GRANT para roles anon y authenticated
GRANT ALL ON TABLE public.proyectos TO anon, authenticated;
GRANT ALL ON TABLE public.tareas TO anon, authenticated;
GRANT ALL ON TABLE public.eventos TO anon, authenticated;
GRANT ALL ON TABLE public.transacciones TO anon, authenticated;
GRANT ALL ON TABLE public.sesiones_chat TO anon, authenticated;
GRANT ALL ON TABLE public.mensajes_chat TO anon, authenticated;
GRANT ALL ON TABLE public.notificaciones_cron TO anon, authenticated;

-- ==============================================================================
-- 11. DATOS INICIALES (SEMILLA)
-- ==============================================================================
INSERT INTO public.proyectos (id, titulo, icono, color, descripcion) VALUES
('proj-uni', 'Universidad', 'GraduationCap', '#007aff', 'Materias, entregas y parciales'),
('proj-personal', 'Personal', 'User', '#af52de', 'Metas, hábitos y vida diaria'),
('proj-gym', 'Gimnasio & Salud', 'Activity', '#34c759', 'Rutinas, dieta y bienestar')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tareas (id, proyecto_id, texto, completada, prioridad, fecha_vencimiento, hora_vencimiento, etiquetas, subtareas) VALUES
('t-1', 'proj-uni', 'Estudiar para el parcial de Cálculo Diferencial (Límites y Continuidad)', false, 'alta', CURRENT_DATE + INTERVAL '2 days', '14:00', ARRAY['Examen', 'Urgente'], '[{"id": "st-1", "text": "Repasar taller 3", "completed": true}, {"id": "st-2", "text": "Ejercicios pares capítulo 4", "completed": false}]'::JSONB),
('t-2', 'proj-uni', 'Entregar informe de laboratorio de Física Mecánica', false, 'media', CURRENT_DATE + INTERVAL '4 days', '23:59', ARRAY['Laboratorio'], '[]'::JSONB),
('t-3', 'proj-personal', 'Comprar cargador tipo C y protector de pantalla', false, 'baja', CURRENT_DATE + INTERVAL '1 day', '18:00', ARRAY['Compras'], '[]'::JSONB),
('t-4', 'proj-gym', 'Completar rutina de pierna y 20 min de cardio', false, 'media', CURRENT_DATE, '07:00', ARRAY['Salud'], '[]'::JSONB)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.eventos (id, titulo, fecha, hora, categoria, lugar, minutos_recordatorio) VALUES
('ev-1', 'Parcial 1: Cálculo Diferencial', CURRENT_DATE + INTERVAL '2 days', '10:00', 'exam', 'Edificio 4 - Salón 302', 120),
('ev-2', 'Entrega Taller Física', CURRENT_DATE + INTERVAL '4 days', '23:59', 'assignment', 'Plataforma Virtual', 60),
('ev-3', 'Reunión Proyecto de Software', CURRENT_DATE + INTERVAL '1 day', '16:00', 'meeting', 'Google Meet', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.transacciones (id, monto, descripcion, categoria, fecha, tipo) VALUES
('tx-1', -4500, 'Café y empanada en la cafetería', 'comida', CURRENT_DATE, 'expense'),
('tx-2', -2800, 'Pasaje de bus transmilenio / colectivo', 'transporte', CURRENT_DATE, 'expense'),
('tx-3', -15000, 'Almuerzo corriente ejecutivo', 'comida', CURRENT_DATE - INTERVAL '1 day', 'expense'),
('tx-4', 150000, 'Monitoría universitaria quincenal', 'ingresos', CURRENT_DATE - INTERVAL '3 days', 'income')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sesiones_chat (id, titulo) VALUES
('session-init', 'Bienvenido a Kairós Copilot')
ON CONFLICT (id) DO NOTHING;
