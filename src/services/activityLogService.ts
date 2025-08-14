import { supabase } from '../lib/supabase';

export class ActivityLogService {
  // Logger une activité
  static async logActivity(activityData: {
    schoolId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    level?: 'info' | 'warning' | 'error' | 'success';
    details?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          school_id: activityData.schoolId,
          user_id: activityData.userId,
          action: activityData.action,
          entity_type: activityData.entityType,
          entity_id: activityData.entityId,
          old_values: activityData.oldValues,
          new_values: activityData.newValues,
          level: activityData.level || 'info',
          details: activityData.details,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du logging:', error);
      // Ne pas faire échouer l'opération principale si le logging échoue
      return null;
    }
  }

  // Obtenir les logs d'activité
  static async getActivityLogs(
    schoolId: string,
    filters?: {
      level?: string;
      entityType?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ) {
    try {
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          user:user_profiles(name, role)
        `)
        .eq('school_id', schoolId);

      if (filters?.level && filters.level !== 'all') {
        query = query.eq('level', filters.level);
      }

      if (filters?.entityType && filters.entityType !== 'all') {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
      return [];
    }
  }

  // Obtenir les statistiques des logs
  static async getLogStats(schoolId: string, days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('activity_logs')
        .select('level')
        .eq('school_id', schoolId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        info: data?.filter(log => log.level === 'info').length || 0,
        success: data?.filter(log => log.level === 'success').length || 0,
        warning: data?.filter(log => log.level === 'warning').length || 0,
        error: data?.filter(log => log.level === 'error').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de logs:', error);
      return { total: 0, info: 0, success: 0, warning: 0, error: 0 };
    }
  }

  // Nettoyer les anciens logs
  static async cleanOldLogs(schoolId: string, daysToKeep: number = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('school_id', schoolId)
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors du nettoyage des logs:', error);
      throw error;
    }
  }

  // Obtenir l'IP du client
  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}