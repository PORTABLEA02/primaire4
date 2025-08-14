import React from 'react';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onRefresh: () => Promise<boolean>;
  onLogout: () => void;
  error?: string;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  onRefresh,
  onLogout,
  error
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const success = await onRefresh();
      if (!success) {
        // Si le refresh échoue, forcer la déconnexion
        onLogout();
      }
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
      onLogout();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Session Expirée</h3>
              <p className="text-sm text-gray-600">Votre session a expiré</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              {error || 'Votre session a expiré pour des raisons de sécurité. Vous pouvez essayer de rafraîchir votre session ou vous reconnecter.'}
            </p>
            <p className="text-sm text-gray-500">
              Cette mesure protège vos données et garantit la sécurité de votre compte.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isRefreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Rafraîchissement...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Rafraîchir Session</span>
                </>
              )}
            </button>
            
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Se Reconnecter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;