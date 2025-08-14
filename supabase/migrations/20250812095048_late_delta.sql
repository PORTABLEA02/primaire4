/*
  # Triggers et fonctions pour automatisation et logging

  1. Triggers de mise à jour des timestamps
  2. Triggers de logging automatique
  3. Fonctions de calcul automatique
  4. Triggers de validation des données
*/

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at sur toutes les tables principales
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_years_updated_at
  BEFORE UPDATE ON academic_years
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classrooms_updated_at
  BEFORE UPDATE ON classrooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON student_class_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction de logging automatique
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
  school_id_val uuid;
  user_id_val uuid;
  action_val text;
  entity_type_val text;
BEGIN
  -- Déterminer l'action
  IF TG_OP = 'INSERT' THEN
    action_val := 'CREATE';
  ELSIF TG_OP = 'UPDATE' THEN
    action_val := 'UPDATE';
  ELSIF TG_OP = 'DELETE' THEN
    action_val := 'DELETE';
  END IF;

  -- Déterminer le type d'entité
  entity_type_val := TG_TABLE_NAME;
  
  -- Obtenir l'ID de l'utilisateur
  user_id_val := auth.uid();
  
  -- Obtenir l'ID de l'école selon la table
  IF TG_TABLE_NAME = 'schools' THEN
    school_id_val := COALESCE(NEW.id, OLD.id);
  ELSIF TG_TABLE_NAME = 'user_profiles' THEN
    school_id_val := COALESCE(NEW.school_id, OLD.school_id);
  ELSIF TG_TABLE_NAME = 'students' THEN
    school_id_val := COALESCE(NEW.school_id, OLD.school_id);
  ELSIF TG_TABLE_NAME = 'teachers' THEN
    school_id_val := COALESCE(NEW.school_id, OLD.school_id);
  ELSIF TG_TABLE_NAME = 'classes' THEN
    school_id_val := COALESCE(NEW.school_id, OLD.school_id);
  ELSIF TG_TABLE_NAME = 'student_class_enrollments' THEN
    school_id_val := COALESCE(NEW.school_id, OLD.school_id);
  ELSIF TG_TABLE_NAME = 'payment_transactions' THEN
    school_id_val := COALESCE(NEW.school_id, OLD.school_id);
  ELSE
    -- Pour les autres tables, essayer de récupérer school_id
    school_id_val := get_user_school_id();
  END IF;

  -- Insérer le log
  INSERT INTO activity_logs (
    school_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    level,
    details
  ) VALUES (
    school_id_val,
    user_id_val,
    action_val,
    entity_type_val,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    'info',
    format('%s %s', action_val, entity_type_val)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers de logging sur les tables importantes
CREATE TRIGGER log_schools_activity
  AFTER INSERT OR UPDATE OR DELETE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_students_activity
  AFTER INSERT OR UPDATE OR DELETE ON students
  FOR EACH ROW
  EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_teachers_activity
  AFTER INSERT OR UPDATE OR DELETE ON teachers
  FOR EACH ROW
  EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_classes_activity
  AFTER INSERT OR UPDATE OR DELETE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_enrollments_activity
  AFTER INSERT OR UPDATE OR DELETE ON student_class_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_payments_activity
  AFTER INSERT OR UPDATE OR DELETE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_grades_activity
  AFTER INSERT OR UPDATE OR DELETE ON grades
  FOR EACH ROW
  EXECUTE FUNCTION log_activity();

-- Fonction pour mettre à jour le nombre d'élèves dans une classe
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE classes 
    SET current_students = (
      SELECT COUNT(*) 
      FROM student_class_enrollments 
      WHERE class_id = NEW.class_id 
        AND is_active = true
    )
    WHERE id = NEW.class_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Mettre à jour l'ancienne classe si elle a changé
    IF OLD.class_id != NEW.class_id THEN
      UPDATE classes 
      SET current_students = (
        SELECT COUNT(*) 
        FROM student_class_enrollments 
        WHERE class_id = OLD.class_id 
          AND is_active = true
      )
      WHERE id = OLD.class_id;
    END IF;
    
    -- Mettre à jour la nouvelle classe
    UPDATE classes 
    SET current_students = (
      SELECT COUNT(*) 
      FROM student_class_enrollments 
      WHERE class_id = NEW.class_id 
        AND is_active = true
    )
    WHERE id = NEW.class_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE classes 
    SET current_students = (
      SELECT COUNT(*) 
      FROM student_class_enrollments 
      WHERE class_id = OLD.class_id 
        AND is_active = true
    )
    WHERE id = OLD.class_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le nombre d'élèves
CREATE TRIGGER update_class_student_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON student_class_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_class_student_count();

-- Fonction pour mettre à jour le montant payé lors d'un nouveau paiement
CREATE OR REPLACE FUNCTION update_enrollment_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'Confirmé' THEN
    UPDATE student_class_enrollments 
    SET paid_amount = paid_amount + NEW.amount
    WHERE id = NEW.enrollment_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Si le statut change de non-confirmé à confirmé
    IF OLD.status != 'Confirmé' AND NEW.status = 'Confirmé' THEN
      UPDATE student_class_enrollments 
      SET paid_amount = paid_amount + NEW.amount
      WHERE id = NEW.enrollment_id;
    -- Si le statut change de confirmé à non-confirmé
    ELSIF OLD.status = 'Confirmé' AND NEW.status != 'Confirmé' THEN
      UPDATE student_class_enrollments 
      SET paid_amount = paid_amount - OLD.amount
      WHERE id = NEW.enrollment_id;
    -- Si le montant change et le paiement est confirmé
    ELSIF NEW.status = 'Confirmé' AND OLD.amount != NEW.amount THEN
      UPDATE student_class_enrollments 
      SET paid_amount = paid_amount - OLD.amount + NEW.amount
      WHERE id = NEW.enrollment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'Confirmé' THEN
    UPDATE student_class_enrollments 
    SET paid_amount = paid_amount - OLD.amount
    WHERE id = OLD.enrollment_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement les paiements
CREATE TRIGGER update_enrollment_payment_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_payment();

-- Fonction pour valider les créneaux d'emploi du temps
CREATE OR REPLACE FUNCTION validate_schedule_slot()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier qu'il n'y a pas de conflit pour l'enseignant
  IF EXISTS (
    SELECT 1 FROM schedule_slots 
    WHERE teacher_id = NEW.teacher_id 
      AND day_of_week = NEW.day_of_week
      AND school_id = NEW.school_id
      AND academic_year_id = NEW.academic_year_id
      AND is_active = true
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
        (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
        (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
        (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      )
  ) THEN
    RAISE EXCEPTION 'Conflit d''horaire pour l''enseignant';
  END IF;

  -- Vérifier qu'il n'y a pas de conflit pour la salle
  IF NEW.classroom_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM schedule_slots 
    WHERE classroom_id = NEW.classroom_id 
      AND day_of_week = NEW.day_of_week
      AND school_id = NEW.school_id
      AND academic_year_id = NEW.academic_year_id
      AND is_active = true
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
        (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
        (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
        (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      )
  ) THEN
    RAISE EXCEPTION 'Conflit d''horaire pour la salle de classe';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger de validation pour l'emploi du temps
CREATE TRIGGER validate_schedule_slot_trigger
  BEFORE INSERT OR UPDATE ON schedule_slots
  FOR EACH ROW
  EXECUTE FUNCTION validate_schedule_slot();

-- Fonction pour créer un profil utilisateur automatiquement
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, name, email, role, school_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'Secrétaire'),
    (NEW.raw_user_meta_data->>'school_id')::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil utilisateur
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();