import { useState, useEffect } from 'react';
import { SchoolService } from '../services/schoolService';
import { AcademicYearService } from '../services/academicYearService';
import { StudentService } from '../services/studentService';
import { TeacherService } from '../services/teacherService';
import { ClassService } from '../services/classService';
import { PaymentService } from '../services/paymentService';
import { ActivityLogService } from '../services/activityLogService';

export const useSchoolData = (schoolId?: string, academicYearId?: string) => {
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [outstandingPayments, setOutstandingPayments] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (schoolId && academicYearId) {
      loadSchoolData();
    }
  }, [schoolId, academicYearId]);

  const loadSchoolData = async () => {
    if (!schoolId || !academicYearId) return;

    try {
      setError(null);

      // Charger toutes les données en parallèle
      const [
        studentsData,
        teachersData,
        classesData,
        recentPaymentsData,
        outstandingData,
        statsData
      ] = await Promise.all([
        StudentService.getStudents(schoolId, academicYearId),
        TeacherService.getTeachers(schoolId),
        ClassService.getClasses(schoolId, academicYearId),
        PaymentService.getRecentPayments(schoolId, 10),
        PaymentService.getOutstandingPayments(schoolId, academicYearId),
        SchoolService.getSchoolStats(schoolId, academicYearId)
      ]);

      setStudents(studentsData);
      setTeachers(teachersData);
      setClasses(classesData);
      setRecentPayments(recentPaymentsData);
      setOutstandingPayments(outstandingData);
      setDashboardStats(statsData);

    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      setError(error.message || 'Erreur lors du chargement des données');
    } finally {
    }
  };

  const refreshData = async () => {
    await loadSchoolData();
  };

  const logActivity = async (
    action: string,
    entityType: string,
    entityId?: string,
    details?: string,
    level: 'info' | 'warning' | 'error' | 'success' = 'info'
  ) => {
    if (schoolId) {
      await ActivityLogService.logActivity({
        schoolId,
        action,
        entityType,
        entityId,
        level,
        details
      });
    }
  };

  // Fonctions spécialisées pour chaque entité
  const createStudent = async (studentData: any, enrollmentData: any) => {
    try {
      const result = await StudentService.createStudentWithEnrollment(
        { ...studentData, schoolId },
        { ...enrollmentData, academicYearId }
      );

      await logActivity(
        'CREATE_STUDENT',
        'student',
        result.student.id,
        `Nouvel élève: ${studentData.firstName} ${studentData.lastName}`,
        'success'
      );

      await refreshData();
      return result;
    } catch (error) {
      await logActivity(
        'CREATE_STUDENT_ERROR',
        'student',
        undefined,
        `Erreur création élève: ${error}`,
        'error'
      );
      throw error;
    }
  };

  const createTeacher = async (teacherData: any) => {
    try {
      const teacher = await TeacherService.createTeacher({
        ...teacherData,
        schoolId
      });

      await logActivity(
        'CREATE_TEACHER',
        'teacher',
        teacher.id,
        `Nouvel enseignant: ${teacherData.firstName} ${teacherData.lastName}`,
        'success'
      );

      await refreshData();
      return teacher;
    } catch (error) {
      await logActivity(
        'CREATE_TEACHER_ERROR',
        'teacher',
        undefined,
        `Erreur création enseignant: ${error}`,
        'error'
      );
      throw error;
    }
  };

  const createClass = async (classData: any) => {
    try {
      const classItem = await ClassService.createClass({
        ...classData,
        schoolId,
        academicYearId
      });

      await logActivity(
        'CREATE_CLASS',
        'class',
        classItem.id,
        `Nouvelle classe: ${classData.name}`,
        'success'
      );

      await refreshData();
      return classItem;
    } catch (error) {
      await logActivity(
        'CREATE_CLASS_ERROR',
        'class',
        undefined,
        `Erreur création classe: ${error}`,
        'error'
      );
      throw error;
    }
  };

  const recordPayment = async (paymentData: any) => {
    try {
      const payment = await PaymentService.recordPayment({
        ...paymentData,
        schoolId,
        academicYearId
      });

      await logActivity(
        'RECORD_PAYMENT',
        'payment',
        payment.id,
        `Paiement: ${paymentData.amount} FCFA`,
        'success'
      );

      await refreshData();
      return payment;
    } catch (error) {
      await logActivity(
        'RECORD_PAYMENT_ERROR',
        'payment',
        undefined,
        `Erreur paiement: ${error}`,
        'error'
      );
      throw error;
    }
  };

  return {
    students,
    teachers,
    classes,
    recentPayments,
    outstandingPayments,
    dashboardStats,
    error,
    refreshData,
    logActivity,
    createStudent,
    createTeacher,
    createClass,
    recordPayment
  };
};