import { supabase } from '../lib/supabase';

export class GradeService {
  // Obtenir les notes d'un élève pour une période
  static async getStudentGrades(studentId: string, gradePeriodId: string) {
    try {
      const { data, error } = await supabase
        .from('grade_details')
        .select('*')
        .eq('student_id', studentId)
        .eq('grade_period_id', gradePeriodId)
        .order('subject_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
      return [];
    }
  }

  // Obtenir les notes d'une classe pour une matière et période
  static async getClassGrades(classId: string, subjectId: string, gradePeriodId: string) {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select(`
          *,
          student:students(first_name, last_name),
          subject:subjects(name, coefficient)
        `)
        .eq('class_id', classId)
        .eq('subject_id', subjectId)
        .eq('grade_period_id', gradePeriodId)
        .order('grade_value', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des notes de la classe:', error);
      return [];
    }
  }

  // Sauvegarder une note
  static async saveGrade(gradeData: {
    studentId: string;
    classId: string;
    subjectId: string;
    teacherId: string;
    schoolId: string;
    academicYearId: string;
    gradePeriodId: string;
    gradeValue: number;
    coefficient?: number;
    evaluationType?: 'devoir' | 'composition' | 'interrogation';
    evaluationTitle?: string;
    evaluationDate?: string;
    teacherComment?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('grades')
        .insert({
          student_id: gradeData.studentId,
          class_id: gradeData.classId,
          subject_id: gradeData.subjectId,
          teacher_id: gradeData.teacherId,
          school_id: gradeData.schoolId,
          academic_year_id: gradeData.academicYearId,
          grade_period_id: gradeData.gradePeriodId,
          grade_value: gradeData.gradeValue,
          coefficient: gradeData.coefficient || 1,
          evaluation_type: gradeData.evaluationType || 'devoir',
          evaluation_title: gradeData.evaluationTitle,
          evaluation_date: gradeData.evaluationDate || new Date().toISOString().split('T')[0],
          teacher_comment: gradeData.teacherComment
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la note:', error);
      throw error;
    }
  }

  // Sauvegarder plusieurs notes en lot
  static async saveBulkGrades(grades: any[]) {
    try {
      const { data, error } = await supabase
        .from('grades')
        .insert(grades)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la sauvegarde en lot:', error);
      throw error;
    }
  }

  // Calculer la moyenne d'un élève
  static async calculateStudentAverage(studentId: string, gradePeriodId: string) {
    try {
      const { data, error } = await supabase
        .rpc('calculate_student_average', {
          p_student_id: studentId,
          p_grade_period_id: gradePeriodId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du calcul de la moyenne:', error);
      return null;
    }
  }

  // Calculer le classement d'un élève
  static async calculateStudentRank(studentId: string, gradePeriodId: string) {
    try {
      const { data, error } = await supabase
        .rpc('calculate_student_rank', {
          p_student_id: studentId,
          p_grade_period_id: gradePeriodId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du calcul du classement:', error);
      return null;
    }
  }

  // Obtenir les statistiques d'une classe
  static async getClassAcademicStats(classId: string, gradePeriodId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_class_academic_stats', {
          p_class_id: classId,
          p_grade_period_id: gradePeriodId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de classe:', error);
      return null;
    }
  }

  // Mettre à jour une note
  static async updateGrade(gradeId: string, updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('grades')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', gradeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
      throw error;
    }
  }

  // Supprimer une note
  static async deleteGrade(gradeId: string) {
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', gradeId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
      throw error;
    }
  }
}