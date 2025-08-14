import { supabase } from '../lib/supabase';

export class ReportService {
  // Générer un rapport financier complet
  static async generateFinancialReport(schoolId: string, academicYearId: string, period: 'month' | 'trimester' | 'year') {
    try {
      let startDate: Date;
      const endDate = new Date();

      switch (period) {
        case 'month':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
          break;
        case 'trimester':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(endDate.getFullYear(), 0, 1);
          break;
      }

      // Revenus par type de paiement
      const { data: payments } = await supabase
        .from('payment_transactions')
        .select(`
          amount,
          payment_type,
          payment_method:payment_methods(name, type)
        `)
        .eq('school_id', schoolId)
        .eq('status', 'Confirmé')
        .gte('payment_date', startDate.toISOString().split('T')[0])
        .lte('payment_date', endDate.toISOString().split('T')[0]);

      // Impayés par niveau
      const { data: outstanding } = await supabase
        .from('enrollment_details')
        .select('level, outstanding_amount')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .gt('outstanding_amount', 0)
        .eq('is_active', true);

      const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const totalOutstanding = outstanding?.reduce((sum, o) => sum + o.outstanding_amount, 0) || 0;

      const paymentsByMethod = payments?.reduce((acc, payment) => {
        const methodName = payment.payment_method?.name || 'Inconnu';
        acc[methodName] = (acc[methodName] || 0) + payment.amount;
        return acc;
      }, {} as Record<string, number>) || {};

      const outstandingByLevel = outstanding?.reduce((acc, item) => {
        acc[item.level] = (acc[item.level] || 0) + item.outstanding_amount;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        period,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalRevenue,
        totalOutstanding,
        collectionRate: totalRevenue / (totalRevenue + totalOutstanding) * 100,
        paymentsByMethod,
        outstandingByLevel,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport financier:', error);
      throw error;
    }
  }

  // Générer un rapport académique
  static async generateAcademicReport(schoolId: string, academicYearId: string, gradePeriodId?: string) {
    try {
      let gradeQuery = supabase
        .from('grades')
        .select(`
          grade_value,
          coefficient,
          student:students(id, first_name, last_name),
          class:classes(name, level),
          subject:subjects(name, coefficient)
        `)
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId);

      if (gradePeriodId) {
        gradeQuery = gradeQuery.eq('grade_period_id', gradePeriodId);
      }

      const { data: grades, error } = await gradeQuery;

      if (error) throw error;

      // Calculer les statistiques par classe
      const classSummary = grades?.reduce((acc, grade) => {
        const className = grade.class.name;
        const level = grade.class.level;
        
        if (!acc[className]) {
          acc[className] = {
            name: className,
            level,
            students: new Set(),
            totalGrades: 0,
            totalWeightedGrades: 0,
            totalCoefficients: 0,
            subjects: {}
          };
        }

        acc[className].students.add(grade.student.id);
        acc[className].totalGrades += grade.grade_value;
        acc[className].totalWeightedGrades += grade.grade_value * grade.coefficient;
        acc[className].totalCoefficients += grade.coefficient;

        // Statistiques par matière
        const subjectName = grade.subject.name;
        if (!acc[className].subjects[subjectName]) {
          acc[className].subjects[subjectName] = {
            grades: [],
            coefficient: grade.subject.coefficient
          };
        }
        acc[className].subjects[subjectName].grades.push(grade.grade_value);

        return acc;
      }, {} as Record<string, any>) || {};

      // Finaliser les calculs
      Object.values(classSummary).forEach((classData: any) => {
        classData.studentCount = classData.students.size;
        classData.averageGrade = classData.totalWeightedGrades / classData.totalCoefficients;
        classData.passRate = Object.values(classData.subjects).reduce((passCount: number, subject: any) => {
          const subjectAverage = subject.grades.reduce((sum: number, grade: number) => sum + grade, 0) / subject.grades.length;
          return passCount + (subjectAverage >= 10 ? 1 : 0);
        }, 0) / Object.keys(classData.subjects).length * 100;

        // Calculer les moyennes par matière
        Object.keys(classData.subjects).forEach(subjectName => {
          const subject = classData.subjects[subjectName];
          subject.average = subject.grades.reduce((sum: number, grade: number) => sum + grade, 0) / subject.grades.length;
        });
      });

      return {
        classSummary: Object.values(classSummary),
        totalStudents: Object.values(classSummary).reduce((sum: number, cls: any) => sum + cls.studentCount, 0),
        overallAverage: Object.values(classSummary).reduce((sum: number, cls: any) => sum + cls.averageGrade * cls.studentCount, 0) / 
                       Object.values(classSummary).reduce((sum: number, cls: any) => sum + cls.studentCount, 0),
        overallPassRate: Object.values(classSummary).reduce((sum: number, cls: any) => sum + cls.passRate * cls.studentCount, 0) / 
                        Object.values(classSummary).reduce((sum: number, cls: any) => sum + cls.studentCount, 0),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport académique:', error);
      throw error;
    }
  }

  // Générer un rapport de présence
  static async generateAttendanceReport(schoolId: string, academicYearId: string) {
    try {
      // Note: Vous devrez créer une table d'attendance si ce n'est pas déjà fait
      // Pour l'instant, on simule avec des données d'exemple
      
      const { data: students } = await supabase
        .from('enrollment_details')
        .select('first_name, last_name, class_name')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true);

      // Simulation des données de présence
      const attendanceData = students?.map(student => ({
        name: `${student.first_name} ${student.last_name}`,
        class: student.class_name,
        totalDays: 60, // Jours d'école depuis le début de l'année
        presentDays: Math.floor(Math.random() * 10) + 50, // Entre 50 et 60
        absentDays: Math.floor(Math.random() * 10),
        tardiness: Math.floor(Math.random() * 5)
      })) || [];

      const totalStudents = attendanceData.length;
      const averageAttendance = attendanceData.reduce((sum, s) => sum + (s.presentDays / s.totalDays), 0) / totalStudents * 100;

      return {
        totalStudents,
        averageAttendance,
        excellentAttendance: attendanceData.filter(s => (s.presentDays / s.totalDays) >= 0.95).length,
        poorAttendance: attendanceData.filter(s => (s.presentDays / s.totalDays) < 0.80).length,
        studentDetails: attendanceData,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport de présence:', error);
      throw error;
    }
  }

  // Exporter des données en CSV
  static async exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Obtenir les données pour export
  static async getExportData(schoolId: string, academicYearId: string, dataType: 'students' | 'teachers' | 'payments' | 'grades') {
    try {
      switch (dataType) {
        case 'students':
          const { data: students } = await supabase
            .from('enrollment_details')
            .select('*')
            .eq('school_id', schoolId)
            .eq('academic_year_id', academicYearId)
            .eq('is_active', true);
          return students || [];

        case 'teachers':
          const { data: teachers } = await supabase
            .from('teacher_assignment_details')
            .select('*')
            .eq('school_id', schoolId)
            .eq('academic_year_id', academicYearId)
            .eq('is_active', true);
          return teachers || [];

        case 'payments':
          const { data: payments } = await supabase
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
            .order('payment_date', { ascending: false });
          return payments || [];

        case 'grades':
          const { data: grades } = await supabase
            .from('grade_details')
            .select('*')
            .eq('school_id', schoolId)
            .eq('academic_year_id', academicYearId);
          return grades || [];

        default:
          return [];
      }
    } catch (error) {
      console.error('Erreur lors de l\'export des données:', error);
      return [];
    }
  }
}