import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../components/Auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { ActivityLogService } from '../services/activityLogService';

interface SessionSecurityConfig {
  maxInactivityTime: number; // en minutes
  warningTime: number; // en minutes avant expiration
  checkInterval: number; // en millisecondes
  maxConcurrentSessions: number;
}

const DEFAULT_CONFIG: SessionSecurityConfig = {
  maxInactivityTime: 30, // 30 minutes
  warningTime: 5, // Avertir 5 minutes avant
  checkInterval: 60000, // Vérifier chaque minute
  maxConcurrentSessions: 3
};

export const useSessionSecurity = (config: Partial<SessionSecurityConfig> = {}) => {
  const { logout, refreshSession, isAuthenticated, user, userSchool } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [timeUntilLogout, setTimeUntilLogout] = useState(0);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Mettre à jour la dernière activité
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowInactivityWarning(false);
  }, []);

  // Vérifier la validité de la session Supabase
  const checkSupabaseSession = useCallback(async () => {
    if (!isAuthenticated || isCheckingSession) return true;

    try {
      setIsCheckingSession(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Erreur lors de la vérification de session:', error);
        return false;
      }

      if (!session) {
        console.log('Aucune session Supabase trouvée');
        return false;
      }

      // Vérifier si le token expire bientôt
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;

        // Si le token expire dans moins de 5 minutes, le rafraîchir
        if (timeUntilExpiry < 300) {
          console.log('Token expire bientôt, rafraîchissement...');
          const refreshSuccess = await refreshSession();
          
          if (!refreshSuccess) {
            console.log('Échec du rafraîchissement, session invalide');
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de session Supabase:', error);
      return false;
    } finally {
      setIsCheckingSession(false);
    }
  }, [isAuthenticated, refreshSession, isCheckingSession]);

  // Vérifier l'inactivité de l'utilisateur
  const checkInactivity = useCallback(async () => {
    if (!isAuthenticated) return;

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;
    const maxInactivityMs = finalConfig.maxInactivityTime * 60 * 1000;
    const warningTimeMs = finalConfig.warningTime * 60 * 1000;

    // Calculer le temps restant avant déconnexion
    const timeRemaining = maxInactivityMs - timeSinceLastActivity;
    setTimeUntilLogout(Math.max(0, Math.floor(timeRemaining / 1000)));

    // Afficher l'avertissement si proche de l'expiration
    if (timeRemaining <= warningTimeMs && timeRemaining > 0) {
      setShowInactivityWarning(true);
    }

    // Déconnecter si temps dépassé
    if (timeSinceLastActivity >= maxInactivityMs) {
      console.log('Session expirée par inactivité');
      
      // Logger la déconnexion par inactivité
      if (userSchool && user) {
        try {
          await ActivityLogService.logActivity({
            schoolId: userSchool.id,
            userId: user.id,
            action: 'SESSION_EXPIRED_INACTIVITY',
            entityType: 'auth',
            level: 'warning',
            details: `Session expirée après ${finalConfig.maxInactivityTime} minutes d'inactivité`
          });
        } catch (error) {
          console.error('Erreur lors du logging de déconnexion:', error);
        }
      }

      await logout();
      return;
    }

    // Vérifier la session Supabase
    const sessionValid = await checkSupabaseSession();
    if (!sessionValid) {
      console.log('Session Supabase invalide, déconnexion...');
      await logout();
    }
  }, [
    isAuthenticated, 
    lastActivity, 
    finalConfig.maxInactivityTime, 
    finalConfig.warningTime, 
    logout, 
    checkSupabaseSession,
    userSchool,
    user
  ]);

  // Étendre la session
  const extendSession = useCallback(async () => {
    updateActivity();
    setShowInactivityWarning(false);
    
    // Optionnel: rafraîchir le token Supabase
    try {
      await refreshSession();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de session:', error);
    }
  }, [updateActivity, refreshSession]);

  // Forcer la déconnexion
  const forceLogout = useCallback(async () => {
    setShowInactivityWarning(false);
    
    if (userSchool && user) {
      try {
        await ActivityLogService.logActivity({
          schoolId: userSchool.id,
          userId: user.id,
          action: 'FORCED_LOGOUT',
          entityType: 'auth',
          level: 'info',
          details: 'Déconnexion forcée par l\'utilisateur'
        });
      } catch (error) {
        console.error('Erreur lors du logging:', error);
      }
    }
    
    await logout();
  }, [logout, userSchool, user]);

  // Configurer les écouteurs d'activité
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    // Ajouter les écouteurs
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Configurer l'intervalle de vérification
    const interval = setInterval(checkInactivity, finalConfig.checkInterval);

    // Vérification initiale
    checkInactivity();

    return () => {
      // Nettoyer les écouteurs
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(interval);
    };
  }, [isAuthenticated, updateActivity, checkInactivity, finalConfig.checkInterval]);

  // Gérer la visibilité de la page
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page redevient visible, vérifier la session
        checkSupabaseSession();
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, checkSupabaseSession, updateActivity]);

  // Gérer la reconnexion réseau
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleOnline = () => {
      console.log('Connexion réseau rétablie, vérification de session...');
      checkSupabaseSession();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isAuthenticated, checkSupabaseSession]);

  return {
    showInactivityWarning,
    timeUntilLogout,
    extendSession,
    forceLogout,
    updateActivity,
    isSessionValid: isAuthenticated && !showInactivityWarning,
    lastActivity: new Date(lastActivity),
    config: finalConfig
  };
};