import { supabase } from '../lib/supabase';

export class SubjectService {
  // Obtenir toutes les matières d'une école
  static async getSubjects(schoolId: string) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('school_id', schoolId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des matières:', error);
      throw error;
    }
  }

  // Créer une nouvelle matière
  static async createSubject(subjectData: {
    schoolId: string;
    name: string;
    description?: string;
    coefficient?: number;
    levels?: string[];
  }) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          school_id: subjectData.schoolId,
          name: subjectData.name,
          description: subjectData.description,
          coefficient: subjectData.coefficient || 1,
          levels: subjectData.levels || []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la matière:', error);
      throw error;
    }
  }

  // Mettre à jour une matière
  static async updateSubject(subjectId: string, updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', subjectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la matière:', error);
      throw error;
    }
  }

  // Supprimer une matière
  static async deleteSubject(subjectId: string) {
    try {
      // Vérifier qu'il n'y a pas de notes associées
      const { data: grades } = await supabase
        .from('grades')
        .select('id')
        .eq('subject_id', subjectId)
        .limit(1);

      if (grades && grades.length > 0) {
        throw new Error('Impossible de supprimer une matière avec des notes associées');
      }

      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de la matière:', error);
      throw error;
    }
  }

  // Obtenir les matières par niveau
  static async getSubjectsByLevel(schoolId: string, level: string) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('school_id', schoolId)
        .contains('levels', [level])
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des matières par niveau:', error);
      return [];
    }
  }
}