import { supabase } from '../lib/supabase';
import { School } from '../types/School';

export class SchoolService {
  // Obtenir toutes les écoles
  static async getSchools(): Promise<School[]> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des écoles:', error);
      throw error;
    }
  }

  // Obtenir une école par ID
  static async getSchoolById(schoolId: string): Promise<School | null> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'école:', error);
      return null;
    }
  }

  // Créer une nouvelle école
  static async createSchool(schoolData: Omit<School, 'id' | 'createdDate'>): Promise<School> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert({
          name: schoolData.name,
          address: schoolData.address,
          phone: schoolData.phone,
          email: schoolData.email,
          director: schoolData.director,
          founded_year: schoolData.foundedYear,
          student_capacity: schoolData.studentCapacity,
          motto: schoolData.motto,
          logo_url: schoolData.logo,
          is_active: schoolData.isActive,
          settings: schoolData.settings
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapSchoolFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la création de l\'école:', error);
      throw error;
    }
  }

  // Mettre à jour une école
  static async updateSchool(schoolId: string, updates: Partial<School>): Promise<School> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.address && { address: updates.address }),
          ...(updates.phone && { phone: updates.phone }),
          ...(updates.email && { email: updates.email }),
          ...(updates.director && { director: updates.director }),
          ...(updates.foundedYear && { founded_year: updates.foundedYear }),
          ...(updates.studentCapacity && { student_capacity: updates.studentCapacity }),
          ...(updates.motto && { motto: updates.motto }),
          ...(updates.logo && { logo_url: updates.logo }),
          ...(updates.isActive !== undefined && { is_active: updates.isActive }),
          ...(updates.settings && { settings: updates.settings }),
          updated_at: new Date().toISOString()
        })
        .eq('id', schoolId)
        .select()
        .single();

      if (error) throw error;
      return this.mapSchoolFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'école:', error);
      throw error;
    }
  }

  // Supprimer une école (désactivation)
  static async deleteSchool(schoolId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('schools')
        .update({ is_active: false })
        .eq('id', schoolId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'école:', error);
      throw error;
    }
  }

  // Obtenir les statistiques d'une école
  static async getSchoolStats(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_school_dashboard', {
          p_school_id: schoolId,
          p_academic_year_id: academicYearId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      return null;
    }
  }

  // Mapper les données de la DB vers le type School
  private static mapSchoolFromDB(dbSchool: any): School {
    return {
      id: dbSchool.id,
      name: dbSchool.name,
      address: dbSchool.address,
      phone: dbSchool.phone,
      email: dbSchool.email,
      director: dbSchool.director,
      foundedYear: dbSchool.founded_year,
      studentCapacity: dbSchool.student_capacity,
      motto: dbSchool.motto,
      logo: dbSchool.logo_url,
      isActive: dbSchool.is_active,
      createdDate: dbSchool.created_at,
      settings: dbSchool.settings
    };
  }
}