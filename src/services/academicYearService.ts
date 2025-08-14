import { supabase } from '../lib/supabase';

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  periods: any[];
  holidays: any[];
  createdAt: string;
  updatedAt: string;
}

export class AcademicYearService {
  // Obtenir toutes les années scolaires
  static async getAcademicYears(): Promise<AcademicYear[]> {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('name', { ascending: false });

      if (error) throw error;
      return data?.map(this.mapAcademicYearFromDB) || [];
    } catch (error) {
      console.error('Erreur lors du chargement des années scolaires:', error);
      throw error;
    }
  }

  // Obtenir l'année scolaire active
  static async getActiveAcademicYear(): Promise<AcademicYear | null> {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucune année active trouvée
          return null;
        }
        throw error;
      }

      return this.mapAcademicYearFromDB(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'année active:', error);
      return null;
    }
  }

  // Créer une nouvelle année scolaire
  static async createAcademicYear(yearData: {
    name: string;
    startDate: string;
    endDate: string;
    periods?: any[];
    holidays?: any[];
  }): Promise<AcademicYear> {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .insert({
          name: yearData.name,
          start_date: yearData.startDate,
          end_date: yearData.endDate,
          periods: yearData.periods || [],
          holidays: yearData.holidays || [],
          is_active: false
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapAcademicYearFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la création de l\'année scolaire:', error);
      throw error;
    }
  }

  // Définir une année comme active
  static async setActiveAcademicYear(yearId: string): Promise<AcademicYear> {
    try {
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
      return this.mapAcademicYearFromDB(data);
    } catch (error) {
      console.error('Erreur lors de l\'activation de l\'année:', error);
      throw error;
    }
  }

  // Mettre à jour une année scolaire
  static async updateAcademicYear(yearId: string, updates: Partial<AcademicYear>): Promise<AcademicYear> {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.startDate && { start_date: updates.startDate }),
          ...(updates.endDate && { end_date: updates.endDate }),
          ...(updates.periods && { periods: updates.periods }),
          ...(updates.holidays && { holidays: updates.holidays }),
          updated_at: new Date().toISOString()
        })
        .eq('id', yearId)
        .select()
        .single();

      if (error) throw error;
      return this.mapAcademicYearFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'année:', error);
      throw error;
    }
  }

  // Obtenir les périodes d'évaluation
  static async getGradePeriods(schoolId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from('grade_periods')
        .select('*')
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .order('start_date');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des périodes:', error);
      throw error;
    }
  }

  // Créer une période d'évaluation
  static async createGradePeriod(periodData: {
    schoolId: string;
    academicYearId: string;
    name: string;
    startDate: string;
    endDate: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('grade_periods')
        .insert({
          school_id: periodData.schoolId,
          academic_year_id: periodData.academicYearId,
          name: periodData.name,
          start_date: periodData.startDate,
          end_date: periodData.endDate
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la période:', error);
      throw error;
    }
  }

  // Mapper les données de la DB
  private static mapAcademicYearFromDB(dbYear: any): AcademicYear {
    return {
      id: dbYear.id,
      name: dbYear.name,
      startDate: dbYear.start_date,
      endDate: dbYear.end_date,
      isActive: dbYear.is_active,
      periods: dbYear.periods || [],
      holidays: dbYear.holidays || [],
      createdAt: dbYear.created_at,
      updatedAt: dbYear.updated_at
    };
  }
}