import React from 'react';
import { useRouter } from '../../contexts/RouterContext';
import { useAuth } from '../Auth/AuthProvider';
import { AlertCircle, Lock, ArrowLeft } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, fallback }) => {
  const { currentRoute, canAccess, goBack, navigate } = useRouter();
  const { isAuthenticated, user } = useAuth();

  // Si pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Accès Restreint</h2>
          <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  // Si pas d'autorisation pour la route actuelle
  if (!canAccess(currentRoute)) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Accès Refusé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
          <div className="space-y-3">
            <button
              onClick={goBack}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </button>
            <button
              onClick={() => navigate('dashboard')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Aller au Tableau de Bord
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Votre rôle:</strong> {user?.role}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Contactez votre administrateur pour obtenir les permissions nécessaires.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;