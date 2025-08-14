import React from 'react';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabase';

const AcademicOverview: React.FC = () => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [academicData, setAcademicData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (userSchool && currentAcademicYear) {
      loadAcademicData();
    }
  }, [userSchool, currentAcademicYear]);

  const loadAcademicData = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);

      // Charger les données par niveau
      const { data: enrollmentData, error } = await supabase
        .from('enrollment_details')
        .select('level, class_name')
        .eq('school_id', userSchool.id)
        .eq('academic_year_id', currentAcademicYear.id)
        .eq('is_active', true);

      if (error) throw error;

      // Grouper par niveau
      const levelStats = (enrollmentData || []).reduce((acc, enrollment) => {
        const level = enrollment.level;
        if (!acc[level]) {
          acc[level] = {
            level,
            students: 0,
            classes: new Set(),
            trend: 'up', // TODO: Calculer la vraie tendance
            percentage: Math.random() * 10 - 5 // TODO: Calculer la vraie évolution
          };
        }
        acc[level].students += 1;
        acc[level].classes.add(enrollment.class_name);
        return acc;
      }, {} as Record<string, any>);

      // Convertir en tableau
      const academicDataArray = Object.values(levelStats).map((level: any) => ({
        ...level,
        classes: level.classes.size
      }));

      setAcademicData(academicDataArray);

    } catch (error) {
      console.error('Erreur lors du chargement des données académiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Répartition Académique</h2>
        <div className="animate-pulse">
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Répartition Académique</h2>
      
      {academicData.length > 0 ? (
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-medium text-gray-600">Niveau</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-medium text-gray-600">Élèves</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-medium text-gray-600">Classes</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-medium text-gray-600">Évolution</th>
            </tr>
          </thead>
          <tbody>
            {academicData.map((level, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 sm:py-4 px-1 sm:px-2">
                  <span className="text-sm sm:text-base font-medium text-gray-800">{level.level}</span>
                </td>
                <td className="py-3 sm:py-4 px-1 sm:px-2 text-center">
                  <span className="text-sm sm:text-base text-gray-800 font-medium">{level.students}</span>
                </td>
                <td className="py-3 sm:py-4 px-1 sm:px-2 text-center">
                  <span className="text-sm sm:text-base text-gray-600">{level.classes}</span>
                </td>
                <td className="py-3 sm:py-4 px-1 sm:px-2 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    {level.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    )}
                    <span className={`text-xs sm:text-sm font-medium ${
                      level.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(level.percentage)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune donnée académique disponible</p>
          <p className="text-sm text-gray-400">Les données apparaîtront après les premières inscriptions</p>
        </div>
      )}
    </div>
  );
};

export default AcademicOverview;