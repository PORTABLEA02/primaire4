import React from 'react';
import { Search, Filter, RefreshCw, Download } from 'lucide-react';

interface StudentFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  classFilter: string;
  onClassFilterChange: (classFilter: string) => void;
  paymentFilter: string;
  onPaymentFilterChange: (paymentFilter: string) => void;
  statusFilter: string;
  onStatusFilterChange: (statusFilter: string) => void;
  availableClasses: string[];
  onRefresh: () => void;
  onExport: () => void;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchTerm,
  onSearchChange,
  classFilter,
  onClassFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  statusFilter,
  onStatusFilterChange,
  availableClasses,
  onRefresh,
  onExport,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom d'élève, parent, téléphone ou email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Filtres */}
        <div className="flex flex-wrap gap-3">
          <select 
            value={classFilter}
            onChange={(e) => onClassFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les classes</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          
          <select 
            value={paymentFilter}
            onChange={(e) => onPaymentFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les paiements</option>
            <option value="À jour">À jour</option>
            <option value="En retard">En retard</option>
            <option value="Partiel">Partiel</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
          
          <button 
            onClick={onRefresh}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>

          <button 
            onClick={onExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFilters;