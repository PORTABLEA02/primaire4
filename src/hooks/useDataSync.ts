import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useSchoolData } from './useSchoolData';
import { useRealTimeUpdates } from './useRealTimeUpdates';
import { ErrorHandler } from '../utils/errorHandler';

export const useDataSync = () => {
  const { userProfile, isAuthenticated } = useSupabaseAuth();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);

  const schoolId = userProfile?.schoolId;
  const academicYearId = userProfile?.school?.settings?.academicYear;

  const {
    students,
    teachers,
    classes,
    recentPayments,
    error,
    refreshData,
    logActivity
  } = useSchoolData(schoolId, academicYearId);

  // Gérer les mises à jour en temps réel
  const handleRealTimeUpdate = useCallback((table: string, payload: any) => {
    console.log(`Mise à jour temps réel - ${table}:`, payload);
    
    // Rafraîchir les données selon la table modifiée
    switch (table) {
      case 'students':
      case 'enrollments':
      case 'payments':
      case 'teachers':
      case 'classes':
      case 'grades':
        refreshData();
        break;
    }
    
    setLastSyncTime(new Date());
  }, [refreshData]);

  // Activer les mises à jour en temps réel
  useRealTimeUpdates(schoolId || '', handleRealTimeUpdate);

  // Synchronisation manuelle
  const syncData = useCallback(async () => {
    if (!schoolId || !academicYearId) return;

    try {
      setSyncStatus('syncing');
      await refreshData();
      setSyncStatus('success');
      setLastSyncTime(new Date());
      
      await logActivity(
        'DATA_SYNC',
        'system',
        undefined,
        'Synchronisation manuelle des données',
        'info'
      );
    } catch (error) {
      setSyncStatus('error');
      console.error('Erreur de synchronisation:', error);
      
      await logActivity(
        'DATA_SYNC_ERROR',
        'system',
        undefined,
        `Erreur de synchronisation: ${error}`,
        'error'
      );
    }
  }, [schoolId, academicYearId, refreshData, logActivity]);

  // Auto-sync périodique
  useEffect(() => {
    if (!isAuthenticated || !schoolId) return;

    const interval = setInterval(() => {
      syncData();
    }, 5 * 60 * 1000); // Sync toutes les 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, schoolId, syncData]);

  // Gestion des changements hors ligne
  const addPendingChange = useCallback((change: any) => {
    setPendingChanges(prev => [...prev, {
      ...change,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    }]);
  }, []);

  const processPendingChanges = useCallback(async () => {
    if (pendingChanges.length === 0) return;

    try {
      setSyncStatus('syncing');
      
      // Traiter chaque changement en attente
      for (const change of pendingChanges) {
        try {
          // Ici vous pouvez implémenter la logique pour appliquer chaque changement
          console.log('Traitement du changement en attente:', change);
        } catch (error) {
          console.error('Erreur lors du traitement du changement:', error);
        }
      }
      
      setPendingChanges([]);
      setSyncStatus('success');
      
    } catch (error) {
      setSyncStatus('error');
      console.error('Erreur lors du traitement des changements en attente:', error);
    }
  }, [pendingChanges]);

  // Traiter les changements en attente quand la connexion revient
  useEffect(() => {
    if (navigator.onLine && pendingChanges.length > 0) {
      processPendingChanges();
    }
  }, [navigator.onLine, pendingChanges.length, processPendingChanges]);

  // Détection de l'état de connexion
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    // Données
    students,
    teachers,
    classes,
    recentPayments,
    
    // État de synchronisation
    syncStatus,
    lastSyncTime,
    isOnline,
    error,
    
    // Actions
    syncData,
    addPendingChange,
    pendingChanges: pendingChanges.length,
    
    // Utilitaires
    refreshData
  };
};