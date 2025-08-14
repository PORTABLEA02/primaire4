/*
  # Configuration de base de données pour système de gestion scolaire multi-école

  1. Tables principales
    - `schools` - Écoles du réseau
    - `academic_years` - Années scolaires
    - `user_profiles` - Profils utilisateurs liés aux écoles
    - `classrooms` - Salles de classe
    - `classes` - Classes/niveaux
    - `students` - Élèves
    - `teachers` - Enseignants
    - `subjects` - Matières

  2. Tables d'association
    - `teacher_class_assignments` - Association enseignant-classe-école-année (avec salaire)
    - `classroom_class_assignments` - Association salle-classe-école-année
    - `student_class_enrollments` - Inscriptions élèves avec suivi financier
    - `schedule_slots` - Créneaux d'emploi du temps

  3. Tables financières
    - `fee_types` - Types de frais
    - `payment_transactions` - Transactions de paiement
    - `payment_methods` - Méthodes de paiement

  4. Tables académiques
    - `grades` - Notes des élèves
    - `grade_periods` - Périodes d'évaluation
    - `bulletins` - Bulletins scolaires

  5. Système de logging
    - `activity_logs` - Journal d'activité complet

  6. Sécurité
    - RLS activé sur toutes les tables
    - Politiques basées sur l'école et les rôles
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des écoles
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  email text,
  director text,
  founded_year text,
  student_capacity integer DEFAULT 500,
  motto text,
  logo_url text,
  is_active boolean DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des années scolaires
CREATE TABLE IF NOT EXISTS academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, -- Ex: "2024-2025"
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT false,
  periods jsonb DEFAULT '[]', -- Trimestres/semestres
  holidays jsonb DEFAULT '[]', -- Vacances
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name)
);

-- Table des profils utilisateurs (liée à auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('Admin', 'Directeur', 'Secrétaire', 'Enseignant', 'Comptable')),
  permissions jsonb DEFAULT '[]',
  avatar_url text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des salles de classe
CREATE TABLE IF NOT EXISTS classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 30,
  type text DEFAULT 'Classe Standard' CHECK (type IN ('Classe Standard', 'Laboratoire', 'Espace Lecture', 'Sport', 'Informatique')),
  equipment jsonb DEFAULT '[]',
  floor integer,
  building text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des classes/niveaux
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE CASCADE,
  name text NOT NULL, -- Ex: "CM2A"
  level text NOT NULL, -- Ex: "CM2"
  capacity integer NOT NULL DEFAULT 35,
  current_students integer DEFAULT 0,
  subjects jsonb DEFAULT '[]', -- Matières enseignées
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des enseignants
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  qualification text,
  experience text,
  specializations jsonb DEFAULT '[]',
  hire_date date,
  emergency_contact text,
  status text DEFAULT 'Actif' CHECK (status IN ('Actif', 'Inactif', 'Congé')),
  performance_rating decimal(2,1) DEFAULT 4.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des élèves
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('Masculin', 'Féminin')),
  date_of_birth date NOT NULL,
  birth_place text,
  nationality text DEFAULT 'Malienne',
  religion text,
  blood_type text,
  mother_tongue text DEFAULT 'Bambara',
  father_name text,
  father_phone text,
  father_occupation text,
  mother_name text,
  mother_phone text,
  mother_occupation text,
  guardian_type text DEFAULT 'Parents',
  number_of_siblings integer DEFAULT 0,
  transport_mode text DEFAULT 'À pied',
  medical_info text,
  allergies text,
  previous_school text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  parent_email text NOT NULL,
  address text NOT NULL,
  status text DEFAULT 'Actif' CHECK (status IN ('Actif', 'Inactif', 'Suspendu')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table d'association enseignant-classe (avec salaire)
CREATE TABLE IF NOT EXISTS teacher_class_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE CASCADE,
  salary_amount decimal(10,2),
  salary_currency text DEFAULT 'FCFA',
  assignment_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(teacher_id, academic_year_id, school_id)
);

-- Table d'association salle-classe
CREATE TABLE IF NOT EXISTS classroom_class_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE CASCADE,
  assignment_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table d'inscription élève-classe avec suivi financier
CREATE TABLE IF NOT EXISTS student_class_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE CASCADE,
  enrollment_date date DEFAULT CURRENT_DATE,
  total_fees decimal(10,2) NOT NULL DEFAULT 0,
  paid_amount decimal(10,2) NOT NULL DEFAULT 0,
  outstanding_amount decimal(10,2) GENERATED ALWAYS AS (total_fees - paid_amount) STORED,
  payment_status text GENERATED ALWAYS AS (
    CASE 
      WHEN total_fees = paid_amount THEN 'À jour'
      WHEN paid_amount > 0  THEN 'Partiel'
      ELSE 'En retard'
    END
  ) STORED,
  payment_method text,
  mobile_number text,
  bank_details text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, academic_year_id, school_id)
);

-- Table des matières
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  coefficient integer DEFAULT 1,
  levels jsonb DEFAULT '[]', -- Niveaux concernés
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des créneaux d'emploi du temps
CREATE TABLE IF NOT EXISTS schedule_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE SET NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Lundi, 7=Dimanche
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Table des types de frais
CREATE TABLE IF NOT EXISTS fee_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount decimal(10,2) NOT NULL,
  level text, -- Niveau concerné ou 'Tous'
  is_mandatory boolean DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des méthodes de paiement
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('cash', 'mobile', 'bank')),
  is_enabled boolean DEFAULT true,
  fees_percentage decimal(4,2) DEFAULT 0,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des transactions de paiement
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES student_class_enrollments(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('Inscription', 'Scolarité', 'Cantine', 'Transport', 'Fournitures', 'Autre')),
  payment_date date DEFAULT CURRENT_DATE,
  reference_number text,
  mobile_number text,
  bank_details text,
  status text DEFAULT 'Confirmé' CHECK (status IN ('En attente', 'Confirmé', 'Échoué', 'Remboursé')),
  notes text,
  processed_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des périodes d'évaluation
CREATE TABLE IF NOT EXISTS grade_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE CASCADE,
  name text NOT NULL, -- Ex: "Trimestre 1"
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des notes
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE CASCADE,
  grade_period_id uuid REFERENCES grade_periods(id) ON DELETE CASCADE,
  grade_value decimal(4,2) NOT NULL CHECK (grade_value >= 0 AND grade_value <= 20),
  coefficient integer DEFAULT 1,
  evaluation_type text DEFAULT 'devoir' CHECK (evaluation_type IN ('devoir', 'composition', 'interrogation')),
  evaluation_title text,
  evaluation_date date DEFAULT CURRENT_DATE,
  teacher_comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des bulletins
CREATE TABLE IF NOT EXISTS bulletins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE CASCADE,
  grade_period_id uuid REFERENCES grade_periods(id) ON DELETE CASCADE,
  general_average decimal(4,2),
  class_rank integer,
  total_students integer,
  conduct_grade text,
  absences integer DEFAULT 0,
  teacher_comment text,
  decision text CHECK (decision IN ('Admis', 'Redouble', 'En cours')),
  generated_at timestamptz DEFAULT now(),
  generated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table de logging des activités
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL, -- 'student', 'teacher', 'payment', etc.
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  level text DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error', 'success')),
  details text,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_school ON user_profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_year ON classes(school_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_school_year ON student_class_enrollments(school_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_period ON grades(student_id, grade_period_id);
CREATE INDEX IF NOT EXISTS idx_schedule_class_year ON schedule_slots(class_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_payments_enrollment ON payment_transactions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_school_date ON activity_logs(school_id, created_at);

-- Contraintes d'unicité
ALTER TABLE user_profiles ADD CONSTRAINT unique_email_per_school UNIQUE(email, school_id);
ALTER TABLE classrooms ADD CONSTRAINT unique_classroom_name_per_school UNIQUE(name, school_id);
ALTER TABLE classes ADD CONSTRAINT unique_class_name_per_school_year UNIQUE(name, school_id, academic_year_id);
ALTER TABLE teachers ADD CONSTRAINT unique_teacher_email_per_school UNIQUE(email, school_id);