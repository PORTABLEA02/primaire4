import { supabase } from '../lib/supabase';

export class DashboardService {
  // Obtenir les données complètes du tableau de bord
  static async getDashboardData(schoolId: string, academicYearId: string) {
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
  }

  // Obtenir les statistiques rapides
  static async getQuickStats(schoolId: string, academicYearId: string) {
    try {
      const [enrollments, payments, teachers, classes] = await Promise.all([
        // Inscriptions actives
        supabase
          .from('student_class_enrollments')
          .select('id, payment_status')
          .eq('school_id', schoolId)
          .eq('academic_year_id', academicYearId)
          .eq('is_active', true),

        // Paiements du mois
        supabase
          .from('payment_transactions')
          .select('amount')
          .eq('school_id', schoolId)
          .eq('status', 'Confirmé')
          .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),

        // Enseignants actifs
        supabase
          .from('teachers')
          .select('id')
          .eq('school_id', schoolId)
          .eq('status', 'Actif'),

        // Classes actives
        supabase
          .from('classes')
          .select('id')
          .eq('school_id', schoolId)
          .eq('academic_year_id', academicYearId)
      ]);

      const totalStudents = enrollments.data?.length || 0;
      const studentsUpToDate = enrollments.data?.filter(e => e.payment_status === 'À jour').length || 0;
      const studentsLate = enrollments.data?.filter(e => e.payment_status === 'En retard').length || 0;
      const totalRevenue = payments.data?.reduce((sum, p) => sum + p.amount, 0) || 0;

      return {
        totalStudents,
        studentsUpToDate,
        studentsLate,
        totalRevenue,
        totalTeachers: teachers.data?.length || 0,
        totalClasses: classes.data?.length || 0,
        collectionRate: totalStudents > 0 ? Math.round((studentsUpToDate / totalStudents) * 100) : 0
      };
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques rapides:', error);
      return null;
    }
  }

  // Obtenir les activités récentes
  static async getRecentActivities(schoolId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:user_profiles(name, role)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
      return [];
    }
  }

  // Obtenir les paiements récents
  static async getRecentPayments(schoolId: string, limit: number = 5) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          enrollment:student_class_enrollments!inner(
            student:students(first_name, last_name),
            class:classes(name)
          )
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

  // Obtenir les alertes importantes
  static async getAlerts(schoolId: string, academicYearId: string) {
    try {
      const alerts = [];

      // Classes sans enseignant
      const { data: classesWithoutTeacher } = await supabase
        .from('classes')
        .select(`
          id, name,
          teacher_assignment:teacher_class_assignments!left(id)
        `)
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .is('teacher_assignment.id', null);

      if (classesWithoutTeacher && classesWithoutTeacher.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Classes sans enseignant',
          message: `${classesWithoutTeacher.length} classe(s) n'ont pas d'enseignant assigné`,
          action: 'Assigner des enseignants'
        });
      }

      // Paiements en retard
      const { data: latePayments } = await supabase
        .from('enrollment_details')
        .select('id')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('payment_status', 'En retard')
        .eq('is_active', true);

      if (latePayments && latePayments.length > 0) {
        alerts.push({
          type: 'error',
          title: 'Paiements en retard',
          message: `${latePayments.length} élève(s) ont des paiements en retard`,
          action: 'Relancer les familles'
        });
      }

      // Capacité des classes
      const { data: fullClasses } = await supabase
        .from('classes')
        .select('id, name, capacity, current_students')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .gte('current_students', supabase.raw('capacity * 0.9'));

      if (fullClasses && fullClasses.length > 0) {
        alerts.push({
          type: 'info',
          title: 'Classes presque pleines',
          message: `${fullClasses.length} classe(s) approchent de leur capacité maximale`,
          action: 'Vérifier les capacités'
        });
      }

      return alerts;
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
      return [];
    }
  }

  // Obtenir les tendances financières
  static async getFinancialTrends(schoolId: string, academicYearId: string) {
    try {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyData = [];
      
      for (let i = 0; i < 6; i++) {
        const month = currentMonth - i;
        const year = month < 0 ? currentYear - 1 : currentYear;
        const adjustedMonth = month < 0 ? 12 + month : month;
        
        const startDate = new Date(year, adjustedMonth, 1);
        const endDate = new Date(year, adjustedMonth + 1, 0);

        const { data: payments } = await supabase
          .from('payment_transactions')
          .select('amount')
          .eq('school_id', schoolId)
          .eq('status', 'Confirmé')
          .gte('payment_date', startDate.toISOString().split('T')[0])
          .lte('payment_date', endDate.toISOString().split('T')[0]);

        const total = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        
        monthlyData.unshift({
          month: startDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          amount: total
        });
      }

      return monthlyData;
    } catch (error) {
      console.error('Erreur lors du calcul des tendances:', error);
      return [];
    }
  }

  // Obtenir les performances académiques par niveau
  static async getAcademicPerformance(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          level,
          current_students,
          grades:grades!inner(grade_value)
        `)
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId);

      if (error) throw error;

      const performanceByLevel = data?.reduce((acc, classData) => {
        const level = classData.level;
        if (!acc[level]) {
          acc[level] = {
            students: 0,
            grades: [],
            classes: 0
          };
        }
        
        acc[level].students += classData.current_students;
        acc[level].classes += 1;
        acc[level].grades.push(...classData.grades.map((g: any) => g.grade_value));
        
        return acc;
      }, {} as Record<string, any>) || {};

      // Calculer les moyennes par niveau
      Object.keys(performanceByLevel).forEach(level => {
        const levelData = performanceByLevel[level];
        const average = levelData.grades.length > 0 
          ? levelData.grades.reduce((sum: number, grade: number) => sum + grade, 0) / levelData.grades.length
          : 0;
        
        levelData.average = average;
        levelData.passRate = levelData.grades.filter((grade: number) => grade >= 10).length / levelData.grades.length * 100;
      });

      return performanceByLevel;
    } catch (error) {
      console.error('Erreur lors du calcul des performances:', error);
      return {};
    }
  }
}