import { supabase } from '../lib/supabase';

export class SessionUtils {
  // Vérifier si la session est valide
  static async isSessionValid(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erreur lors de la vérification de session:', error);
        return false;
      }

      if (!session) {
        return false;
      }

      // Vérifier si le token n'est pas expiré
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        return expiresAt > now;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de validité:', error);
      return false;
    }
  }

  // Obtenir le temps restant avant expiration (en secondes)
  static async getTimeUntilExpiry(): Promise<number | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.expires_at) {
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, session.expires_at - now);
    } catch (error) {
      console.error('Erreur lors du calcul du temps d\'expiration:', error);
      return null;
    }
  }

  // Rafraîchir la session avec gestion d'erreur
  static async refreshSessionSafely(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Erreur lors du refresh de session:', error);
        
        // Messages d'erreur spécifiques
        if (error.message.includes('refresh_token_not_found')) {
          return { success: false, error: 'Token de rafraîchissement non trouvé' };
        } else if (error.message.includes('invalid_grant')) {
          return { success: false, error: 'Token de rafraîchissement invalide' };
        } else {
          return { success: false, error: error.message };
        }
      }

      if (data.session?.user) {
        console.log('Session rafraîchie avec succès');
        return { success: true };
      }

      return { success: false, error: 'Aucune session retournée' };
    } catch (error: any) {
      console.error('Erreur lors du refresh:', error);
      return { success: false, error: error.message || 'Erreur inconnue' };
    }
  }

  // Forcer la déconnexion en cas d'erreur de session
  static async forceSignOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      console.log('Déconnexion forcée effectuée');
    } catch (error) {
      console.error('Erreur lors de la déconnexion forcée:', error);
      // Même en cas d'erreur, nettoyer le localStorage
      localStorage.clear();
    }
  }

  // Vérifier la santé de la connexion Supabase
  static async checkSupabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Erreur de connexion Supabase:', error);
      return false;
    }
  }

  // Logger les événements de session pour le debugging
  static logSessionEvent(event: string, details?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[SESSION ${timestamp}] ${event}`, details);
    
    // En production, vous pourriez envoyer ces logs à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      // Exemple: envoyer à un service de logging
      // LoggingService.log('session', event, details);
    }
  }

  // Obtenir les informations de session pour le debugging
  static async getSessionInfo(): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { status: 'no_session' };
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = session.expires_at ? session.expires_at - now : null;

      return {
        status: 'active',
        userId: session.user.id,
        email: session.user.email,
        expiresAt: session.expires_at,
        timeUntilExpiry,
        isExpired: timeUntilExpiry ? timeUntilExpiry <= 0 : false,
        needsRefresh: timeUntilExpiry ? timeUntilExpiry < 300 : false // Moins de 5 minutes
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  // Obtenir les métriques de session pour le monitoring
  static getSessionMetrics(): {
    sessionDuration: number;
    lastActivity: Date | null;
    pageViews: number;
    actionsPerformed: number;
  } {
    const sessionStart = localStorage.getItem('ecoletech_session_start');
    const lastActivity = localStorage.getItem('ecoletech_last_activity');
    const pageViews = parseInt(localStorage.getItem('ecoletech_page_views') || '0');
    const actionsPerformed = parseInt(localStorage.getItem('ecoletech_actions_count') || '0');

    return {
      sessionDuration: sessionStart ? Date.now() - parseInt(sessionStart) : 0,
      lastActivity: lastActivity ? new Date(parseInt(lastActivity)) : null,
      pageViews,
      actionsPerformed
    };
  }

  // Enregistrer une action utilisateur
  static recordUserAction(actionType: string): void {
    const currentCount = parseInt(localStorage.getItem('ecoletech_actions_count') || '0');
    localStorage.setItem('ecoletech_actions_count', (currentCount + 1).toString());
    localStorage.setItem('ecoletech_last_activity', Date.now().toString());
    
    // Logger les actions importantes
    if (['login', 'logout', 'data_export', 'settings_change'].includes(actionType)) {
      console.log(`Action utilisateur enregistrée: ${actionType}`);
    }
  }

  // Initialiser une nouvelle session
  static initializeSession(): void {
    const now = Date.now().toString();
    localStorage.setItem('ecoletech_session_start', now);
    localStorage.setItem('ecoletech_last_activity', now);
    localStorage.setItem('ecoletech_page_views', '1');
    localStorage.setItem('ecoletech_actions_count', '0');
  }

  // Nettoyer les données de session
  static cleanupSession(): void {
    localStorage.removeItem('ecoletech_session_start');
    localStorage.removeItem('ecoletech_last_activity');
    localStorage.removeItem('ecoletech_page_views');
    localStorage.removeItem('ecoletech_actions_count');
    localStorage.removeItem('ecoletech_current_route');
  }
}