import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomBar } from './components/BottomBar';
import { DesktopSidebar } from './components/DesktopSidebar';
import { QuickCaptureSheet } from './components/QuickCaptureSheet';
import { NotesView } from './components/views/NotesView';
import { TodayView } from './components/views/TodayView';
import { CalendarView } from './components/views/CalendarView';
import { FinanceView } from './components/views/FinanceView';
import { CopilotChatView } from './components/views/CopilotChatView';
import './styles/app.css';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="app-shell">
      {/* Desktop Sidebar (macOS style - hidden on mobile) */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="app-container">
        {/* Top Header (Visible on mobile, adapted on desktop) */}
        <Header />

        {/* Main View Router */}
        <main className="main-viewport">
          {activeTab === 'notes' && <NotesView />}
          {activeTab === 'today' && <TodayView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'finance' && <FinanceView />}
          {activeTab === 'copilot' && <CopilotChatView />}
        </main>

        {/* Floating Bottom Tab Bar (Visible on mobile only) */}
        <BottomBar />

        {/* Natural Language / AI Bottom Sheet Modal */}
        <QuickCaptureSheet />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
