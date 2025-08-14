import React, { useState } from 'react';
import { X, School, Plus, Edit, Trash2, Eye, Settings, Users, Building } from 'lucide-react';
import { useSchool } from '../../contexts/SchoolContext';
import { School as SchoolType } from '../../types/School';
import AddSchoolModal from '../Schools/AddSchoolModal';

interface SchoolManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SchoolManagementModal: React.FC<SchoolManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { schools, currentSchool, setCurrentSchool, updateSchool, deleteSchool } = useSchool();
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);
  const [showSchoolDetail, setShowSchoolDetail] = useState(false);

  const handleSetActive = (school: SchoolType) => {
    setCurrentSchool(school);
    alert(`${school.name} est maintenant l'école active`);
  };

  const handleDeleteSchool = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    if (school && confirm(`Êtes-vous sûr de vouloir supprimer "${school.name}" ? Cette action est irréversible.`)) {
      deleteSchool(schoolId);
    }
  };

  const toggleSchoolStatus = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      updateSchool(schoolId, { isActive: !school.isActive });
    }
  };

  const SchoolDetailModal = ({ school, onClose }: { school: SchoolType; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <School className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{school.name}</h2>
                <p className="text-gray-600">{school.address}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  school.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {school.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations Générales</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Directeur:</span>
                    <span className="font-medium">{school.director}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Téléphone:</span>
                    <span className="font-medium">{school.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{school.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fondée en:</span>
                    <span className="font-medium">{school.foundedYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacité:</span>
                    <span className="font-medium">{school.studentCapacity} élèves</span>
                  </div>
                  {school.motto && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Devise:</span>
                      <span className="font-medium italic">"{school.motto}"</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration Académique</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Année scolaire:</span>
                    <span className="font-medium">{school.settings.academicYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Périodes:</span>
                    <span className="font-medium">{school.settings.periods.length} trimestres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Devise:</span>
                    <span className="font-medium">{school.settings.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Types de frais:</span>
                    <span className="font-medium">{school.settings.feeTypes.length} configurés</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Gestion des Écoles</h2>
                <p className="text-gray-600">Administration des établissements du réseau</p>
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
          {/* Header avec bouton d'ajout */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Écoles du Réseau</h3>
              <p className="text-gray-600">{schools.length} établissement(s) configuré(s)</p>
            </div>
            <button
              onClick={() => setShowAddSchoolModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvelle École</span>
            </button>
          </div>

          {/* Liste des écoles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {schools.map((school) => (
              <div key={school.id} className={`p-6 border-2 rounded-xl transition-all ${
                currentSchool?.id === school.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <School className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{school.name}</h4>
                      <p className="text-sm text-gray-600">{school.director}</p>
                      {currentSchool?.id === school.id && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mt-1">
                          École Active
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setSelectedSchool(school);
                        setShowSchoolDetail(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => toggleSchoolStatus(school.id)}
                      className={`p-2 rounded transition-colors ${
                        school.isActive 
                          ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      }`}
                      title={school.isActive ? 'Désactiver' : 'Activer'}
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteSchool(school.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adresse:</span>
                    <span className="text-right">{school.address.split(',')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacité:</span>
                    <span>{school.studentCapacity} élèves</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Année scolaire:</span>
                    <span>{school.settings.academicYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className={school.isActive ? 'text-green-600' : 'text-red-600'}>
                      {school.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {currentSchool?.id !== school.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleSetActive(school)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Définir comme École Active
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {schools.length === 0 && (
            <div className="text-center py-12">
              <School className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune École Configurée</h3>
              <p className="text-gray-600 mb-4">Commencez par ajouter votre première école au système</p>
              <button
                onClick={() => setShowAddSchoolModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Ajouter une École</span>
              </button>
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

        {/* Modals */}
        <AddSchoolModal
          isOpen={showAddSchoolModal}
          onClose={() => setShowAddSchoolModal(false)}
        />

        {selectedSchool && showSchoolDetail && (
          <SchoolDetailModal 
            school={selectedSchool} 
            onClose={() => {
              setShowSchoolDetail(false);
              setSelectedSchool(null);
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default SchoolManagementModal;