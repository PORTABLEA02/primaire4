import { supabase } from '../lib/supabase';

export class StatisticsService {
  // Obtenir les statistiques complètes d'une école
  static async getSchoolStatistics(schoolId: string, academicYearId: string) {
    try {
      const [
        enrollmentStats,
        financialStats,
        academicStats,
        teacherStats
      ] = await Promise.all([
        this.getEnrollmentStatistics(schoolId, academicYearId),
        this.getFinancialStatistics(schoolId, academicYearId),
        this.getAcademicStatistics(schoolId, academicYearId),
        this.getTeacherStatistics(schoolId, academicYearId)
      ]);

      return {
        enrollment: enrollmentStats,
        financial: financialStats,
        academic: academicStats,
        teacher: teacherStats,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  }

  // Statistiques d'inscription
  static async getEnrollmentStatistics(schoolId: string, academicYearId: string) {
    try {
      const { data: enrollments } = await supabase
        .from('enrollment_details')
        .select('level, payment_status, enrollment_date, gender')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true);

      if (!enrollments) return null;

      const byLevel = enrollments.reduce((acc, e) => {
        acc[e.level] = (acc[e.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byGender = enrollments.reduce((acc, e) => {
        acc[e.gender] = (acc[e.gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byPaymentStatus = enrollments.reduce((acc, e) => {
        acc[e.payment_status] = (acc[e.payment_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Évolution des inscriptions par mois
      const enrollmentsByMonth = enrollments.reduce((acc, e) => {
        const month = new Date(e.enrollment_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: enrollments.length,
        byLevel,
        byGender,
        byPaymentStatus,
        enrollmentsByMonth,
        averageAge: this.calculateAverageAge(enrollments)
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques d\'inscription:', error);
      return null;
    }
  }

  // Statistiques financières
  static async getFinancialStatistics(schoolId: string, academicYearId: string) {
    try {
      const { data: payments } = await supabase
        .from('payment_transactions')
        .select(`
          amount,
          payment_type,
          payment_date,
          payment_method:payment_methods(name, type)
        `)
        .eq('school_id', schoolId)
        .eq('status', 'Confirmé');

      const { data: enrollments } = await supabase
        .from('enrollment_details')
        .select('total_fees, paid_amount, outstanding_amount, level')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true);

      if (!payments || !enrollments) return null;

      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalOutstanding = enrollments.reduce((sum, e) => sum + e.outstanding_amount, 0);
      const totalExpected = enrollments.reduce((sum, e) => sum + e.total_fees, 0);

      const revenueByMethod = payments.reduce((acc, p) => {
        const method = p.payment_method?.name || 'Inconnu';
        acc[method] = (acc[method] || 0) + p.amount;
        return acc;
      }, {} as Record<string, number>);

      const revenueByType = payments.reduce((acc, p) => {
        acc[p.payment_type] = (acc[p.payment_type] || 0) + p.amount;
        return acc;
      }, {} as Record<string, number>);

      const outstandingByLevel = enrollments.reduce((acc, e) => {
        if (e.outstanding_amount > 0) {
          acc[e.level] = (acc[e.level] || 0) + e.outstanding_amount;
        }
        return acc;
      }, {} as Record<string, number>);

      // Évolution mensuelle des revenus
      const revenueByMonth = payments.reduce((acc, p) => {
        const month = new Date(p.payment_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + p.amount;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalRevenue,
        totalOutstanding,
        totalExpected,
        collectionRate: (totalRevenue / totalExpected) * 100,
        revenueByMethod,
        revenueByType,
        outstandingByLevel,
        revenueByMonth,
        averagePayment: totalRevenue / payments.length
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques financières:', error);
      return null;
    }
  }

  // Statistiques académiques
  static async getAcademicStatistics(schoolId: string, academicYearId: string) {
    try {
      const { data: grades } = await supabase
        .from('grades')
        .select(`
          grade_value,
          coefficient,
          subject:subjects(name),
          class:classes(name, level),
          student:students(id)
        `)
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId);

      if (!grades) return null;

      // Moyenne générale de l'école
      const weightedSum = grades.reduce((sum, g) => sum + (g.grade_value * g.coefficient), 0);
      const totalCoefficients = grades.reduce((sum, g) => sum + g.coefficient, 0);
      const overallAverage = weightedSum / totalCoefficients;

      // Statistiques par niveau
      const byLevel = grades.reduce((acc, g) => {
        const level = g.class.level;
        if (!acc[level]) {
          acc[level] = {
            grades: [],
            students: new Set(),
            classes: new Set()
          };
        }
        acc[level].grades.push(g.grade_value);
        acc[level].students.add(g.student.id);
        acc[level].classes.add(g.class.name);
        return acc;
      }, {} as Record<string, any>);

      // Calculer les moyennes par niveau
      Object.keys(byLevel).forEach(level => {
        const levelData = byLevel[level];
        levelData.average = levelData.grades.reduce((sum: number, grade: number) => sum + grade, 0) / levelData.grades.length;
        levelData.passRate = (levelData.grades.filter((grade: number) => grade >= 10).length / levelData.grades.length) * 100;
        levelData.studentCount = levelData.students.size;
        levelData.classCount = levelData.classes.size;
      });

      // Statistiques par matière
      const bySubject = grades.reduce((acc, g) => {
        const subject = g.subject.name;
        if (!acc[subject]) {
          acc[subject] = {
            grades: [],
            coefficient: g.coefficient
          };
        }
        acc[subject].grades.push(g.grade_value);
        return acc;
      }, {} as Record<string, any>);

      Object.keys(bySubject).forEach(subject => {
        const subjectData = bySubject[subject];
        subjectData.average = subjectData.grades.reduce((sum: number, grade: number) => sum + grade, 0) / subjectData.grades.length;
        subjectData.passRate = (subjectData.grades.filter((grade: number) => grade >= 10).length / subjectData.grades.length) * 100;
      });

      return {
        overallAverage,
        totalGrades: grades.length,
        passRate: (grades.filter(g => g.grade_value >= 10).length / grades.length) * 100,
        byLevel,
        bySubject,
        excellenceRate: (grades.filter(g => g.grade_value >= 16).length / grades.length) * 100
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques académiques:', error);
      return null;
    }
  }

  // Statistiques des enseignants
  static async getTeacherStatistics(schoolId: string, academicYearId: string) {
    try {
      const { data: teachers } = await supabase
        .from('teacher_assignment_details')
        .select('*')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true);

      const { data: allTeachers } = await supabase
        .from('teachers')
        .select('status, experience, qualification')
        .eq('school_id', schoolId);

      if (!teachers || !allTeachers) return null;

      const assigned = teachers.length;
      const available = allTeachers.filter(t => t.status === 'Actif').length - assigned;

      const byExperience = allTeachers.reduce((acc, t) => {
        const exp = parseInt(t.experience?.split(' ')[0] || '0');
        let category = 'Débutant (0-2 ans)';
        if (exp >= 10) category = 'Expérimenté (10+ ans)';
        else if (exp >= 5) category = 'Confirmé (5-10 ans)';
        else if (exp >= 3) category = 'Junior (3-5 ans)';
        
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byQualification = allTeachers.reduce((acc, t) => {
        const qual = t.qualification || 'Non spécifié';
        acc[qual] = (acc[qual] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const averageSalary = teachers.reduce((sum, t) => sum + t.salary_amount, 0) / teachers.length;

      return {
        total: allTeachers.length,
        assigned,
        available,
        byExperience,
        byQualification,
        averageSalary,
        totalSalaryCost: teachers.reduce((sum, t) => sum + t.salary_amount, 0)
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques enseignants:', error);
      return null;
    }
  }

  // Calculer l'âge moyen
  private static calculateAverageAge(enrollments: any[]): number {
    const ages = enrollments.map(e => {
      const birthDate = new Date(e.date_of_birth || '2010-01-01');
      const today = new Date();
      return today.getFullYear() - birthDate.getFullYear();
    });

    return ages.reduce((sum, age) => sum + age, 0) / ages.length;
  }

  // Obtenir les tendances comparatives
  static async getComparativeTrends(schoolId: string, academicYearId: string, previousYearId?: string) {
    try {
      const currentStats = await this.getSchoolStatistics(schoolId, academicYearId);
      
      if (!previousYearId) {
        return {
          current: currentStats,
          trends: null
        };
      }

      const previousStats = await this.getSchoolStatistics(schoolId, previousYearId);

      const trends = {
        enrollment: {
          change: currentStats.enrollment.total - previousStats.enrollment.total,
          percentage: ((currentStats.enrollment.total - previousStats.enrollment.total) / previousStats.enrollment.total) * 100
        },
        revenue: {
          change: currentStats.financial.totalRevenue - previousStats.financial.totalRevenue,
          percentage: ((currentStats.financial.totalRevenue - previousStats.financial.totalRevenue) / previousStats.financial.totalRevenue) * 100
        },
        academic: {
          averageChange: currentStats.academic.overallAverage - previousStats.academic.overallAverage,
          passRateChange: currentStats.academic.passRate - previousStats.academic.passRate
        }
      };

      return {
        current: currentStats,
        previous: previousStats,
        trends
      };
    } catch (error) {
      console.error('Erreur lors du calcul des tendances:', error);
      return null;
    }
  }
}