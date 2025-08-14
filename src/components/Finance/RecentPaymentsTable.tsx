import React from 'react';
import { Clock, User, CreditCard, RefreshCw, Eye } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';
import AllPaymentsModal from './AllPaymentsModal';

interface RecentPaymentsTableProps {
  payments: Array<{
    id: string;
    amount: number;
    payment_type: string;
    payment_date: string;
    status: string;
    reference_number?: string;
    enrollment: {
      student: {
        first_name: string;
        last_name: string;
      };
      class: {
        name: string;
      };
    };
    payment_method?: {
      name: string;
      type: string;
    };
  }>;
  loading: boolean;
  onRefresh: () => void;
}

const RecentPaymentsTable: React.FC<RecentPaymentsTableProps> = ({
  payments,
  loading,
  onRefresh
}) => {
  const [showAllPaymentsModal, setShowAllPaymentsModal] = React.useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmé': return 'bg-green-50 text-green-700';
      case 'En attente': return 'bg-yellow-50 text-yellow-700';
      case 'Échoué': return 'bg-red-50 text-red-700';
      case 'Remboursé': return 'bg-gray-50 text-gray-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'Inscription': return 'bg-blue-100 text-blue-800';
      case 'Scolarité': return 'bg-green-100 text-green-800';
      case 'Cantine': return 'bg-orange-100 text-orange-800';
      case 'Transport': return 'bg-purple-100 text-purple-800';
      case 'Fournitures': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'cash': return '💵';
      case 'mobile': return '📱';
      case 'bank': return '🏦';
      default: return '💳';
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Paiements Récents</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowAllPaymentsModal(true)}
            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
          >
            Voir tout
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-2 sm:p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">
                    {getMethodIcon(payment.payment_method?.type || 'cash')}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
                      {payment.enrollment.student.first_name} {payment.enrollment.student.last_name}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(payment.payment_type)}`}>
                      {payment.payment_type}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-500">
                    <span>{payment.enrollment.class.name}</span>
                    <span>•</span>
                    <span>{payment.payment_method?.name || 'Espèces'}</span>
                    {payment.reference_number && (
                      <>
                        <span>•</span>
                        <span>Réf: {payment.reference_number}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatRelativeTime(payment.payment_date)}
                  </div>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <p className="text-sm sm:text-base font-semibold text-gray-800">
                  {payment.amount.toLocaleString()} FCFA
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun paiement récent</p>
          <p className="text-sm text-gray-400">Les paiements apparaîtront ici une fois enregistrés</p>
        </div>
      )}

      {/* Modal Tous les Paiements */}
      <AllPaymentsModal
        isOpen={showAllPaymentsModal}
        onClose={() => setShowAllPaymentsModal(false)}
      />
    </div>
  );
};

export default RecentPaymentsTable;