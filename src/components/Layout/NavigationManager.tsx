import React from 'react';
import { useRouter } from '../../contexts/RouterContext';
import { useAuth } from '../Auth/AuthProvider';
import Dashboard from '../Dashboard/Dashboard';
import StudentManagement from '../Students/StudentManagement';
import ClassManagement from '../Classes/ClassManagement';
import FinanceManagement from '../Finance/FinanceManagement';
import AcademicManagement from '../Academic/AcademicManagement';
import TeacherManagement from '../Teachers/TeacherManagement';
import Settings from '../Settings/Settings';
import ScheduleManagement from '../Schedule/ScheduleManagement';
import EnrollmentInterface from '../Enrollment/EnrollmentInterface';
import RouteGuard from './RouteGuard';

const NavigationManager: React.FC = () => {
  const { currentRoute } = useRouter();
  const { hasPermission } = useAuth();

  const renderRoute = () => {
    switch (currentRoute) {
      case 'dashboard':
        return (
          <RouteGuard>
            <Dashboard />
          </RouteGuard>
        );
      
      case 'enrollment':
        return (
          <RouteGuard>
            <EnrollmentInterface />
          </RouteGuard>
        );
      
      case 'students':
        return (
          <RouteGuard>
            <StudentManagement />
          </RouteGuard>
        );
      
      case 'classes':
        return (
          <RouteGuard>
            <ClassManagement />
          </RouteGuard>
        );
      
      case 'finance':
        return (
          <RouteGuard>
            <FinanceManagement />
          </RouteGuard>
        );
      
      case 'academic':
        return (
          <RouteGuard>
            <AcademicManagement />
          </RouteGuard>
        );
      
      case 'teachers':
        return (
          <RouteGuard>
            <TeacherManagement />
          </RouteGuard>
        );
      
      case 'schedule':
        return (
          <RouteGuard>
            <ScheduleManagement />
          </RouteGuard>
        );
      
      case 'settings':
        return (
          <RouteGuard>
            <Settings />
          </RouteGuard>
        );
      
      default:
        return (
          <RouteGuard>
            <Dashboard />
          </RouteGuard>
        );
    }
  };

  return <>{renderRoute()}</>;
};

export default NavigationManager;