import { supabase } from '../lib/supabase';

export class SupabaseService {
  // Service pour les écoles
  static async getSchools() {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  }

  static async createSchool(schoolData: any) {
    const { data, error } = await supabase
      .from('schools')
      .insert(schoolData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Service pour les années scolaires
  static async getAcademicYears() {
    const { data, error } = await supabase
      .from('academic_years')
      .select('*')
      .order('name', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getActiveAcademicYear() {
    const { data, error } = await supabase
      .from('academic_years')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  }

  static async setActiveAcademicYear(yearId: string) {
    // Désactiver toutes les années
    await supabase
      .from('academic_years')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Activer l'année sélectionnée
    const { data, error } = await supabase
      .from('academic_years')
      .update({ is_active: true })
      .eq('id', yearId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Service pour les élèves
  static async getStudents(schoolId: string, academicYearId: string) {
    const { data, error } = await supabase
      .from('enrollment_details')
      .select('*')
      .eq('school_id', schoolId)
      .eq('academic_year_id', academicYearId)
      .eq('is_active', true)
      .order('last_name');

    if (error) throw error;
    return data;
  }

  static async createStudent(studentData: any) {
    const { data, error } = await supabase
      .from('students')
      .insert(studentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async enrollStudent(enrollmentData: any) {
    const { data, error } = await supabase
      .from('student_class_enrollments')
      .insert(enrollmentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Service pour les enseignants
  static async getTeachers(schoolId: string) {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId)
      .order('last_name');

    if (error) throw error;
    return data;
  }

  static async getTeacherAssignments(schoolId: string, academicYearId: string) {
    const { data, error } = await supabase
      .from('teacher_assignment_details')
      .select('*')
      .eq('school_id', schoolId)
      .eq('academic_year_id', academicYearId)
      .eq('is_active', true);

    if (error) throw error;
    return data;
  }

  static async assignTeacherToClass(assignmentData: any) {
    const { data, error } = await supabase
      .from('teacher_class_assignments')
      .insert(assignmentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Service pour les classes
  static async getClasses(schoolId: string, academicYearId: string) {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        teacher_assignment:teacher_class_assignments!inner(
          teacher:teachers(first_name, last_name)
        ),
        classroom_assignment:classroom_class_assignments(
          classroom:classrooms(name)
        )
      `)
      .eq('school_id', schoolId)
      .eq('academic_year_id', academicYearId);

    if (error) throw error;
    return data;
  }

  static async createClass(classData: any) {
    const { data, error } = await supabase
      .from('classes')
      .insert(classData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Service pour les paiements
  static async recordPayment(paymentData: any) {
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getPaymentHistory(enrollmentId: string) {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        payment_method:payment_methods(name, type)
      `)
      .eq('enrollment_id', enrollmentId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Service pour les notes
  static async getGrades(studentId: string, periodId: string) {
    const { data, error } = await supabase
      .from('grade_details')
      .select('*')
      .eq('student_id', studentId)
      .eq('grade_period_id', periodId);

    if (error) throw error;
    return data;
  }

  static async saveGrade(gradeData: any) {
    const { data, error } = await supabase
      .from('grades')
      .insert(gradeData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Service pour l'emploi du temps
  static async getSchedule(schoolId: string, academicYearId: string, classId?: string) {
    const { data, error } = await supabase
      .from('schedule_details')
      .select('*')
      .eq('school_id', schoolId)
      .eq('academic_year_id', academicYearId)
      .eq('is_active', true)
      .modify((query) => {
        if (classId) {
          return query.eq('class_id', classId);
        }
        return query;
      })
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;
    return data;
  }

  static async createScheduleSlot(slotData: any) {
    const { data, error } = await supabase
      .from('schedule_slots')
      .insert(slotData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Service pour les logs
  static async getActivityLogs(schoolId: string, limit: number = 50) {
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
    return data;
  }

  // Service pour les statistiques
  static async getDashboardStats(schoolId: string, academicYearId: string) {
    const { data, error } = await supabase
      .rpc('get_school_dashboard', {
        p_school_id: schoolId,
        p_academic_year_id: academicYearId
      });

    if (error) throw error;
    return data;
  }

  // Service pour les bulletins
  static async generateBulletin(studentId: string, periodId: string) {
    const { data, error } = await supabase
      .rpc('generate_bulletin', {
        p_student_id: studentId,
        p_grade_period_id: periodId
      });

    if (error) throw error;
    return data;
  }

  // Service pour l'authentification
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw error;
    return data;
  }
}