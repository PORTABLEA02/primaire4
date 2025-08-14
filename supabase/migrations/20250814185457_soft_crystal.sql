-- Supprimer l'ancienne vue
DROP VIEW IF EXISTS public.grade_details;

-- Recréer la vue avec les colonnes manquantes
CREATE VIEW public.grade_details AS
SELECT
  g.id,
  g.grade_value,
  g.coefficient,
  g.evaluation_type,
  g.evaluation_title,
  g.evaluation_date,
  g.teacher_comment,
  g.created_at,
  -- Colonnes manquantes ajoutées
  g.school_id,
  g.academic_year_id,
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