import { useState, useEffect, useCallback } from 'react';
import { 
  DashboardService, 
  EnrollmentService, 
  PaymentService, 
  ActivityLogService,
  StatisticsService 
} from '../services';
import { useSupabaseAuth } from './useSupabaseAuth';

export const useSupabaseData = (schoolId?: string, academicYearId?: string) => {
  const { userProfile } = useSupabaseAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const effectiveSchoolId = schoolId || userProfile?.schoolId;
  const effectiveAcademicYearId = academicYearId || userProfile?.school?.settings?.academicYear;

  const loadData = useCallback(async () => {
    if (!effectiveSchoolId || !effectiveAcademicYearId) return;

    try {
      setError(null);

      const [
        dashboard,
        enrollmentData,
        payments,
        activities,
        stats
      ] = await Promise.all([
        DashboardService.getDashboardData(effectiveSchoolId, effectiveAcademicYearId),
        EnrollmentService.getEnrollments(effectiveSchoolId, effectiveAcademicYearId),
        PaymentService.getRecentPayments(effectiveSchoolId, 10),
        ActivityLogService.getActivityLogs(effectiveSchoolId, { limit: 10 }),
        StatisticsService.getSchoolStatistics(effectiveSchoolId, effectiveAcademicYearId)
      ]);

      setDashboardData(dashboard);
      setEnrollments(enrollmentData);
      setRecentPayments(payments);
      setRecentActivities(activities);
      setStatistics(stats);

    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      setError(error.message || 'Erreur lors du chargement des données');
    } finally {
    }
  }, [effectiveSchoolId, effectiveAcademicYearId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = useCallback(() => {
    return loadData();
  }, [loadData]);

  // Fonctions spécialisées
  const createEnrollment = useCallback(async (enrollmentData: any) => {
    if (!effectiveSchoolId || !effectiveAcademicYearId) return null;

    try {
      const result = await EnrollmentService.createEnrollment({
        ...enrollmentData,
        schoolId: effectiveSchoolId,
        academicYearId: effectiveAcademicYearId
      });

      // Rafraîchir les données
      await refreshData();
      
      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: effectiveSchoolId,
        userId: userProfile?.id,
        action: 'CREATE_ENROLLMENT',
        entityType: 'enrollment',
        entityId: result.id,
        level: 'success',
        details: `Nouvelle inscription créée`
      });

      return result;
    } catch (error) {
      console.error('Erreur lors de la création de l\'inscription:', error);
      throw error;
    }
  }, [effectiveSchoolId, effectiveAcademicYearId, userProfile?.id, refreshData]);

  const recordPayment = useCallback(async (paymentData: any) => {
    if (!effectiveSchoolId || !effectiveAcademicYearId) return null;

    try {
      const result = await PaymentService.recordPayment({
        ...paymentData,
        schoolId: effectiveSchoolId,
        academicYearId: effectiveAcademicYearId,
        processedBy: userProfile?.id
      });

      // Rafraîchir les données
      await refreshData();
      
      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: effectiveSchoolId,
        userId: userProfile?.id,
        action: 'RECORD_PAYMENT',
        entityType: 'payment',
        entityId: result.id,
        level: 'success',
        details: `Paiement enregistré: ${paymentData.amount} FCFA`
      });

      return result;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      throw error;
    }
  }, [effectiveSchoolId, effectiveAcademicYearId, userProfile?.id, refreshData]);

  const getEnrollmentsByClass = useCallback((classId: string) => {
    return enrollments.filter(e => e.class_id === classId);
  }, [enrollments]);

  const getPaymentsByStatus = useCallback((status: string) => {
    return enrollments.filter(e => e.payment_status === status);
  }, [enrollments]);

  const getTotalRevenue = useCallback(() => {
    return recentPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [recentPayments]);

  const getOutstandingAmount = useCallback(() => {
    return enrollments.reduce((sum, enrollment) => sum + enrollment.outstanding_amount, 0);
  }, [enrollments]);

  return {
    // Données
    dashboardData,
    enrollments,
    recentPayments,
    recentActivities,
    statistics,
    
    // État
    error,
    
    // Actions
    refreshData,
    createEnrollment,
    recordPayment,
    
    // Utilitaires
    getEnrollmentsByClass,
    getPaymentsByStatus,
    getTotalRevenue,
    getOutstandingAmount,
    
    // Indicateurs
    hasData: !!dashboardData,
    isReady: !!effectiveSchoolId && !!effectiveAcademicYearId
  };
};