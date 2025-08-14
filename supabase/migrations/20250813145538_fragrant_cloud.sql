/*
  # Fix schedule_details view - Add missing teacher_id column

  1. Drop and recreate the schedule_details view
  2. Add the missing teacher_id column that is needed for teacher schedule queries
  3. Ensure all necessary columns are included for proper functionality
*/

-- Drop the existing view
DROP VIEW IF EXISTS schedule_details;

-- Recreate the view with all necessary columns including teacher_id
CREATE OR REPLACE VIEW schedule_details AS
SELECT 
  ss.id,
  ss.day_of_week,
  ss.start_time,
  ss.end_time,
  ss.is_active,
  ss.teacher_id,
  ss.class_id,
  ss.subject_id,
  ss.classroom_id,
  ss.school_id,
  ss.academic_year_id,
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