import React, { useState } from 'react';
import { X, Plus, Clock, Users, BookOpen, MapPin, User, Calendar } from 'lucide-react';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (courseData: NewCourseData) => void;
}

interface NewCourseData {
  subject: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
  notes?: string;
}

interface Teacher {
  id: string;
  name: string;
  assignedClass: string;
  subjects: string[];
}

interface ClassInfo {
  id: string;
  name: string;
  level: string;
  teacher: string;
  subjects: string[];
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  onClose,
  onAddCourse
}) => {
  const [formData, setFormData] = useState<NewCourseData>({
    subject: '',
    teacherId: '',
    teacherName: '',
    classId: '',
    className: '',
    day: '',
    startTime: '',
    endTime: '',
    classroom: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Données des enseignants avec leurs classes assignées
  const teachers: Teacher[] = [
    {
      id: 'traore',
      name: 'M. Moussa Traore',
      assignedClass: 'CI A',
      subjects: ['Français', 'Mathématiques', 'Éveil Scientifique', 'Éducation Civique']
    },
    {
      id: 'kone',
      name: 'Mme Aminata Kone',
      assignedClass: 'Maternelle 1A',
      subjects: ['Éveil', 'Langage', 'Graphisme', 'Jeux éducatifs']
    },
    {
      id: 'sidibe',
      name: 'M. Ibrahim Sidibe',
      assignedClass: 'CE2B',
      subjects: ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique']
    },
    {
      id: 'coulibaly',
      name: 'Mlle Fatoumata Coulibaly',
      assignedClass: 'Disponible',
      subjects: []
    }
  ];

  // Classes disponibles
  const classes: ClassInfo[] = [
    {
      id: 'maternelle-1a',
      name: 'Maternelle 1A',
      level: 'Maternelle',
      teacher: 'Mme Aminata Kone',
      subjects: ['Éveil', 'Langage', 'Graphisme', 'Jeux éducatifs']
    },
    {
      id: 'ci-a',
      name: 'CI A',
      level: 'CI',
      teacher: 'M. Moussa Traore',
      subjects: ['Français', 'Mathématiques', 'Éveil Scientifique', 'Éducation Civique']
    },
    {
      id: 'ce2b',
      name: 'CE2B',
      level: 'CE2',
      teacher: 'M. Ibrahim Sidibe',
      subjects: ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique']
    }
  ];

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const timeSlots = [
    { value: '08:00', label: '08:00' },
    { value: '10:00', label: '10:00' },
    { value: '12:00', label: '12:00' },
    { value: '14:00', label: '14:00' },
    { value: '16:00', label: '16:00' },
    { value: '18:00', label: '18:00' }
  ];

  const classrooms = [
    'Salle 1', 'Salle 2', 'Salle 3', 'Salle 8', 'Salle 12', 'Salle 15',
    'Laboratoire 1', 'Bibliothèque', 'Salle Informatique'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject) {
      newErrors.subject = 'La matière est requise';
    }

    if (!formData.teacherId) {
      newErrors.teacherId = 'L\'enseignant est requis';
    }

    if (!formData.classId) {
      newErrors.classId = 'La classe est requise';
    }

    if (!formData.day) {
      newErrors.day = 'Le jour est requis';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'L\'heure de début est requise';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'L\'heure de fin est requise';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'L\'heure de fin doit être après l\'heure de début';
    }

    if (!formData.classroom) {
      newErrors.classroom = 'La salle est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddCourse(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      subject: '',
      teacherId: '',
      teacherName: '',
      classId: '',
      className: '',
      day: '',
      startTime: '',
      endTime: '',
      classroom: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const handleTeacherChange = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      setFormData(prev => ({
        ...prev,
        teacherId,
        teacherName: teacher.name,
        // Si l'enseignant a une classe assignée, la sélectionner automatiquement
        classId: teacher.assignedClass !== 'Disponible' ? 
          classes.find(c => c.name === teacher.assignedClass)?.id || '' : '',
        className: teacher.assignedClass !== 'Disponible' ? teacher.assignedClass : '',
        subject: '' // Reset subject when teacher changes
      }));
    }
  };

  const handleClassChange = (classId: string) => {
    const selectedClass = classes.find(c => c.id === classId);
    if (selectedClass) {
      setFormData(prev => ({
        ...prev,
        classId,
        className: selectedClass.name,
        subject: '' // Reset subject when class changes
      }));
    }
  };

  // Obtenir les matières disponibles selon l'enseignant et la classe sélectionnés
  const getAvailableSubjects = () => {
    const teacher = teachers.find(t => t.id === formData.teacherId);
    const selectedClass = classes.find(c => c.id === formData.classId);
    
    if (teacher && selectedClass) {
      // Intersection des matières de l'enseignant et de la classe
      return teacher.subjects.filter(subject => 
        selectedClass.subjects.includes(subject)
      );
    }
    
    return teacher?.subjects || selectedClass?.subjects || [];
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Français': 'bg-green-100 text-green-800',
      'Mathématiques': 'bg-blue-100 text-blue-800',
      'Éveil Scientifique': 'bg-purple-100 text-purple-800',
      'Sciences': 'bg-purple-100 text-purple-800',
      'Histoire-Géographie': 'bg-orange-100 text-orange-800',
      'Éducation Civique': 'bg-yellow-100 text-yellow-800',
      'Éveil': 'bg-pink-100 text-pink-800',
      'Langage': 'bg-green-100 text-green-800',
      'Graphisme': 'bg-indigo-100 text-indigo-800',
      'Jeux éducatifs': 'bg-red-100 text-red-800'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  const availableSubjects = getAvailableSubjects();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Nouveau Cours</h2>
                <p className="text-gray-600">Ajouter un cours à l'emploi du temps</p>
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
          {/* Système d'enseignant unique */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Système d'Enseignant Unique</h3>
            <p className="text-sm text-blue-700">
              Dans notre système, chaque enseignant est responsable d'une classe et enseigne toutes les matières du programme. 
              Sélectionnez d'abord l'enseignant, puis la matière à programmer.
            </p>
          </div>

          {/* Sélection de l'enseignant */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Enseignant</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner l'Enseignant *
              </label>
              <select
                value={formData.teacherId}
                onChange={(e) => handleTeacherChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.teacherId ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Choisir un enseignant</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} {teacher.assignedClass !== 'Disponible' ? `(${teacher.assignedClass})` : '(Disponible)'}
                  </option>
                ))}
              </select>
              {errors.teacherId && <p className="text-red-500 text-sm mt-1">{errors.teacherId}</p>}
            </div>

            {/* Classe (automatiquement sélectionnée si enseignant a une classe) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe *
              </label>
              <select
                value={formData.classId}
                onChange={(e) => handleClassChange(e.target.value)}
                disabled={formData.teacherId && teachers.find(t => t.id === formData.teacherId)?.assignedClass !== 'Disponible'}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.classId ? 'border-red-300' : 'border-gray-200'
                } ${formData.teacherId && teachers.find(t => t.id === formData.teacherId)?.assignedClass !== 'Disponible' ? 'bg-gray-100' : ''}`}
              >
                <option value="">Choisir une classe</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.level})
                  </option>
                ))}
              </select>
              {errors.classId && <p className="text-red-500 text-sm mt-1">{errors.classId}</p>}
              {formData.teacherId && teachers.find(t => t.id === formData.teacherId)?.assignedClass !== 'Disponible' && (
                <p className="text-sm text-blue-600 mt-1">
                  Classe automatiquement sélectionnée selon l'enseignant
                </p>
              )}
            </div>
          </div>

          {/* Détails du cours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Détails du Cours</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matière *
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                disabled={availableSubjects.length === 0}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.subject ? 'border-red-300' : 'border-gray-200'
                } ${availableSubjects.length === 0 ? 'bg-gray-100' : ''}`}
              >
                <option value="">Choisir une matière</option>
                {availableSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
              {availableSubjects.length === 0 && formData.teacherId && (
                <p className="text-sm text-gray-500 mt-1">
                  Sélectionnez d'abord un enseignant et une classe
                </p>
              )}
            </div>

            {formData.subject && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(formData.subject)}`}>
                  {formData.subject}
                </span>
              </div>
            )}
          </div>

          {/* Horaires */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Horaires</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jour *
                </label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.day ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Choisir un jour</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                {errors.day && <p className="text-red-500 text-sm mt-1">{errors.day}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de début *
                </label>
                <select
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startTime ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Début</option>
                  {timeSlots.map(slot => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
                {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de fin *
                </label>
                <select
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endTime ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Fin</option>
                  {timeSlots.map(slot => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
                {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
              </div>
            </div>
          </div>

          {/* Salle */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Salle de Classe</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salle *
              </label>
              <select
                value={formData.classroom}
                onChange={(e) => setFormData(prev => ({ ...prev, classroom: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.classroom ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Choisir une salle</option>
                {classrooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
              {errors.classroom && <p className="text-red-500 text-sm mt-1">{errors.classroom}</p>}
            </div>
          </div>

          {/* Notes optionnelles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Commentaires ou informations supplémentaires..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Résumé */}
          {formData.subject && formData.teacherName && formData.className && formData.day && formData.startTime && formData.endTime && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Résumé du Cours</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Matière:</strong> {formData.subject}</p>
                <p><strong>Enseignant:</strong> {formData.teacherName}</p>
                <p><strong>Classe:</strong> {formData.className}</p>
                <p><strong>Horaire:</strong> {formData.day} de {formData.startTime} à {formData.endTime}</p>
                <p><strong>Salle:</strong> {formData.classroom}</p>
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
              <Plus className="h-4 w-4" />
              <span>Ajouter le Cours</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;