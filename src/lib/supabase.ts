import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour TypeScript
export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          address: string;
          phone: string | null;
          email: string | null;
          director: string | null;
          founded_year: string | null;
          student_capacity: number;
          motto: string | null;
          logo_url: string | null;
          is_active: boolean;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          phone?: string;
          email?: string;
          director?: string;
          founded_year?: string;
          student_capacity?: number;
          motto?: string;
          logo_url?: string;
          is_active?: boolean;
          settings?: any;
        };
        Update: {
          name?: string;
          address?: string;
          phone?: string;
          email?: string;
          director?: string;
          founded_year?: string;
          student_capacity?: number;
          motto?: string;
          logo_url?: string;
          is_active?: boolean;
          settings?: any;
        };
      };
      academic_years: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active: boolean;
          periods: any;
          holidays: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          periods?: any;
          holidays?: any;
        };
        Update: {
          name?: string;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          periods?: any;
          holidays?: any;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          email: string;
          role: 'Admin' | 'Directeur' | 'Secrétaire' | 'Enseignant' | 'Comptable';
          permissions: any;
          avatar_url: string | null;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          school_id: string;
          name: string;
          email: string;
          role: 'Admin' | 'Directeur' | 'Secrétaire' | 'Enseignant' | 'Comptable';
          permissions?: any;
          avatar_url?: string;
          is_active?: boolean;
        };
        Update: {
          school_id?: string;
          name?: string;
          email?: string;
          role?: 'Admin' | 'Directeur' | 'Secrétaire' | 'Enseignant' | 'Comptable';
          permissions?: any;
          avatar_url?: string;
          is_active?: boolean;
          last_login?: string;
        };
      };
      students: {
        Row: {
          id: string;
          school_id: string;
          first_name: string;
          last_name: string;
          gender: 'Masculin' | 'Féminin';
          date_of_birth: string;
          birth_place: string | null;
          nationality: string;
          religion: string | null;
          blood_type: string | null;
          mother_tongue: string;
          father_name: string | null;
          father_phone: string | null;
          father_occupation: string | null;
          mother_name: string | null;
          mother_phone: string | null;
          mother_occupation: string | null;
          guardian_type: string;
          number_of_siblings: number;
          transport_mode: string;
          medical_info: string | null;
          allergies: string | null;
          previous_school: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relation: string | null;
          parent_email: string;
          address: string;
          status: 'Actif' | 'Inactif' | 'Suspendu';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          first_name: string;
          last_name: string;
          gender: 'Masculin' | 'Féminin';
          date_of_birth: string;
          birth_place?: string;
          nationality?: string;
          religion?: string;
          blood_type?: string;
          mother_tongue?: string;
          father_name?: string;
          father_phone?: string;
          father_occupation?: string;
          mother_name?: string;
          mother_phone?: string;
          mother_occupation?: string;
          guardian_type?: string;
          number_of_siblings?: number;
          transport_mode?: string;
          medical_info?: string;
          allergies?: string;
          previous_school?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          emergency_contact_relation?: string;
          parent_email: string;
          address: string;
          status?: 'Actif' | 'Inactif' | 'Suspendu';
        };
        Update: {
          first_name?: string;
          last_name?: string;
          gender?: 'Masculin' | 'Féminin';
          date_of_birth?: string;
          birth_place?: string;
          nationality?: string;
          religion?: string;
          blood_type?: string;
          mother_tongue?: string;
          father_name?: string;
          father_phone?: string;
          father_occupation?: string;
          mother_name?: string;
          mother_phone?: string;
          mother_occupation?: string;
          guardian_type?: string;
          number_of_siblings?: number;
          transport_mode?: string;
          medical_info?: string;
          allergies?: string;
          previous_school?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          emergency_contact_relation?: string;
          parent_email?: string;
          address?: string;
          status?: 'Actif' | 'Inactif' | 'Suspendu';
        };
      };
      // Ajoutez d'autres types selon vos besoins
    };
    Views: {
      enrollment_details: {
        Row: {
          id: string;
          enrollment_date: string;
          total_fees: number;
          paid_amount: number;
          outstanding_amount: number;
          payment_status: string;
          is_active: boolean;
          student_id: string;
          first_name: string;
          last_name: string;
          gender: string;
          date_of_birth: string;
          parent_email: string;
          father_phone: string | null;
          mother_phone: string | null;
          class_id: string;
          class_name: string;
          level: string;
          school_id: string;
          school_name: string;
          academic_year_id: string;
          academic_year: string;
          teacher_first_name: string | null;
          teacher_last_name: string | null;
        };
      };
      teacher_assignment_details: {
        Row: {
          id: string;
          assignment_date: string;
          salary_amount: number;
          salary_currency: string;
          is_active: boolean;
          teacher_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          qualification: string | null;
          experience: string | null;
          specializations: any;
          class_id: string;
          class_name: string;
          level: string;
          capacity: number;
          current_students: number;
          school_id: string;
          school_name: string;
          academic_year_id: string;
          academic_year: string;
        };
      };
      schedule_details: {
        Row: {
          id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          day_name: string;
          subject_name: string;
          coefficient: number;
          teacher_first_name: string;
          teacher_last_name: string;
          class_name: string;
          level: string;
          classroom_name: string | null;
          classroom_capacity: number | null;
          school_name: string;
          academic_year: string;
        };
      };
    };
    Functions: {
      get_school_dashboard: {
        Args: {
          p_school_id: string;
          p_academic_year_id: string;
        };
        Returns: any;
      };
      calculate_student_average: {
        Args: {
          p_student_id: string;
          p_grade_period_id: string;
        };
        Returns: number;
      };
      generate_bulletin: {
        Args: {
          p_student_id: string;
          p_grade_period_id: string;
        };
        Returns: string;
      };
    };
  };
}