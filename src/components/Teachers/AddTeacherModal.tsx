import React, { useState } from 'react';
import { X, UserCheck, User, Mail, Phone, MapPin, Calendar, Award, BookOpen } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { ClassService } from '../../services/classService';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTeacher: (teacherData: NewTeacherData) => void;
  availableClasses?: string[];
}

interface NewTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  qualification: string;
  experience: string;
  specializations: string[];
  assignedClass: string | null;
  salary: number;
  hireDate: string;
  emergencyContact: string;
  subjects: string[];
  createUserAccount: boolean;
  password?: string;
  permissions?: string[];
}

const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  isOpen,
  onClose,
  onAddTeacher,
  availableClasses = []
}) => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [availableClassesData, setAvailableClassesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<NewTeacherData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    experience: '',
    specializations: [],
    assignedClass: null,
    salary: 150000,
    hireDate: new Date().toISOString().split('T')[0],
    emergencyContact: '',
    subjects: [],
    createUserAccount: false,
    password: '',
    permissions: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les classes disponibles
  React.useEffect(() => {
    if (isOpen && userSchool && currentAcademicYear) {
      loadAvailableClasses();
    }
  }, [isOpen, userSchool, currentAcademicYear]);

  const loadAvailableClasses = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);
      const classes = await ClassService.getClasses(userSchool.id, currentAcademicYear.id);
      
      // Filtrer les classes sans enseignant
      const classesWithoutTeacher = classes.filter(cls => !cls.teacher_assignment || cls.teacher_assignment.length === 0);
      setAvailableClassesData(classesWithoutTeacher);
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const qualifications = [
    'CAP Petite Enfance',
    'Licence en Pédagogie',
    'Licence en Lettres Modernes',
    'Licence en Sciences de l\'Éducation',
    'Licence en Mathématiques',
    'Maîtrise en Sciences Naturelles',
    'Master en Éducation',
    'Autre'
  ];

  const specializationOptions = [
    'Petite Enfance',
    'Psychologie Enfantine',
    'Mathématiques',
    'Sciences Naturelles',
    'Littérature',
    'Histoire',
    'Pédagogie',
    'Psychologie',
    'Environnement',
    'Langues'
  ];

  const subjectsByLevel = {
    'Maternelle': ['Éveil', 'Langage', 'Graphisme', 'Jeux éducatifs', 'Motricité'],
    'CI': ['Français', 'Mathématiques', 'Éveil Scientifique', 'Éducation Civique', 'Dessin'],
    'CP': ['Français', 'Mathématiques', 'Éveil Scientifique', 'Éducation Civique', 'Dessin'],
    'CE1': ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Dessin'],
    'CE2': ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Dessin'],
    'CM1': ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Anglais', 'Dessin'],
    'CM2': ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Anglais', 'Dessin']
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    }

    if (!formData.qualification) {
      newErrors.qualification = 'La qualification est requise';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'L\'expérience est requise';
    }

    if (formData.salary < 100000 || formData.salary > 500000) {
      newErrors.salary = 'Le salaire doit être entre 100,000 et 500,000 FCFA';
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Le contact d\'urgence est requis';
    }

    if (formData.createUserAccount) {
      if (!formData.password || formData.password.length < 8) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      }
      if (!formData.permissions || formData.permissions.length === 0) {
        newErrors.permissions = 'Au moins une permission doit être accordée';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddTeacher(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      qualification: '',
      experience: '',
      specializations: [],
      assignedClass: null,
      salary: 150000,
      hireDate: new Date().toISOString().split('T')[0],
      emergencyContact: '',
      subjects: [],
      createUserAccount: false,
      password: '',
      permissions: []
    });
    setErrors({});
    onClose();
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const handleClassAssignment = (className: string) => {
    if (className === '') {
      setFormData(prev => ({
        ...prev,
        assignedClass: null,
        subjects: []
      }));
    } else {
      // Trouver la classe sélectionnée
      const selectedClass = availableClassesData.find(cls => cls.name === className);
      const level = selectedClass?.level || '';

      const subjects = subjectsByLevel[level as keyof typeof subjectsByLevel] || [];

      setFormData(prev => ({
        ...prev,
        assignedClass: className,
        subjects: subjects
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Nouvel Enseignant</h2>
                <p className="text-gray-600">Ajouter un nouvel enseignant au système</p>
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
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informations Personnelles</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+229 01 XX XX XX XX"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Adresse
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact d'Urgence *
              </label>
              <input
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                placeholder="+229 01 XX XX XX XX"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.emergencyContact ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>}
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Informations Professionnelles</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification *
                </label>
                <select
                  value={formData.qualification}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.qualification ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Sélectionner une qualification</option>
                  {qualifications.map(qual => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
                {errors.qualification && <p className="text-red-500 text-sm mt-1">{errors.qualification}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expérience *
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Ex: 5 ans, Débutant..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.experience ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date d'Embauche *
                </label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salaire (FCFA) *
                </label>
                <input
                  type="number"
                  min="100000"
                  max="500000"
                  step="5000"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: parseInt(e.target.value) || 150000 }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.salary ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
              </div>
            </div>
          </div>

          {/* Spécialisations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Spécialisations</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {specializationOptions.map(specialization => (
                <label key={specialization} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specializations.includes(specialization)}
                    onChange={() => handleSpecializationToggle(specialization)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{specialization}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Affectation de classe */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Affectation de Classe (Optionnel)</span>
            </h3>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Système d'Enseignant Unique:</strong> Un enseignant peut être assigné à une classe pour enseigner toutes les matières du programme.
              </p>
              
              <select
                value={formData.assignedClass || ''}
                onChange={(e) => handleClassAssignment(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Aucune classe (Enseignant disponible)</option>
                {availableClassesData.map(cls => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>
              
              {loading && (
                <p className="text-sm text-gray-500 mt-1">Chargement des classes disponibles...</p>
              )}
              
              {!loading && availableClassesData.length === 0 && (
                <p className="text-sm text-yellow-600 mt-1">
                  Aucune classe disponible - Toutes les classes ont déjà un enseignant assigné
                </p>
              )}
            </div>

            {formData.assignedClass && formData.subjects.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Matières à Enseigner</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map(subject => (
                    <span key={subject} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Compte utilisateur */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Compte Utilisateur (Optionnel)</span>
            </h3>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.createUserAccount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    createUserAccount: e.target.checked,
                    permissions: e.target.checked ? ['academic'] : []
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-800">Créer un compte utilisateur</span>
                  <p className="text-sm text-gray-600">
                    Permet à l'enseignant de se connecter au système pour saisir des notes
                  </p>
                </div>
              </label>
            </div>

            {formData.createUserAccount && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de Passe *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimum 8 caractères"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions *
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'academic', label: 'Gestion académique (notes, bulletins)' },
                      { id: 'students', label: 'Consultation des élèves' },
                      { id: 'schedule', label: 'Consultation emploi du temps' }
                    ].map(permission => (
                      <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions?.includes(permission.id) || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ 
                                ...prev, 
                                permissions: [...(prev.permissions || []), permission.id] 
                              }));
                            } else {
                              setFormData(prev => ({ 
                                ...prev, 
                                permissions: (prev.permissions || []).filter(p => p !== permission.id) 
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.permissions && <p className="text-red-500 text-sm mt-1">{errors.permissions}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {formData.firstName && formData.lastName && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Résumé</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Nom complet:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Qualification:</strong> {formData.qualification}</p>
                <p><strong>Expérience:</strong> {formData.experience}</p>
                <p><strong>Classe assignée:</strong> {formData.assignedClass || 'Aucune (Disponible)'}</p>
                <p><strong>Salaire:</strong> {formData.salary.toLocaleString()} FCFA</p>
                <p><strong>Compte utilisateur:</strong> {formData.createUserAccount ? 'Oui' : 'Non'}</p>
                {formData.specializations.length > 0 && (
                  <p><strong>Spécialisations:</strong> {formData.specializations.join(', ')}</p>
                )}
                {formData.createUserAccount && formData.permissions && formData.permissions.length > 0 && (
                  <p><strong>Permissions:</strong> {formData.permissions.join(', ')}</p>
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
              <UserCheck className="h-4 w-4" />
              <span>Ajouter l'Enseignant</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacherModal;