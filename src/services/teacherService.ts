import { supabase } from '../lib/supabase';
import { ValidationService } from './validationService';
import { ActivityLogService } from './activityLogService';

export interface TeacherData {
  id?: string;
  schoolId: string;
  userProfileId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  qualification?: string;
  experience?: string;
  specializations?: string[];
  hireDate?: string;
  emergencyContact?: string;
  status?: 'Actif' | 'Inactif' | 'Congé';
  performanceRating?: number;
}

export interface TeacherAssignmentData {
  teacherId: string;
  classId: string;
  schoolId: string;
  academicYearId: string;
  salaryAmount?: number;
  salaryCurrency?: string;
}

export class TeacherService {
  // Obtenir tous les enseignants d'une école
  static async getTeachers(schoolId: string) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          user_profile:user_profiles(id, name, email, role, is_active),
          current_assignment:teacher_class_assignments!left(
            id,
            class:classes(name, level),
            salary_amount,
            is_active
          )
        `)
        .eq('school_id', schoolId)
        .order('last_name');

      if (error) throw error;
      
      // Mapper les données pour inclure les informations du profil utilisateur
      return (data || []).map(teacher => ({
        ...teacher,
        hasUserAccount: !!teacher.user_profile_id,
        userAccountActive: teacher.user_profile?.is_active || false,
        userRole: teacher.user_profile?.role || null
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des enseignants:', error);
      throw error;
    }
  }

  // Obtenir les affectations d'enseignants avec détails
  static async getTeacherAssignments(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('teacher_assignment_details')
        .select('*')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('assignment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des affectations:', error);
      throw error;
    }
  }

  // Créer un nouvel enseignant
  static async createTeacher(teacherData: TeacherData) {
    try {
      // Valider les données
      const validation = ValidationService.validateTeacherData(teacherData);
      /*if (!validation.isValid) {
        throw new Error(`Données invalides: ${Object.values(validation.errors).join(', ')}`);
      }*/

      // Vérifier l'unicité de l'email
      const emailExists = await ValidationService.checkEmailUniqueness(
        teacherData.email, 
        teacherData.schoolId
      );
      if (!emailExists) {
        throw new Error('Cette adresse email est déjà utilisée');
      }

      const { data, error } = await supabase
        .from('teachers')
        .insert({
          school_id: teacherData.schoolId,
          user_profile_id: teacherData.userProfileId,
          first_name: teacherData.firstName,
          last_name: teacherData.lastName,
          email: teacherData.email,
          phone: teacherData.phone,
          address: teacherData.address,
          qualification: teacherData.qualification,
          experience: teacherData.experience,
          specializations: teacherData.specializations || [],
          hire_date: teacherData.hireDate,
          emergency_contact: teacherData.emergencyContact,
          status: teacherData.status || 'Actif',
          performance_rating: teacherData.performanceRating || 4.0
        })
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: teacherData.schoolId,
        action: 'CREATE_TEACHER',
        entityType: 'teacher',
        entityId: data.id,
        level: 'success',
        details: `Nouvel enseignant créé: ${teacherData.firstName} ${teacherData.lastName}${teacherData.userProfileId ? ' (avec compte utilisateur)' : ''}`
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'enseignant:', error);
      throw error;
    }
  }

  // Créer un enseignant avec compte utilisateur
  static async createTeacherWithUserAccount(teacherData: TeacherData & {
    password: string;
    permissions: string[];
  }) {
    try {
      // Créer d'abord le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: teacherData.email,
        password: teacherData.password,
        email_confirm: true,
        user_metadata: {
          name: `${teacherData.firstName} ${teacherData.lastName}`,
          role: 'Enseignant',
          school_id: teacherData.schoolId
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Mettre à jour les permissions du profil
        await supabase
          .from('user_profiles')
          .update({
            permissions: teacherData.permissions
          })
          .eq('id', authData.user.id);

        // Créer l'enseignant avec le lien vers le profil utilisateur
        const teacher = await this.createTeacher({
          ...teacherData,
          userProfileId: authData.user.id
        });

        return { teacher, userProfile: authData.user };
      }

      throw new Error('Erreur lors de la création du compte utilisateur');
    } catch (error) {
      console.error('Erreur lors de la création de l\'enseignant avec compte:', error);
      throw error;
    }
  }

  // Lier un enseignant existant à un compte utilisateur
  static async linkTeacherToUserAccount(teacherId: string, userProfileId: string) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update({ user_profile_id: userProfileId })
        .eq('id', teacherId)
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: data.school_id,
        action: 'LINK_TEACHER_USER_ACCOUNT',
        entityType: 'teacher',
        entityId: teacherId,
        level: 'info',
        details: 'Enseignant lié à un compte utilisateur'
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la liaison:', error);
      throw error;
    }
  }

  // Délier un enseignant d'un compte utilisateur
  static async unlinkTeacherFromUserAccount(teacherId: string) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update({ user_profile_id: null })
        .eq('id', teacherId)
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: data.school_id,
        action: 'UNLINK_TEACHER_USER_ACCOUNT',
        entityType: 'teacher',
        entityId: teacherId,
        level: 'warning',
        details: 'Enseignant délié du compte utilisateur'
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la déliaison:', error);
      throw error;
    }
  }

  // Obtenir les enseignants sans compte utilisateur
  static async getTeachersWithoutUserAccount(schoolId: string) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('school_id', schoolId)
        .is('user_profile_id', null)
        .eq('status', 'Actif')
        .order('last_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des enseignants sans compte:', error);
      return [];
    }
  }

  // Assigner un enseignant à une classe
  static async assignTeacherToClass(assignmentData: TeacherAssignmentData) {
    try {
      // Vérifier qu'il n'y a pas déjà une affectation active pour cet enseignant
      const { data: existingAssignment } = await supabase
        .from('teacher_class_assignments')
        .select('id')
        .eq('teacher_id', assignmentData.teacherId)
        .eq('academic_year_id', assignmentData.academicYearId)
        .eq('is_active', true)
        .maybeSingle();

      if (existingAssignment) {
        throw new Error('Cet enseignant a déjà une classe assignée pour cette année');
      }

      // Vérifier qu'il n'y a pas déjà un enseignant pour cette classe
      const { data: existingClassAssignment } = await supabase
        .from('teacher_class_assignments')
        .select('id')
        .eq('class_id', assignmentData.classId)
        .eq('academic_year_id', assignmentData.academicYearId)
        .eq('is_active', true)
        .maybeSingle();

      if (existingClassAssignment) {
        throw new Error('Cette classe a déjà un enseignant assigné');
      }

      const { data, error } = await supabase
        .from('teacher_class_assignments')
        .insert({
          teacher_id: assignmentData.teacherId,
          class_id: assignmentData.classId,
          school_id: assignmentData.schoolId,
          academic_year_id: assignmentData.academicYearId,
          salary_amount: assignmentData.salaryAmount || 150000,
          salary_currency: assignmentData.salaryCurrency || 'FCFA'
        })
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: assignmentData.schoolId,
        action: 'ASSIGN_TEACHER',
        entityType: 'teacher_assignment',
        entityId: data.id,
        level: 'success',
        details: `Enseignant assigné à une classe`
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      throw error;
    }
  }

  // Changer l'affectation d'un enseignant
  static async changeTeacherAssignment(
    teacherId: string,
    newClassId: string,
    academicYearId: string,
    schoolId: string
  ) {
    try {
      // Désactiver l'affectation actuelle
      await supabase
        .from('teacher_class_assignments')
        .update({ is_active: false })
        .eq('teacher_id', teacherId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true);

      // Créer la nouvelle affectation
      const { data, error } = await supabase
        .from('teacher_class_assignments')
        .insert({
          teacher_id: teacherId,
          class_id: newClassId,
          school_id: schoolId,
          academic_year_id: academicYearId,
          salary_amount: 150000,
          salary_currency: 'FCFA'
        })
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: schoolId,
        action: 'CHANGE_TEACHER_ASSIGNMENT',
        entityType: 'teacher_assignment',
        entityId: data.id,
        level: 'info',
        details: `Changement d'affectation d'enseignant`
      });

      return data;
    } catch (error) {
      console.error('Erreur lors du changement d\'affectation:', error);
      throw error;
    }
  }

  // Mettre à jour un enseignant
  static async updateTeacher(teacherId: string, updates: Partial<TeacherData>) {
    try {
      // Valider les données si elles sont fournies
      if (Object.keys(updates).length > 0) {
        const validation = ValidationService.validateTeacherData(updates);
        if (!validation.isValid) {
          throw new Error(`Données invalides: ${Object.values(validation.errors).join(', ')}`);
        }
      }

      const { data, error } = await supabase
        .from('teachers')
        .update({
          ...(updates.firstName && { first_name: updates.firstName }),
          ...(updates.lastName && { last_name: updates.lastName }),
          ...(updates.email && { email: updates.email }),
          ...(updates.phone && { phone: updates.phone }),
          ...(updates.address && { address: updates.address }),
          ...(updates.qualification && { qualification: updates.qualification }),
          ...(updates.experience && { experience: updates.experience }),
          ...(updates.specializations && { specializations: updates.specializations }),
          ...(updates.hireDate && { hire_date: updates.hireDate }),
          ...(updates.emergencyContact && { emergency_contact: updates.emergencyContact }),
          ...(updates.status && { status: updates.status }),
          ...(updates.performanceRating && { performance_rating: updates.performanceRating }),
          updated_at: new Date().toISOString()
        })
        .eq('id', teacherId)
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: data.school_id,
        action: 'UPDATE_TEACHER',
        entityType: 'teacher',
        entityId: teacherId,
        level: 'info',
        details: `Enseignant mis à jour: ${data.first_name} ${data.last_name}`
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'enseignant:', error);
      throw error;
    }
  }

  // Obtenir les enseignants disponibles (sans classe)
  static async getAvailableTeachers(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          assignment:teacher_class_assignments!left(
            id,
            is_active,
            academic_year_id
          )
        `)
        .eq('school_id', schoolId)
        .eq('status', 'Actif');

      if (error) throw error;

      // Filtrer les enseignants qui n'ont pas d'affectation active pour cette année
      const availableTeachers = data?.filter(teacher => {
        const activeAssignment = teacher.assignment?.find(
          (a: any) => a.is_active && a.academic_year_id === academicYearId
        );
        return !activeAssignment;
      }) || [];

      return availableTeachers;
    } catch (error) {
      console.error('Erreur lors du chargement des enseignants disponibles:', error);
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
      console.error('Erreur lors du chargement de l\'emploi du temps:', error);
      return [];
    }
  }

  // Obtenir les statistiques des enseignants
  static async getTeacherStats(schoolId: string, academicYearId: string) {
    try {
      const [allTeachers, assignments] = await Promise.all([
        this.getTeachers(schoolId),
        this.getTeacherAssignments(schoolId, academicYearId)
      ]);

      const stats = {
        total: allTeachers.length,
        active: allTeachers.filter(t => t.status === 'Actif').length,
        assigned: assignments.length,
        available: allTeachers.filter(t => t.status === 'Actif').length - assignments.length,
        onLeave: allTeachers.filter(t => t.status === 'Congé').length,
        averageExperience: this.calculateAverageExperience(allTeachers),
        averagePerformance: this.calculateAveragePerformance(allTeachers),
        totalSalaryCost: assignments.reduce((sum, a) => sum + (a.salary_amount || 0), 0),
        byQualification: this.groupByQualification(allTeachers),
        byExperience: this.groupByExperience(allTeachers)
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return null;
    }
  }

  // Obtenir un enseignant par ID avec détails
  static async getTeacherById(teacherId: string) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          user_profile:user_profiles(name, email, role),
          current_assignment:teacher_class_assignments!left(
            *,
            class:classes(name, level, current_students),
            academic_year:academic_years(name)
          ),
          schedule:schedule_slots!left(
            *,
            subject:subjects(name),
            classroom:classrooms(name)
          )
        `)
        .eq('id', teacherId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'enseignant:', error);
      throw error;
    }
  }

  // Rechercher des enseignants
  static async searchTeachers(schoolId: string, searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          current_assignment:teacher_class_assignments!left(
            class:classes(name, level),
            is_active
          )
        `)
        .eq('school_id', schoolId)
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('last_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
  }

  // Supprimer un enseignant (désactivation)
  static async deleteTeacher(teacherId: string) {
    try {
      // Vérifier qu'il n'y a pas d'affectation active
      const { data: activeAssignments } = await supabase
        .from('teacher_class_assignments')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('is_active', true);

      if (activeAssignments && activeAssignments.length > 0) {
        throw new Error('Impossible de supprimer un enseignant avec une classe assignée');
      }

      const { data, error } = await supabase
        .from('teachers')
        .update({ 
          status: 'Inactif',
          updated_at: new Date().toISOString()
        })
        .eq('id', teacherId)
        .select()
        .single();

      if (error) throw error;

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: data.school_id,
        action: 'DELETE_TEACHER',
        entityType: 'teacher',
        entityId: teacherId,
        level: 'warning',
        details: `Enseignant désactivé: ${data.first_name} ${data.last_name}`
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'enseignant:', error);
      throw error;
    }
  }

  // Obtenir les classes sans enseignant
  static async getClassesWithoutTeacher(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          teacher_assignment:teacher_class_assignments!left(id, is_active)
        `)
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .is('teacher_assignment.id', null);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des classes sans enseignant:', error);
      return [];
    }
  }

  // Obtenir les absences d'enseignants
  static async getTeacherAbsences(schoolId: string, filters?: {
    teacherId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      // Note: Cette table n'existe pas encore dans les migrations
      // Pour l'instant, on retourne des données simulées
      const mockAbsences = [
        {
          id: '1',
          teacher_id: 'teacher-traore',
          teacher_name: 'M. Moussa Traore',
          start_date: '2024-10-15',
          end_date: '2024-10-17',
          reason: 'Congé maladie',
          status: 'Approuvée',
          substitute_teacher: 'Mlle Fatoumata Coulibaly',
          documents: ['certificat_medical.pdf'],
          comments: 'Grippe saisonnière, repos recommandé'
        },
        {
          id: '2',
          teacher_id: 'teacher-kone',
          teacher_name: 'Mme Aminata Kone',
          start_date: '2024-10-12',
          end_date: '2024-10-12',
          reason: 'Formation continue',
          status: 'Approuvée',
          substitute_teacher: 'M. Sekou Sangare',
          comments: 'Formation sur les nouvelles méthodes pédagogiques'
        }
      ];

      return mockAbsences.filter(absence => {
        if (filters?.teacherId && absence.teacher_id !== filters.teacherId) return false;
        if (filters?.status && absence.status !== filters.status) return false;
        return true;
      });
    } catch (error) {
      console.error('Erreur lors du chargement des absences:', error);
      return [];
    }
  }

  // Fonctions utilitaires privées
  private static calculateAverageExperience(teachers: any[]): number {
    if (teachers.length === 0) return 0;
    
    const totalExperience = teachers.reduce((sum, teacher) => {
      const experience = parseInt(teacher.experience?.split(' ')[0] || '0');
      return sum + experience;
    }, 0);
    
    return Math.round(totalExperience / teachers.length);
  }

  private static calculateAveragePerformance(teachers: any[]): number {
    if (teachers.length === 0) return 0;
    
    const totalRating = teachers.reduce((sum, teacher) => {
      return sum + (teacher.performance_rating || 4.0);
    }, 0);
    
    return Math.round((totalRating / teachers.length) * 10) / 10;
  }

  private static groupByQualification(teachers: any[]): Record<string, number> {
    return teachers.reduce((acc, teacher) => {
      const qualification = teacher.qualification || 'Non spécifié';
      acc[qualification] = (acc[qualification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private static groupByExperience(teachers: any[]): Record<string, number> {
    return teachers.reduce((acc, teacher) => {
      const experience = parseInt(teacher.experience?.split(' ')[0] || '0');
      let category = 'Débutant (0-2 ans)';
      
      if (experience >= 10) category = 'Expérimenté (10+ ans)';
      else if (experience >= 5) category = 'Confirmé (5-10 ans)';
      else if (experience >= 3) category = 'Junior (3-5 ans)';
      
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}