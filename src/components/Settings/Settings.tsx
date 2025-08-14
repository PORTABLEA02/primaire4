import React from 'react';
import { useState } from 'react';
import { Settings as SettingsIcon, Users, Calendar, DollarSign, BookOpen, Shield, Database } from 'lucide-react';
import SchoolInfoModal from './SchoolInfoModal';
import AcademicYearModal from './AcademicYearModal';
import UserManagementModal from './UserManagementModal';
import FinancialSettingsModal from './FinancialSettingsModal';
import AcademicLevelsModal from './AcademicLevelsModal';
import SecurityModal from './SecurityModal';
import LogsModal from './LogsModal';
import FinancialReportsModal from './FinancialReportsModal';
import BackupModal from './BackupModal';
import BulletinTemplatesModal from './BulletinTemplatesModal';
import SchoolManagementModal from './SchoolManagementModal';
import { useAcademicYear } from '../../contexts/AcademicYearContext';

const Settings: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { currentAcademicYear } = useAcademicYear();

  const settingsSections = [
    {
      title: 'Configuration Générale',
      icon: SettingsIcon,
      color: 'blue',
      settings: [
        { name: 'Gestion des écoles', action: 'school-management' },
        { name: 'Informations de l\'école', action: 'school-info' },
        { name: 'Année scolaire active', action: 'academic-year' }, 
        { name: 'Périodes et trimestres', action: 'academic-year' },
        { name: 'Seuil de promotion', action: 'academic-config' }
      ]
    },
    {
      title: 'Gestion des Utilisateurs',
      icon: Users,
      color: 'green',
      settings: [
        { name: 'Comptes utilisateurs', action: 'user-management' },
        { name: 'Rôles et permissions', action: 'user-management' },
        { name: 'Sécurité des accès', action: 'security' },
        { name: 'Historique des connexions', action: 'logs' }
      ]
    },
    {
      title: 'Configuration Académique',
      icon: BookOpen,
      color: 'purple',
      settings: [
        { name: 'Niveaux et classes', action: 'academic-levels' },
        { name: 'Matières enseignées', action: 'subjects' },
        { name: 'Emplois du temps', action: 'schedule-config' },
        { name: 'Modèles de bulletins', action: 'bulletin-templates' }
      ]
    },
    {
      title: 'Paramètres Financiers',
      icon: DollarSign,
      color: 'yellow',
      settings: [
        { name: 'Types de frais', action: 'financial-settings' },
        { name: 'Méthodes de paiement', action: 'financial-settings' },
        { name: 'Mobile Money', action: 'financial-settings' },
        { name: 'Rapports financiers', action: 'financial-reports' }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const handleSettingClick = (action: string) => {
    setActiveModal(action);
  };

  const handleSaveSchoolInfo = (schoolData: any) => {
    console.log('Informations école sauvegardées:', schoolData);
    // Ici vous pouvez implémenter la logique de sauvegarde
  };

  const handleSaveAcademicYear = (yearData: any) => {
    console.log('Année scolaire sauvegardée:', yearData);
    // Ici vous pouvez implémenter la logique de sauvegarde
  };

  const handleSaveFinancialSettings = (settings: any) => {
    console.log('Paramètres financiers sauvegardés:', settings);
    // Ici vous pouvez implémenter la logique de sauvegarde
  };

  const handleBackup = () => {
    console.log('Création de sauvegarde...');
    // Simulation de création de sauvegarde
    setTimeout(() => {
      alert('Sauvegarde créée avec succès !');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Paramètres</h1>
          <p className="text-sm sm:text-base text-gray-600">Configuration et administration du système</p>
        </div>
      </div>

      {/* Current School Year */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-blue-50 rounded-xl flex-shrink-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Année Scolaire Active</h2>
              <p className="text-sm sm:text-base text-gray-600">{currentAcademicYear} • Données de l'année en cours uniquement</p>
            </div>
          </div>
          <button 
            onClick={() => handleSettingClick('academic-year')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            Modifier
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          
          return (
            <div key={index} className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border ${getColorClasses(section.color).includes('border') ? getColorClasses(section.color).split(' ')[2] : 'border-gray-100'}`}>
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${getColorClasses(section.color).split(' ')[0]} ${getColorClasses(section.color).split(' ')[1]}`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">{section.title}</h3>
              </div>
              
              <div className="space-y-3">
                {section.settings.map((setting, settingIndex) => (
                  <div 
                    key={settingIndex} 
                    onClick={() => handleSettingClick(setting.action)}
                    className="flex items-center justify-between p-2 sm:p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base text-gray-700">{setting.name}</span>
                    <span className="text-gray-400">→</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* System Information */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
          <div className="p-1.5 sm:p-2 bg-gray-50 rounded-lg flex-shrink-0">
            <Database className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Informations Système</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-4 border border-gray-100 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-gray-800">1,247</p>
            <p className="text-xs sm:text-sm text-gray-600">Élèves inscrits</p>
          </div>
          
          <div className="text-center p-4 border border-gray-100 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-gray-800">24</p>
            <p className="text-xs sm:text-sm text-gray-600">Enseignants actifs</p>
          </div>
          
          <div className="text-center p-4 border border-gray-100 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-gray-800">42</p>
            <p className="text-xs sm:text-sm text-gray-600">Classes configurées</p>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
          <div className="p-1.5 sm:p-2 bg-red-50 rounded-lg flex-shrink-0">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Sécurité et Sauvegarde</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-100 rounded-lg">
            <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-2">Dernière Sauvegarde</h4>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">15 Octobre 2024 à 23:30</p>
            <button 
              onClick={() => setActiveModal('backup')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              Créer une Sauvegarde
            </button>
          </div>
          
          <div className="p-4 border border-gray-100 rounded-lg">
            <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-2">Journal d'Activité</h4>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">Dernière connexion: Aujourd'hui 14:25</p>
            <button 
              onClick={() => setActiveModal('logs')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Voir les Logs
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SchoolInfoModal
        isOpen={activeModal === 'school-info'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveSchoolInfo}
      />

      <AcademicYearModal
        isOpen={activeModal === 'academic-year'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveAcademicYear}
      />

      <UserManagementModal
        isOpen={activeModal === 'user-management'}
        onClose={() => setActiveModal(null)}
      />

      <FinancialSettingsModal
        isOpen={activeModal === 'financial-settings'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveFinancialSettings}
      />

      <AcademicLevelsModal
        isOpen={activeModal === 'academic-levels' || activeModal === 'subjects' || activeModal === 'schedule-config'}
        onClose={() => setActiveModal(null)}
      />

      <SecurityModal
        isOpen={activeModal === 'security'}
        onClose={() => setActiveModal(null)}
      />

      <LogsModal
        isOpen={activeModal === 'logs'}
        onClose={() => setActiveModal(null)}
      />

      <FinancialReportsModal
        isOpen={activeModal === 'financial-reports'}
        onClose={() => setActiveModal(null)}
      />

      <BackupModal
        isOpen={activeModal === 'backup'}
        onClose={() => setActiveModal(null)}
      />

      <BulletinTemplatesModal
        isOpen={activeModal === 'bulletin-templates'}
        onClose={() => setActiveModal(null)}
      />

      <SchoolManagementModal
        isOpen={activeModal === 'school-management'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};

export default Settings;