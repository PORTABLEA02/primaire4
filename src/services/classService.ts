import { supabase } from '../lib/supabase';

export class ClassService {
  // Obtenir toutes les classes d'une école pour une année
  static async getClasses(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          teacher_assignment:teacher_class_assignments!left(
            teacher:teachers(first_name, last_name, email),
            salary_amount,
            is_active
          ),
          classroom_assignment:classroom_class_assignments!left(
            classroom:classrooms(name, capacity)
          )
        `)
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .order('level')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
      throw error;
    }
  }

  // Créer une nouvelle classe
  static async createClass(classData: {
    schoolId: string;
    academicYearId: string;
    name: string;
    level: string;
    capacity: number;
    subjects?: string[];
  }) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          school_id: classData.schoolId,
          academic_year_id: classData.academicYearId,
          name: classData.name,
          level: classData.level,
          capacity: classData.capacity,
          subjects: classData.subjects || []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la classe:', error);
      throw error;
    }
  }

  // Mettre à jour une classe
  static async updateClass(classId: string, updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', classId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la classe:', error);
      throw error;
    }
  }

  // Obtenir les détails d'une classe avec élèves
  static async getClassDetails(classId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('enrollment_details')
        .select('*')
        .eq('class_id', classId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('last_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des détails de la classe:', error);
      return [];
    }
  }

  // Obtenir les statistiques d'une classe
  static async getClassStats(classId: string, gradePeriodId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_class_academic_stats', {
          p_class_id: classId,
          p_grade_period_id: gradePeriodId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      return null;
    }
  }

  // Supprimer une classe (si aucun élève inscrit)
  static async deleteClass(classId: string) {
    try {
      // Vérifier qu'il n'y a pas d'élèves inscrits
      const { data: enrollments } = await supabase
        .from('student_class_enrollments')
        .select('id')
        .eq('class_id', classId)
        .eq('is_active', true);

      if (enrollments && enrollments.length > 0) {
        throw new Error('Impossible de supprimer une classe avec des élèves inscrits');
      }

      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de la classe:', error);
      throw error;
    }
  }
}