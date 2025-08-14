import React, { useState } from 'react';
import { X, BarChart3, Download, Calendar, DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react';

interface FinancialReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReportData {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  studentsCount: number;
  averagePayment: number;
  collectionRate: number;
}

const FinancialReportsModal: React.FC<FinancialReportsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [reportType, setReportType] = useState('summary');

  // Données d'exemple pour les rapports
  const reportData: Record<string, ReportData> = {
    'current-month': {
      period: 'Octobre 2024',
      totalRevenue: 3250000,
      totalExpenses: 1800000,
      netProfit: 1450000,
      studentsCount: 1247,
      averagePayment: 260000,
      collectionRate: 89
    },
    'last-month': {
      period: 'Septembre 2024',
      totalRevenue: 2980000,
      totalExpenses: 1750000,
      netProfit: 1230000,
      studentsCount: 1235,
      averagePayment: 241000,
      collectionRate: 85
    },
    'current-trimester': {
      period: 'Trimestre 1 2024-2025',
      totalRevenue: 9750000,
      totalExpenses: 5200000,
      netProfit: 4550000,
      studentsCount: 1247,
      averagePayment: 782000,
      collectionRate: 87
    },
    'academic-year': {
      period: 'Année 2024-2025',
      totalRevenue: 9750000,
      totalExpenses: 5200000,
      netProfit: 4550000,
      studentsCount: 1247,
      averagePayment: 782000,
      collectionRate: 87
    }
  };

  const paymentMethods = [
    { name: 'Espèces', amount: 1250000, percentage: 38.5, color: 'green' },
    { name: 'Mobile Money', amount: 1300000, percentage: 40.0, color: 'blue' },
    { name: 'Virement Bancaire', amount: 700000, percentage: 21.5, color: 'purple' }
  ];

  const expenseCategories = [
    { name: 'Salaires Enseignants', amount: 1200000, percentage: 66.7 },
    { name: 'Frais Administratifs', amount: 300000, percentage: 16.7 },
    { name: 'Maintenance & Équipement', amount: 200000, percentage: 11.1 },
    { name: 'Autres', amount: 100000, percentage: 5.5 }
  ];

  const outstandingPayments = [
    { level: 'Maternelle', students: 15, amount: 450000 },
    { level: 'CI-CP', students: 28, amount: 980000 },
    { level: 'CE1-CE2', students: 35, amount: 1400000 },
    { level: 'CM1-CM2', students: 25, amount: 1125000 }
  ];

  const currentData = reportData[selectedPeriod];

  const generateReport = () => {
    // Ici vous pouvez implémenter la génération de rapport PDF/Excel
    console.log('Génération du rapport pour:', selectedPeriod, reportType);
    alert(`Rapport ${reportType} pour ${currentData.period} généré avec succès !`);
  };

  const exportData = (format: 'pdf' | 'excel' | 'csv') => {
    // Ici vous pouvez implémenter l'export dans différents formats
    console.log('Export en format:', format);
    alert(`Export ${format.toUpperCase()} en cours...`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Rapports Financiers</h2>
                <p className="text-gray-600">Analyse et statistiques financières</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Contrôles */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="current-month">Mois Actuel</option>
                <option value="last-month">Mois Précédent</option>
                <option value="current-trimester">Trimestre Actuel</option>
                <option value="academic-year">Année Scolaire</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de Rapport
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="summary">Résumé Financier</option>
                <option value="detailed">Rapport Détaillé</option>
                <option value="payments">Analyse des Paiements</option>
                <option value="outstanding">Impayés</option>
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={generateReport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Générer</span>
              </button>
              
              <div className="relative">
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Exporter</span>
                </button>
                {/* Menu déroulant d'export (simplifié) */}
              </div>
            </div>
          </div>

          {/* Résumé Financier */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Résumé - {currentData.period}</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Revenus Totaux</p>
                    <p className="text-2xl font-bold text-green-800">
                      {currentData.totalRevenue.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+8.5%</span>
                  <span className="text-sm text-green-500 ml-1">vs période précédente</span>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Dépenses</p>
                    <p className="text-2xl font-bold text-red-800">
                      {currentData.totalExpenses.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-red-600 font-medium">+2.8%</span>
                  <span className="text-sm text-red-500 ml-1">vs période précédente</span>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Bénéfice Net</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {currentData.netProfit.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">+17.9%</span>
                  <span className="text-sm text-blue-500 ml-1">vs période précédente</span>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Taux de Collecte</p>
                    <p className="text-2xl font-bold text-purple-800">{currentData.collectionRate}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${currentData.collectionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Répartition par Méthode de Paiement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Répartition des Paiements</h4>
              
              <div className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        method.color === 'green' ? 'bg-green-500' :
                        method.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="font-medium text-gray-800">{method.name}</span>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{method.amount.toLocaleString()} FCFA</p>
                      <p className="text-sm text-gray-500">{method.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Répartition des Dépenses</h4>
              
              <div className="space-y-4">
                {expenseCategories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {category.amount.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Impayés par Niveau */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Impayés par Niveau</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveau</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Élèves Concernés</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant Dû</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pourcentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {outstandingPayments.map((item, index) => {
                    const totalOutstanding = outstandingPayments.reduce((sum, p) => sum + p.amount, 0);
                    const percentage = (item.amount / totalOutstanding) * 100;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{item.level}</td>
                        <td className="px-6 py-4 text-gray-600">{item.students}</td>
                        <td className="px-6 py-4 font-semibold text-red-600">
                          {item.amount.toLocaleString()} FCFA
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-red-800">Total des Impayés:</span>
                <span className="text-xl font-bold text-red-600">
                  {outstandingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Rapport généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => exportData('pdf')}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportData('excel')}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export Excel
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReportsModal;