import { supabase } from '../lib/supabase';

export class SupabaseHelpers {
  // Fonction générique pour les requêtes avec pagination
  static async getPaginatedData<T>(
    table: string,
    options: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{ data: T[]; count: number; hasMore: boolean }> {
    try {
      const {
        select = '*',
        filters = {},
        orderBy,
        page = 1,
        pageSize = 50
      } = options;

      let query = supabase
        .from(table)
        .select(select, { count: 'exact' });

      // Appliquer les filtres
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      // Appliquer l'ordre
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Appliquer la pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        hasMore: (count || 0) > page * pageSize
      };
    } catch (error) {
      console.error('Erreur lors de la requête paginée:', error);
      throw error;
    }
  }

  // Fonction pour les requêtes de recherche
  static async searchData<T>(
    table: string,
    searchTerm: string,
    searchColumns: string[],
    options: {
      select?: string;
      filters?: Record<string, any>;
      limit?: number;
    } = {}
  ): Promise<T[]> {
    try {
      const { select = '*', filters = {}, limit = 50 } = options;

      let query = supabase
        .from(table)
        .select(select);

      // Appliquer les filtres
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      // Appliquer la recherche
      if (searchTerm) {
        const searchConditions = searchColumns
          .map(col => `${col}.ilike.%${searchTerm}%`)
          .join(',');
        query = query.or(searchConditions);
      }

      const { data, error } = await query.limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw error;
    }
  }

  // Fonction pour les mises à jour en lot
  static async bulkUpdate(
    table: string,
    updates: Array<{ id: string; data: Record<string, any> }>
  ): Promise<any[]> {
    try {
      const results = await Promise.all(
        updates.map(({ id, data }) =>
          supabase
            .from(table)
            .update(data)
            .eq('id', id)
            .select()
            .single()
        )
      );

      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Erreurs lors de la mise à jour: ${errors.length} échecs`);
      }

      return results.map(result => result.data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour en lot:', error);
      throw error;
    }
  }

  // Fonction pour les insertions en lot
  static async bulkInsert<T>(
    table: string,
    records: Record<string, any>[]
  ): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(table)
        .insert(records)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de l\'insertion en lot:', error);
      throw error;
    }
  }

  // Fonction pour obtenir des statistiques agrégées
  static async getAggregatedStats(
    table: string,
    aggregations: Array<{
      column: string;
      function: 'count' | 'sum' | 'avg' | 'min' | 'max';
      alias?: string;
    }>,
    filters: Record<string, any> = {}
  ): Promise<any> {
    try {
      const selectClause = aggregations
        .map(agg => `${agg.function}(${agg.column})${agg.alias ? ` as ${agg.alias}` : ''}`)
        .join(', ');

      let query = supabase
        .from(table)
        .select(selectClause);

      // Appliquer les filtres
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  }

  // Fonction pour vérifier l'existence d'un enregistrement
  static async recordExists(
    table: string,
    filters: Record<string, any>
  ): Promise<boolean> {
    try {
      let query = supabase
        .from(table)
        .select('id', { count: 'exact', head: true });

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { count, error } = await query;

      if (error) throw error;
      return (count || 0) > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'existence:', error);
      return false;
    }
  }

  // Fonction pour obtenir le prochain ID disponible
  static async getNextSequenceValue(table: string, column: string = 'id'): Promise<number> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(column)
        .order(column, { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && typeof data[column] === 'number') {
        return data[column] + 1;
      }
      
      return 1;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du prochain ID:', error);
      return 1;
    }
  }
}