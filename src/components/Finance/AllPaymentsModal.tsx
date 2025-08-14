import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Download, Eye, Calendar, DollarSign, User, CreditCard, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { PaymentService } from '../../services/paymentService';
import { formatRelativeTime } from '../../utils/formatters';

interface AllPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Payment {
  id: string;
  amount: number;
  payment_type: string;
  payment_date: string;
  status: string;
  reference_number?: string;
  mobile_number?: string;
  bank_details?: string;
  notes?: string;
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
  processed_by_user?: {
    name: string;
  };
}

const AllPaymentsModal: React.FC<AllPaymentsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'student'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Charger les paiements
  useEffect(() => {
    if (isOpen && userSchool) {
      loadPayments();
    }
  }, [isOpen, userSchool]);

  // Filtrer les paiements
  useEffect(() => {
    let filtered = payments.filter(payment => {
      const matchesSearch = `${payment.enrollment.student.first_name} ${payment.enrollment.student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.enrollment.class.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (payment.reference_number || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesType = typeFilter === 'all' || payment.payment_type === typeFilter;
      const matchesMethod = methodFilter === 'all' || payment.payment_method?.name === methodFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const paymentDate = new Date(payment.payment_date);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            matchesDate = paymentDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = paymentDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = paymentDate >= monthAgo;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesMethod && matchesDate;
    });

    // Trier les résultats
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'student':
          comparison = `${a.enrollment.student.first_name} ${a.enrollment.student.last_name}`.localeCompare(
            `${b.enrollment.student.first_name} ${b.enrollment.student.last_name}`
          );
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, typeFilter, methodFilter, dateFilter, sortBy, sortOrder]);

  const loadPayments = async () => {
    if (!userSchool) return;

    try {
      setLoading(true);
      const paymentsData = await PaymentService.getRecentPayments(userSchool.id, 100); // Charger plus de paiements
      setPayments(paymentsData);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const exportPayments = () => {
    const csvData = filteredPayments.map(payment => ({
      'Date': new Date(payment.payment_date).toLocaleDateString('fr-FR'),
      'Élève': `${payment.enrollment.student.first_name} ${payment.enrollment.student.last_name}`,
      'Classe': payment.enrollment.class.name,
      'Type': payment.payment_type,
      'Montant': payment.amount,
      'Méthode': payment.payment_method?.name || 'Non spécifié',
      'Statut': payment.status,
      'Référence': payment.reference_number || '',
      'Traité par': payment.processed_by_user?.name || 'Système'
    }));

    // Créer et télécharger le CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `paiements_${userSchool?.name}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueStatuses = [...new Set(payments.map(p => p.status))];
  const uniqueTypes = [...new Set(payments.map(p => p.payment_type))];
  const uniqueMethods = [...new Set(payments.map(p => p.payment_method?.name).filter(Boolean))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Tous les Paiements</h2>
                <p className="text-gray-600">
                  {userSchool?.name} • {filteredPayments.length} paiement(s) trouvé(s)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadPayments}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Filtres et recherche */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Recherche */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom d'élève, classe ou référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportPayments}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>

            {/* Filtres */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous les statuts</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous les types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select 
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Toutes les méthodes</option>
                {uniqueMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>

              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="date">Trier par date</option>
                <option value="amount">Trier par montant</option>
                <option value="student">Trier par élève</option>
              </select>

              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Paiements</p>
                  <p className="text-xl font-bold text-blue-800">{filteredPayments.length}</p>
                </div>
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Montant Total</p>
                  <p className="text-xl font-bold text-green-800">
                    {filteredPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} FCFA
                  </p>
                </div>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Confirmés</p>
                  <p className="text-xl font-bold text-purple-800">
                    {filteredPayments.filter(p => p.status === 'Confirmé').length}
                  </p>
                </div>
                <User className="h-5 w-5 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Montant Moyen</p>
                  <p className="text-xl font-bold text-orange-800">
                    {filteredPayments.length > 0 
                      ? Math.round(filteredPayments.reduce((sum, p) => sum + p.amount, 0) / filteredPayments.length).toLocaleString()
                      : '0'
                    } FCFA
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Liste des paiements */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Chargement des paiements...</p>
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Élève</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">
                            {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(payment.payment_date)}
                          </p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-medium">
                              {payment.enrollment.student.first_name[0]}{payment.enrollment.student.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {payment.enrollment.student.first_name} {payment.enrollment.student.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{payment.enrollment.class.name}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(payment.payment_type)}`}>
                          {payment.payment_type}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          {payment.amount.toLocaleString()} FCFA
                        </p>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {getMethodIcon(payment.payment_method?.type || 'cash')}
                          </span>
                          <span className="text-sm text-gray-700">
                            {payment.payment_method?.name || 'Espèces'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun paiement trouvé</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'all'
                  ? 'Aucun paiement ne correspond aux critères de recherche'
                  : 'Aucun paiement enregistré'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {filteredPayments.length} paiement(s) affiché(s) sur {payments.length} total
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Modal de détail du paiement */}
        {selectedPayment && (
          <PaymentDetailModal
            payment={selectedPayment}
            onClose={() => setSelectedPayment(null)}
          />
        )}
      </div>
    </div>
  );
};

// Modal de détail d'un paiement
const PaymentDetailModal: React.FC<{
  payment: Payment;
  onClose: () => void;
}> = ({ payment, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Détails du Paiement</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Informations du Paiement</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant:</span>
                  <span className="font-bold text-green-600">{payment.amount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{payment.payment_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(payment.payment_date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Méthode:</span>
                  <span className="font-medium">{payment.payment_method?.name || 'Espèces'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
                {payment.reference_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Référence:</span>
                    <span className="font-mono text-sm">{payment.reference_number}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Informations de l'Élève</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nom:</span>
                  <span className="font-medium">
                    {payment.enrollment.student.first_name} {payment.enrollment.student.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classe:</span>
                  <span className="font-medium">{payment.enrollment.class.name}</span>
                </div>
                {payment.processed_by_user && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Traité par:</span>
                    <span className="font-medium">{payment.processed_by_user.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {payment.notes && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Notes</h4>
              <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">{payment.notes}</p>
            </div>
          )}

          {payment.mobile_number && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Détails Mobile Money</h4>
              <p className="text-sm text-gray-700">Numéro: {payment.mobile_number}</p>
            </div>
          )}

          {payment.bank_details && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Détails Bancaires</h4>
              <p className="text-sm text-gray-700">{payment.bank_details}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPaymentsModal;