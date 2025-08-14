import { supabase } from '../lib/supabase';

// Note: Cette table n'existe pas encore dans vos migrations
// Vous devrez l'ajouter dans une nouvelle migration
export class AttendanceService {
  // Enregistrer la présence d'un élève
  static async recordAttendance(attendanceData: {
    studentId: string;
    classId: string;
    schoolId: string;
    academicYearId: string;
    date: string;
    status: 'Présent' | 'Absent' | 'Retard' | 'Absent justifié';
    notes?: string;
    recordedBy: string;
  }) {
    try {
      // Pour l'instant, on simule car la table attendance n'existe pas
      console.log('Enregistrement de présence:', attendanceData);
      
      // Logger l'activité
      await supabase
        .from('activity_logs')
        .insert({
          school_id: attendanceData.schoolId,
          user_id: attendanceData.recordedBy,
          action: 'RECORD_ATTENDANCE',
          entity_type: 'attendance',
          entity_id: attendanceData.studentId,
          level: 'info',
          details: `Présence enregistrée: ${attendanceData.status} pour ${attendanceData.date}`
        });

      return { success: true, id: `attendance_${Date.now()}` };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de présence:', error);
      throw error;
    }
  }

  // Obtenir les statistiques de présence d'un élève
  static async getStudentAttendanceStats(studentId: string, academicYearId: string) {
    try {
      // Simulation des données de présence
      const totalDays = 120; // Jours d'école dans l'année
      const presentDays = Math.floor(Math.random() * 20) + 100; // Entre 100 et 120
      const absentDays = totalDays - presentDays;
      const tardiness = Math.floor(Math.random() * 10);

      return {
        totalDays,
        presentDays,
        absentDays,
        tardiness,
        attendanceRate: (presentDays / totalDays) * 100,
        lastAbsence: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques de présence:', error);
      return null;
    }
  }

  // Obtenir les statistiques de présence d'une classe
  static async getClassAttendanceStats(classId: string, academicYearId: string) {
    try {
      // Obtenir les élèves de la classe
      const { data: students } = await supabase
        .from('enrollment_details')
        .select('student_id, first_name, last_name')
        .eq('class_id', classId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true);

      if (!students) return null;

      // Simuler les données de présence pour chaque élève
      const attendanceData = students.map(student => {
        const totalDays = 120;
        const presentDays = Math.floor(Math.random() * 20) + 100;
        const absentDays = totalDays - presentDays;
        const tardiness = Math.floor(Math.random() * 10);

        return {
          studentId: student.student_id,
          studentName: `${student.first_name} ${student.last_name}`,
          totalDays,
          presentDays,
          absentDays,
          tardiness,
          attendanceRate: (presentDays / totalDays) * 100
        };
      });

      const averageAttendance = attendanceData.reduce((sum, s) => sum + s.attendanceRate, 0) / attendanceData.length;

      return {
        totalStudents: students.length,
        averageAttendance,
        excellentAttendance: attendanceData.filter(s => s.attendanceRate >= 95).length,
        goodAttendance: attendanceData.filter(s => s.attendanceRate >= 85 && s.attendanceRate < 95).length,
        poorAttendance: attendanceData.filter(s => s.attendanceRate < 85).length,
        studentDetails: attendanceData
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques de classe:', error);
      return null;
    }
  }

  // Obtenir les absences récentes
  static async getRecentAbsences(schoolId: string, days: number = 7) {
    try {
      // Simulation des absences récentes
      const { data: students } = await supabase
        .from('enrollment_details')
        .select('student_id, first_name, last_name, class_name, father_phone, mother_phone')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .limit(10);

      const recentAbsences = students?.slice(0, 5).map(student => ({
        studentId: student.student_id,
        studentName: `${student.first_name} ${student.last_name}`,
        className: student.class_name,
        date: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: Math.random() > 0.5 ? 'Absent' : 'Absent justifié',
        parentContact: student.father_phone || student.mother_phone,
        contacted: Math.random() > 0.3
      })) || [];

      return recentAbsences;
    } catch (error) {
      console.error('Erreur lors du chargement des absences récentes:', error);
      return [];
    }
  }

  // Calculer l'âge
  private static calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Valider l'email
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Valider le numéro de téléphone (format Mali)
  private static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+22901[4-9][4-9]\d{6}$/;
    return phoneRegex.test(phone);
  }
}