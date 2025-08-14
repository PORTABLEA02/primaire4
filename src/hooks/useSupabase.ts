import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/Auth/AuthProvider';

export const useSupabase = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          school:schools(*)
        `)
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
    }
  };

  // Fonction pour logger une activité
  const logActivity = async (
    action: string,
    entityType: string,
    entityId?: string,
    details?: string,
    level: 'info' | 'warning' | 'error' | 'success' = 'info'
  ) => {
    if (!userProfile) return;

    try {
      await supabase
        .from('activity_logs')
        .insert({
          school_id: userProfile.school_id,
          user_id: user?.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          level,
          details,
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Erreur lors du logging:', error);
    }
  };

  // Fonction pour obtenir l'IP du client (simplifiée)
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  // Fonction pour obtenir les données du dashboard
  const getDashboardData = async (schoolId: string, academicYearId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_school_dashboard', {
          p_school_id: schoolId,
          p_academic_year_id: academicYearId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      return null;
    }
  };

  // Fonction pour obtenir les inscriptions avec détails
  const getEnrollmentDetails = async (schoolId: string, academicYearId: string) => {
    try {
      const { data, error } = await supabase
        .from('enrollment_details')
        .select('*')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error);
      return [];
    }
  };

  // Fonction pour obtenir les affectations d'enseignants
  const getTeacherAssignments = async (schoolId: string, academicYearId: string) => {
    try {
      const { data, error } = await supabase
        .from('teacher_assignment_details')
        .select('*')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des affectations:', error);
      return [];
    }
  };

  // Fonction pour obtenir l'emploi du temps
  const getScheduleDetails = async (schoolId: string, academicYearId: string, classId?: string) => {
    try {
      let query = supabase
        .from('schedule_details')
        .select('*')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true);

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query.order('day_of_week').order('start_time');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'emploi du temps:', error);
      return [];
    }
  };

  // Fonction pour créer un nouvel élève avec inscription
  const createStudentWithEnrollment = async (
    studentData: any,
    enrollmentData: any
  ) => {
    try {
      // Commencer une transaction
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert(studentData)
        .select()
        .single();

      if (studentError) throw studentError;

      // Créer l'inscription
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('student_class_enrollments')
        .insert({
          ...enrollmentData,
          student_id: student.id
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // Logger l'activité
      await logActivity(
        'CREATE_STUDENT_WITH_ENROLLMENT',
        'student',
        student.id,
        `Nouvel élève inscrit: ${student.first_name} ${student.last_name}`,
        'success'
      );

      return { student, enrollment };
    } catch (error) {
      console.error('Erreur lors de la création de l\'élève:', error);
      await logActivity(
        'CREATE_STUDENT_ERROR',
        'student',
        undefined,
        `Erreur lors de la création d'un élève: ${error}`,
        'error'
      );
      throw error;
    }
  };

  // Fonction pour enregistrer un paiement
  const recordPayment = async (paymentData: any) => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          ...paymentData,
          processed_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await logActivity(
        'RECORD_PAYMENT',
        'payment',
        data.id,
        `Paiement enregistré: ${paymentData.amount} FCFA`,
        'success'
      );

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      await logActivity(
        'PAYMENT_ERROR',
        'payment',
        undefined,
        `Erreur lors de l'enregistrement d'un paiement: ${error}`,
        'error'
      );
      throw error;
    }
  };

  return {
    userProfile,
    logActivity,
    getDashboardData,
    getEnrollmentDetails,
    getTeacherAssignments,
    getScheduleDetails,
    createStudentWithEnrollment,
    recordPayment
  };
};