export class DataValidation {
  // Validation des données d'élève
  static validateStudentData(studentData: any): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!studentData.firstName?.trim()) {
      errors.firstName = 'Le prénom est requis';
    }

    if (!studentData.lastName?.trim()) {
      errors.lastName = 'Le nom est requis';
    }

    if (!studentData.dateOfBirth) {
      errors.dateOfBirth = 'La date de naissance est requise';
    } else {
      const birthDate = new Date(studentData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
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

    if (!studentData.fatherPhone?.trim() && !studentData.motherPhone?.trim()) {
      errors.parentPhone = 'Au moins un numéro de téléphone parent est requis';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validation des données d'enseignant
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

    if (!teacherData.phone?.trim()) {
      errors.phone = 'Le téléphone est requis';
    }

    if (!teacherData.qualification?.trim()) {
      errors.qualification = 'La qualification est requise';
    }

    if (teacherData.salary && (teacherData.salary < 50000 || teacherData.salary > 1000000)) {
      errors.salary = 'Le salaire doit être entre 50,000 et 1,000,000 FCFA';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validation des données de classe
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

  // Validation des données de paiement
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

  // Validation des notes
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

  // Validation d'email
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validation de numéro de téléphone (format Mali)
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+229\s?[0-9]\d{7}$|^[0-9]\d{7}$/;
    return phoneRegex.test(phone);
  }

  // Validation de date
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Validation d'âge pour un niveau scolaire
  static isValidAgeForLevel(birthDate: string, level: string): boolean {
    const age = this.calculateAge(birthDate);
    
    const ageRanges: Record<string, { min: number; max: number }> = {
      'Maternelle': { min: 3, max: 5 },
      'CI': { min: 6, max: 7 },
      'CP': { min: 7, max: 8 },
      'CE1': { min: 8, max: 9 },
      'CE2': { min: 9, max: 10 },
      'CM1': { min: 10, max: 11 },
      'CM2': { min: 11, max: 12 }
    };

    const range = ageRanges[level];
    if (!range) return true; // Niveau non défini, on accepte

    return age >= range.min && age <= range.max;
  }

  // Calculer l'âge
  static calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Validation des conflits d'horaire
  static hasScheduleConflict(
    newSlot: { startTime: string; endTime: string; dayOfWeek: number },
    existingSlots: Array<{ startTime: string; endTime: string; dayOfWeek: number }>
  ): boolean {
    return existingSlots.some(slot => {
      if (slot.dayOfWeek !== newSlot.dayOfWeek) return false;
      
      const newStart = this.timeToMinutes(newSlot.startTime);
      const newEnd = this.timeToMinutes(newSlot.endTime);
      const existingStart = this.timeToMinutes(slot.startTime);
      const existingEnd = this.timeToMinutes(slot.endTime);
      
      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  }

  // Convertir l'heure en minutes
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Validation des données financières
  static validateFinancialAmount(amount: number, currency: string = 'FCFA'): boolean {
    if (currency === 'FCFA') {
      return amount >= 0 && amount <= 10000000; // Max 10M FCFA
    }
    return amount >= 0;
  }

  // Validation des permissions utilisateur
  static validateUserPermissions(role: string, permissions: string[]): boolean {
    const rolePermissions: Record<string, string[]> = {
      'Admin': ['all'],
      'Directeur': ['students', 'teachers', 'classes', 'academic', 'finance', 'reports', 'schedule'],
      'Secrétaire': ['students', 'classes'],
      'Enseignant': ['academic'],
      'Comptable': ['finance', 'reports']
    };

    const allowedPermissions = rolePermissions[role] || [];
    
    if (allowedPermissions.includes('all')) return true;
    
    return permissions.every(permission => allowedPermissions.includes(permission));
  }
}