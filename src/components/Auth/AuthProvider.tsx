import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { User as UserType } from '../../types/User';
import { School } from '../../types/School';
import { SessionUtils } from '../../utils/sessionUtils';

interface AuthContextType {
  user: UserType | null;
  supabaseUser: SupabaseUser | null;
  userSchool: School | null;
  currentAcademicYear: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  error: string | null;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [userSchool, setUserSchool] = useState<School | null>(null);
  const [currentAcademicYear, setCurrentAcademicYear] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier la session existante
    checkSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Initialiser la session
          SessionUtils.initializeSession();
          SessionUtils.recordUserAction('login');
          
          // Utiliser setTimeout pour éviter le deadlock
          setTimeout(() => {
            loadUserProfile(session.user);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Nettoyer la session
          SessionUtils.cleanupSession();
          handleSignOut();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Pour le rafraîchissement de token, mettre à jour l'utilisateur Supabase
          setSupabaseUser(session.user);
          SessionUtils.recordUserAction('token_refresh');
          console.log('Token refreshed successfully');
        } else if (event === 'TOKEN_REFRESH_FAILED') {
          // Le refresh token est invalide → obliger l'utilisateur à se reconnecter
          console.log('Session expirée, merci de vous reconnecter');
          setError('Votre session a expiré. Veuillez vous reconnecter.');
          SessionUtils.cleanupSession();
          await handleSignOut();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fonction pour rafraîchir manuellement la session
  const refreshSession = async (): Promise<boolean> => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Erreur lors du refresh de session:', error);
        setError('Session expirée, merci de vous reconnecter');
        SessionUtils.cleanupSession();
        await handleSignOut();
        return false;
      }

      if (data.session?.user) {
        setSupabaseUser(data.session.user);
        SessionUtils.recordUserAction('manual_refresh');
        console.log('Session refreshed manually');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors du refresh manuel:', error);
      setError('Erreur lors du rafraîchissement de la session');
      SessionUtils.cleanupSession();
      return false;
    }
  };

  // Fonction centralisée pour gérer la déconnexion
  const handleSignOut = () => {
    SessionUtils.cleanupSession();
    setUser(null);
    setSupabaseUser(null);
    setUserSchool(null);
    setCurrentAcademicYear(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
      }
    } catch (error) {
      console.error('Erreur de vérification de session:', error);
      setError('Erreur de vérification de session');
    }
  };

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          school:schools(*)
        `)
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setError('Profil utilisateur non trouvé');
        return;
      }

      // Charger l'année scolaire active
      const { data: activeYear, error: yearError } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_active', true)
        .single();

      if (yearError) {
        console.warn('Aucune année scolaire active trouvée:', yearError);
        // Créer une année par défaut si aucune n'existe
        const { data: newYear, error: createError } = await supabase
          .from('academic_years')
          .insert({
            name: '2024-2025',
            start_date: '2024-10-01',
            end_date: '2025-06-30',
            is_active: true,
            periods: [
              {
                id: '1',
                name: 'Trimestre 1',
                startDate: '2024-10-01',
                endDate: '2024-12-20',
                type: 'Trimestre'
              },
              {
                id: '2',
                name: 'Trimestre 2',
                startDate: '2025-01-08',
                endDate: '2025-03-28',
                type: 'Trimestre'
              },
              {
                id: '3',
                name: 'Trimestre 3',
                startDate: '2025-04-07',
                endDate: '2025-06-30',
                type: 'Trimestre'
              }
            ]
          })
          .select()
          .single();

        if (createError) {
          console.error('Erreur lors de la création de l\'année par défaut:', createError);
        } else {
          setCurrentAcademicYear(newYear);
        }
      } else {
        setCurrentAcademicYear(activeYear);
      }
      // Mapper vers notre type User
      const userData: UserType = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        permissions: profile.permissions || [],
        schoolId: profile.school_id,
        isActive: profile.is_active,
        createdDate: profile.created_at,
        lastLogin: profile.last_login
      };

      // Mapper les données de l'école
      if (profile.school) {
        const schoolData: School = {
          id: profile.school.id,
          name: profile.school.name,
          address: profile.school.address,
          phone: profile.school.phone,
          email: profile.school.email,
          director: profile.school.director,
          foundedYear: profile.school.founded_year,
          studentCapacity: profile.school.student_capacity,
          motto: profile.school.motto,
          logo: profile.school.logo_url,
          isActive: profile.school.is_active,
          createdDate: profile.school.created_at,
          settings: profile.school.settings || {
            currency: 'FCFA',
            academicYear: '2024-2025',
            periods: [],
            feeTypes: [],
            paymentMethods: [],
            lateFeePercentage: 5,
            scholarshipPercentage: 10
          }
        };
        setUserSchool(schoolData);
      }
      setUser(userData);
      setSupabaseUser(supabaseUser);
      setIsAuthenticated(true);
      setError(null);

      // Mettre à jour la dernière connexion
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', supabaseUser.id);

    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setError('Erreur lors du chargement du profil utilisateur');
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erreur de connexion:', error);
        
        // Messages d'erreur personnalisés
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Veuillez confirmer votre email avant de vous connecter');
        } else {
          setError(error.message);
        }
        
        return false;
      }

      if (data.user) {
        await loadUserProfile(data.user);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      setError(error.message || 'Erreur de connexion');
      return false;
    } finally {
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Logger la déconnexion avant de perdre les informations utilisateur
      if (userSchool && user) {
        try {
          await ActivityLogService.logActivity({
            schoolId: userSchool.id,
            userId: user.id,
            action: 'LOGOUT',
            entityType: 'auth',
            level: 'info',
            details: 'Déconnexion manuelle'
          });
        } catch (logError) {
          console.error('Erreur lors du logging de déconnexion:', logError);
        }
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erreur de déconnexion:', error);
        setError('Erreur lors de la déconnexion');
      }

      handleSignOut();
      
      // Nettoyer le localStorage
      localStorage.removeItem('ecoletech_current_route');
      localStorage.removeItem('ecoletech_last_activity');
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      setError(error.message || 'Erreur de déconnexion');
    } finally {
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    userSchool,
    currentAcademicYear,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    error,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};