import React from 'react';
import { Clock, Users, DollarSign, BookOpen, AlertCircle } from 'lucide-react';

const activities = [
  {
    type: 'inscription',
    title: 'Nouvelle inscription',
    description: 'Kofi Mensah inscrit en CM2A',
    time: 'Il y a 2 heures',
    icon: Users,
    color: 'blue'
  },
  {
    type: 'paiement',
    title: 'Paiement reçu',
    description: '1ère Tranche - Fatima Diallo (CE1B) - 150,000 FCFA',
    time: 'Il y a 3 heures',
    icon: DollarSign,
    color: 'green'
  },
  {
    type: 'notes',
    title: 'Notes saisies',
    description: 'Mathématiques - CM1A (32 élèves) par M. Traore',
    time: 'Il y a 5 heures',
    icon: BookOpen,
    color: 'purple'
  },
  {
    type: 'alerte',
    title: 'Paiement en retard',
    description: '1ère Tranche - Amadou Kone (CP2)',
    time: 'Il y a 1 jour',
    icon: AlertCircle,
    color: 'orange'
  },
  {
    type: 'inscription',
    title: 'Transfert d\'élève',
    description: 'Aissata Ba transférée de CE2A vers CE2B',
    time: 'Il y a 2 jours',
    icon: Users,
    color: 'blue'
  }
];

const RecentActivities: React.FC = () => {
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Activités Récentes</h2>
        <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">
          Voir tout
        </button>
      </div>
      
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
    </div>
  );
};

export default RecentActivities;