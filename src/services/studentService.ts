import { supabase } from '../lib/supabase';
import { ValidationService } from './validationService';
import { ActivityLogService } from './activityLogService';

export interface StudentData {
  id?: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  gender: 'Masculin' | 'Féminin';
  dateOfBirth: string;
  birthPlace?: string;
  nationality?: string;
  religion?: string;
  bloodType?: string;
  motherTongue?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhone?: string;
  motherOccupation?: string;
  guardianType?: string;
  numberOfSiblings?: number;
  transportMode?: string;
  medicalInfo?: string;
  allergies?: string;
  previousSchool?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  parentEmail: string;
  address: string;
  status?: 'Actif' | 'Inactif' | 'Suspendu';
}

export interface EnrollmentData {
  studentId: string;
  classId: string;
  schoolId: string;
  academicYearId: string;
  totalFees: number;
  paidAmount?: number;
  paymentMethod?: string;
  mobileNumber?: string;
  bankDetails?: string;
  notes?: string;
}

export class StudentService {
  // Obtenir tous les élèves d'une école pour une année
  static async getStudents(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('enrollment_details')
        .select('*')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('last_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des élèves:', error);
      throw error;
    }
  }

  // Obtenir un élève par ID avec ses inscriptions
  static async getStudentById(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          enrollments:student_class_enrollments!inner(
            *,
            class:classes(name, level),
            academic_year:academic_years(name)
          )
        `)
        .eq('id', studentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'élève:', error);
      throw error;
    }
  }

  // Créer un nouvel élève
  static async createStudent(studentData: StudentData) {
    try {
      // Valider les données
      const validation = ValidationService.validateStudentData(studentData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${Object.values(validation.errors).join(', ')}`);
      }

      const { data, error } = await supabase
        .from('students')
        .insert({
          school_id: studentData.schoolId,
          first_name: studentData.firstName,
          last_name: studentData.lastName,
          gender: studentData.gender,
          date_of_birth: studentData.dateOfBirth,
          birth_place: studentData.birthPlace,
          nationality: studentData.nationality || 'Malienne',
          religion: studentData.religion,
          blood_type: studentData.bloodType,
          mother_tongue: studentData.motherTongue || 'Bambara',
          father_name: studentData.fatherName,
          father_phone: studentData.fatherPhone,
          father_occupation: studentData.fatherOccupation,
          mother_name: studentData.motherName,
          mother_phone: studentData.motherPhone,
          mother_occupation: studentData.motherOccupation,
          guardian_type: studentData.guardianType || 'Parents',
          number_of_siblings: studentData.numberOfSiblings || 0,
          transport_mode: studentData.transportMode || 'À pied',
          medical_info: studentData.medicalInfo,
          allergies: studentData.allergies,
          previous_school: studentData.previousSchool,
          emergency_contact_name: studentData.emergencyContactName,
          emergency_contact_phone: studentData.emergencyContactPhone,
          emergency_contact_relation: studentData.emergencyContactRelation,
          parent_email: studentData.parentEmail,
          address: studentData.address,
          status: studentData.status || 'Actif'
        })
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: studentData.schoolId,
        action: 'CREATE_STUDENT',
        entityType: 'student',
        entityId: data.id,
        level: 'success',
        details: `Nouvel élève créé: ${studentData.firstName} ${studentData.lastName}`
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'élève:', error);
      throw error;
    }
  }

  // Inscrire un élève dans une classe
  static async enrollStudent(enrollmentData: EnrollmentData) {
    try {
      // Récupérer le niveau de la classe pour calculer les frais totaux
      const { data: classInfo, error: classError } = await supabase
        .from('classes')
        .select('level')
        .eq('id', enrollmentData.classId)
        .eq('school_id', enrollmentData.schoolId)
        .eq('academic_year_id', enrollmentData.academicYearId)
        .single();

      if (classError) {
        throw new Error(`Erreur lors de la récupération de la classe: ${classError.message}`);
      }

      // Calculer les frais totaux basés sur le niveau de la classe
      const calculatedTotalFees = await this.calculateTotalFeesForLevel(
        enrollmentData.schoolId, 
        classInfo.level
      );

      const { data, error } = await supabase
        .from('student_class_enrollments')
        .insert({
          student_id: enrollmentData.studentId,
          class_id: enrollmentData.classId,
          school_id: enrollmentData.schoolId,
          academic_year_id: enrollmentData.academicYearId,
          total_fees: calculatedTotalFees,
          paid_amount: enrollmentData.paidAmount || 0,
          payment_method: enrollmentData.paymentMethod,
          mobile_number: enrollmentData.mobileNumber,
          bank_details: enrollmentData.bankDetails,
          notes: enrollmentData.notes
        })
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: enrollmentData.schoolId,
        action: 'CREATE_ENROLLMENT',
        entityType: 'enrollment',
        entityId: data.id,
        level: 'success',
        details: `Inscription créée pour l'élève dans la classe (Frais totaux: ${calculatedTotalFees.toLocaleString()} FCFA)`
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  // Calculer les frais totaux pour un niveau donné
  static async calculateTotalFeesForLevel(schoolId: string, level: string): Promise<number> {
    try {
      const { data: feeTypes, error } = await supabase
        .from('fee_types')
        .select('amount')
        .eq('school_id', schoolId)
        .eq('is_mandatory', true)
        .eq('level',level);

      if (error) {
        throw new Error(`Erreur lors de la récupération des frais: ${error.message}`);
      }

      // Calculer la somme de tous les frais obligatoires
      const totalFees = (feeTypes || []).reduce((sum, feeType) => sum + feeType.amount, 0);
      
      // Si aucun frais configuré, utiliser un montant par défaut basé sur le niveau
     
      return totalFees;
    } catch (error) {
      console.error('Erreur lors du calcul des frais totaux:', error);
      
      
    }
  }
  // Créer un élève avec inscription en une transaction
  static async createStudentWithEnrollment(
    studentData: StudentData,
    enrollmentData: Omit<EnrollmentData, 'studentId'>
  ) {
    try {
      // Créer l'élève
      const student = await this.createStudent(studentData);

      // Créer l'inscription
      const enrollment = await this.enrollStudent({
        studentId: student.id,
        ...enrollmentData
      });

      return { student, enrollment };
    } catch (error) {
      console.error('Erreur lors de la création avec inscription:', error);
      throw error;
    }
  }

  // Mettre à jour un élève
  static async updateStudent(studentId: string, updates: Partial<StudentData>) {
    try {
      // Valider les données si elles sont fournies
      if (Object.keys(updates).length > 0) {
        const validation = ValidationService.validateStudentData(updates);
        if (!validation.isValid) {
          throw new Error(`Données invalides: ${Object.values(validation.errors).join(', ')}`);
        }
      }

      const { data, error } = await supabase
        .from('students')
        .update({
          ...(updates.firstName && { first_name: updates.firstName }),
          ...(updates.lastName && { last_name: updates.lastName }),
          ...(updates.gender && { gender: updates.gender }),
          ...(updates.dateOfBirth && { date_of_birth: updates.dateOfBirth }),
          ...(updates.birthPlace && { birth_place: updates.birthPlace }),
          ...(updates.nationality && { nationality: updates.nationality }),
          ...(updates.religion && { religion: updates.religion }),
          ...(updates.bloodType && { blood_type: updates.bloodType }),
          ...(updates.motherTongue && { mother_tongue: updates.motherTongue }),
          ...(updates.fatherName && { father_name: updates.fatherName }),
          ...(updates.fatherPhone && { father_phone: updates.fatherPhone }),
          ...(updates.fatherOccupation && { father_occupation: updates.fatherOccupation }),
          ...(updates.motherName && { mother_name: updates.motherName }),
          ...(updates.motherPhone && { mother_phone: updates.motherPhone }),
          ...(updates.motherOccupation && { mother_occupation: updates.motherOccupation }),
          ...(updates.guardianType && { guardian_type: updates.guardianType }),
          ...(updates.numberOfSiblings !== undefined && { number_of_siblings: updates.numberOfSiblings }),
          ...(updates.transportMode && { transport_mode: updates.transportMode }),
          ...(updates.medicalInfo && { medical_info: updates.medicalInfo }),
          ...(updates.allergies && { allergies: updates.allergies }),
          ...(updates.previousSchool && { previous_school: updates.previousSchool }),
          ...(updates.emergencyContactName && { emergency_contact_name: updates.emergencyContactName }),
          ...(updates.emergencyContactPhone && { emergency_contact_phone: updates.emergencyContactPhone }),
          ...(updates.emergencyContactRelation && { emergency_contact_relation: updates.emergencyContactRelation }),
          ...(updates.parentEmail && { parent_email: updates.parentEmail }),
          ...(updates.address && { address: updates.address }),
          ...(updates.status && { status: updates.status }),
          updated_at: new Date().toISOString()
        })
        .eq('id', studentId)
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: data.school_id,
        action: 'UPDATE_STUDENT',
        entityType: 'student',
        entityId: studentId,
        level: 'info',
        details: `Élève mis à jour: ${data.first_name} ${data.last_name}`
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'élève:', error);
      throw error;
    }
  }

  // Rechercher des élèves
  static async searchStudents(schoolId: string, academicYearId: string, searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('enrollment_details')
        .select('*')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,parent_email.ilike.%${searchTerm}%,father_phone.ilike.%${searchTerm}%,mother_phone.ilike.%${searchTerm}%`)
        .order('last_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
  }

  // Obtenir les élèves par classe
  static async getStudentsByClass(classId: string, academicYearId: string) {
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
      console.error('Erreur lors du chargement des élèves de la classe:', error);
      return [];
    }
  }

  // Transférer un élève vers une autre classe
  static async transferStudent(
    currentEnrollmentId: string,
    newClassId: string,
    transferReason?: string
  ) {
    try {
      // Obtenir l'inscription actuelle
      const { data: currentEnrollment } = await supabase
        .from('student_class_enrollments')
        .select('*')
        .eq('id', currentEnrollmentId)
        .single();

      if (!currentEnrollment) {
        throw new Error('Inscription non trouvée');
      }

      // Désactiver l'inscription actuelle
      await supabase
        .from('student_class_enrollments')
        .update({ is_active: false })
        .eq('id', currentEnrollmentId);

      // Créer une nouvelle inscription
      const { data, error } = await supabase
        .from('student_class_enrollments')
        .insert({
          student_id: currentEnrollment.student_id,
          class_id: newClassId,
          school_id: currentEnrollment.school_id,
          academic_year_id: currentEnrollment.academic_year_id,
          total_fees: currentEnrollment.total_fees,
          paid_amount: currentEnrollment.paid_amount,
          payment_method: currentEnrollment.payment_method,
          mobile_number: currentEnrollment.mobile_number,
          bank_details: currentEnrollment.bank_details,
          notes: transferReason ? `Transfert: ${transferReason}` : currentEnrollment.notes
        })
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: currentEnrollment.school_id,
        action: 'TRANSFER_STUDENT',
        entityType: 'enrollment',
        entityId: data.id,
        level: 'info',
        details: `Élève transféré vers une nouvelle classe`
      });

      return data;
    } catch (error) {
      console.error('Erreur lors du transfert:', error);
      throw error;
    }
  }

  // Désactiver une inscription (retrait d'élève)
  static async withdrawStudent(enrollmentId: string, withdrawalReason: string) {
    try {
      const { data, error } = await supabase
        .from('student_class_enrollments')
        .update({
          is_active: false,
          notes: `Retrait: ${withdrawalReason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: data.school_id,
        action: 'WITHDRAW_STUDENT',
        entityType: 'enrollment',
        entityId: enrollmentId,
        level: 'warning',
        details: `Élève retiré: ${withdrawalReason}`
      });

      return data;
    } catch (error) {
      console.error('Erreur lors du retrait de l\'élève:', error);
      throw error;
    }
  }

  // Obtenir l'historique des inscriptions d'un élève
  static async getStudentEnrollmentHistory(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('student_class_enrollments')
        .select(`
          *,
          class:classes(name, level),
          academic_year:academic_years(name)
        `)
        .eq('student_id', studentId)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      return [];
    }
  }

  // Obtenir les statistiques des élèves
  static async getStudentStats(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('enrollment_details')
        .select('payment_status, level, gender')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        byPaymentStatus: {
          'À jour': data?.filter(e => e.payment_status === 'À jour').length || 0,
          'En retard': data?.filter(e => e.payment_status === 'En retard').length || 0,
          'Partiel': data?.filter(e => e.payment_status === 'Partiel').length || 0
        },
        byLevel: data?.reduce((acc, enrollment) => {
          acc[enrollment.level] = (acc[enrollment.level] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        byGender: {
          'Masculin': data?.filter(e => e.gender === 'Masculin').length || 0,
          'Féminin': data?.filter(e => e.gender === 'Féminin').length || 0
        }
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return null;
    }
  }

  // Obtenir les élèves avec impayés
  static async getStudentsWithOutstandingPayments(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_students_with_outstanding_payments', {
          p_school_id: schoolId,
          p_academic_year_id: academicYearId
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des impayés:', error);
      return [];
    }
  }

  // Calculer l'âge d'un élève
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

  // Valider l'âge pour un niveau
  static validateAgeForLevel(birthDate: string, level: string): boolean {
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

  // Obtenir les classes disponibles pour inscription
  static async getAvailableClassesForEnrollment(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          teacher_assignment:teacher_class_assignments!left(
            teacher:teachers(first_name, last_name)
          )
        `)
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des classes disponibles:', error);
      return [];
    }
  }
}