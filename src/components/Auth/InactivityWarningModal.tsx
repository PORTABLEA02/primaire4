import React, { useEffect, useState } from 'react';
import { Clock, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';

interface InactivityWarningModalProps {
  isOpen: boolean;
  timeUntilLogout: number; // en secondes
  onExtendSession: () => void;
  onLogout: () => void;
}

const InactivityWarningModal: React.FC<InactivityWarningModalProps> = ({
  isOpen,
  timeUntilLogout,
  onExtendSession,
  onLogout
}) => {
  const [countdown, setCountdown] = useState(timeUntilLogout);

  useEffect(() => {
    setCountdown(timeUntilLogout);
  }, [timeUntilLogout]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onLogout]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Session Inactive</h3>
              <p className="text-sm text-gray-600">Votre session va expirer</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {formatTime(countdown)}
              </div>
              <p className="text-gray-700">
                Votre session expirera automatiquement dans ce délai pour des raisons de sécurité.
              </p>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / timeUntilLogout) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onExtendSession}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Continuer ma Session</span>
            </button>
            
            <button
              onClick={onLogout}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Se Déconnecter</span>
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              Cette mesure de sécurité protège vos données en cas d'oubli de déconnexion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarningModal;