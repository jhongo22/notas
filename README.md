# ⚡ Kairós — Tu Segundo Cerebro & Workspace Personal

> **Adiós al *"chat conmigo mismo en WhatsApp"*.** Una suite ultrarrápida, offline-first y 100% personalizada para gestionar tareas, proyectos estilo Taskade, calendario académico/personal y microfinanzas diarias con asistencia de IA.

![Plataformas](https://img.shields.io/badge/PWA-Android%20%7C%20iOS%20%7C%20Desktop-0a84ff?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20TypeScript%20%7C%20Vite-30d158?style=flat-square)
![Diseño](https://img.shields.io/badge/Diseño-Apple%20HIG%20%7C%20macOS%20Split%20View-ffd60a?style=flat-square)

---

## 🎯 ¿Por qué nació Kairós?

Escribir recordatorios en WhatsApp hacia uno mismo es rápido, pero las cosas se pierden: no hay fechas límite, no hay seguimiento de entregas, no hay cálculo de gastos y el desorden termina ganando.

**Kairós** resuelve esto con una experiencia híbrida:
- **Escribes en lenguaje natural como en un chat:** `-3000 gaseosa`, `Parcial de matemáticas el viernes a las 8am` o `Comprar cartulina`.
- **El sistema lo organiza en el lugar correcto sin que tengas que clasificar nada a mano.**
- **Todo funciona al instante, sin tiempos de carga y 100% en tu dispositivo.**

---

## ✨ Características Principales

### 1. 📝 Bloc de Notas & Tareas (Estilo Taskade / Apple Reminders)
- **Centro de trabajo por defecto:** Entras a la app y tienes de inmediato tu lienzo activo.
- **Jerarquía y subtareas:** Desglose con líneas guía para dividir tareas complejas en pasos sencillos.
- **Checkboxes con dopamina:** Animación de completado con respuesta háptica y confeti de recompensa.
- **Proyectos / Carpetas personalizables:** *Universidad & Parciales*, *Día a Día & Urgencias*, *Proyectos Personales*, *Ideas*, etc.

### 2. ⚡ Vista "Hoy" (Focus Mode)
- Panel de inicio diario con porcentaje de cumplimiento del día.
- Alerta visual para compromisos o parciales del día actual.
- Resumen automático de gastos realizados en la jornada.

### 3. 📅 Calendario & Agenda Académica
- Cuadrícula interactiva mensual y selector por días.
- Clasificación visual por tipo de compromiso:
  - 🔴 **Parciales / Exámenes universitarios**
  - 🔵 **Entregas de talleres y proyectos**
  - 🟡 **Reuniones y asesorías**
  - 🟢 **Citas personales y médicas**
- En pantallas de escritorio, el mes y la agenda del día se organizan automáticamente a **2 columnas**.

### 4. 💰 Microfinanzas & Gastos Express (Estilo Apple Wallet)
- **Saldo disponible en vivo:** Ingresos, egresos y balance neto del mes.
- **Captura ultrarrápida:** Escribe `-3000 gaseosa` o `-14500 almuerzo corriente` y la app categoriza el gasto en milisegundos.
- **Desglose gráfico:** Porcentajes por categorías (*Comida, Transporte, Universidad, Ocio, Servicios, Ingresos*).

### 5. 🤖 Copiloto Inteligente & Parser Local
- **Sin latencia de red:** Reconoce patrones numéricos, verbos de gasto, fechas y horas localmente.
- **Consultas en lenguaje natural:**
  - *"¿Cuánto he gastado hoy?"*
  - *"¿Qué tengo que hacer hoy?"*
  - *"¿Cuáles son mis parciales?"*
- Accesible mediante la barra de búsqueda o el modal deslizable de captura rápida en cualquier pantalla.

### 6. 🖥️ Diseño Responsive Dual (Móvil & Desktop)
- **En Celular (Android / iOS):**
  - Interfaz de una columna con **UITabBar inferior fija**.
  - Modales deslizables (*Bottom Sheets*) con tirador de arrastre.
  - Vibración háptica nativa (`navigator.vibrate`) en cada interacción táctil.
  - Paleta oficial Dark Mode de Apple (`#000000` mate, separadores finos `#38383a`, acentos de sistema).
- **En PC / Laptop / Tablet:**
  - Transición automática a **Split View estilo macOS / iPadOS**.
  - **Sidebar lateral persistente** con acceso a todas las listas y saldo actual.
  - Vistas multi-columna en Calendario, Finanzas y Hoy.

### 7. 📲 PWA Instalable (Progressive Web App)
- `manifest.json` configurado con soporte `standalone`.
- Service Worker (`sw.js`) con soporte para funcionamiento offline.
- Iconos de alta resolución (192x192 y 512x512) y meta tags para pantalla completa en Android y iOS.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Motivo |
|---|---|---|
| **Frontend Core** | React 18 + TypeScript | Tipado estricto y componentes limpios |
| **Bundler & Dev Server** | Vite 8 | Compilación en menos de 400 ms y HMR instantáneo |
| **Estilos** | CSS Moderno con Custom Properties | Cero dependencias pesadas, control total de tokens iOS |
| **Iconos** | Lucide React | Iconografía de línea ligera y moderna |
| **Persistencia** | `localStorage` con fallback a datos quemados | Tus datos se guardan al recargar sin necesidad de configurar BD aún |
| **Animaciones & FX** | Canvas Confetti | Feedback visual al tachar tareas |

---

## 🚀 Cómo Ejecutar el Proyecto

### Requisitos previos
- Node.js (v18 o superior)
- npm

### 1. Clonar o ingresar a la carpeta
```bash
cd d:/Jhongo/Proyectos/NOTAS
```

### 2. Instalar dependencias (si no se han instalado)
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev -- --host
```

### 4. Abrir la aplicación
- **En tu computadora:** Abre [http://localhost:5173](http://localhost:5173)
- **En tu celular (misma red Wi-Fi):** Abre la dirección de red que muestra la consola (por ejemplo `http://192.168.2.34:5173`).

---

## 📱 Cómo Instalarla como App en tu Celular (Android)

1. Abre la URL local en **Google Chrome** en tu teléfono.
2. Toca el menú de los tres puntos (`⋮`) en la esquina superior derecha.
3. Selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
4. ¡Listo! Se creará un ícono en tu pantalla de inicio y se abrirá a pantalla completa sin la barra del navegador, igual que una app nativa.

---

## 📂 Estructura del Proyecto

```
NOTAS/
├── public/
│   ├── icon-192.png          # Ícono PWA para Android
│   ├── icon-512.png          # Ícono de alta resolución
│   ├── icon.svg              # Favicon SVG vectorial
│   ├── manifest.json         # Manifiesto de instalación PWA
│   └── sw.js                 # Service Worker para caché offline
├── src/
│   ├── components/
│   │   ├── DesktopSidebar.tsx        # Barra lateral split-view para PC
│   │   ├── Header.tsx                # Cabecera de navegación superior
│   │   ├── BottomBar.tsx             # UITabBar inferior fija para móviles
│   │   ├── QuickCaptureSheet.tsx     # Modal deslizable de captura con IA
│   │   └── views/
│   │       ├── NotesView.tsx         # Vista principal: bloc de notas tipo Taskade
│   │       ├── TodayView.tsx         # Vista de enfoque del día
│   │       ├── CalendarView.tsx      # Calendario interactivo y parciales
│   │       ├── FinanceView.tsx       # Control de gastos estilo Apple Wallet
│   │       └── CopilotChatView.tsx   # Chat con el asistente iMessage style
│   ├── context/
│   │   └── AppContext.tsx            # Estado global reactivo con localStorage
│   ├── data/
│   │   └── initialData.ts            # Datos quemados de prueba (tareas, gastos, eventos)
│   ├── services/
│   │   └── aiParser.ts               # Motor NLP local para parsing rápido
│   ├── styles/
│   │   ├── variables.css             # Tokens de diseño oficiales de Apple HIG
│   │   └── app.css                   # Estilos responsivos para móvil y desktop
│   ├── types/
│   │   └── index.ts                  # Interfaces y definiciones TypeScript
│   ├── utils/
│   │   └── haptics.ts                # Vibración háptica en dispositivos móviles
│   ├── App.tsx                       # Shell principal con enrutador de vistas
│   └── main.tsx                      # Punto de entrada de React
├── index.html                        # HTML con meta tags iOS / PWA
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔄 Restauración de Datos Quemados

Si agregas o borras tareas, gastos o notas y quieres volver a tener los datos de demostración originales (parcial de matemáticas, gastos de gaseosa, etc.), simplemente presiona el botón con el ícono de **recarga (`↺`)** en la cabecera o en la barra lateral.
