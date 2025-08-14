import React from 'react';
import { DollarSign, Smartphone, Building, CreditCard } from 'lucide-react';

interface PaymentMethodsChartProps {
  paymentsByMethod: Record<string, number>;
  paymentMethods: Array<{
    id: string;
    name: string;
    type: 'cash' | 'mobile' | 'bank';
    is_enabled: boolean;
    fees_percentage: number;
  }>;
}

const PaymentMethodsChart: React.FC<PaymentMethodsChartProps> = ({
  paymentsByMethod,
  paymentMethods
}) => {
  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'cash': return DollarSign;
      case 'mobile': return Smartphone;
      case 'bank': return Building;
      default: return CreditCard;
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'cash': return { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-600' };
      case 'mobile': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600' };
      case 'bank': return { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-600' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', icon: 'text-gray-600' };
    }
  };

  const totalAmount = Object.values(paymentsByMethod).reduce((sum, amount) => sum + amount, 0);

  const methodsWithData = paymentMethods.map(method => {
    const amount = paymentsByMethod[method.name] || 0;
    const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
    
    return {
      ...method,
      amount,
      percentage
    };
  }).filter(method => method.amount > 0);

  if (methodsWithData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Répartition par Méthode de Paiement</h2>
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun paiement enregistré</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
        Répartition par Méthode de Paiement
      </h2>
      
      <div className="space-y-4">
        {methodsWithData.map((method) => {
          const Icon = getMethodIcon(method.type);
          const colors = getMethodColor(method.type);
          
          return (
            <div key={method.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${colors.bg}`}>
                  <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${colors.icon}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm sm:text-base font-medium text-gray-800 truncate block">
                    {method.name}
                  </span>
                  {method.fees_percentage > 0 && (
                    <p className="text-xs text-gray-500">
                      Frais: {method.fees_percentage}%
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm sm:text-base font-semibold text-gray-800">
                  {method.amount.toLocaleString()} FCFA
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {method.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual representation */}
      <div className="mt-6">
        <div className="flex rounded-lg overflow-hidden h-3">
          {methodsWithData.map((method, index) => {
            const colors = getMethodColor(method.type);
            return (
              <div
                key={method.id}
                className={colors.bg.replace('50', '200')}
                style={{ width: `${method.percentage}%` }}
                title={`${method.name}: ${method.percentage.toFixed(1)}%`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span>
          <span>Total: {totalAmount.toLocaleString()} FCFA</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsChart;