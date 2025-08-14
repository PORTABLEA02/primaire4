import React, { useState } from 'react';
import { X, BookOpen, Plus, Trash2, Edit } from 'lucide-react';

interface AcademicLevelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Level {
  id: string;
  name: string;
  description: string;
  subjects: string[];
  minAge: number;
  maxAge: number;
  annualFees: number;
}

interface Subject {
  id: string;
  name: string;
  levels: string[];
  coefficient: number;
  description: string;
}

const AcademicLevelsModal: React.FC<AcademicLevelsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'subjects'>('levels');
  const [levels, setLevels] = useState<Level[]>([
    {
      id: '1',
      name: 'Maternelle',
      description: 'Éducation préscolaire pour les tout-petits',
      subjects: ['Éveil', 'Langage', 'Graphisme', 'Jeux éducatifs', 'Motricité'],
      minAge: 3,
      maxAge: 5,
      annualFees: 300000
    },
    {
      id: '2',
      name: 'CI',
      description: 'Cours d\'Initiation - Première année du primaire',
      subjects: ['Français', 'Mathématiques', 'Éveil Scientifique', 'Éducation Civique', 'Dessin'],
      minAge: 6,
      maxAge: 7,
      annualFees: 350000
    },
    {
      id: '3',
      name: 'CP',
      description: 'Cours Préparatoire',
      subjects: ['Français', 'Mathématiques', 'Éveil Scientifique', 'Éducation Civique', 'Dessin'],
      minAge: 7,
      maxAge: 8,
      annualFees: 350000
    },
    {
      id: '4',
      name: 'CE1',
      description: 'Cours Élémentaire 1ère année',
      subjects: ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Dessin'],
      minAge: 8,
      maxAge: 9,
      annualFees: 400000
    },
    {
      id: '5',
      name: 'CE2',
      description: 'Cours Élémentaire 2ème année',
      subjects: ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Dessin'],
      minAge: 9,
      maxAge: 10,
      annualFees: 400000
    },
    {
      id: '6',
      name: 'CM1',
      description: 'Cours Moyen 1ère année',
      subjects: ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Anglais', 'Dessin'],
      minAge: 10,
      maxAge: 11,
      annualFees: 450000
    },
    {
      id: '7',
      name: 'CM2',
      description: 'Cours Moyen 2ème année',
      subjects: ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Anglais', 'Dessin'],
      minAge: 11,
      maxAge: 12,
      annualFees: 450000
    }
  ]);

  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: '1',
      name: 'Français',
      levels: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
      coefficient: 4,
      description: 'Langue française, lecture, écriture, expression'
    },
    {
      id: '2',
      name: 'Mathématiques',
      levels: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
      coefficient: 4,
      description: 'Calcul, géométrie, résolution de problèmes'
    },
    {
      id: '3',
      name: 'Sciences',
      levels: ['CE1', 'CE2', 'CM1', 'CM2'],
      coefficient: 2,
      description: 'Sciences naturelles, physique, chimie'
    },
    {
      id: '4',
      name: 'Histoire-Géographie',
      levels: ['CE1', 'CE2', 'CM1', 'CM2'],
      coefficient: 2,
      description: 'Histoire du Mali et du monde, géographie'
    },
    {
      id: '5',
      name: 'Éducation Civique',
      levels: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
      coefficient: 1,
      description: 'Citoyenneté, valeurs civiques et morales'
    },
    {
      id: '6',
      name: 'Anglais',
      levels: ['CM1', 'CM2'],
      coefficient: 2,
      description: 'Langue anglaise de base'
    },
    {
      id: '7',
      name: 'Éveil',
      levels: ['Maternelle'],
      coefficient: 1,
      description: 'Éveil sensoriel et cognitif'
    },
    {
      id: '8',
      name: 'Langage',
      levels: ['Maternelle'],
      coefficient: 1,
      description: 'Développement du langage oral'
    }
  ]);

  const [showAddLevel, setShowAddLevel] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [newLevel, setNewLevel] = useState<Partial<Level>>({
    name: '',
    description: '',
    subjects: [],
    minAge: 6,
    maxAge: 7,
    annualFees: 350000
  });

  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    name: '',
    levels: [],
    coefficient: 1,
    description: ''
  });

  const handleAddLevel = () => {
    if (newLevel.name && newLevel.description) {
      const level: Level = {
        id: Date.now().toString(),
        name: newLevel.name,
        description: newLevel.description,
        subjects: newLevel.subjects || [],
        minAge: newLevel.minAge || 6,
        maxAge: newLevel.maxAge || 7,
        annualFees: newLevel.annualFees || 350000
      };
      
      setLevels(prev => [...prev, level]);
      setNewLevel({
        name: '',
        description: '',
        subjects: [],
        minAge: 6,
        maxAge: 7,
        annualFees: 350000
      });
      setShowAddLevel(false);
    }
  };

  const handleAddSubject = () => {
    if (newSubject.name && newSubject.description) {
      const subject: Subject = {
        id: Date.now().toString(),
        name: newSubject.name,
        levels: newSubject.levels || [],
        coefficient: newSubject.coefficient || 1,
        description: newSubject.description
      };
      
      setSubjects(prev => [...prev, subject]);
      setNewSubject({
        name: '',
        levels: [],
        coefficient: 1,
        description: ''
      });
      setShowAddSubject(false);
    }
  };

  const deleteLevel = (levelId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce niveau ?')) {
      setLevels(prev => prev.filter(l => l.id !== levelId));
    }
  };

  const deleteSubject = (subjectId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      setSubjects(prev => prev.filter(s => s.id !== subjectId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Configuration Académique</h2>
                <p className="text-gray-600">Gestion des niveaux et matières</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mt-6">
            <button
              onClick={() => setActiveTab('levels')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'levels'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Niveaux Scolaires
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subjects'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Matières
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'levels' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Niveaux Scolaires</h3>
                <button
                  onClick={() => setShowAddLevel(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouveau Niveau</span>
                </button>
              </div>

              {/* Add Level Form */}
              {showAddLevel && (
                <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <h4 className="font-medium text-purple-800 mb-4">Ajouter un Niveau</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du Niveau *
                      </label>
                      <input
                        type="text"
                        value={newLevel.name}
                        onChange={(e) => setNewLevel(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frais Annuels (FCFA) *
                      </label>
                      <input
                        type="number"
                        value={newLevel.annualFees}
                        onChange={(e) => setNewLevel(prev => ({ ...prev, annualFees: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Âge Minimum
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="15"
                        value={newLevel.minAge}
                        onChange={(e) => setNewLevel(prev => ({ ...prev, minAge: parseInt(e.target.value) || 6 }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Âge Maximum
                      </label>
                      <input
                        type="number"
                        min="4"
                        max="16"
                        value={newLevel.maxAge}
                        onChange={(e) => setNewLevel(prev => ({ ...prev, maxAge: parseInt(e.target.value) || 7 }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newLevel.description}
                      onChange={(e) => setNewLevel(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleAddLevel}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => setShowAddLevel(false)}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Levels List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {levels.map((level) => (
                  <div key={level.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-800">{level.name}</h4>
                        <p className="text-sm text-gray-600">{level.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingLevel(level)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteLevel(level.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Âge:</span>
                        <span>{level.minAge} - {level.maxAge} ans</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frais annuels:</span>
                        <span className="font-medium">{level.annualFees.toLocaleString()} FCFA</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Matières ({level.subjects.length}):</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {level.subjects.slice(0, 3).map(subject => (
                            <span key={subject} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              {subject}
                            </span>
                          ))}
                          {level.subjects.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{level.subjects.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Matières Enseignées</h3>
                <button
                  onClick={() => setShowAddSubject(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouvelle Matière</span>
                </button>
              </div>

              {/* Add Subject Form */}
              {showAddSubject && (
                <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <h4 className="font-medium text-purple-800 mb-4">Ajouter une Matière</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la Matière *
                      </label>
                      <input
                        type="text"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coefficient
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newSubject.coefficient}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, coefficient: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newSubject.description}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveaux Concernés
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {levels.map(level => (
                        <label key={level.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newSubject.levels?.includes(level.name) || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewSubject(prev => ({ 
                                  ...prev, 
                                  levels: [...(prev.levels || []), level.name] 
                                }));
                              } else {
                                setNewSubject(prev => ({ 
                                  ...prev, 
                                  levels: (prev.levels || []).filter(l => l !== level.name) 
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">{level.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleAddSubject}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => setShowAddSubject(false)}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Subjects List */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matière</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveaux</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coefficient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800">{subject.name}</p>
                            <p className="text-sm text-gray-500">{subject.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {subject.levels.map(level => (
                              <span key={level} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {level}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-800">{subject.coefficient}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditingSubject(subject)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteSubject(subject.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicLevelsModal;