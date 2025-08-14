import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { AuthService } from '../services/authService';
import { ActivityLogService } from '../services/activityLogService';

interface UserProfile {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: string;
  school?: any;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier la session existante
    checkSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id);
          await AuthService.updateLastLogin(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const session = await AuthService.getCurrentSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Erreur de vérification de session:', error);
      setError('Erreur de vérification de session');
    } finally {
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await AuthService.getUserProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Erreur de chargement du profil:', error);
      setError('Erreur de chargement du profil utilisateur');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      
      const { user: authUser, profile } = await AuthService.signIn(email, password);
      
      if (authUser && profile) {
        setUser(authUser);
        setUserProfile(profile);
        
        // Logger la connexion
        await ActivityLogService.logActivity({
          schoolId: profile.school_id,
          userId: authUser.id,
          action: 'LOGIN',
          entityType: 'auth',
          level: 'success',
          details: 'Connexion réussie'
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setError(error.message || 'Erreur de connexion');
      return false;
    } finally {
    }
  };

  const signOut = async () => {
    try {
      if (userProfile) {
        // Logger la déconnexion
        await ActivityLogService.logActivity({
          schoolId: userProfile.schoolId,
          userId: user?.id,
          action: 'LOGOUT',
          entityType: 'auth',
          level: 'info',
          details: 'Déconnexion'
        });
      }
      
      await AuthService.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) return null;
      
      const updatedProfile = await AuthService.updateUserProfile(user.id, updates);
      setUserProfile(updatedProfile);
      
      // Logger la mise à jour
      if (userProfile) {
        await ActivityLogService.logActivity({
          schoolId: userProfile.schoolId,
          userId: user.id,
          action: 'UPDATE_PROFILE',
          entityType: 'user_profile',
          entityId: user.id,
          level: 'info',
          details: 'Mise à jour du profil utilisateur'
        });
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    if (userProfile.role === 'Admin') return true;
    if (userProfile.permissions.includes('all')) return true;
    return userProfile.permissions.includes(permission);
  };

  return {
    user,
    userProfile,
    error,
    signIn,
    signOut,
    updateProfile,
    hasPermission,
    isAuthenticated: !!user
  };
};