// Index des services - Point d'entrée centralisé
export { AuthService } from './authService';
export { SchoolService } from './schoolService';
export { AcademicYearService } from './academicYearService';
export { StudentService } from './studentService';
export { TeacherService } from './teacherService';
export { ClassService } from './classService';
export { PaymentService } from './paymentService';
export { GradeService } from './gradeService';
export { BulletinService } from './bulletinService';
export { ScheduleService } from './scheduleService';
export { ClassroomService } from './classroomService';
export { SubjectService } from './subjectService';
export { ActivityLogService } from './activityLogService';
export { EnrollmentService } from './enrollmentService';
export { DashboardService } from './dashboardService';
export { UserService } from './userService';
export { ReportService } from './reportService';
export { NotificationService } from './notificationService';
export { BackupService } from './backupService';
export { StatisticsService } from './statisticsService';
export { ValidationService } from './validationService';
export { AttendanceService } from './attendanceService';

// Types de services pour TypeScript
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  count: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

export interface SearchOptions {
  searchTerm?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  page?: number;
  pageSize?: number;
}

// Configuration des services
export const ServiceConfig = {
  defaultPageSize: 50,
  maxPageSize: 100,
  defaultTimeout: 30000,
  retryAttempts: 3,
  logLevel: 'info' as 'info' | 'warning' | 'error' | 'success'
};

// Wrapper pour les appels de service avec gestion d'erreur
export async function withServiceErrorHandling<T>(
  serviceCall: () => Promise<T>,
  context: {
    serviceName: string;
    operation: string;
    schoolId?: string;
    userId?: string;
  }
): Promise<ServiceResponse<T>> {
  try {
    const data = await serviceCall();
    return {
      success: true,
      data,
      message: `${context.operation} réussi`
    };
  } catch (error: any) {
    console.error(`Erreur ${context.serviceName}.${context.operation}:`, error);
    
    // Logger l'erreur si possible
    if (context.schoolId) {
      try {
        await ActivityLogService.logActivity({
          schoolId: context.schoolId,
          userId: context.userId,
          action: `${context.operation.toUpperCase()}_ERROR`,
          entityType: context.serviceName.toLowerCase(),
          level: 'error',
          details: error.message || 'Erreur inconnue'
        });
      } catch (logError) {
        console.error('Erreur lors du logging:', logError);
      }
    }

    return {
      success: false,
      error: error.message || 'Une erreur est survenue',
      message: `Échec de ${context.operation}`
    };
  }
}