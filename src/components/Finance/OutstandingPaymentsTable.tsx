import React, { useState } from 'react';
import { AlertCircle, Phone, Mail, Calendar, DollarSign, User, Filter, Search } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

interface OutstandingPaymentsTableProps {
  outstandingPayments: Array<{
    id: string;
    first_name: string;
    last_name: string;
    class_name: string;
    level: string;
    total_fees: number;
    paid_amount: number;
    outstanding_amount: number;
    payment_status: string;
    enrollment_date: string;
    parent_email: string;
    father_phone?: string;
    mother_phone?: string;
  }>;
  loading: boolean;
  onPaymentRecord: () => void;
}

const OutstandingPaymentsTable: React.FC<OutstandingPaymentsTableProps> = ({
  outstandingPayments,
  loading,
  onPaymentRecord
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'amount' | 'date' | 'name'>('amount');

  // Filtrer et trier les impayés
  const filteredPayments = React.useMemo(() => {
    let filtered = outstandingPayments.filter(payment => {
      const matchesSearch = `${payment.first_name} ${payment.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.class_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === 'all' || payment.level === levelFilter;
      return matchesSearch && matchesLevel;
    });

    // Trier
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.outstanding_amount - a.outstanding_amount;
        case 'date':
          return new Date(a.enrollment_date).getTime() - new Date(b.enrollment_date).getTime();
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        default:
          return 0;
      }
    });

    return filtered;
  }, [outstandingPayments, searchTerm, levelFilter, sortBy]);

  const uniqueLevels = [...new Set(outstandingPayments.map(p => p.level))].sort();
  const totalOutstanding = outstandingPayments.reduce((sum, p) => sum + p.outstanding_amount, 0);

  const getUrgencyColor = (amount: number, enrollmentDate: string) => {
    const daysSinceEnrollment = Math.floor((Date.now() - new Date(enrollmentDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (amount > 200000 || daysSinceEnrollment > 60) {
      return 'bg-red-50 border-red-200';
    } else if (amount > 100000 || daysSinceEnrollment > 30) {
      return 'bg-yellow-50 border-yellow-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

  const getUrgencyLabel = (amount: number, enrollmentDate: string) => {
    const daysSinceEnrollment = Math.floor((Date.now() - new Date(enrollmentDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (amount > 200000 || daysSinceEnrollment > 60) {
      return { label: 'Urgent', color: 'text-red-600' };
    } else if (amount > 100000 || daysSinceEnrollment > 30) {
      return { label: 'Prioritaire', color: 'text-yellow-600' };
    }
    return { label: 'Normal', color: 'text-green-600' };
  };

  const handleContactParent = (payment: any) => {
    const phone = payment.father_phone || payment.mother_phone;
    if (phone) {
      // Ouvrir l'application de téléphone
      window.open(`tel:${phone}`);
    } else {
      alert('Aucun numéro de téléphone disponible');
    }
  };

  const handleEmailParent = (payment: any) => {
    const subject = `Rappel de paiement - ${payment.first_name} ${payment.last_name}`;
    const body = `Bonjour,\n\nNous vous rappelons qu'un paiement de ${payment.outstanding_amount.toLocaleString()} FCFA est en attente pour ${payment.first_name} ${payment.last_name} (${payment.class_name}).\n\nMerci de régulariser cette situation.\n\nCordialement,\nL'administration`;
    
    window.open(`mailto:${payment.parent_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Paiements en Attente</h2>
            <p className="text-sm text-gray-600">
              {filteredPayments.length} élève(s) • Total: {totalOutstanding.toLocaleString()} FCFA
            </p>
          </div>
          
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
              />
            </div>
            
            <select 
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les niveaux</option>
              {uniqueLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="amount">Trier par montant</option>
              <option value="date">Trier par date</option>
              <option value="name">Trier par nom</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-3 p-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredPayments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Élève</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classe</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant Dû</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Situation</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Contact</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.map((payment) => {
                const urgency = getUrgencyLabel(payment.outstanding_amount, payment.enrollment_date);
                const daysSinceEnrollment = Math.floor((Date.now() - new Date(payment.enrollment_date).getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <tr key={payment.id} className={`hover:bg-gray-50 transition-colors ${getUrgencyColor(payment.outstanding_amount, payment.enrollment_date)}`}>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-xs font-medium">
                            {payment.first_name[0]}{payment.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-medium text-gray-800">
                            {payment.first_name} {payment.last_name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgency.color} bg-current bg-opacity-10`}>
                              {urgency.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-3 sm:px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                        {payment.class_name}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{payment.level}</p>
                    </td>
                    
                    <td className="px-3 sm:px-6 py-4">
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-red-600">
                          {payment.outstanding_amount.toLocaleString()} FCFA
                        </p>
                        <p className="text-xs text-gray-500">
                          sur {payment.total_fees.toLocaleString()} FCFA
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Payé:</span>
                          <span className="font-medium text-green-600">
                            {payment.paid_amount.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(payment.paid_amount / payment.total_fees) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Inscrit il y a {daysSinceEnrollment} jour(s)
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {payment.father_phone || payment.mother_phone || 'Non renseigné'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">
                            {payment.parent_email}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <button 
                          onClick={() => handleContactParent(payment)}
                          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                        >
                          Appeler
                        </button>
                        <span className="text-gray-300 hidden sm:inline">|</span>
                        <button 
                          onClick={() => handleEmailParent(payment)}
                          className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium"
                        >
                          Email
                        </button>
                        <span className="text-gray-300 hidden sm:inline">|</span>
                        <button className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm font-medium">
                          Paiement
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          {searchTerm || levelFilter !== 'all' ? (
            <>
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun impayé trouvé</p>
              <p className="text-sm text-gray-400">Aucun élève ne correspond aux critères de recherche</p>
            </>
          ) : (
            <>
              <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-green-600 font-medium">Tous les paiements sont à jour !</p>
              <p className="text-sm text-gray-500">Aucun impayé dans cette école</p>
            </>
          )}
        </div>
      )}

      {/* Summary Footer */}
      {filteredPayments.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredPayments.length}</span> élève(s) avec impayés
              {searchTerm || levelFilter !== 'all' ? (
                <span> (filtré sur {outstandingPayments.length} total)</span>
              ) : null}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600">Total des impayés: </span>
                <span className="font-bold text-red-600">
                  {filteredPayments.reduce((sum, p) => sum + p.outstanding_amount, 0).toLocaleString()} FCFA
                </span>
              </div>
              
              <button 
                onClick={() => {
                  // Ici vous pouvez implémenter l'envoi groupé de rappels
                  alert(`Envoi de rappels à ${filteredPayments.length} famille(s)...`);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Relancer Tout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutstandingPaymentsTable;