import { supabase } from '../lib/supabase';

export class UserService {
  // Obtenir tous les utilisateurs d'une école
  static async getUsers(schoolId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('school_id', schoolId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      throw error;
    }
  }

  // Créer un nouvel utilisateur
  static async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: 'Admin' | 'Directeur' | 'Secrétaire' | 'Enseignant' | 'Comptable';
    schoolId: string;
    permissions: string[];
    teacherId?: string; // Pour lier à un enseignant existant
  }) {
    try {
      // Créer l'utilisateur dans auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          role: userData.role,
          school_id: userData.schoolId
        }
      });

      if (authError) throw authError;

      // Le profil sera créé automatiquement par le trigger
      // Mettre à jour les permissions
      if (authData.user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            permissions: userData.permissions
          })
          .eq('id', authData.user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
        // Si c'est un enseignant, lier le profil à l'enseignant
        if (userData.role === 'Enseignant' && userData.teacherId) {
          await supabase
            .from('teachers')
            .update({ user_profile_id: authData.user.id })
            .eq('id', userData.teacherId);
        }
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  static async updateUser(userId: string, updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }

  // Désactiver un utilisateur
  static async deactivateUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
      throw error;
    }
  }

  // Réinitialiser le mot de passe
  static async resetUserPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      throw error;
    }
  }

  // Obtenir les permissions par rôle
  static getPermissionsByRole(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      'Admin': ['all'],
      'Directeur': ['students', 'teachers', 'classes', 'academic', 'finance', 'reports', 'schedule', 'settings'],
      'Secrétaire': ['students', 'classes'],
      'Enseignant': ['academic'],
      'Comptable': ['finance', 'reports']
    };

    return rolePermissions[role] || [];
  }

  // Vérifier les permissions d'un utilisateur
  static async checkUserPermissions(userId: string, requiredPermission: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, permissions')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data.role === 'Admin') return true;
      if (data.permissions.includes('all')) return true;
      return data.permissions.includes(requiredPermission);
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  // Obtenir les statistiques d'utilisation
  static async getUserStats(schoolId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, is_active, last_login')
        .eq('school_id', schoolId);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        active: data?.filter(u => u.is_active).length || 0,
        byRole: data?.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        recentLogins: data?.filter(u => {
          if (!u.last_login) return false;
          const lastLogin = new Date(u.last_login);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return lastLogin > weekAgo;
        }).length || 0
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques utilisateur:', error);
      return null;
    }
  }
}