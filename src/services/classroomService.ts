import { supabase } from '../lib/supabase';

export class ClassroomService {
  // Obtenir toutes les salles d'une école
  static async getClassrooms(schoolId: string) {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('school_id', schoolId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des salles:', error);
      throw error;
    }
  }

  // Créer une nouvelle salle
  static async createClassroom(classroomData: {
    schoolId: string;
    name: string;
    capacity: number;
    type?: string;
    equipment?: string[];
    floor?: number;
    building?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .insert({
          school_id: classroomData.schoolId,
          name: classroomData.name,
          capacity: classroomData.capacity,
          type: classroomData.type || 'Classe Standard',
          equipment: classroomData.equipment || [],
          floor: classroomData.floor,
          building: classroomData.building
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la salle:', error);
      throw error;
    }
  }

  // Assigner une salle à une classe
  static async assignClassroomToClass(assignmentData: {
    classroomId: string;
    classId: string;
    schoolId: string;
    academicYearId: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('classroom_class_assignments')
        .insert({
          classroom_id: assignmentData.classroomId,
          class_id: assignmentData.classId,
          school_id: assignmentData.schoolId,
          academic_year_id: assignmentData.academicYearId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'affectation de la salle:', error);
      throw error;
    }
  }

  // Obtenir les salles disponibles
  static async getAvailableClassrooms(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select(`
          *,
          assignment:classroom_class_assignments!left(id, is_active)
        `)
        .eq('school_id', schoolId)
        .eq('is_available', true)
        .is('assignment.id', null);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des salles disponibles:', error);
      return [];
    }
  }

  // Mettre à jour une salle
  static async updateClassroom(classroomId: string, updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', classroomId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la salle:', error);
      throw error;
    }
  }
}