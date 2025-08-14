import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertCircle, CreditCard, Smartphone, Building, RefreshCw, Download, Users, Calendar } from 'lucide-react';
import PaymentModal from './PaymentModal';
import FinancialStatsCards from './FinancialStatsCards';
import PaymentMethodsChart from './PaymentMethodsChart';
import OutstandingPaymentsTable from './OutstandingPaymentsTable';
import RecentPaymentsTable from './RecentPaymentsTable';
import { useAuth } from '../Auth/AuthProvider';
import { PaymentService } from '../../services/paymentService';
import { ActivityLogService } from '../../services/activityLogService';

interface Payment {
  id: string;
  enrollment_id: string;
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
}

interface FinancialStats {
  totalRevenue: number;
  totalOutstanding: number;
  collectionRate: number;
  recentPayments: number;
  paymentsByMethod: Record<string, number>;
  paymentsByType: Record<string, number>;
  outstandingByLevel: Record<string, number>;
}

const FinanceManagement: React.FC = () => {
  const { userSchool, currentAcademicYear, user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États des données
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [outstandingPayments, setOutstandingPayments] = useState<any[]>([]);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  // Charger les données au montage
  useEffect(() => {
    if (userSchool && currentAcademicYear) {
      loadFinancialData();
    }
  }, [userSchool, currentAcademicYear]);

  const loadFinancialData = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);
      setError(null);

      // Charger toutes les données financières en parallèle
      const [
        recentPaymentsData,
        outstandingData,
        statsData,
        methodsData
      ] = await Promise.all([
        PaymentService.getRecentPayments(userSchool.id, 10),
        PaymentService.getOutstandingPayments(userSchool.id, currentAcademicYear.id),
        PaymentService.getFinancialStats(userSchool.id, currentAcademicYear.id),
        PaymentService.getPaymentMethods(userSchool.id)
      ]);

      setRecentPayments(recentPaymentsData);
      setOutstandingPayments(outstandingData);
      setPaymentMethods(methodsData);

      // Calculer les statistiques financières
      if (statsData) {
        const totalRevenue = recentPaymentsData.reduce((sum, p) => sum + p.amount, 0);
        const totalOutstanding = outstandingData.reduce((sum, p) => sum + p.outstanding_amount, 0);
        
        setFinancialStats({
          totalRevenue,
          totalOutstanding,
          collectionRate: totalRevenue > 0 ? (totalRevenue / (totalRevenue + totalOutstanding)) * 100 : 0,
          recentPayments: recentPaymentsData.length,
          paymentsByMethod: statsData.revenueByMethod || {},
          paymentsByType: statsData.revenueByType || {},
          outstandingByLevel: statsData.outstandingByLevel || {}
        });
      }

    } catch (error: any) {
      console.error('Erreur lors du chargement des données financières:', error);
      setError(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (paymentData: any) => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);

      // Enregistrer le paiement
      await PaymentService.recordPayment({
        enrollmentId: paymentData.enrollmentId,
        schoolId: userSchool.id,
        academicYearId: currentAcademicYear.id,
        amount: paymentData.amount,
        paymentMethodId: paymentData.paymentMethodId,
        paymentType: paymentData.type,
        paymentDate: paymentData.date,
        referenceNumber: paymentData.reference,
        mobileNumber: paymentData.mobileNumber,
        bankDetails: paymentData.bankDetails,
        notes: paymentData.notes,
        processedBy: user?.id // Utiliser l'ID de l'utilisateur connecté
      });

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: userSchool.id,
        action: 'RECORD_PAYMENT',
        entityType: 'payment',
        level: 'success',
        details: `Paiement enregistré: ${paymentData.amount.toLocaleString()} FCFA pour ${paymentData.studentName}`
      });

      // Recharger les données
      await loadFinancialData();
      
      alert(`Paiement de ${paymentData.amount.toLocaleString()} FCFA enregistré avec succès !`);
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportFinancialReport = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);
      
      // Préparer les données pour l'export
      const exportData = {
        school: userSchool.name,
        academicYear: currentAcademicYear.name,
        generatedAt: new Date().toISOString(),
        stats: financialStats,
        recentPayments: recentPayments.map(p => ({
          date: p.payment_date,
          student: `${p.enrollment.student.first_name} ${p.enrollment.student.last_name}`,
          class: p.enrollment.class.name,
          amount: p.amount,
          type: p.payment_type,
          method: p.payment_method?.name || 'Non spécifié',
          status: p.status
        })),
        outstandingPayments: outstandingPayments.map(p => ({
          student: `${p.first_name} ${p.last_name}`,
          class: p.class_name,
          level: p.level,
          totalFees: p.total_fees,
          paidAmount: p.paid_amount,
          outstandingAmount: p.outstanding_amount,
          paymentStatus: p.payment_status
        }))
      };

      // Créer et télécharger le fichier JSON
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport_financier_${userSchool.name}_${currentAcademicYear.name}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      // Logger l'export
      await ActivityLogService.logActivity({
        schoolId: userSchool.id,
        action: 'EXPORT_FINANCIAL_REPORT',
        entityType: 'report',
        level: 'info',
        details: 'Rapport financier exporté'
      });

    } catch (error: any) {
      console.error('Erreur lors de l\'export:', error);
      alert(`Erreur lors de l\'export: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadFinancialData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gestion Financière</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {userSchool?.name} - Année {currentAcademicYear?.name}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={loadFinancialData}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          <button 
            onClick={exportFinancialReport}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
          
          <button 
            onClick={() => setShowPaymentModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <DollarSign className="h-4 w-4" />
            <span>Nouveau Paiement</span>
          </button>
        </div>
      </div>

      {/* Financial Stats Cards */}
      {financialStats && (
        <FinancialStatsCards 
          stats={financialStats}
          loading={loading}
        />
      )}

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Payment Methods Chart */}
        {financialStats && (
          <PaymentMethodsChart 
            paymentsByMethod={financialStats.paymentsByMethod}
            paymentMethods={paymentMethods}
          />
        )}

        {/* Recent Payments */}
        <RecentPaymentsTable 
          payments={recentPayments}
          loading={loading}
          onRefresh={loadFinancialData}
        />
      </div>

      {/* Outstanding Payments Table */}
      <OutstandingPaymentsTable 
        outstandingPayments={outstandingPayments}
        loading={loading}
        onPaymentRecord={loadFinancialData}
      />

      {/* Summary by Level */}
      {financialStats && Object.keys(financialStats.outstandingByLevel).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Impayés par Niveau</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(financialStats.outstandingByLevel).map(([level, amount]) => (
                <div key={level} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">{level}</p>
                      <p className="text-lg font-bold text-red-800">
                        {(amount as number).toLocaleString()} FCFA
                      </p>
                    </div>
                    <Users className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-red-500">
                      {outstandingPayments.filter(p => p.level === level).length} élève(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="text-gray-700">Chargement des données financières...</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onAddPayment={handleAddPayment}
      />
    </div>
  );
};

export default FinanceManagement;