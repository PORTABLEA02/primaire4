import React from 'react';
import { useAuth } from '../Auth/AuthProvider';
import StatsCards from './StatsCards';
import RecentActivities from './RecentActivities';
import QuickActions from './QuickActions';
import AcademicOverview from './AcademicOverview';

const Dashboard: React.FC = () => {
  const { userSchool, currentAcademicYear } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tableau de Bord</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {userSchool?.name} - Année scolaire {currentAcademicYear?.name || '2024-2025'}
          </p>
        </div>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <AcademicOverview />
          <RecentActivities />
        </div>
        
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;