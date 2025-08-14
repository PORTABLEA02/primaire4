import React, { useState } from 'react';
import { X, Database, Download, Upload, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BackupEntry {
  id: string;
  name: string;
  date: string;
  size: string;
  type: 'automatic' | 'manual';
  status: 'completed' | 'in-progress' | 'failed';
  description: string;
}

const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [backups] = useState<BackupEntry[]>([
    {
      id: '1',
      name: 'Sauvegarde_Automatique_2024-10-15',
      date: '2024-10-15 23:30:00',
      size: '245 MB',
      type: 'automatic',
      status: 'completed',
      description: 'Sauvegarde automatique quotidienne - Données complètes'
    },
    {
      id: '2',
      name: 'Sauvegarde_Manuelle_2024-10-14',
      date: '2024-10-14 16:20:00',
      size: '238 MB',
      type: 'manual',
      status: 'completed',
      description: 'Sauvegarde avant mise à jour système'
    },
    {
      id: '3',
      name: 'Sauvegarde_Automatique_2024-10-14',
      date: '2024-10-14 23:30:00',
      size: '242 MB',
      type: 'automatic',
      status: 'completed',
      description: 'Sauvegarde automatique quotidienne'
    },
    {
      id: '4',
      name: 'Sauvegarde_Automatique_2024-10-13',
      date: '2024-10-13 23:30:00',
      size: '240 MB',
      type: 'automatic',
      status: 'completed',
      description: 'Sauvegarde automatique quotidienne'
    },
    {
      id: '5',
      name: 'Sauvegarde_Manuelle_2024-10-10',
      date: '2024-10-10 14:15:00',
      size: '235 MB',
      type: 'manual',
      status: 'completed',
      description: 'Sauvegarde de fin de semaine'
    }
  ]);

  const createBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    // Simulation du processus de sauvegarde
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCreatingBackup(false);
          alert('Sauvegarde créée avec succès !');
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const downloadBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (backup) {
      // Simulation du téléchargement
      alert(`Téléchargement de ${backup.name} en cours...`);
    }
  };

  const restoreBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (backup && confirm(`Êtes-vous sûr de vouloir restaurer la sauvegarde "${backup.name}" ? Cette action remplacera toutes les données actuelles.`)) {
      alert(`Restauration de ${backup.name} en cours...`);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadBackup = () => {
    if (selectedFile) {
      alert(`Upload de ${selectedFile.name} en cours...`);
      setSelectedFile(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Clock;
      case 'failed': return AlertCircle;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'automatic' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Gestion des Sauvegardes</h2>
                <p className="text-gray-600">Sauvegarde et restauration des données</p>
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
          {/* Actions de sauvegarde */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 border border-gray-200 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Créer une Sauvegarde</span>
              </h3>
              
              <p className="text-gray-600 mb-4">
                Créez une sauvegarde complète de toutes les données du système.
              </p>
              
              {isCreatingBackup ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Création en cours...</span>
                    <span>{backupProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${backupProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={createBackup}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Database className="h-4 w-4" />
                  <span>Créer Sauvegarde</span>
                </button>
              )}
            </div>

            <div className="p-6 border border-gray-200 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Restaurer une Sauvegarde</span>
              </h3>
              
              <p className="text-gray-600 mb-4">
                Importez et restaurez une sauvegarde depuis un fichier.
              </p>
              
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".backup,.sql,.zip"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {selectedFile && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Fichier sélectionné: {selectedFile.name}
                    </p>
                    <p className="text-xs text-blue-600">
                      Taille: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                )}
                
                <button
                  onClick={uploadBackup}
                  disabled={!selectedFile}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Restaurer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Configuration automatique */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration Automatique</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuelle</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure
                </label>
                <input
                  type="time"
                  defaultValue="23:30"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rétention (jours)
                </label>
                <input
                  type="number"
                  defaultValue="30"
                  min="7"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoBackup"
                defaultChecked
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoBackup" className="text-sm text-gray-700">
                Activer les sauvegardes automatiques
              </label>
            </div>
          </div>

          {/* Liste des sauvegardes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Historique des Sauvegardes</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taille</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {backups.map((backup) => {
                    const StatusIcon = getStatusIcon(backup.status);
                    
                    return (
                      <tr key={backup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800">{backup.name}</p>
                            <p className="text-sm text-gray-500">{backup.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(backup.date).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{backup.size}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(backup.type)}`}>
                            {backup.type === 'automatic' ? 'Automatique' : 'Manuelle'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={`h-4 w-4 ${getStatusColor(backup.status)}`} />
                            <span className={`text-sm ${getStatusColor(backup.status)}`}>
                              {backup.status === 'completed' ? 'Terminée' :
                               backup.status === 'in-progress' ? 'En cours' : 'Échouée'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => downloadBackup(backup.id)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              title="Télécharger"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => restoreBackup(backup.id)}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                              title="Restaurer"
                            >
                              <Upload className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Informations importantes */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Recommandations</h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Effectuez des sauvegardes régulières, idéalement quotidiennes</li>
                  <li>• Stockez les sauvegardes dans un lieu sûr, de préférence hors site</li>
                  <li>• Testez régulièrement la restauration de vos sauvegardes</li>
                  <li>• Gardez plusieurs versions de sauvegarde (au moins 30 jours)</li>
                  <li>• Vérifiez l'intégrité des fichiers de sauvegarde</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Dernière sauvegarde automatique: 15 Octobre 2024 à 23:30
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupModal;