import React from 'react';
import { Users, GraduationCap, DollarSign, AlertTriangle } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabase';

const StatsCards: React.FC = () => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (userSchool && currentAcademicYear) {
      loadStats();
    }
  }, [userSchool, currentAcademicYear]);

  const loadStats = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);

      // Charger les statistiques depuis la base de données
      const [enrollments, classes, payments, outstandingPayments] = await Promise.all([
        // Élèves inscrits
        supabase
          .from('student_class_enrollments')
          .select('id')
          .eq('school_id', userSchool.id)
          .eq('academic_year_id', currentAcademicYear.id)
          .eq('is_active', true),

        // Classes actives
        supabase
          .from('classes')
          .select('id')
          .eq('school_id', userSchool.id)
          .eq('academic_year_id', currentAcademicYear.id),

        // Revenus confirmés
        supabase
          .from('payment_transactions')
          .select('amount')
          .eq('school_id', userSchool.id)
          .eq('status', 'Confirmé'),

        // Paiements en retard
        supabase
          .from('enrollment_details')
          .select('id')
          .eq('school_id', userSchool.id)
          .eq('academic_year_id', currentAcademicYear.id)
          .eq('payment_status', 'En retard')
          .eq('is_active', true)
      ]);

      const totalStudents = enrollments.data?.length || 0;
      const totalClasses = classes.data?.length || 0;
      const totalRevenue = payments.data?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const latePayments = outstandingPayments.data?.length || 0;

      setStats({
        totalStudents,
        totalClasses,
        totalRevenue,
        latePayments
      });

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="mt-4 h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: 'Élèves Inscrits',
      value: stats.totalStudents.toString(),
      change: '+12%', // TODO: Calculer la vraie tendance
      changeType: 'increase',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Classes Actives',
      value: stats.totalClasses.toString(),
      change: '+2',
      changeType: 'increase',
      icon: GraduationCap,
      color: 'green'
    },
    {
      title: 'Revenus Totaux',
      value: `${stats.totalRevenue.toLocaleString()} FCFA`,
      change: '+8.5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'yellow'
    },
    {
      title: 'Paiements en Retard',
      value: stats.latePayments.toString(),
      change: '-5%',
      changeType: 'decrease',
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const colorClasses = {
          blue: 'bg-blue-500 text-blue-600 bg-blue-50',
          green: 'bg-green-500 text-green-600 bg-green-50',
          yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
          red: 'bg-red-500 text-red-600 bg-red-50'
        };

        return (
          <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800 break-words">{stat.value}</p>
              </div>
              
              <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${colorClasses[stat.color].split(' ')[2]}`}>
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${colorClasses[stat.color].split(' ')[1]}`} />
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-2">
                {userSchool?.name} - tranche précédente
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;