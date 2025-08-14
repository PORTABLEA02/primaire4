import { supabase } from '../lib/supabase';

export class ValidationService {
  // Valider les données d'un élève
  static validateStudentData(studentData: any): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Validation des champs obligatoires
    if (!studentData.firstName?.trim()) {
      errors.firstName = 'Le prénom est requis';
    }

    if (!studentData.lastName?.trim()) {
      errors.lastName = 'Le nom est requis';
    }

    if (!studentData.dateOfBirth) {
      errors.dateOfBirth = 'La date de naissance est requise';
    } else {
      const age = this.calculateAge(studentData.dateOfBirth);
      if (age < 3 || age > 18) {
        errors.dateOfBirth = 'L\'âge doit être entre 3 et 18 ans';
      }
    }

    if (!studentData.parentEmail?.trim()) {
      errors.parentEmail = 'L\'email du parent est requis';
    } else if (!this.isValidEmail(studentData.parentEmail)) {
      errors.parentEmail = 'Format d\'email invalide';
    }

    if (!studentData.address?.trim()) {
      errors.address = 'L\'adresse est requise';
    }

    // Au moins un contact parent requis
    if (!studentData.fatherPhone?.trim() && !studentData.motherPhone?.trim()) {
      errors.parentContact = 'Au moins un numéro de téléphone parent est requis';
    }

    // Validation des numéros de téléphone
    if (studentData.fatherPhone && !this.isValidPhoneNumber(studentData.fatherPhone)) {
      errors.fatherPhone = 'Format de téléphone invalide';
    }

    if (studentData.motherPhone && !this.isValidPhoneNumber(studentData.motherPhone)) {
      errors.motherPhone = 'Format de téléphone invalide';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Valider les données d'un enseignant
  static validateTeacherData(teacherData: any): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!teacherData.firstName?.trim()) {
      errors.firstName = 'Le prénom est requis';
    }

    if (!teacherData.lastName?.trim()) {
      errors.lastName = 'Le nom est requis';
    }

    if (!teacherData.email?.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!this.isValidEmail(teacherData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (teacherData.phone && !this.isValidPhoneNumber(teacherData.phone)) {
      errors.phone = teacherData.phone;
    }

    if (teacherData.salary && (teacherData.salary < 50000 || teacherData.salary > 1000000)) {
      errors.salary = 'Le salaire doit être entre 50,000 et 1,000,000 FCFA';
    }

    if (teacherData.performanceRating && (teacherData.performanceRating < 1 || teacherData.performanceRating > 5)) {
      errors.performanceRating = 'La note de performance doit être entre 1 et 5';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Valider les données d'une classe
  static validateClassData(classData: any): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!classData.name?.trim()) {
      errors.name = 'Le nom de la classe est requis';
    }

    if (!classData.level?.trim()) {
      errors.level = 'Le niveau est requis';
    }

    if (!classData.capacity || classData.capacity < 10 || classData.capacity > 60) {
      errors.capacity = 'La capacité doit être entre 10 et 60 élèves';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Valider les données de paiement
  static validatePaymentData(paymentData: any): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.amount = 'Le montant doit être supérieur à 0';
    }

    if (!paymentData.paymentType) {
      errors.paymentType = 'Le type de paiement est requis';
    }

    if (paymentData.paymentMethod === 'Mobile Money' && !paymentData.mobileNumber) {
      errors.mobileNumber = 'Le numéro de téléphone est requis pour Mobile Money';
    }

    if (paymentData.paymentMethod === 'Virement Bancaire' && !paymentData.bankDetails) {
      errors.bankDetails = 'Les détails bancaires sont requis pour le virement';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Valider les notes
  static validateGradeData(gradeData: any): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (gradeData.gradeValue === undefined || gradeData.gradeValue === null) {
      errors.gradeValue = 'La note est requise';
    } else if (gradeData.gradeValue < 0 || gradeData.gradeValue > 20) {
      errors.gradeValue = 'La note doit être entre 0 et 20';
    }

    if (!gradeData.studentId) {
      errors.studentId = 'L\'élève est requis';
    }

    if (!gradeData.subjectId) {
      errors.subjectId = 'La matière est requise';
    }

    if (!gradeData.gradePeriodId) {
      errors.gradePeriodId = 'La période d\'évaluation est requise';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Vérifier l'unicité d'un email
  static async checkEmailUniqueness(email: string, schoolId: string, excludeId?: string): Promise<boolean> {
    try {
      // Vérifier dans les profils utilisateurs
      let userQuery = supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .eq('school_id', schoolId);

      if (excludeId) {
        userQuery = userQuery.neq('id', excludeId);
      }

      // Vérifier dans les enseignants
      let teacherQuery = supabase
        .from('teachers')
        .select('id')
        .eq('email', email)
        .eq('school_id', schoolId);

      if (excludeId) {
        teacherQuery = teacherQuery.neq('id', excludeId);
      }

      const [userData, teacherData] = await Promise.all([
        userQuery,
        teacherQuery
      ]);

      if (userData.error || teacherData.error) {
        throw userData.error || teacherData.error;
      }

      return (userData.data?.length || 0) === 0 && (teacherData.data?.length || 0) === 0;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'unicité:', error);
      return false;
    }
  }

  // Vérifier l'unicité d'un nom de classe
  static async checkClassNameUniqueness(
    name: string, 
    schoolId: string, 
    academicYearId: string, 
    excludeId?: string
  ): Promise<boolean> {
    try {
      let query = supabase
        .from('classes')
        .select('id')
        .eq('name', name)
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data?.length || 0) === 0;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'unicité:', error);
      return false;
    }
  }

  // Valider les conflits d'horaire
  static async validateScheduleConflict(
    teacherId: string,
    classroomId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    academicYearId: string,
    excludeSlotId?: string
  ): Promise<{ hasConflict: boolean; conflicts: any[] }> {
    try {
      let query = supabase
        .from('schedule_slots')
        .select(`
          *,
          teacher:teachers(first_name, last_name),
          classroom:classrooms(name),
          class:classes(name)
        `)
        .eq('academic_year_id', academicYearId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .or(`teacher_id.eq.${teacherId},classroom_id.eq.${classroomId}`);

      if (excludeSlotId) {
        query = query.neq('id', excludeSlotId);
      }

      const { data: existingSlots, error } = await query;

      if (error) throw error;

      const conflicts = existingSlots?.filter(slot => {
        const slotStart = this.timeToMinutes(slot.start_time);
        const slotEnd = this.timeToMinutes(slot.end_time);
        const newStart = this.timeToMinutes(startTime);
        const newEnd = this.timeToMinutes(endTime);

        return (
          (newStart >= slotStart && newStart < slotEnd) ||
          (newEnd > slotStart && newEnd <= slotEnd) ||
          (newStart <= slotStart && newEnd >= slotEnd)
        );
      }) || [];

      return {
        hasConflict: conflicts.length > 0,
        conflicts
      };
    } catch (error) {
      console.error('Erreur lors de la validation des conflits:', error);
      return { hasConflict: false, conflicts: [] };
    }
  }

  // Fonctions utilitaires
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+229\s?[0-9]\d{7}$|^[0-9]\d{7}$/;
    return phoneRegex.test(phone);
  }

  private static calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}