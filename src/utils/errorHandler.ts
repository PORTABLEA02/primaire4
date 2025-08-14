import { ActivityLogService } from '../services/activityLogService';

export class ErrorHandler {
  // Gérer les erreurs Supabase
  static handleSupabaseError(error: any, context: string = '') {
    console.error(`Erreur Supabase ${context}:`, error);

    let userMessage = 'Une erreur est survenue';
    let logLevel: 'error' | 'warning' = 'error';

    switch (error.code) {
      case 'PGRST116':
        userMessage = 'Aucun enregistrement trouvé';
        logLevel = 'warning';
        break;
      case 'PGRST301':
        userMessage = 'Plusieurs enregistrements trouvés, un seul attendu';
        break;
      case '23505':
        userMessage = 'Cette donnée existe déjà dans le système';
        break;
      case '23503':
        userMessage = 'Référence invalide - données liées manquantes';
        break;
      case '23514':
        userMessage = 'Données invalides - contraintes non respectées';
        break;
      case 'PGRST103':
        userMessage = 'Accès refusé - permissions insuffisantes';
        break;
      case 'PGRST204':
        userMessage = 'Opération non autorisée';
        break;
      default:
        if (error.message) {
          userMessage = error.message;
        }
    }

    return {
      userMessage,
      logLevel,
      originalError: error
    };
  }

  // Gérer les erreurs de validation
  static handleValidationError(errors: Record<string, string>) {
    const errorMessages = Object.values(errors);
    return {
      userMessage: `Erreurs de validation: ${errorMessages.join(', ')}`,
      logLevel: 'warning' as const,
      validationErrors: errors
    };
  }

  // Gérer les erreurs réseau
  static handleNetworkError(error: any) {
    console.error('Erreur réseau:', error);
    
    let userMessage = 'Erreur de connexion';
    
    if (!navigator.onLine) {
      userMessage = 'Pas de connexion internet';
    } else if (error.name === 'TimeoutError') {
      userMessage = 'Délai d\'attente dépassé';
    } else if (error.name === 'AbortError') {
      userMessage = 'Opération annulée';
    }

    return {
      userMessage,
      logLevel: 'error' as const,
      originalError: error
    };
  }

  // Logger une erreur avec contexte
  static async logError(
    error: any,
    context: {
      schoolId?: string;
      userId?: string;
      action: string;
      entityType: string;
      entityId?: string;
    }
  ) {
    try {
      if (context.schoolId) {
        await ActivityLogService.logActivity({
          schoolId: context.schoolId,
          userId: context.userId,
          action: `${context.action}_ERROR`,
          entityType: context.entityType,
          entityId: context.entityId,
          level: 'error',
          details: error.message || 'Erreur inconnue',
          newValues: { error: error.toString() }
        });
      }
    } catch (logError) {
      console.error('Erreur lors du logging de l\'erreur:', logError);
    }
  }

  // Créer un gestionnaire d'erreur global
  static createGlobalErrorHandler(
    schoolId?: string,
    userId?: string,
    onError?: (error: any) => void
  ) {
    return async (error: any, context: string = '') => {
      const handledError = this.handleSupabaseError(error, context);
      
      // Logger l'erreur
      if (schoolId) {
        await this.logError(error, {
          schoolId,
          userId,
          action: 'GLOBAL_ERROR',
          entityType: 'system'
        });
      }

      // Notifier l'interface utilisateur
      if (onError) {
        onError(handledError);
      }

      return handledError;
    };
  }

  // Wrapper pour les opérations async avec gestion d'erreur
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: {
      schoolId?: string;
      userId?: string;
      action: string;
      entityType: string;
      entityId?: string;
      onError?: (error: any) => void;
    }
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      const handledError = this.handleSupabaseError(error, context.action);
      
      await this.logError(error, context);
      
      if (context.onError) {
        context.onError(handledError);
      }
      
      return null;
    }
  }

  // Validation des permissions
  static validatePermission(
    userRole: string,
    userPermissions: string[],
    requiredPermission: string
  ): boolean {
    if (userRole === 'Admin') return true;
    if (userPermissions.includes('all')) return true;
    return userPermissions.includes(requiredPermission);
  }

  // Validation des données avant envoi
  static sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized: any = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (typeof value === 'string') {
        // Nettoyer les chaînes
        sanitized[key] = value.trim();
      } else if (typeof value === 'number') {
        // Vérifier les nombres
        sanitized[key] = isNaN(value) ? null : value;
      } else if (Array.isArray(value)) {
        // Nettoyer les tableaux
        sanitized[key] = value.filter(item => item !== null && item !== undefined);
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }
}