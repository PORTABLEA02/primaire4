import React from 'react';
import { useAuth } from '../Auth/AuthProvider';
import { RefreshCw, AlertCircle } from 'lucide-react';
import StatsCards from './StatsCards';
import RecentActivities from './RecentActivities';
import QuickActions from './QuickActions';
import AcademicOverview from './AcademicOverview';

const Dashboard: React.FC = () => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Forcer le rechargement des composants enfants
    setTimeout(() => {
      setRefreshing(false);
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tableau de Bord</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {userSchool?.name} - Année scolaire {currentAcademicYear?.name || '2024-2025'}
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {!userSchool && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Configuration requise</p>
              <p className="text-sm text-yellow-700">
                Veuillez vous connecter pour accéder aux données de votre école.
              </p>
            </div>
          </div>
        </div>
      )}

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