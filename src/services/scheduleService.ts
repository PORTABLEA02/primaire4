import { supabase } from '../lib/supabase';

export class ScheduleService {
  // Obtenir l'emploi du temps d'une école
  static async getSchedule(schoolId: string, academicYearId: string, classId?: string) {
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

      const { data, error } = await query
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'emploi du temps:', error);
      return [];
    }
  }

  // Créer un créneau d'emploi du temps
  static async createScheduleSlot(slotData: {
    schoolId: string;
    academicYearId: string;
    classId: string;
    teacherId: string;
    subjectId: string;
    classroomId?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('schedule_slots')
        .insert({
          school_id: slotData.schoolId,
          academic_year_id: slotData.academicYearId,
          class_id: slotData.classId,
          teacher_id: slotData.teacherId,
          subject_id: slotData.subjectId,
          classroom_id: slotData.classroomId,
          day_of_week: slotData.dayOfWeek,
          start_time: slotData.startTime,
          end_time: slotData.endTime
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du créneau:', error);
      throw error;
    }
  }

  // Obtenir l'emploi du temps d'un enseignant
  static async getTeacherSchedule(teacherId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('schedule_details')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'emploi du temps enseignant:', error);
      return [];
    }
  }

  // Obtenir l'emploi du temps d'une classe
  static async getClassSchedule(classId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('schedule_details')
        .select('*')
        .eq('class_id', classId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'emploi du temps de la classe:', error);
      return [];
    }
  }

  // Obtenir l'occupation d'une salle
  static async getClassroomSchedule(classroomId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('schedule_details')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'occupation de la salle:', error);
      return [];
    }
  }

  // Mettre à jour un créneau
  static async updateScheduleSlot(slotId: string, updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('schedule_slots')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', slotId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du créneau:', error);
      throw error;
    }
  }

  // Supprimer un créneau
  static async deleteScheduleSlot(slotId: string) {
    try {
      const { error } = await supabase
        .from('schedule_slots')
        .update({ is_active: false })
        .eq('id', slotId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression du créneau:', error);
      throw error;
    }
  }

  // Vérifier les conflits d'horaire
  static async checkScheduleConflicts(
    teacherId: string,
    classroomId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    academicYearId: string,
    excludeSlotId?: string
  ) {
    try {
      let query = supabase
        .from('schedule_slots')
        .select('*')
        .eq('academic_year_id', academicYearId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .or(`teacher_id.eq.${teacherId},classroom_id.eq.${classroomId}`)
        .or(`start_time.lte.${startTime}.and.end_time.gt.${startTime},start_time.lt.${endTime}.and.end_time.gte.${endTime},start_time.gte.${startTime}.and.end_time.lte.${endTime}`);

      if (excludeSlotId) {
        query = query.neq('id', excludeSlotId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la vérification des conflits:', error);
      return [];
    }
  }
}