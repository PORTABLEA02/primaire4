import React, { useState, useEffect } from 'react';
import { Clock, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { SessionUtils } from '../../utils/sessionUtils';
import { useSessionSecurity } from '../../hooks/useSessionSecurity';

const SessionIndicator: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isSessionValid, lastActivity } = useSessionSecurity();

  useEffect(() => {
    // Mettre à jour les informations de session toutes les 30 secondes
    const updateSessionInfo = async () => {
      const info = await SessionUtils.getSessionInfo();
      setSessionInfo(info);
    };

    updateSessionInfo();
    const interval = setInterval(updateSessionInfo, 30000);

    // Écouter les changements de connexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600';
    if (!sessionInfo || sessionInfo.status === 'error' || !isSessionValid) return 'text-red-600';
    if (sessionInfo.needsRefresh) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!isOnline) return WifiOff;
    if (!sessionInfo || sessionInfo.status === 'error' || !isSessionValid) return AlertCircle;
    if (sessionInfo.needsRefresh) return Clock;
    return CheckCircle;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Hors ligne';
    if (!isSessionValid) return 'Session inactive';
    if (!sessionInfo) return 'Vérification...';
    if (sessionInfo.status === 'error') return 'Erreur session';
    if (sessionInfo.status === 'no_session') return 'Pas de session';
    if (sessionInfo.needsRefresh) return 'Session expire bientôt';
    return 'Session active';
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h${minutes % 60}m`;
  };

  const getTimeSinceActivity = (): string => {
    if (!lastActivity) return '';
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastActivity.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Actif maintenant';
    if (diffInSeconds < 3600) return `Actif il y a ${Math.floor(diffInSeconds / 60)}m`;
    return `Actif il y a ${Math.floor(diffInSeconds / 3600)}h`;
  };
  const StatusIcon = getStatusIcon();

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors" title={`Dernière activité: ${getTimeSinceActivity()}`}>
      <StatusIcon className={`h-4 w-4 ${getStatusColor()}`} />
      <div className="text-xs">
        <div className={`font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
        {sessionInfo?.timeUntilExpiry && sessionInfo.timeUntilExpiry > 0 && (
          <div className="text-gray-500">
            {formatTimeRemaining(sessionInfo.timeUntilExpiry)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionIndicator;