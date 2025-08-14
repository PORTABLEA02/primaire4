import { supabase } from '../lib/supabase';
import { User } from '../types/User';

export class AuthService {
  // Connexion utilisateur
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Charger le profil utilisateur
      if (data.user) {
        const profile = await this.getUserProfile(data.user.id);
        return { user: data.user, profile };
      }

      return { user: data.user, profile: null };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  // Déconnexion
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  }

  // Inscription d'un nouvel utilisateur
  static async signUp(email: string, password: string, userData: {
    name: string;
    role: string;
    schoolId: string;
    permissions: string[];
  }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            school_id: userData.schoolId
          }
        }
      });

      if (error) throw error;

      // Le profil sera créé automatiquement par le trigger
      return data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  }

  // Obtenir le profil utilisateur
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          school:schools(*)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      throw error;
    }
  }

  // Mettre à jour le profil utilisateur
  static async updateUserProfile(userId: string, updates: Partial<any>) {
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
      console.error('Erreur de mise à jour du profil:', error);
      throw error;
    }
  }

  // Mettre à jour la dernière connexion
  static async updateLastLogin(userId: string) {
    try {
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Erreur de mise à jour de la dernière connexion:', error);
    }
  }

  // Réinitialiser le mot de passe
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur de réinitialisation:', error);
      throw error;
    }
  }

  // Changer le mot de passe
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur de changement de mot de passe:', error);
      throw error;
    }
  }

  // Obtenir la session courante
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Erreur de récupération de session:', error);
      return null;
    }
  }

  // Écouter les changements d'authentification
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export { AuthService }