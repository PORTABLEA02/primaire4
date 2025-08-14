import React, { useState } from 'react';
import { X, Users, BookOpen, User, MapPin, AlertCircle } from 'lucide-react';
import { SUBJECTS_BY_LEVEL, FEES_BY_LEVEL } from '../../utils/constants';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClass: (classData: NewClassData) => void;
  availableTeachers: Teacher[];
}

interface Teacher {
  id: string;
  name: string;
  isAvailable: boolean;
}

interface NewClassData {
  name: string;
  level: string;
  capacity: number;
  teacherId: string;
  teacherName: string;
  subjects: string[];
  salary?: number;
}

const AddClassModal: React.FC<AddClassModalProps> = ({
  isOpen,
  onClose,
  onAddClass,
  availableTeachers
}) => {
  const [formData, setFormData] = useState<NewClassData>({
    name: '',
    level: '',
    capacity: 30,
    teacherId: '',
    teacherName: '',
    subjects: [],
    salary: 150000
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const levels = [
    'Garderie',
    'Maternelle',
    'CI',
    'CP',
    'CE1',
    'CE2',
    'CM1',
    'CM2'
  ];


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la classe est requis';
    }

    if (!formData.level) {
      newErrors.level = 'Le niveau est requis';
    }

    if (formData.capacity < 10 || formData.capacity > 50) {
      newErrors.capacity = 'La capacité doit être entre 10 et 50 élèves';
    }


    if (formData.subjects.length === 0) {
      newErrors.subjects = 'Au moins une matière doit être sélectionnée';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddClass(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      level: '',
      capacity: 30,
      teacherId: '',
      teacherName: '',
      subjects: [],
      salary: 150000
    });
    setErrors({});
    onClose();
  };

  const handleLevelChange = (level: string) => {
    setFormData(prev => ({
      ...prev,
      level,
      subjects: SUBJECTS_BY_LEVEL[level as keyof typeof SUBJECTS_BY_LEVEL] || []
    }));
  };

  const handleTeacherChange = (teacherId: string) => {
    const teacher = availableTeachers.find(t => t.id === teacherId);
    setFormData(prev => ({
      ...prev,
      teacherId,
      teacherName: teacher?.name || ''
    }));
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Nouvelle Classe</h2>
                <p className="text-gray-600">Créer une nouvelle classe avec enseignant unique</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Informations de Base</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la Classe *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: CM2A, CE1B..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.level ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Sélectionner un niveau</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacité Maximum *
                </label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 30 }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.capacity ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salaire Enseignant (FCFA)
                </label>
                <input
                  type="number"
                  min="100000"
                  max="500000"
                  step="5000"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: parseInt(e.target.value) || 150000 }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Salaire mensuel de l'enseignant</p>
              </div>
            </div>
          </div>

          {/* Teacher Assignment */}
          {availableTeachers.length > 0 && (
            <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Enseignant Titulaire</span>
            </h3>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Système d'Enseignant Unique:</strong> Chaque classe a un seul enseignant qui assure toutes les matières du programme.
              </p>
              
              <select
                value={formData.teacherId}
                onChange={(e) => handleTeacherChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.teacherId ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Sélectionner un enseignant</option>
                {availableTeachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id} disabled={!teacher.isAvailable}>
                    {teacher.name} {!teacher.isAvailable ? '(Déjà assigné)' : '(Disponible)'}
                  </option>
                ))}
              </select>
              {errors.teacherId && <p className="text-red-500 text-sm mt-1">{errors.teacherId}</p>}
              
              {availableTeachers.length === 0 && (
                <p className="text-sm text-yellow-700 mt-2">
                  Aucun enseignant disponible. Vous pourrez assigner un enseignant plus tard.
                </p>
              )}
            </div>
            </div>
          )}

          {/* Subjects */}
          {formData.level && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Matières Enseignées</span>
              </h3>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Matières du programme officiel béninois pour le niveau {formData.level}:
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(SUBJECTS_BY_LEVEL[formData.level as keyof typeof SUBJECTS_BY_LEVEL] || []).map(subject => (
                    <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
                
                {errors.subjects && <p className="text-red-500 text-sm mt-2">{errors.subjects}</p>}
              </div>
              
              {formData.level && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Frais de scolarité recommandés:</strong> {FEES_BY_LEVEL[formData.level as keyof typeof FEES_BY_LEVEL]?.toLocaleString() || 'Non défini'} FCFA/an
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {formData.name && formData.level && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Résumé de la Classe</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Classe:</strong> {formData.name} ({formData.level})</p>
                <p><strong>Enseignant:</strong> {formData.teacherName || 'À assigner plus tard'}</p>
                <p><strong>Capacité:</strong> {formData.capacity} élèves</p>
                <p><strong>Matières:</strong> {formData.subjects.length} matières sélectionnées</p>
                {formData.teacherId && (
                  <p><strong>Salaire:</strong> {formData.salary?.toLocaleString()} FCFA/mois</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Créer la Classe</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;