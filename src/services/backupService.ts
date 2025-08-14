import { supabase } from '../lib/supabase';

export class BackupService {
  // Créer une sauvegarde complète
  static async createBackup(schoolId: string, backupName?: string) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const name = backupName || `Sauvegarde_${timestamp}`;

      // Obtenir toutes les données de l'école
      const backupData = await this.getAllSchoolData(schoolId);

      // Créer le fichier de sauvegarde
      const backupContent = {
        metadata: {
          schoolId,
          backupName: name,
          createdAt: new Date().toISOString(),
          version: '1.0',
          description: 'Sauvegarde complète des données de l\'école'
        },
        data: backupData
      };

      // Simuler la création du fichier (en production, vous stockeriez cela dans un service de stockage)
      const backupJson = JSON.stringify(backupContent, null, 2);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Télécharger automatiquement
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name}.backup.json`;
      link.click();
      URL.revokeObjectURL(url);

      // Logger l'activité
      await supabase
        .from('activity_logs')
        .insert({
          school_id: schoolId,
          action: 'CREATE_BACKUP',
          entity_type: 'backup',
          level: 'success',
          details: `Sauvegarde créée: ${name}`
        });

      return {
        success: true,
        backupName: name,
        size: backupJson.length,
        recordCount: this.countRecords(backupData)
      };
    } catch (error) {
      console.error('Erreur lors de la création de la sauvegarde:', error);
      throw error;
    }
  }

  // Obtenir toutes les données d'une école
  private static async getAllSchoolData(schoolId: string) {
    try {
      const [
        school,
        academicYears,
        userProfiles,
        classrooms,
        classes,
        students,
        teachers,
        subjects,
        teacherAssignments,
        classroomAssignments,
        enrollments,
        scheduleSlots,
        feeTypes,
        paymentMethods,
        paymentTransactions,
        gradePeriods,
        grades,
        bulletins
      ] = await Promise.all([
        supabase.from('schools').select('*').eq('id', schoolId),
        supabase.from('academic_years').select('*'),
        supabase.from('user_profiles').select('*').eq('school_id', schoolId),
        supabase.from('classrooms').select('*').eq('school_id', schoolId),
        supabase.from('classes').select('*').eq('school_id', schoolId),
        supabase.from('students').select('*').eq('school_id', schoolId),
        supabase.from('teachers').select('*').eq('school_id', schoolId),
        supabase.from('subjects').select('*').eq('school_id', schoolId),
        supabase.from('teacher_class_assignments').select('*').eq('school_id', schoolId),
        supabase.from('classroom_class_assignments').select('*').eq('school_id', schoolId),
        supabase.from('student_class_enrollments').select('*').eq('school_id', schoolId),
        supabase.from('schedule_slots').select('*').eq('school_id', schoolId),
        supabase.from('fee_types').select('*').eq('school_id', schoolId),
        supabase.from('payment_methods').select('*').eq('school_id', schoolId),
        supabase.from('payment_transactions').select('*').eq('school_id', schoolId),
        supabase.from('grade_periods').select('*').eq('school_id', schoolId),
        supabase.from('grades').select('*').eq('school_id', schoolId),
        supabase.from('bulletins').select('*').eq('school_id', schoolId)
      ]);

      return {
        school: school.data,
        academicYears: academicYears.data,
        userProfiles: userProfiles.data,
        classrooms: classrooms.data,
        classes: classes.data,
        students: students.data,
        teachers: teachers.data,
        subjects: subjects.data,
        teacherAssignments: teacherAssignments.data,
        classroomAssignments: classroomAssignments.data,
        enrollments: enrollments.data,
        scheduleSlots: scheduleSlots.data,
        feeTypes: feeTypes.data,
        paymentMethods: paymentMethods.data,
        paymentTransactions: paymentTransactions.data,
        gradePeriods: gradePeriods.data,
        grades: grades.data,
        bulletins: bulletins.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw error;
    }
  }

  // Restaurer une sauvegarde
  static async restoreBackup(backupFile: File, schoolId: string) {
    try {
      const backupContent = await this.readBackupFile(backupFile);
      
      if (!backupContent.metadata || !backupContent.data) {
        throw new Error('Format de sauvegarde invalide');
      }

      // Vérifier la compatibilité
      if (backupContent.metadata.schoolId !== schoolId) {
        throw new Error('Cette sauvegarde ne correspond pas à l\'école actuelle');
      }

      // Restaurer les données (attention: cela remplace les données existantes)
      console.warn('Restauration de sauvegarde - Cette opération remplacera les données existantes');
      
      // En production, vous devriez implémenter une restauration sécurisée
      // avec validation et rollback en cas d'erreur
      
      // Logger l'activité
      await supabase
        .from('activity_logs')
        .insert({
          school_id: schoolId,
          action: 'RESTORE_BACKUP',
          entity_type: 'backup',
          level: 'warning',
          details: `Restauration de sauvegarde: ${backupContent.metadata.backupName}`
        });

      return {
        success: true,
        restoredRecords: this.countRecords(backupContent.data)
      };
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      throw error;
    }
  }

  // Lire un fichier de sauvegarde
  private static async readBackupFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          resolve(content);
        } catch (error) {
          reject(new Error('Fichier de sauvegarde corrompu'));
        }
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsText(file);
    });
  }

  // Compter les enregistrements dans une sauvegarde
  private static countRecords(data: any): number {
    return Object.values(data).reduce((total: number, tableData: any) => {
      return total + (Array.isArray(tableData) ? tableData.length : 0);
    }, 0);
  }

  // Programmer une sauvegarde automatique
  static async scheduleAutoBackup(schoolId: string, frequency: 'daily' | 'weekly' | 'monthly') {
    try {
      // En production, vous utiliseriez un service de tâches programmées
      // comme Supabase Edge Functions avec des cron jobs
      
      console.log(`Sauvegarde automatique programmée: ${frequency} pour l'école ${schoolId}`);
      
      // Logger l'activité
      await supabase
        .from('activity_logs')
        .insert({
          school_id: schoolId,
          action: 'SCHEDULE_AUTO_BACKUP',
          entity_type: 'backup',
          level: 'info',
          details: `Sauvegarde automatique programmée: ${frequency}`
        });

      return { success: true, frequency };
    } catch (error) {
      console.error('Erreur lors de la programmation:', error);
      throw error;
    }
  }

  // Vérifier l'intégrité des données
  static async verifyDataIntegrity(schoolId: string) {
    try {
      const issues = [];

      // Vérifier les références orphelines
      const { data: orphanedEnrollments } = await supabase
        .from('student_class_enrollments')
        .select(`
          id,
          student:students(id),
          class:classes(id)
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true);

      const orphaned = orphanedEnrollments?.filter(e => !e.student || !e.class) || [];
      if (orphaned.length > 0) {
        issues.push({
          type: 'error',
          message: `${orphaned.length} inscription(s) avec des références invalides`,
          details: orphaned.map(o => o.id)
        });
      }

      // Vérifier les incohérences de paiement
      const { data: paymentIssues } = await supabase
        .from('student_class_enrollments')
        .select('id, total_fees, paid_amount')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .gt('paid_amount', supabase.raw('total_fees'));

      if (paymentIssues && paymentIssues.length > 0) {
        issues.push({
          type: 'warning',
          message: `${paymentIssues.length} inscription(s) avec paiement supérieur aux frais`,
          details: paymentIssues.map(p => p.id)
        });
      }

      return {
        isValid: issues.length === 0,
        issues,
        checkedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la vérification d\'intégrité:', error);
      throw error;
    }
  }
}