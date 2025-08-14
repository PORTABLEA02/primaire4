import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/Auth/AuthProvider';
import { SchoolProvider } from './contexts/SchoolContext';
import { AcademicYearProvider } from './contexts/AcademicYearContext';
import { RouterProvider } from './contexts/RouterContext';
import { useSessionManager } from './hooks/useSessionManager';
import { useSessionSecurity } from './hooks/useSessionSecurity';
import LoginPage from './components/Auth/LoginPage';
import SessionExpiredModal from './components/Auth/SessionExpiredModal';
import InactivityWarningModal from './components/Auth/InactivityWarningModal';
import NavigationManager from './components/Layout/NavigationManager';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import ErrorBoundary from './components/Common/ErrorBoundary';
import { useRouter } from './contexts/RouterContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, login, error, refreshSession, logout } = useAuth();
  const { currentRoute, navigate } = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Utiliser le gestionnaire de session
  useSessionManager();

  // Utiliser la sécurité de session avec avertissement d'inactivité
  const {
    showInactivityWarning,
    timeUntilLogout,
    extendSession,
    forceLogout,
    updateActivity
  } = useSessionSecurity({
    maxInactivityTime: 30, // 30 minutes
    warningTime: 5, // Avertir 5 minutes avant
    checkInterval: 60000 // Vérifier chaque minute
  });

  // Vérifier si on doit afficher le modal de session expirée
  const showSessionExpiredModal = error && (
    error.includes('session') || 
    error.includes('expir') || 
    error.includes('token') ||
    error.includes('refresh')
  );

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogin = async (credentials: { email: string; password: string; rememberMe: boolean }) => {
    return await login(credentials.email, credentials.password, credentials.rememberMe);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex relative">
        <Sidebar 
          activeModule={currentRoute}
          onModuleChange={navigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
        />
        
        {/* Overlay for mobile */}
        {isMobile && !sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
        
        <div className={`flex-1 transition-all duration-300 ${
          isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <Header 
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            isMobile={isMobile}
          />
          
          <main className="p-4 sm:p-6">
            <NavigationManager />
          </main>
        </div>
      </div>

      {/* Modal de session expirée */}
      <SessionExpiredModal
        isOpen={showSessionExpiredModal}
        onRefresh={refreshSession}
        onLogout={logout}
        error={error}
      />

      {/* Modal d'avertissement d'inactivité */}
      <InactivityWarningModal
        isOpen={showInactivityWarning}
        timeUntilLogout={timeUntilLogout}
        onExtendSession={extendSession}
        onLogout={forceLogout}
      />
    </ErrorBoundary>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SchoolProvider>
          <AcademicYearProvider>
            <RouterProvider>
              <AppContent />
            </RouterProvider>
          </AcademicYearProvider>
        </SchoolProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;