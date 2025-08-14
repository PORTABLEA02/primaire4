import { StudentService } from '../services/studentService';

export class StudentHelpers {
  // Calculer l'âge d'un élève
  static calculateAge(birthDate: string): number {
    return StudentService.calculateAge(birthDate);
  }

  // Valider l'âge pour un niveau
  static validateAgeForLevel(birthDate: string, level: string): { isValid: boolean; message?: string } {
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
    if (!range) return { isValid: true };

    const isValid = age >= range.min && age <= range.max;
    
    return {
      isValid,
      message: isValid ? undefined : `L'âge recommandé pour ${level} est entre ${range.min} et ${range.max} ans`
    };
  }

  // Formater le nom complet
  static formatFullName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`;
  }

  // Obtenir les initiales
  static getInitials(firstName: string, lastName: string): string {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  }

  // Formater le statut de paiement avec couleur
  static getPaymentStatusDisplay(status: string) {
    const configs = {
      'À jour': { label: 'À jour', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700' },
      'En retard': { label: 'En retard', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700' },
      'Partiel': { label: 'Partiel', color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' }
    };

    const config = configs[status as keyof typeof configs] || { 
      label: status, 
      color: 'gray', 
      bgColor: 'bg-gray-50', 
      textColor: 'text-gray-700' 
    };
    
    return {
      label: config.label,
      className: `${config.bgColor} ${config.textColor} border-${config.color}-200`
    };
  }

  // Calculer le pourcentage de paiement
  static calculatePaymentProgress(paidAmount: number, totalFees: number): number {
    if (totalFees === 0) return 0;
    return Math.min((paidAmount / totalFees) * 100, 100);
  }

  // Valider les données d'un élève
  static validateStudentData(data: Partial<NewStudentData>): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!data.firstName?.trim()) {
      errors.firstName = 'Le prénom est requis';
    }

    if (!data.lastName?.trim()) {
      errors.lastName = 'Le nom est requis';
    }

    if (!data.dateOfBirth) {
      errors.dateOfBirth = 'La date de naissance est requise';
    } else {
      const age = this.calculateAge(data.dateOfBirth);
      if (age < 3 || age > 18) {
        errors.dateOfBirth = 'L\'âge doit être entre 3 et 18 ans';
      }
    }

    if (!data.parentEmail?.trim()) {
      errors.parentEmail = 'L\'email du parent est requis';
    } else if (!this.isValidEmail(data.parentEmail)) {
      errors.parentEmail = 'Format d\'email invalide';
    }

    if (!data.address?.trim()) {
      errors.address = 'L\'adresse est requise';
    }

    if (!data.fatherPhone?.trim() && !data.motherPhone?.trim()) {
      errors.parentPhone = 'Au moins un numéro de téléphone parent est requis';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Valider un email
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Valider un numéro de téléphone (format Mali)
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+229\s?[0-9]\d{7}$|^[0-9]\d{7}$/;
    return phoneRegex.test(phone);
  }

  // Générer un numéro d'élève unique
  static generateStudentNumber(schoolId: string, academicYear: string, level: string): string {
    const year = academicYear.split('-')[0];
    const levelCode = this.getLevelCode(level);
    const timestamp = Date.now().toString().slice(-4);
    
    return `${year}${levelCode}${timestamp}`;
  }

  // Obtenir le code du niveau
  private static getLevelCode(level: string): string {
    const codes: Record<string, string> = {
      'Maternelle': 'MAT',
      'CI': 'CI',
      'CP': 'CP',
      'CE1': 'CE1',
      'CE2': 'CE2',
      'CM1': 'CM1',
      'CM2': 'CM2'
    };
    return codes[level] || 'STD';
  }

  // Obtenir les frais par niveau
  static getFeesByLevel(level: string): number {
    const fees: Record<string, number> = {
      'Maternelle': 300000,
      'CI': 350000,
      'CP': 350000,
      'CE1': 400000,
      'CE2': 400000,
      'CM1': 450000,
      'CM2': 450000
    };
    return fees[level] || 350000;
  }

  // Obtenir les matières par niveau
  static getSubjectsByLevel(level: string): string[] {
    const subjects: Record<string, string[]> = {
      'Maternelle': ['Éveil', 'Langage', 'Graphisme', 'Jeux éducatifs', 'Motricité'],
      'CI': ['Français', 'Mathématiques', 'Éveil Scientifique', 'Éducation Civique', 'Dessin'],
      'CP': ['Français', 'Mathématiques', 'Éveil Scientifique', 'Éducation Civique', 'Dessin'],
      'CE1': ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Dessin'],
      'CE2': ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Dessin'],
      'CM1': ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Anglais', 'Dessin'],
      'CM2': ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Anglais', 'Dessin']
    };
    return subjects[level] || [];
  }

  // Formater les données pour l'export
  static formatStudentForExport(student: any) {
    return {
      'Numéro': student.student_number || '',
      'Nom': `${student.first_name} ${student.last_name}`,
      'Sexe': student.gender,
      'Date de naissance': new Date(student.date_of_birth).toLocaleDateString('fr-FR'),
      'Âge': this.calculateAge(student.date_of_birth),
      'Nationalité': student.nationality,
      'Lieu de naissance': student.birth_place || '',
      'Classe': student.class_name,
      'Niveau': student.level,
      'Père': student.father_name || '',
      'Téléphone père': student.father_phone || '',
      'Mère': student.mother_name || '',
      'Téléphone mère': student.mother_phone || '',
      'Email': student.parent_email,
      'Adresse': student.address,
      'Contact urgence': student.emergency_contact_name || '',
      'Téléphone urgence': student.emergency_contact_phone || '',
      'Statut paiement': student.payment_status,
      'Frais totaux': student.total_fees,
      'Montant payé': student.paid_amount,
      'Montant dû': student.outstanding_amount,
      'Date inscription': new Date(student.enrollment_date).toLocaleDateString('fr-FR'),
      'Année scolaire': student.academic_year
    };
  }

  // Générer un rapport de classe
  static generateClassReport(students: any[], className: string) {
    const totalStudents = students.length;
    const maleStudents = students.filter(s => s.gender === 'Masculin').length;
    const femaleStudents = students.filter(s => s.gender === 'Féminin').length;
    const averageAge = students.reduce((sum, s) => sum + this.calculateAge(s.date_of_birth), 0) / totalStudents;
    
    const paymentStats = {
      upToDate: students.filter(s => s.payment_status === 'À jour').length,
      late: students.filter(s => s.payment_status === 'En retard').length,
      partial: students.filter(s => s.payment_status === 'Partiel').length
    };

    const totalRevenue = students.reduce((sum, s) => sum + s.paid_amount, 0);
    const totalOutstanding = students.reduce((sum, s) => sum + s.outstanding_amount, 0);

    return {
      className,
      totalStudents,
      demographics: {
        male: maleStudents,
        female: femaleStudents,
        averageAge: Math.round(averageAge * 10) / 10
      },
      payments: paymentStats,
      financial: {
        totalRevenue,
        totalOutstanding,
        collectionRate: totalRevenue / (totalRevenue + totalOutstanding) * 100
      }
    };
  }
}

// Types pour TypeScript
export interface NewStudentData {
  firstName: string;
  lastName: string;
  gender: 'Masculin' | 'Féminin';
  nationality: string;
  birthPlace: string;
  religion?: string;
  bloodType?: string;
  allergies?: string;
  previousSchool?: string;
  motherTongue: string;
  fatherName: string;
  fatherPhone: string;
  fatherOccupation: string;
  motherName: string;
  motherPhone: string;
  motherOccupation: string;
  guardianType: 'Parents' | 'Tuteur' | 'Famille élargie' | 'Autre';
  numberOfSiblings: number;
  transportMode: 'À pied' | 'Transport scolaire' | 'Transport familial' | 'Transport public';
  medicalInfo?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  dateOfBirth: string;
  parentEmail: string;
  address: string;
}