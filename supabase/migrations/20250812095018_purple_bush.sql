/*
  # Politiques de sécurité Row Level Security (RLS)

  1. Politiques basées sur l'école
    - Les utilisateurs ne voient que les données de leur école
    - Les admins système peuvent voir toutes les écoles

  2. Politiques basées sur les rôles
    - Directeur : accès complet à son école
    - Secrétaire : élèves, classes, inscriptions
    - Enseignant : ses classes et élèves
    - Comptable : données financières

  3. Politiques pour les logs
    - Lecture selon les permissions
    - Écriture automatique via triggers
*/

-- Fonction helper pour vérifier l'école de l'utilisateur
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT school_id 
    FROM user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction helper pour vérifier les permissions
CREATE OR REPLACE FUNCTION user_has_permission(permission_name text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT 
      role = 'Admin' OR 
      permissions ? permission_name OR
      permissions ? 'all'
    FROM user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politiques pour schools
CREATE POLICY "Users can read their school"
  ON schools
  FOR SELECT
  TO authenticated
  USING (
    id = get_user_school_id() OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Admins can manage schools"
  ON schools
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Politiques pour academic_years
CREATE POLICY "Users can read academic years"
  ON academic_years
  FOR SELECT
  TO authenticated
  USING (true); -- Années scolaires visibles par tous

CREATE POLICY "Admins and directors can manage academic years"
  ON academic_years
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Admin', 'Directeur')
    )
  );

-- Politiques pour user_profiles
CREATE POLICY "Users can read profiles from their school"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_user_school_id() OR
    id = auth.uid()
  );

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins and directors can manage user profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Admin', 'Directeur')
    )
  );

-- Politiques pour classrooms
CREATE POLICY "Users can read classrooms from their school"
  ON classrooms
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Admins and directors can manage classrooms"
  ON classrooms
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('classes')
  );

-- Politiques pour classes
CREATE POLICY "Users can read classes from their school"
  ON classes
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage classes"
  ON classes
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('classes')
  );

-- Politiques pour students
CREATE POLICY "Users can read students from their school"
  ON students
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage students"
  ON students
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('students')
  );

-- Politiques pour teachers
CREATE POLICY "Users can read teachers from their school"
  ON teachers
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage teachers"
  ON teachers
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('teachers')
  );

-- Politiques pour teacher_class_assignments
CREATE POLICY "Users can read assignments from their school"
  ON teacher_class_assignments
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage assignments"
  ON teacher_class_assignments
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('teachers')
  );

-- Politiques pour classroom_class_assignments
CREATE POLICY "Users can read classroom assignments from their school"
  ON classroom_class_assignments
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage classroom assignments"
  ON classroom_class_assignments
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('classes')
  );

-- Politiques pour student_class_enrollments
CREATE POLICY "Users can read enrollments from their school"
  ON student_class_enrollments
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage enrollments"
  ON student_class_enrollments
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    (user_has_permission('students') OR user_has_permission('finance'))
  );

-- Politiques pour subjects
CREATE POLICY "Users can read subjects from their school"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage subjects"
  ON subjects
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('academic')
  );

-- Politiques pour schedule_slots
CREATE POLICY "Users can read schedules from their school"
  ON schedule_slots
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage schedules"
  ON schedule_slots
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('schedule')
  );

-- Politiques pour fee_types
CREATE POLICY "Users can read fee types from their school"
  ON fee_types
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage fee types"
  ON fee_types
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('finance')
  );

-- Politiques pour payment_methods
CREATE POLICY "Users can read payment methods from their school"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage payment methods"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('finance')
  );

-- Politiques pour payment_transactions
CREATE POLICY "Users can read transactions from their school"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage transactions"
  ON payment_transactions
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('finance')
  );

-- Politiques pour grade_periods
CREATE POLICY "Users can read grade periods from their school"
  ON grade_periods
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage grade periods"
  ON grade_periods
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('academic')
  );

-- Politiques pour grades
CREATE POLICY "Users can read grades from their school"
  ON grades
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Teachers can manage grades for their classes"
  ON grades
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    (
      user_has_permission('academic') OR
      teacher_id IN (
        SELECT id FROM teachers 
        WHERE user_profile_id = auth.uid()
      )
    )
  );

-- Politiques pour bulletins
CREATE POLICY "Users can read bulletins from their school"
  ON bulletins
  FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "Authorized users can manage bulletins"
  ON bulletins
  FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    user_has_permission('academic')
  );

-- Politiques pour activity_logs
CREATE POLICY "Users can read logs from their school"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    (
      user_has_permission('settings') OR
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('Admin', 'Directeur')
      )
    )
  );

CREATE POLICY "System can insert logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);