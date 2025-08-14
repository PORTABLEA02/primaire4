import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/Auth/AuthProvider';

interface SupabaseContextType {
  userProfile: any;
  currentSchool: any;
  currentAcademicYear: any;
  loading: boolean;
  refreshData: () => Promise<void>;
  logActivity: (action: string, entityType: string, entityId?: string, details?: string, level?: 'info' | 'warning' | 'error' | 'success') => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabaseContext = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseContext must be used within a SupabaseProvider');
  }
  return context;
};

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentSchool, setCurrentSchool] = useState<any>(null);
  const [currentAcademicYear, setCurrentAcademicYear] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      setUserProfile(null);
      setCurrentSchool(null);
      setCurrentAcademicYear(null);
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    try {

      // Charger le profil utilisateur avec l'école
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          school:schools(*)
        `)
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      setUserProfile(profile);
      setCurrentSchool(profile.school);

      // Charger l'année scolaire active
      const { data: academicYear, error: yearError } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_active', true)
        .single();

      if (yearError) {
        console.warn('Aucune année scolaire active trouvée');
        // Créer une année par défaut si aucune n'existe
        const { data: newYear } = await supabase
          .from('academic_years')
          .insert({
            name: '2024-2025',
            start_date: '2024-10-01',
            end_date: '2025-06-30',
            is_active: true
          })
          .select()
          .single();
        
        setCurrentAcademicYear(newYear);
      } else {
        setCurrentAcademicYear(academicYear);
      }

      // Mettre à jour la dernière connexion
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user?.id);

    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    } finally {
    }
  };

  const refreshData = async () => {
    if (isAuthenticated && user) {
      await loadUserData();
    }
  };

  const logActivity = async (
    action: string,
    entityType: string,
    entityId?: string,
    details?: string,
    level: 'info' | 'warning' | 'error' | 'success' = 'info'
  ) => {
    if (!userProfile || !currentSchool) return;

    try {
      await supabase
        .from('activity_logs')
        .insert({
          school_id: currentSchool.id,
          user_id: user?.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          level,
          details,
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Erreur lors du logging:', error);
    }
  };

  const value: SupabaseContextType = {
    userProfile,
    currentSchool,
    currentAcademicYear,
    refreshData,
    logActivity
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};