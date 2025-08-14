import { supabase } from '../lib/supabase';

export class EnrollmentService {
  // Obtenir toutes les inscriptions d'une école pour une année
  static async getEnrollments(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('enrollment_details')
        .select('*')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error);
      throw error;
    }
  }

  // Créer une nouvelle inscription
  static async createEnrollment(enrollmentData: {
    studentId: string;
    classId: string;
    schoolId: string;
    academicYearId: string;
    totalFees: number;
    paidAmount?: number;
    paymentMethod?: string;
    mobileNumber?: string;
    bankDetails?: string;
    notes?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('student_class_enrollments')
        .insert({
          student_id: enrollmentData.studentId,
          class_id: enrollmentData.classId,
          school_id: enrollmentData.schoolId,
          academic_year_id: enrollmentData.academicYearId,
          total_fees: enrollmentData.totalFees,
          paid_amount: enrollmentData.paidAmount || 0,
          payment_method: enrollmentData.paymentMethod,
          mobile_number: enrollmentData.mobileNumber,
          bank_details: enrollmentData.bankDetails,
          notes: enrollmentData.notes
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'inscription:', error);
      throw error;
    }
  }

  // Mettre à jour une inscription
  static async updateEnrollment(enrollmentId: string, updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('student_class_enrollments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'inscription:', error);
      throw error;
    }
  }

  // Transférer un élève vers une autre classe
  static async transferStudent(
    currentEnrollmentId: string,
    newClassId: string,
    transferReason?: string
  ) {
    try {
      // Désactiver l'inscription actuelle
      const { data: currentEnrollment } = await supabase
        .from('student_class_enrollments')
        .select('*')
        .eq('id', currentEnrollmentId)
        .single();

      if (!currentEnrollment) {
        throw new Error('Inscription non trouvée');
      }

      await supabase
        .from('student_class_enrollments')
        .update({ is_active: false })
        .eq('id', currentEnrollmentId);

      // Créer une nouvelle inscription
      const { data, error } = await supabase
        .from('student_class_enrollments')
        .insert({
          student_id: currentEnrollment.student_id,
          class_id: newClassId,
          school_id: currentEnrollment.school_id,
          academic_year_id: currentEnrollment.academic_year_id,
          total_fees: currentEnrollment.total_fees,
          paid_amount: currentEnrollment.paid_amount,
          payment_method: currentEnrollment.payment_method,
          mobile_number: currentEnrollment.mobile_number,
          bank_details: currentEnrollment.bank_details,
          notes: transferReason ? `Transfert: ${transferReason}` : currentEnrollment.notes
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du transfert:', error);
      throw error;
    }
  }

  // Obtenir les statistiques d'inscription
  static async getEnrollmentStats(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('enrollment_details')
        .select('payment_status, class_name, level')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        byPaymentStatus: {
          'À jour': data?.filter(e => e.payment_status === 'À jour').length || 0,
          'En retard': data?.filter(e => e.payment_status === 'En retard').length || 0,
          'Partiel': data?.filter(e => e.payment_status === 'Partiel').length || 0
        },
        byLevel: data?.reduce((acc, enrollment) => {
          acc[enrollment.level] = (acc[enrollment.level] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return null;
    }
  }

  // Désactiver une inscription (retrait d'élève)
  static async withdrawStudent(enrollmentId: string, withdrawalReason: string) {
    try {
      const { data, error } = await supabase
        .from('student_class_enrollments')
        .update({
          is_active: false,
          notes: `Retrait: ${withdrawalReason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du retrait de l\'élève:', error);
      throw error;
    }
  }

  // Obtenir l'historique des inscriptions d'un élève
  static async getStudentEnrollmentHistory(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('student_class_enrollments')
        .select(`
          *,
          class:classes(name, level),
          academic_year:academic_years(name)
        `)
        .eq('student_id', studentId)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      return [];
    }
  }
}