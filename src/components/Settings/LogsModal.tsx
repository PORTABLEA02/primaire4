import React, { useState } from 'react';
import { X, FileText, Download, Filter, Search, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: string;
  user: string;
  action: string;
  details: string;
  ip?: string;
}

const LogsModal: React.FC<LogsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  // Données d'exemple des logs
  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: '2024-10-15 14:30:25',
      level: 'success',
      category: 'Authentification',
      user: 'Admin Principal',
      action: 'Connexion réussie',
      details: 'Connexion depuis l\'interface web',
      ip: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: '2024-10-15 14:25:12',
      level: 'info',
      category: 'Élèves',
      user: 'Mme Fatoumata Keita',
      action: 'Ajout élève',
      details: 'Nouvel élève ajouté: Kofi Mensah (CM2A)',
      ip: '192.168.1.105'
    },
    {
      id: '3',
      timestamp: '2024-10-15 14:20:45',
      level: 'success',
      category: 'Finance',
      user: 'M. Ibrahim Coulibaly',
      action: 'Paiement enregistré',
      details: 'Paiement de 250,000 FCFA pour Fatima Diallo',
      ip: '192.168.1.110'
    },
    {
      id: '4',
      timestamp: '2024-10-15 14:15:33',
      level: 'warning',
      category: 'Système',
      user: 'Système',
      action: 'Espace disque faible',
      details: 'Espace disque disponible: 15% (seuil: 20%)',
      ip: 'localhost'
    },
    {
      id: '5',
      timestamp: '2024-10-15 14:10:18',
      level: 'error',
      category: 'Authentification',
      user: 'Inconnu',
      action: 'Tentative de connexion échouée',
      details: 'Échec de connexion avec l\'email: test@example.com',
      ip: '203.0.113.45'
    },
    {
      id: '6',
      timestamp: '2024-10-15 14:05:22',
      level: 'info',
      category: 'Enseignants',
      user: 'Dr. Amadou Sanogo',
      action: 'Modification enseignant',
      details: 'Mise à jour des informations de M. Moussa Traore',
      ip: '192.168.1.102'
    },
    {
      id: '7',
      timestamp: '2024-10-15 14:00:15',
      level: 'success',
      category: 'Sauvegarde',
      user: 'Système',
      action: 'Sauvegarde automatique',
      details: 'Sauvegarde quotidienne effectuée avec succès',
      ip: 'localhost'
    },
    {
      id: '8',
      timestamp: '2024-10-15 13:55:40',
      level: 'warning',
      category: 'Finance',
      user: 'M. Ibrahim Coulibaly',
      action: 'Paiement en retard détecté',
      details: 'Paiement en retard pour Amadou Kone (CP2)',
      ip: '192.168.1.110'
    },
    {
      id: '9',
      timestamp: '2024-10-15 13:50:28',
      level: 'info',
      category: 'Classes',
      user: 'Mme Fatoumata Keita',
      action: 'Création classe',
      details: 'Nouvelle classe créée: CE1C avec Mlle Coulibaly',
      ip: '192.168.1.105'
    },
    {
      id: '10',
      timestamp: '2024-10-15 13:45:12',
      level: 'error',
      category: 'Système',
      user: 'Système',
      action: 'Erreur base de données',
      details: 'Timeout de connexion à la base de données',
      ip: 'localhost'
    }
  ]);

  const categories = ['Authentification', 'Élèves', 'Enseignants', 'Finance', 'Classes', 'Système', 'Sauvegarde'];
  const levels = ['info', 'success', 'warning', 'error'];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    
    // Filtre de date simple
    const logDate = new Date(log.timestamp);
    const today = new Date();
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && logDate.toDateString() === today.toDateString()) ||
                       (dateFilter === 'week' && (today.getTime() - logDate.getTime()) <= 7 * 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesLevel && matchesCategory && matchesDate;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertCircle;
      default: return Info;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'success': return 'bg-green-50';
      case 'warning': return 'bg-yellow-50';
      case 'error': return 'bg-red-50';
      default: return 'bg-blue-50';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Niveau', 'Catégorie', 'Utilisateur', 'Action', 'Détails', 'IP'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.level,
        log.category,
        log.user,
        log.action,
        `"${log.details}"`,
        log.ip || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Journal d'Activité</h2>
                <p className="text-gray-600">Historique des actions et événements système</p>
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
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select 
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les niveaux</option>
              <option value="info">Info</option>
              <option value="success">Succès</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
            </select>
            
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
            </select>
            
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Info</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {logs.filter(l => l.level === 'info').length}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Succès</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {logs.filter(l => l.level === 'success').length}
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Avertissements</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {logs.filter(l => l.level === 'warning').length}
              </p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Erreurs</span>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {logs.filter(l => l.level === 'error').length}
              </p>
            </div>
          </div>

          {/* Liste des logs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Entrées du Journal ({filteredLogs.length})
              </h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredLogs.map((log) => {
                const LevelIcon = getLevelIcon(log.level);
                
                return (
                  <div key={log.id} className={`p-4 rounded-lg border ${getLevelBg(log.level)} hover:shadow-sm transition-shadow`}>
                    <div className="flex items-start space-x-3">
                      <LevelIcon className={`h-5 w-5 mt-0.5 ${getLevelColor(log.level)}`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800">{log.action}</span>
                            <span className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs font-medium">
                              {log.category}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{log.timestamp}</span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{log.details}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Utilisateur: {log.user}</span>
                          {log.ip && <span>IP: {log.ip}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune entrée de journal trouvée</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
            </div>
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

export default LogsModal;