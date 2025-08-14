import React, { useState, useEffect } from 'react';
import { X, User, Users, ArrowRight, CheckCircle, AlertCircle, Award } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { TeacherService } from '../../services/teacherService';
import { ActivityLogService } from '../../services/activityLogService';

interface ChangeTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: {
    id: string;
    name: string;
    level: string;
    teacher: string;
    teacherId: string;
    subjects: string[];
  };
  onChangeTeacher: (classId: string, newTeacherId: string, newTeacherName: string) => void;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  qualification?: string;
  experience: string;
  specializations: string[];
  performance_rating: number;
  current_assignment?: Array<{
    class: {
      name: string;
    };
    is_active: boolean;
  }>;
}

const ChangeTeacherModal: React.FC<ChangeTeacherModalProps> = ({
  isOpen,
  onClose,
  classData,
  onChangeTeacher
}) => {
  const { userSchool, currentAcademicYear, user } = useAuth();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [confirmationStep, setConfirmationStep] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les enseignants disponibles
  useEffect(() => {
    if (isOpen && userSchool && currentAcademicYear) {
      loadAvailableTeachers();
    }
  }, [isOpen, userSchool, currentAcademicYear]);

  const loadAvailableTeachers = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);
      setError(null);

      // Charger les enseignants disponibles (sans classe assignée)
      const teachers = await TeacherService.getAvailableTeachers(userSchool.id, currentAcademicYear.id);
      setAvailableTeachers(teachers);

    } catch (error: any) {
      console.error('Erreur lors du chargement des enseignants:', error);
      setError(error.message || 'Erreur lors du chargement des enseignants');
    } finally {
      setLoading(false);
    }
  };

  const getTeacherSuitability = (teacher: Teacher) => {
    let score = 0;
    let reasons = [];

    // Vérifier les spécialisations
    if (classData.level === 'Maternelle' && teacher.specializations?.includes('Petite Enfance')) {
      score += 3;
      reasons.push('Spécialisé en petite enfance');
    }

    if (teacher.specializations?.includes('Mathématiques') && classData.subjects.includes('Mathématiques')) {
      score += 2;
      reasons.push('Spécialisé en mathématiques');
    }

    if (teacher.specializations?.includes('Sciences Naturelles') && classData.subjects.includes('Sciences')) {
      score += 2;
      reasons.push('Spécialisé en sciences');
    }

    if (teacher.specializations?.includes('Littérature') && classData.subjects.includes('Français')) {
      score += 2;
      reasons.push('Spécialisé en français');
    }

    // Expérience
    const experienceYears = parseInt(teacher.experience?.split(' ')[0] || '0');
    if (experienceYears >= 10) {
      score += 2;
      reasons.push('Très expérimenté');
    } else if (experienceYears >= 5) {
      score += 1;
      reasons.push('Expérimenté');
    }

    // Performance
    if (teacher.performance_rating >= 4.5) {
      score += 2;
      reasons.push('Excellente performance');
    } else if (teacher.performance_rating >= 4.0) {
      score += 1;
      reasons.push('Bonne performance');
    }

    if (score >= 5) return { level: 'Excellent', color: 'green', reasons };
    if (score >= 3) return { level: 'Très Bon', color: 'blue', reasons };
    if (score >= 1) return { level: 'Bon', color: 'yellow', reasons };
    return { level: 'Convenable', color: 'gray', reasons: ['Peut enseigner toutes les matières'] };
  };

  const getSuitabilityColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'Très Bon': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const handleConfirmChange = async () => {
    if (selectedTeacher && userSchool) {
      try {
        setLoading(true);

        // Logger l'activité
        await ActivityLogService.logActivity({
          schoolId: userSchool.id,
          userId: user?.id,
          action: 'CHANGE_CLASS_TEACHER',
          entityType: 'teacher_assignment',
          entityId: classData.id,
          level: 'info',
          details: `Changement d'enseignant pour ${classData.name}: ${selectedTeacher.first_name} ${selectedTeacher.last_name}`
        });

        onChangeTeacher(classData.id, selectedTeacher.id, `${selectedTeacher.first_name} ${selectedTeacher.last_name}`);
        onClose();
        setSelectedTeacher(null);
        setConfirmationStep(false);
      } catch (error: any) {
        console.error('Erreur lors du changement d\'enseignant:', error);
        setError(error.message || 'Erreur lors du changement');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setSelectedTeacher(null);
    setConfirmationStep(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Changer l'Enseignant</h2>
                <p className="text-gray-600">{classData.name} • Enseignant actuel: {classData.teacher}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!confirmationStep ? (
            <>
              {/* Enseignant actuel */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">Enseignant Actuel</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">{classData.teacher}</p>
                    <p className="text-sm text-blue-600">Enseigne toutes les matières de {classData.name}</p>
                  </div>
                </div>
              </div>

              {/* Système d'enseignant unique */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Important - Système d'Enseignant Unique</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Le nouvel enseignant sera responsable de toutes les matières de la classe: {classData.subjects.join(', ')}.
                      Il assurera l'enseignement complet du programme de {classData.level}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Enseignants disponibles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Enseignants Disponibles</h3>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des enseignants disponibles...</p>
                  </div>
                ) : availableTeachers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableTeachers.map((teacher) => {
                      const suitability = getTeacherSuitability(teacher);
                      const isSelected = selectedTeacher?.id === teacher.id;
                      const hasActiveAssignment = teacher.current_assignment?.some(a => a.is_active);
                      
                      return (
                        <div
                          key={teacher.id}
                          onClick={() => !hasActiveAssignment && setSelectedTeacher(teacher)}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            hasActiveAssignment
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                              : isSelected
                                ? 'border-purple-500 bg-purple-50 cursor-pointer'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 font-medium">
                                  {teacher.first_name[0]}{teacher.last_name[0]}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800">{teacher.first_name} {teacher.last_name}</h4>
                                <p className="text-sm text-gray-600">{teacher.qualification || 'Qualification non renseignée'}</p>
                                <p className="text-xs text-gray-500">Expérience: {teacher.experience || 'Non renseignée'}</p>
                              </div>
                            </div>
                            
                            {hasActiveAssignment ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                Déjà assigné
                              </span>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSuitabilityColor(suitability.level)}`}>
                                {suitability.level}
                              </span>
                            )}
                          </div>
                          
                          {/* Performance */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">Performance:</span>
                            <div className="flex items-center space-x-2">
                              {renderStars(teacher.performance_rating)}
                              <span className="font-medium text-gray-800">{teacher.performance_rating}/5</span>
                            </div>
                          </div>
                          
                          {/* Spécialisations */}
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-2">Spécialisations:</p>
                            <div className="flex flex-wrap gap-1">
                              {(teacher.specializations || []).map(spec => (
                                <span key={spec} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {spec}
                                </span>
                              ))}
                              {(!teacher.specializations || teacher.specializations.length === 0) && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  Polyvalent
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Raisons de compatibilité */}
                          {!hasActiveAssignment && suitability.reasons.length > 0 && (
                            <div className="p-2 bg-white rounded border">
                              <p className="text-xs text-gray-600 mb-1">Pourquoi ce choix:</p>
                              <ul className="text-xs text-gray-700">
                                {suitability.reasons.slice(0, 2).map((reason, index) => (
                                  <li key={index}>• {reason}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {hasActiveAssignment && (
                            <div className="p-2 bg-red-50 rounded border border-red-200">
                              <p className="text-xs text-red-700">
                                Actuellement assigné à: {teacher.current_assignment?.find(a => a.is_active)?.class?.name || 'Une autre classe'}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun enseignant disponible</p>
                    <p className="text-sm text-gray-400">Tous les enseignants ont déjà une classe assignée</p>
                  </div>
                )}
              </div>

              {/* Aperçu du changement */}
              {selectedTeacher && (
                <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Aperçu du Changement</h3>
                  
                  <div className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                      <div className="p-4 bg-red-100 rounded-lg">
                        <User className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <p className="font-medium text-red-800">{classData.teacher}</p>
                        <p className="text-sm text-red-600">Enseignant actuel</p>
                      </div>
                    </div>

                    <ArrowRight className="h-8 w-8 text-gray-400" />

                    <div className="text-center">
                      <div className="p-4 bg-green-100 rounded-lg">
                        <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="font-medium text-green-800">{selectedTeacher.first_name} {selectedTeacher.last_name}</p>
                        <p className="text-sm text-green-600">Nouvel enseignant</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white rounded-lg border">
                    <h4 className="font-medium text-gray-800 mb-2">Impact du Changement</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• {selectedTeacher.first_name} {selectedTeacher.last_name} deviendra responsable de toutes les matières de {classData.name}</li>
                      <li>• L'emploi du temps sera automatiquement transféré</li>
                      <li>• Les parents seront notifiés du changement</li>
                      <li>• Une période de transition de 1 semaine sera mise en place</li>
                    </ul>
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setConfirmationStep(true)}
                      disabled={loading}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto disabled:opacity-50"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>Procéder au Changement</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Confirmation */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirmer le Changement</h3>
                <p className="text-gray-600">Êtes-vous sûr de vouloir effectuer ce changement d'enseignant ?</p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-4">Récapitulatif du Changement</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Classe:</span>
                    <span className="font-medium">{classData.name} ({classData.level})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ancien enseignant:</span>
                    <span className="font-medium text-red-600">{classData.teacher}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nouvel enseignant:</span>
                    <span className="font-medium text-green-600">
                      {selectedTeacher?.first_name} {selectedTeacher?.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Matières concernées:</span>
                    <span className="font-medium">{classData.subjects.length} matières</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date d'effet:</span>
                    <span className="font-medium">Immédiat</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Actions Automatiques</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ Transfert de l'emploi du temps</li>
                  <li>✓ Notification aux parents par email/SMS</li>
                  <li>✓ Mise à jour des documents administratifs</li>
                  <li>✓ Briefing du nouvel enseignant</li>
                  <li>✓ Archivage des données de l'ancien enseignant</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {!confirmationStep && selectedTeacher && (
                <span>Enseignant sélectionné: {selectedTeacher.first_name} {selectedTeacher.last_name}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              
              {confirmationStep && selectedTeacher && (
                <button
                  onClick={handleConfirmChange}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Changement...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Confirmer le Changement</span>
                    </>
                  )}
                </button>
              )}
              
              {!confirmationStep && selectedTeacher && !loading && (
                <button
                  onClick={() => setConfirmationStep(true)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Continuer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeTeacherModal;