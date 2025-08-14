import { supabase } from '../lib/supabase';

export class PaymentService {
  // Enregistrer un nouveau paiement
  static async recordPayment(paymentData: {
    enrollmentId: string;
    schoolId: string;
    academicYearId: string;
    amount: number;
    paymentMethodId?: string | null;
    paymentType: 'Inscription' | 'Scolarité' | 'Cantine' | 'Transport' | 'Fournitures' | 'Autre';
    paymentDate?: string;
    referenceNumber?: string;
    mobileNumber?: string;
    bankDetails?: string;
    notes?: string;
    processedBy?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          enrollment_id: paymentData.enrollmentId,
          school_id: paymentData.schoolId,
          academic_year_id: paymentData.academicYearId,
          amount: paymentData.amount,
          payment_method_id: paymentData.paymentMethodId || null,
          payment_type: paymentData.paymentType,
          payment_date: paymentData.paymentDate || new Date().toISOString().split('T')[0],
          reference_number: paymentData.referenceNumber,
          mobile_number: paymentData.mobileNumber,
          bank_details: paymentData.bankDetails,
          notes: paymentData.notes,
          processed_by: paymentData.processedBy || null,
          status: 'Confirmé'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      throw error;
    }
  }

  // Obtenir l'historique des paiements
  static async getPaymentHistory(enrollmentId: string) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          payment_method:payment_methods(name, type),
          processed_by_user:user_profiles(name)
        `)
        .eq('enrollment_id', enrollmentId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      return [];
    }
  }

  // Obtenir les paiements récents d'une école
  static async getRecentPayments(schoolId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          enrollment:student_class_enrollments!inner(
            student:students(first_name, last_name),
            class:classes(name)
          ),
          payment_method:payment_methods(name)
        `)
        .eq('school_id', schoolId)
        .eq('status', 'Confirmé')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des paiements récents:', error);
      return [];
    }
  }

  // Obtenir les impayés d'une école
  static async getOutstandingPayments(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('enrollment_details')
        .select('*')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .gt('outstanding_amount', 0)
        .order('outstanding_amount', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des impayés:', error);
      return [];
    }
  }

  // Obtenir les statistiques financières
  static async getFinancialStats(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_school_financial_stats', {
          p_school_id: schoolId,
          p_academic_year_id: academicYearId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques financières:', error);
      return null;
    }
  }

  // Obtenir les méthodes de paiement d'une école
  static async getPaymentMethods(schoolId: string) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_enabled', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des méthodes de paiement:', error);
      return [];
    }
  }

  // Obtenir une méthode de paiement par nom
  static async getPaymentMethodByName(schoolId: string, methodName: string) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('school_id', schoolId)
        .eq('name', methodName)
        .eq('is_enabled', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de la méthode de paiement:', error);
      return null;
    }
  }

  // Créer une méthode de paiement
  static async createPaymentMethod(methodData: {
    schoolId: string;
    name: string;
    type: 'cash' | 'mobile' | 'bank';
    feesPercentage?: number;
    config?: any;
  }) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          school_id: methodData.schoolId,
          name: methodData.name,
          type: methodData.type,
          fees_percentage: methodData.feesPercentage || 0,
          config: methodData.config || {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la méthode de paiement:', error);
      throw error;
    }
  }

  // Annuler un paiement
  static async cancelPayment(paymentId: string, reason: string) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .update({
          status: 'Remboursé',
          notes: reason
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'annulation du paiement:', error);
      throw error;
    }
  }
}