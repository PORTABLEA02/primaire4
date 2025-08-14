import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useDataSync } from '../hooks/useDataSync';
import { AcademicYearService } from '../services/academicYearService';
import { SchoolService } from '../services/schoolService';

interface SupabaseContextType {
  // Authentification
  user: any;
  userProfile: any;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  
  // Données de l'école
  currentSchool: any;
  currentAcademicYear: any;
  students: any[];
  teachers: any[];
  classes: any[];
  recentPayments: any[];
  
  // État de synchronisation
  syncStatus: string;
  lastSyncTime: Date | null;
  isOnline: boolean;
  
  // Actions
  refreshData: () => Promise<void>;
  logActivity: (action: string, entityType: string, entityId?: string, details?: string, level?: string) => Promise<void>;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const auth = useSupabaseAuth();
  const [currentSchool, setCurrentSchool] = useState<any>(null);
  const [currentAcademicYear, setCurrentAcademicYear] = useState<any>(null);

  const dataSync = useDataSync();

  // Charger les données initiales après authentification
  useEffect(() => {
    if (auth.isAuthenticated && auth.userProfile) {
      loadInitialData();
    } else {
    }
  }, [auth.isAuthenticated, auth.userProfile]);

  const loadInitialData = async () => {
    try {
      if (!auth.userProfile?.schoolId) return;

      // Charger l'école courante
      const school = await SchoolService.getSchoolById(auth.userProfile.schoolId);
      setCurrentSchool(school);

      // Charger l'année scolaire active
      const activeYear = await AcademicYearService.getActiveAcademicYear();
      setCurrentAcademicYear(activeYear);

      if (!activeYear) {
        console.warn('Aucune année scolaire active trouvée');
        // Créer une année par défaut
        const defaultYear = await AcademicYearService.createAcademicYear({
          name: '2024-2025',
          startDate: '2024-10-01',
          endDate: '2025-06-30',
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
        });

        // Activer la nouvelle année
        await AcademicYearService.setActiveAcademicYear(defaultYear.id);
        setCurrentAcademicYear(defaultYear);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données initiales:', error);
    } finally {
    }
  };

  const value: SupabaseContextType = {
    // Authentification
    user: auth.user,
    userProfile: auth.userProfile,
    isAuthenticated: auth.isAuthenticated,
    signIn: auth.signIn,
    signOut: auth.signOut,
    hasPermission: auth.hasPermission,
    
    // Données de l'école
    currentSchool,
    currentAcademicYear,
    students: dataSync.students,
    teachers: dataSync.teachers,
    classes: dataSync.classes,
    recentPayments: dataSync.recentPayments,
    
    // État de synchronisation
    syncStatus: dataSync.syncStatus,
    lastSyncTime: dataSync.lastSyncTime,
    isOnline: dataSync.isOnline,
    
    // Actions
    refreshData: dataSync.refreshData,
    logActivity: dataSync.logActivity,
    
    // Loading states
    loading: false,
    error: auth.error || dataSync.error
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};