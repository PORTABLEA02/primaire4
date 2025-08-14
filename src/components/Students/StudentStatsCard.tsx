import React from 'react';
import { Users, CheckCircle, AlertCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface StudentStatsCardProps {
  stats: {
    total: number;
    byPaymentStatus: {
      'À jour': number;
      'En retard': number;
      'Partiel': number;
    };
    byLevel: Record<string, number>;
    byGender: {
      'Masculin': number;
      'Féminin': number;
    };
  };
  previousStats?: any;
}

const StudentStatsCard: React.FC<StudentStatsCardProps> = ({ stats, previousStats }) => {
  const collectionRate = stats.total > 0 
    ? Math.round((stats.byPaymentStatus['À jour'] / stats.total) * 100)
    : 0;

  const getTrend = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = current - previous;
    const percentage = previous > 0 ? Math.round((change / previous) * 100) : 0;
    
    return {
      change,
      percentage,
      isPositive: change >= 0
    };
  };

  const totalTrend = getTrend(stats.total, previousStats?.total);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Élèves */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Élèves</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        {totalTrend && (
          <div className="mt-4 flex items-center">
            {totalTrend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm font-medium ${totalTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {totalTrend.isPositive ? '+' : ''}{totalTrend.change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs période précédente</span>
          </div>
        )}
      </div>

      {/* Paiements à Jour */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Paiements à Jour</p>
            <p className="text-2xl font-bold text-green-600">{stats.byPaymentStatus['À jour']}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Taux de collecte</span>
            <span className="font-medium text-green-600">{collectionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${collectionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Paiements en Retard */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">En Retard</p>
            <p className="text-2xl font-bold text-red-600">{stats.byPaymentStatus['En retard']}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-red-600 font-medium">
            {stats.total > 0 ? Math.round((stats.byPaymentStatus['En retard'] / stats.total) * 100) : 0}%
          </span>
          <span className="text-sm text-gray-500 ml-1">des élèves</span>
        </div>
      </div>

      {/* Paiements Partiels */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Paiements Partiels</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.byPaymentStatus['Partiel']}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-xl">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-yellow-600 font-medium">
            {stats.total > 0 ? Math.round((stats.byPaymentStatus['Partiel'] / stats.total) * 100) : 0}%
          </span>
          <span className="text-sm text-gray-500 ml-1">des élèves</span>
        </div>
      </div>
    </div>
  );
};

export default StudentStatsCard;