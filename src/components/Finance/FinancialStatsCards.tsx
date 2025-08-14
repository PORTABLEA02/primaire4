import React from 'react';
import { DollarSign, TrendingUp, AlertCircle, CreditCard, Users, Calendar, TrendingDown } from 'lucide-react';

interface FinancialStatsCardsProps {
  stats: {
    totalRevenue: number;
    totalOutstanding: number;
    collectionRate: number;
    recentPayments: number;
    paymentsByMethod: Record<string, number>;
    paymentsByType: Record<string, number>;
  };
  loading: boolean;
}

const FinancialStatsCards: React.FC<FinancialStatsCardsProps> = ({ stats, loading }) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const getTrendIcon = (value: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value > 0 ? TrendingUp : TrendingDown;
    } else {
      return value > 0 ? TrendingDown : TrendingUp;
    }
  };

  const getTrendColor = (value: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value > 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return value > 0 ? 'text-red-600' : 'text-green-600';
    }
  };

  // Calculer les tendances (simulation - en production, comparer avec période précédente)
  const revenueTrend = 8.5; // +8.5%
  const outstandingTrend = -5.2; // -5.2%
  const collectionTrend = 3.1; // +3.1%

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Revenus Totaux */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Revenus Totaux</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-800 break-words">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-green-50 rounded-xl flex-shrink-0">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {React.createElement(getTrendIcon(revenueTrend), {
            className: `h-4 w-4 mr-1 ${getTrendColor(revenueTrend)}`
          })}
          <span className={`text-xs sm:text-sm font-medium ${getTrendColor(revenueTrend)}`}>
            {revenueTrend > 0 ? '+' : ''}{revenueTrend}%
          </span>
          <span className="text-xs sm:text-sm text-gray-500 ml-1">vs période précédente</span>
        </div>
      </div>

      {/* Impayés */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Montant des Impayés</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">
              {formatCurrency(stats.totalOutstanding)}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-red-50 rounded-xl flex-shrink-0">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {React.createElement(getTrendIcon(outstandingTrend, false), {
            className: `h-4 w-4 mr-1 ${getTrendColor(outstandingTrend, false)}`
          })}
          <span className={`text-xs sm:text-sm font-medium ${getTrendColor(outstandingTrend, false)}`}>
            {outstandingTrend > 0 ? '+' : ''}{outstandingTrend}%
          </span>
          <span className="text-xs sm:text-sm text-gray-500 ml-1">vs période précédente</span>
        </div>
      </div>

      {/* Taux de Collecte */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Taux de Collecte</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">
              {stats.collectionRate.toFixed(1)}%
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-blue-50 rounded-xl flex-shrink-0">
            <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                stats.collectionRate >= 90 ? 'bg-green-600' :
                stats.collectionRate >= 75 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${Math.min(stats.collectionRate, 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center mt-2">
            {React.createElement(getTrendIcon(collectionTrend), {
              className: `h-4 w-4 mr-1 ${getTrendColor(collectionTrend)}`
            })}
            <span className={`text-xs sm:text-sm font-medium ${getTrendColor(collectionTrend)}`}>
              {collectionTrend > 0 ? '+' : ''}{collectionTrend}%
            </span>
          </div>
        </div>
      </div>

      {/* Paiements Récents */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Paiements Récents</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">{stats.recentPayments}</p>
          </div>
          <div className="p-2 sm:p-3 bg-purple-50 rounded-xl flex-shrink-0">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-xs sm:text-sm text-purple-600 font-medium">
            Dernières 24h
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinancialStatsCards;