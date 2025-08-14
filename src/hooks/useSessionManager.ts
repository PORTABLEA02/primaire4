import { useEffect, useCallback } from 'react';
import { useAuth } from '../components/Auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { ActivityLogService } from '../services/activityLogService';

export const useSessionManager = () => {
  const { refreshSession, logout, isAuthenticated, user, userSchool } = useAuth();

  // Vérifier périodiquement la validité de la session
  const checkSessionValidity = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erreur lors de la vérification de session:', error);
        
        // Logger l'erreur de session
        if (userSchool && user) {
          await ActivityLogService.logActivity({
            schoolId: userSchool.id,
            userId: user.id,
            action: 'SESSION_CHECK_ERROR',
            entityType: 'auth',
            level: 'error',
            details: `Erreur de vérification de session: ${error.message}`
          });
        }
        return;
      }

      if (!session) {
        console.log('Aucune session active trouvée');
        
        // Logger la perte de session
        if (userSchool && user) {
          await ActivityLogService.logActivity({
            schoolId: userSchool.id,
            userId: user.id,
            action: 'SESSION_LOST',
            entityType: 'auth',
            level: 'warning',
            details: 'Session perdue, déconnexion automatique'
          });
        }
        
        await logout();
        return;
      }

      // Vérifier si le token expire bientôt (dans les 5 prochaines minutes)
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        // Si le token expire dans moins de 5 minutes, le rafraîchir
        if (timeUntilExpiry < 300) {
          console.log('Token expire bientôt, rafraîchissement...');
          
          // Logger la tentative de rafraîchissement
          if (userSchool && user) {
            await ActivityLogService.logActivity({
              schoolId: userSchool.id,
              userId: user.id,
              action: 'SESSION_REFRESH_ATTEMPT',
              entityType: 'auth',
              level: 'info',
              details: `Token expire dans ${timeUntilExpiry} secondes, rafraîchissement automatique`
            });
          }
          
          const refreshSuccess = await refreshSession();
          
          if (!refreshSuccess) {
            console.log('Échec du rafraîchissement, déconnexion...');
            
            // Logger l'échec du rafraîchissement
            if (userSchool && user) {
              await ActivityLogService.logActivity({
                schoolId: userSchool.id,
                userId: user.id,
                action: 'SESSION_REFRESH_FAILED',
                entityType: 'auth',
                level: 'error',
                details: 'Échec du rafraîchissement de session, déconnexion forcée'
              });
            }
            
            await logout();
          } else {
            // Logger le succès du rafraîchissement
            if (userSchool && user) {
              await ActivityLogService.logActivity({
                schoolId: userSchool.id,
                userId: user.id,
                action: 'SESSION_REFRESHED',
                entityType: 'auth',
                level: 'success',
                details: 'Session rafraîchie avec succès'
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de session:', error);
      
      // Logger l'erreur générale
      if (userSchool && user) {
        try {
          await ActivityLogService.logActivity({
            schoolId: userSchool.id,
            userId: user.id,
            action: 'SESSION_CHECK_EXCEPTION',
            entityType: 'auth',
            level: 'error',
            details: `Exception lors de la vérification: ${error}`
          });
        } catch (logError) {
          console.error('Erreur lors du logging:', logError);
        }
      }
    }
  }, [isAuthenticated, refreshSession, logout, user, userSchool]);

  // Vérifier la session toutes les 2 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(checkSessionValidity, 2 * 60 * 1000);
    
    // Vérification initiale
    checkSessionValidity();

    return () => clearInterval(interval);
  }, [isAuthenticated, checkSessionValidity]);

  // Gérer la visibilité de la page (rafraîchir quand l'utilisateur revient)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        console.log('Page redevient visible, vérification de session...');
        checkSessionValidity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, checkSessionValidity]);

  // Gérer la reconnexion réseau
  useEffect(() => {
    const handleOnline = () => {
      if (isAuthenticated) {
        console.log('Connexion réseau rétablie, vérification de session...');
        checkSessionValidity();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isAuthenticated, checkSessionValidity]);

  // Gérer la fermeture de l'onglet/fenêtre
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (isAuthenticated && userSchool && user) {
        // Logger la fermeture de session
        try {
          await ActivityLogService.logActivity({
            schoolId: userSchool.id,
            userId: user.id,
            action: 'SESSION_CLOSED',
            entityType: 'auth',
            level: 'info',
            details: 'Fermeture de l\'application'
          });
        } catch (error) {
          console.error('Erreur lors du logging de fermeture:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated, user, userSchool]);
  return {
    checkSessionValidity,
    refreshSession
  };
};