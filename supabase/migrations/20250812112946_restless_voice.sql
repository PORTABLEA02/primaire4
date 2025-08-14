/*
  # Vues et fonctions utilitaires pour le système de gestion scolaire

  1. Vues pour simplifier les requêtes complexes
    - `enrollment_details` - Vue complète des inscriptions
    - `teacher_assignment_details` - Vue des affectations enseignants
    - `schedule_details` - Vue de l'emploi du temps
    - `grade_details` - Vue des notes avec détails

  2. Fonctions de calcul
    - `calculate_student_average` - Moyenne d'un élève
    - `calculate_student_rank` - Classement dans la classe
    - `get_class_academic_stats` - Statistiques de classe
    - `get_school_dashboard` - Données du tableau de bord
    - `get_school_financial_stats` - Statistiques financières
    - `generate_bulletin` - Génération de bulletin
    - `archive_academic_year` - Archivage d'année
*/

-- Vue complète des inscriptions avec détails élève/classe/école
CREATE OR REPLACE VIEW enrollment_details AS
SELECT 
  sce.id,
  sce.enrollment_date,
  sce.total_fees,
  sce.paid_amount,
  sce.outstanding_amount,
  sce.payment_status,
  sce.payment_method,
  sce.mobile_number,
  sce.bank_details,
  sce.notes,
  sce.is_active,
  -- Informations élève
  s.id as student_id,
  s.first_name,
  s.last_name,
  s.gender,
  s.date_of_birth,
  s.nationality,
  s.parent_email,
  s.father_name,
  s.father_phone,
  s.mother_name,
  s.mother_phone,
  s.address,
  s.emergency_contact_name,
  s.emergency_contact_phone,
  -- Informations classe
  c.id as class_id,
  c.name as class_name,
  c.level,
  c.capacity as class_capacity,
  c.current_students,
  -- Informations école
  sch.id as school_id,
  sch.name as school_name,
  -- Informations année scolaire
  ay.id as academic_year_id,
  ay.name as academic_year,
  -- Informations enseignant (via affectation)
  t.first_name as teacher_first_name,
  t.last_name as teacher_last_name
FROM student_class_enrollments sce
JOIN students s ON sce.student_id = s.id
JOIN classes c ON sce.class_id = c.id
JOIN schools sch ON sce.school_id = sch.id
JOIN academic_years ay ON sce.academic_year_id = ay.id
LEFT JOIN teacher_class_assignments tca ON (c.id = tca.class_id AND tca.is_active = true)
LEFT JOIN teachers t ON tca.teacher_id = t.id;

-- Vue des affectations enseignants avec détails
CREATE OR REPLACE VIEW teacher_assignment_details AS
SELECT 
  tca.id,
  tca.assignment_date,
  tca.salary_amount,
  tca.salary_currency,
  tca.is_active,
  -- Informations enseignant
  t.id as teacher_id,
  t.first_name,
  t.last_name,
  t.email,
  t.phone,
  t.qualification,
  t.experience,
  t.specializations,
  t.performance_rating,
  -- Informations classe
  c.id as class_id,
  c.name as class_name,
  c.level,
  c.capacity,
  c.current_students,
  c.subjects,
  -- Informations école
  sch.id as school_id,
  sch.name as school_name,
  -- Informations année scolaire
  ay.id as academic_year_id,
  ay.name as academic_year
FROM teacher_class_assignments tca
JOIN teachers t ON tca.teacher_id = t.id
JOIN classes c ON tca.class_id = c.id
JOIN schools sch ON tca.school_id = sch.id
JOIN academic_years ay ON tca.academic_year_id = ay.id;

-- Vue de l'emploi du temps avec tous les détails
CREATE OR REPLACE VIEW schedule_details AS
SELECT 
  ss.id,
  ss.day_of_week,
  ss.start_time,
  ss.end_time,
  ss.is_active,
  -- Nom du jour
  CASE ss.day_of_week
    WHEN 1 THEN 'Lundi'
    WHEN 2 THEN 'Mardi'
    WHEN 3 THEN 'Mercredi'
    WHEN 4 THEN 'Jeudi'
    WHEN 5 THEN 'Vendredi'
    WHEN 6 THEN 'Samedi'
    WHEN 7 THEN 'Dimanche'
  END as day_name,
  -- Informations matière
  subj.name as subject_name,
  subj.coefficient,
  -- Informations enseignant
  t.first_name as teacher_first_name,
  t.last_name as teacher_last_name,
  -- Informations classe
  c.name as class_name,
  c.level,
  -- Informations salle
  cr.name as classroom_name,
  cr.capacity as classroom_capacity,
  -- Informations école
  sch.name as school_name,
  -- Informations année scolaire
  ay.name as academic_year
FROM schedule_slots ss
JOIN subjects subj ON ss.subject_id = subj.id
JOIN teachers t ON ss.teacher_id = t.id
JOIN classes c ON ss.class_id = c.id
JOIN schools sch ON ss.school_id = sch.id
JOIN academic_years ay ON ss.academic_year_id = ay.id
LEFT JOIN classrooms cr ON ss.classroom_id = cr.id;

-- Vue des notes avec informations complètes
CREATE OR REPLACE VIEW grade_details AS
SELECT 
  g.id,
  g.grade_value,
  g.coefficient,
  g.evaluation_type,
  g.evaluation_title,
  g.evaluation_date,
  g.teacher_comment,
  g.created_at,
  -- Informations élève
  s.id as student_id,
  s.first_name as student_first_name,
  s.last_name as student_last_name,
  -- Informations matière
  subj.name as subject_name,
  subj.coefficient as subject_coefficient,
  -- Informations classe
  c.name as class_name,
  c.level,
  -- Informations enseignant
  t.first_name as teacher_first_name,
  t.last_name as teacher_last_name,
  -- Informations période
  gp.name as period_name,
  gp.start_date as period_start,
  gp.end_date as period_end,
  -- Informations école
  sch.name as school_name,
  -- Informations année scolaire
  ay.name as academic_year
FROM grades g
JOIN students s ON g.student_id = s.id
JOIN subjects subj ON g.subject_id = subj.id
JOIN classes c ON g.class_id = c.id
JOIN teachers t ON g.teacher_id = t.id
JOIN grade_periods gp ON g.grade_period_id = gp.id
JOIN schools sch ON g.school_id = sch.id
JOIN academic_years ay ON g.academic_year_id = ay.id;

-- Fonction pour calculer la moyenne d'un élève
CREATE OR REPLACE FUNCTION calculate_student_average(
  p_student_id uuid,
  p_grade_period_id uuid
)
RETURNS decimal(4,2) AS $$
DECLARE
  weighted_sum decimal(10,2) := 0;
  total_coefficients integer := 0;
  grade_record RECORD;
BEGIN
  -- Calculer la moyenne pondérée
  FOR grade_record IN
    SELECT grade_value, coefficient
    FROM grades
    WHERE student_id = p_student_id 
      AND grade_period_id = p_grade_period_id
  LOOP
    weighted_sum := weighted_sum + (grade_record.grade_value * grade_record.coefficient);
    total_coefficients := total_coefficients + grade_record.coefficient;
  END LOOP;

  -- Retourner la moyenne ou 0 si pas de notes
  IF total_coefficients > 0 THEN
    RETURN weighted_sum / total_coefficients;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer le rang d'un élève dans sa classe
CREATE OR REPLACE FUNCTION calculate_student_rank(
  p_student_id uuid,
  p_grade_period_id uuid
)
RETURNS integer AS $$
DECLARE
  student_average decimal(4,2);
  student_rank integer;
  class_id_val uuid;
BEGIN
  -- Obtenir la classe de l'élève
  SELECT DISTINCT class_id INTO class_id_val
  FROM grades
  WHERE student_id = p_student_id 
    AND grade_period_id = p_grade_period_id;

  -- Calculer la moyenne de l'élève
  student_average := calculate_student_average(p_student_id, p_grade_period_id);

  -- Calculer le rang
  SELECT COUNT(*) + 1 INTO student_rank
  FROM (
    SELECT DISTINCT student_id
    FROM grades
    WHERE class_id = class_id_val 
      AND grade_period_id = p_grade_period_id
  ) class_students
  WHERE calculate_student_average(class_students.student_id, p_grade_period_id) > student_average;

  RETURN student_rank;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques académiques d'une classe
CREATE OR REPLACE FUNCTION get_class_academic_stats(
  p_class_id uuid,
  p_grade_period_id uuid
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  total_students integer;
  class_average decimal(4,2);
  pass_rate decimal(4,2);
  subject_stats jsonb := '[]'::jsonb;
  subject_record RECORD;
BEGIN
  -- Compter les élèves de la classe
  SELECT COUNT(DISTINCT student_id) INTO total_students
  FROM grades
  WHERE class_id = p_class_id 
    AND grade_period_id = p_grade_period_id;

  -- Calculer la moyenne de classe
  SELECT AVG(calculate_student_average(DISTINCT student_id, p_grade_period_id)) INTO class_average
  FROM grades
  WHERE class_id = p_class_id 
    AND grade_period_id = p_grade_period_id;

  -- Calculer le taux de réussite
  SELECT 
    (COUNT(*) FILTER (WHERE calculate_student_average(student_id, p_grade_period_id) >= 10.0) * 100.0 / COUNT(*))
  INTO pass_rate
  FROM (
    SELECT DISTINCT student_id
    FROM grades
    WHERE class_id = p_class_id 
      AND grade_period_id = p_grade_period_id
  ) class_students;

  -- Statistiques par matière
  FOR subject_record IN
    SELECT 
      s.name as subject_name,
      s.coefficient,
      AVG(g.grade_value) as subject_average,
      COUNT(g.grade_value) as grade_count
    FROM grades g
    JOIN subjects s ON g.subject_id = s.id
    WHERE g.class_id = p_class_id 
      AND g.grade_period_id = p_grade_period_id
    GROUP BY s.id, s.name, s.coefficient
  LOOP
    subject_stats := subject_stats || jsonb_build_object(
      'subject', subject_record.subject_name,
      'coefficient', subject_record.coefficient,
      'average', subject_record.subject_average,
      'gradeCount', subject_record.grade_count
    );
  END LOOP;

  -- Construire le résultat
  result := jsonb_build_object(
    'totalStudents', total_students,
    'classAverage', COALESCE(class_average, 0),
    'passRate', COALESCE(pass_rate, 0),
    'subjectStats', subject_stats
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les données du tableau de bord
CREATE OR REPLACE FUNCTION get_school_dashboard(
  p_school_id uuid,
  p_academic_year_id uuid
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  total_students integer;
  total_teachers integer;
  total_classes integer;
  total_revenue decimal(10,2);
  outstanding_amount decimal(10,2);
  recent_enrollments integer;
BEGIN
  -- Compter les élèves inscrits
  SELECT COUNT(*) INTO total_students
  FROM student_class_enrollments
  WHERE school_id = p_school_id 
    AND academic_year_id = p_academic_year_id 
    AND is_active = true;

  -- Compter les enseignants actifs
  SELECT COUNT(*) INTO total_teachers
  FROM teachers
  WHERE school_id = p_school_id 
    AND status = 'Actif';

  -- Compter les classes
  SELECT COUNT(*) INTO total_classes
  FROM classes
  WHERE school_id = p_school_id 
    AND academic_year_id = p_academic_year_id;

  -- Calculer les revenus totaux
  SELECT COALESCE(SUM(amount), 0) INTO total_revenue
  FROM payment_transactions
  WHERE school_id = p_school_id 
    AND status = 'Confirmé';

  -- Calculer les impayés
  SELECT COALESCE(SUM(outstanding_amount), 0) INTO outstanding_amount
  FROM student_class_enrollments
  WHERE school_id = p_school_id 
    AND academic_year_id = p_academic_year_id 
    AND is_active = true;

  -- Compter les inscriptions récentes (30 derniers jours)
  SELECT COUNT(*) INTO recent_enrollments
  FROM student_class_enrollments
  WHERE school_id = p_school_id 
    AND academic_year_id = p_academic_year_id 
    AND enrollment_date >= CURRENT_DATE - INTERVAL '30 days';

  -- Construire le résultat
  result := jsonb_build_object(
    'totalStudents', total_students,
    'totalTeachers', total_teachers,
    'totalClasses', total_classes,
    'totalRevenue', total_revenue,
    'outstandingAmount', outstanding_amount,
    'recentEnrollments', recent_enrollments,
    'collectionRate', 
      CASE 
        WHEN (total_revenue + outstanding_amount) > 0 
        THEN (total_revenue * 100.0 / (total_revenue + outstanding_amount))
        ELSE 0 
      END
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques financières
CREATE OR REPLACE FUNCTION get_school_financial_stats(
  p_school_id uuid,
  p_academic_year_id uuid
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  revenue_by_method jsonb := '{}'::jsonb;
  revenue_by_type jsonb := '{}'::jsonb;
  outstanding_by_level jsonb := '{}'::jsonb;
  method_record RECORD;
  type_record RECORD;
  level_record RECORD;
BEGIN
  -- Revenus par méthode de paiement
  FOR method_record IN
    SELECT 
      pm.name as method_name,
      COALESCE(SUM(pt.amount), 0) as total_amount
    FROM payment_methods pm
    LEFT JOIN payment_transactions pt ON (pm.id = pt.payment_method_id AND pt.school_id = p_school_id AND pt.status = 'Confirmé')
    WHERE pm.school_id = p_school_id
    GROUP BY pm.id, pm.name
  LOOP
    revenue_by_method := revenue_by_method || jsonb_build_object(method_record.method_name, method_record.total_amount);
  END LOOP;

  -- Revenus par type de paiement
  FOR type_record IN
    SELECT 
      payment_type,
      SUM(amount) as total_amount
    FROM payment_transactions
    WHERE school_id = p_school_id 
      AND status = 'Confirmé'
    GROUP BY payment_type
  LOOP
    revenue_by_type := revenue_by_type || jsonb_build_object(type_record.payment_type, type_record.total_amount);
  END LOOP;

  -- Impayés par niveau
  FOR level_record IN
    SELECT 
      level,
      SUM(outstanding_amount) as total_outstanding
    FROM enrollment_details
    WHERE school_id = p_school_id 
      AND academic_year_id = p_academic_year_id 
      AND outstanding_amount > 0
      AND is_active = true
    GROUP BY level
  LOOP
    outstanding_by_level := outstanding_by_level || jsonb_build_object(level_record.level, level_record.total_outstanding);
  END LOOP;

  -- Construire le résultat
  result := jsonb_build_object(
    'revenueByMethod', revenue_by_method,
    'revenueByType', revenue_by_type,
    'outstandingByLevel', outstanding_by_level
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un bulletin
CREATE OR REPLACE FUNCTION generate_bulletin(
  p_student_id uuid,
  p_grade_period_id uuid
)
RETURNS uuid AS $$
DECLARE
  bulletin_id uuid;
  student_average decimal(4,2);
  student_rank integer;
  total_students integer;
  class_id_val uuid;
  school_id_val uuid;
  academic_year_id_val uuid;
BEGIN
  -- Obtenir les informations de base
  SELECT DISTINCT 
    g.class_id, 
    g.school_id, 
    g.academic_year_id
  INTO class_id_val, school_id_val, academic_year_id_val
  FROM grades g
  WHERE g.student_id = p_student_id 
    AND g.grade_period_id = p_grade_period_id;

  -- Calculer la moyenne et le rang
  student_average := calculate_student_average(p_student_id, p_grade_period_id);
  student_rank := calculate_student_rank(p_student_id, p_grade_period_id);

  -- Compter le total d'élèves dans la classe
  SELECT COUNT(DISTINCT student_id) INTO total_students
  FROM grades
  WHERE class_id = class_id_val 
    AND grade_period_id = p_grade_period_id;

  -- Créer ou mettre à jour le bulletin
  INSERT INTO bulletins (
    student_id,
    class_id,
    school_id,
    academic_year_id,
    grade_period_id,
    general_average,
    class_rank,
    total_students,
    conduct_grade,
    decision,
    generated_by
  ) VALUES (
    p_student_id,
    class_id_val,
    school_id_val,
    academic_year_id_val,
    p_grade_period_id,
    student_average,
    student_rank,
    total_students,
    'Bien', -- Valeur par défaut
    CASE 
      WHEN student_average >= 10 THEN 'Admis'
      ELSE 'En cours'
    END,
    auth.uid()
  )
  ON CONFLICT (student_id, grade_period_id) 
  DO UPDATE SET
    general_average = EXCLUDED.general_average,
    class_rank = EXCLUDED.class_rank,
    total_students = EXCLUDED.total_students,
    decision = EXCLUDED.decision,
    generated_at = now(),
    updated_at = now()
  RETURNING id INTO bulletin_id;

  RETURN bulletin_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour archiver une année scolaire
CREATE OR REPLACE FUNCTION archive_academic_year(
  p_academic_year_id uuid
)
RETURNS boolean AS $$
BEGIN
  -- Désactiver l'année scolaire
  UPDATE academic_years 
  SET is_active = false 
  WHERE id = p_academic_year_id;

  -- Marquer toutes les inscriptions comme archivées
  UPDATE student_class_enrollments 
  SET is_active = false 
  WHERE academic_year_id = p_academic_year_id;

  -- Marquer toutes les affectations comme archivées
  UPDATE teacher_class_assignments 
  SET is_active = false 
  WHERE academic_year_id = p_academic_year_id;

  UPDATE classroom_class_assignments 
  SET is_active = false 
  WHERE academic_year_id = p_academic_year_id;

  -- Marquer tous les créneaux comme archivés
  UPDATE schedule_slots 
  SET is_active = false 
  WHERE academic_year_id = p_academic_year_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les élèves avec impayés
CREATE OR REPLACE FUNCTION get_students_with_outstanding_payments(
  p_school_id uuid,
  p_academic_year_id uuid
)
RETURNS TABLE (
  student_id uuid,
  student_name text,
  class_name text,
  outstanding_amount decimal(10,2),
  parent_email text,
  parent_phone text,
  days_overdue integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ed.student_id,
    (ed.first_name || ' ' || ed.last_name) as student_name,
    ed.class_name,
    ed.outstanding_amount,
    ed.parent_email,
    COALESCE(ed.father_phone, ed.mother_phone) as parent_phone,
    (CURRENT_DATE - ed.enrollment_date)::integer as days_overdue
  FROM enrollment_details ed
  WHERE ed.school_id = p_school_id
    AND ed.academic_year_id = p_academic_year_id
    AND ed.outstanding_amount > 0
    AND ed.is_active = true
  ORDER BY ed.outstanding_amount DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le top des élèves par classe
CREATE OR REPLACE FUNCTION get_top_students_by_class(
  p_class_id uuid,
  p_grade_period_id uuid,
  p_limit integer DEFAULT 3
)
RETURNS TABLE (
  student_id uuid,
  student_name text,
  general_average decimal(4,2),
  class_rank integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as student_id,
    (s.first_name || ' ' || s.last_name) as student_name,
    calculate_student_average(s.id, p_grade_period_id) as general_average,
    calculate_student_rank(s.id, p_grade_period_id) as class_rank
  FROM students s
  JOIN grades g ON s.id = g.student_id
  WHERE g.class_id = p_class_id 
    AND g.grade_period_id = p_grade_period_id
  GROUP BY s.id, s.first_name, s.last_name
  ORDER BY calculate_student_average(s.id, p_grade_period_id) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier la capacité d'une classe
CREATE OR REPLACE FUNCTION check_class_capacity(
  p_class_id uuid
)
RETURNS jsonb AS $$
DECLARE
  class_info RECORD;
  result jsonb;
BEGIN
  SELECT 
    c.name,
    c.capacity,
    c.current_students,
    (c.current_students * 100.0 / c.capacity) as fill_rate
  INTO class_info
  FROM classes c
  WHERE c.id = p_class_id;

  result := jsonb_build_object(
    'className', class_info.name,
    'capacity', class_info.capacity,
    'currentStudents', class_info.current_students,
    'availableSpaces', class_info.capacity - class_info.current_students,
    'fillRate', class_info.fill_rate,
    'status', 
      CASE 
        WHEN class_info.fill_rate >= 100 THEN 'Complète'
        WHEN class_info.fill_rate >= 90 THEN 'Presque pleine'
        WHEN class_info.fill_rate >= 75 THEN 'Bien remplie'
        ELSE 'Disponible'
      END
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;