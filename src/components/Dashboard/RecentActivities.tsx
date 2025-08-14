import React from 'react';
import { Clock, Users, DollarSign, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { ActivityLogService } from '../../services/activityLogService';
import { formatRelativeTime } from '../../utils/formatters';

const RecentActivities: React.FC = () => {
  const { userSchool } = useAuth();
  const [activities, setActivities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (userSchool) {
      loadRecentActivities();
    }
  }, [userSchool]);

  const loadRecentActivities = async () => {
    if (!userSchool) return;

    try {
      setLoading(true);

      const activityLogs = await ActivityLogService.getActivityLogs(userSchool.id, {
        limit: 5
      });

      // Mapper les logs vers le format d'activités
      const mappedActivities = activityLogs.map(log => ({
        type: log.entity_type,
        title: getActivityTitle(log.action, log.entity_type),
        description: log.details || `${log.action} ${log.entity_type}`,
        time: formatRelativeTime(log.created_at),
        icon: getActivityIcon(log.entity_type),
        color: getActivityColor(log.level)
      }));

      setActivities(mappedActivities);

    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTitle = (action: string, entityType: string) => {
    const titles: Record<string, string> = {
      'CREATE_STUDENT': 'Nouvelle inscription',
      'RECORD_PAYMENT': 'Paiement reçu',
      'CREATE_GRADE': 'Notes saisies',
      'CREATE_CLASS': 'Nouvelle classe',
      'ASSIGN_TEACHER': 'Affectation enseignant',
      'LOGIN': 'Connexion utilisateur',
      'LOGOUT': 'Déconnexion utilisateur'
    };
    return titles[action] || `${action} ${entityType}`;
  };

  const getActivityIcon = (entityType: string) => {
    const icons: Record<string, any> = {
      'student': Users,
      'payment': DollarSign,
      'grade': BookOpen,
      'class': Users,
      'teacher': Users,
      'auth': AlertCircle
    };
    return icons[entityType] || AlertCircle;
  };

  const getActivityColor = (level: string) => {
    const colors: Record<string, string> = {
      'success': 'green',
      'info': 'blue',
      'warning': 'orange',
      'error': 'red'
    };
    return colors[level] || 'blue';
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Activités Récentes</h2>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse flex items-center space-x-3 p-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Activités Récentes</h2>
        <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">
          Voir tout
        </button>
      </div>
      
      {activities.length > 0 ? (
        <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          
          return (
            <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${getColorClasses(activity.color)}`}>
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-xs sm:text-sm">{activity.title}</p>
                <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{activity.description}</p>
                
                <div className="flex items-center mt-1 sm:mt-2 text-xs text-gray-500">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  {activity.time}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune activité récente</p>
          <p className="text-sm text-gray-400">Les activités apparaîtront ici au fur et à mesure</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;