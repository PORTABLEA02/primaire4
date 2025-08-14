import { supabase } from '../lib/supabase';

export class BulletinService {
  // Générer un bulletin pour un élève
  static async generateBulletin(studentId: string, gradePeriodId: string) {
    try {
      const { data, error } = await supabase
        .rpc('generate_bulletin', {
          p_student_id: studentId,
          p_grade_period_id: gradePeriodId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la génération du bulletin:', error);
      throw error;
    }
  }

  // Obtenir les bulletins d'une classe
  static async getClassBulletins(classId: string, gradePeriodId: string) {
    try {
      const { data, error } = await supabase
        .from('bulletins')
        .select(`
          *,
          student:students(first_name, last_name),
          class:classes(name, level),
          grade_period:grade_periods(name)
        `)
        .eq('class_id', classId)
        .eq('grade_period_id', gradePeriodId)
        .order('class_rank');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des bulletins:', error);
      return [];
    }
  }

  // Créer un bulletin
  static async createBulletin(bulletinData: {
    studentId: string;
    classId: string;
    schoolId: string;
    academicYearId: string;
    gradePeriodId: string;
    generalAverage?: number;
    classRank?: number;
    totalStudents?: number;
    conductGrade?: string;
    absences?: number;
    teacherComment?: string;
    decision?: 'Admis' | 'Redouble' | 'En cours';
    generatedBy?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('bulletins')
        .insert({
          student_id: bulletinData.studentId,
          class_id: bulletinData.classId,
          school_id: bulletinData.schoolId,
          academic_year_id: bulletinData.academicYearId,
          grade_period_id: bulletinData.gradePeriodId,
          general_average: bulletinData.generalAverage,
          class_rank: bulletinData.classRank,
          total_students: bulletinData.totalStudents,
          conduct_grade: bulletinData.conductGrade,
          absences: bulletinData.absences || 0,
          teacher_comment: bulletinData.teacherComment,
          decision: bulletinData.decision || 'En cours',
          generated_by: bulletinData.generatedBy
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du bulletin:', error);
      throw error;
    }
  }

  // Mettre à jour un bulletin
  static async updateBulletin(bulletinId: string, updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('bulletins')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', bulletinId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bulletin:', error);
      throw error;
    }
  }

  // Obtenir les bulletins d'un élève
  static async getStudentBulletins(studentId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('bulletins')
        .select(`
          *,
          grade_period:grade_periods(name, start_date, end_date),
          class:classes(name, level)
        `)
        .eq('student_id', studentId)
        .eq('academic_year_id', academicYearId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des bulletins de l\'élève:', error);
      return [];
    }
  }
}