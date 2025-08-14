import React, { useState, useEffect } from 'react';
import { X, Users, User, ArrowRight, CheckCircle, AlertCircle, BookOpen, Calendar } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { TeacherService } from '../../services/teacherService';
import { ClassService } from '../../services/classService';

interface TeacherAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignTeacher: (assignments: Assignment[]) => void;
}

interface AvailableTeacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  qualification?: string;
  experience: string;
  specializations: string[];
  performance_rating: number;
}

interface ClassWithoutTeacher {
  id: string;
  name: string;
  level: string;
  current_students: number;
  capacity: number;
  subjects: string[];
  teacher_assignment?: Array<{
    teacher: {
      first_name: string;
      last_name: string;
      email: string;
    };
    salary_amount: number;
  }>;
}

interface Assignment {
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  salary: number;
}

const TeacherAssignmentModal: React.FC<TeacherAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssignTeacher
}) => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTeachers, setAvailableTeachers] = useState<AvailableTeacher[]>([]);
  const [classesWithoutTeacher, setClassesWithoutTeacher] = useState<ClassWithoutTeacher[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<AvailableTeacher | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassWithoutTeacher | null>(null);

  // Charger les données au montage
  useEffect(() => {
    if (isOpen && userSchool && currentAcademicYear) {
      loadData();
    }
  }, [isOpen, userSchool, currentAcademicYear]);

  const loadData = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);

      const [teachers, allClasses, assignments] = await Promise.all([
        TeacherService.getAvailableTeachers(userSchool.id, currentAcademicYear.id),
        ClassService.getClasses(userSchool.id, currentAcademicYear.id),
        TeacherService.getTeacherAssignments(userSchool.id, currentAcademicYear.id)
      ]);

      setAvailableTeachers(teachers);
      
      // Séparer les classes avec et sans enseignant
      const withoutTeacher = allClasses.filter(c => 
        !c.teacher_assignment || 
        c.teacher_assignment.length === 0 || 
        !c.teacher_assignment.some(ta => ta.is_active)
      );
      const withTeacher = allClasses.filter(c => 
        c.teacher_assignment && 
        c.teacher_assignment.length > 0 && 
        c.teacher_assignment.some(ta => ta.is_active)
      );
      
      setClassesWithoutTeacher(withoutTeacher);
      setAssignedClasses(withTeacher);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = () => {
    if (selectedTeacher && selectedClass) {
      const newAssignment: Assignment = {
        teacherId: selectedTeacher.id,
        teacherName: `${selectedTeacher.first_name} ${selectedTeacher.last_name}`,
        classId: selectedClass.id,
        className: selectedClass.name,
        salary: 150000 // Salaire par défaut
      };

      setPendingAssignments(prev => [
        ...prev.filter(a => a.teacherId !== selectedTeacher.id && a.classId !== selectedClass.id),
        newAssignment
      ]);

      setSelectedTeacher(null);
      setSelectedClass(null);
    }
  };

  const removeAssignment = (assignmentIndex: number) => {
    setPendingAssignments(prev => prev.filter((_, index) => index !== assignmentIndex));
  };

  const handleSaveAssignments = () => {
    if (pendingAssignments.length > 0) {
      onAssignTeacher(pendingAssignments);
      setPendingAssignments([]);
      onClose();
    }
  };

  const getTeacherSuitability = (teacher: AvailableTeacher, classInfo: ClassWithoutTeacher) => {
    let score = 0;
    let reasons = [];

    // Vérifier les spécialisations
    if (classInfo.level === 'Maternelle' && teacher.specializations?.includes('Petite Enfance')) {
      score += 3;
      reasons.push('Spécialisé en petite enfance');
    }

    if (teacher.specializations?.includes('Mathématiques') && classInfo.subjects?.includes('Mathématiques')) {
      score += 2;
      reasons.push('Spécialisé en mathématiques');
    }

    if (teacher.specializations?.includes('Sciences Naturelles') && classInfo.subjects?.includes('Sciences')) {
      score += 2;
      reasons.push('Spécialisé en sciences');
    }

    if (teacher.specializations?.includes('Littérature') && classInfo.subjects?.includes('Français')) {
      score += 2;
      reasons.push('Spécialisé en français');
    }

    // Expérience et performance
    if (teacher.performance_rating >= 4.5) {
      score += 2;
      reasons.push('Très expérimenté');
    } else if (teacher.performance_rating >= 4.0) {
      score += 1;
      reasons.push('Expérimenté');
    }

    if (score >= 4) return { level: 'Excellent', color: 'green', reasons };
    if (score >= 2) return { level: 'Bon', color: 'blue', reasons };
    if (score >= 1) return { level: 'Convenable', color: 'yellow', reasons };
    return { level: 'Possible', color: 'gray', reasons: ['Peut enseigner toutes les matières'] };
  };

  const getSuitabilityColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'Bon': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Convenable': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Gestion des Affectations</h2>
                <p className="text-gray-600">Assigner des enseignants aux classes disponibles</p>
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
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Enseignants Disponibles</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">{availableTeachers.length}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Classes sans Enseignant</span>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-2">{classesWithoutTeacher.length}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Classes Assignées</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">{assignedClasses.length}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Affectations en Attente</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">{pendingAssignments.length}</p>
            </div>
          </div>

          {/* Système d'enseignant unique */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Principe du Système d'Enseignant Unique</h3>
            <p className="text-sm text-blue-700">
              Chaque enseignant est responsable d'une seule classe et enseigne toutes les matières du programme de ce niveau. 
              Cela garantit un suivi personnalisé et une cohérence pédagogique optimale pour chaque élève.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Enseignants Disponibles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Enseignants Disponibles ({availableTeachers.length})</span>
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      onClick={() => setSelectedTeacher(teacher)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTeacher?.id === teacher.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {teacher.first_name[0]}{teacher.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{teacher.first_name} {teacher.last_name}</h4>
                            <p className="text-sm text-gray-600">{teacher.qualification || 'Qualification non renseignée'}</p>
                            <p className="text-xs text-gray-500">Expérience: {teacher.experience}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Disponible
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Spécialisations:</p>
                        <div className="flex flex-wrap gap-1">
                          {(teacher.specializations || []).map(spec => (
                            <span key={spec} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
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
                    </div>
                  ))}
                
                {availableTeachers.length === 0 && (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun enseignant disponible</p>
                    <p className="text-sm text-gray-400">Tous les enseignants ont déjà une classe assignée</p>
                  </div>
                )}
              </div>
            </div>

            {/* Classes sans Enseignant */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Classes sans Enseignant ({classesWithoutTeacher.length})</span>
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {classesWithoutTeacher.map((classInfo) => {
                  const suitability = selectedTeacher ? getTeacherSuitability(selectedTeacher, classInfo) : null;
                  
                  return (
                    <div
                      key={classInfo.id}
                      onClick={() => setSelectedClass(classInfo)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedClass?.id === classInfo.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-medium">
                              {classInfo.name.substring(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{classInfo.name}</h4>
                            <p className="text-sm text-gray-600">{classInfo.level}</p>
                            <p className="text-xs text-gray-500">
                              {classInfo.current_students}/{classInfo.capacity} élèves
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Sans enseignant
                          </span>
                          {suitability && (
                            <div className="mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSuitabilityColor(suitability.level)}`}>
                                {suitability.level}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Matières à enseigner:</p>
                        <div className="flex flex-wrap gap-1">
                          {(classInfo.subjects || []).slice(0, 4).map(subject => (
                            <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {subject}
                            </span>
                          ))}
                          {(classInfo.subjects || []).length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{(classInfo.subjects || []).length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {suitability && suitability.reasons.length > 0 && (
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-xs text-gray-600 mb-1">Pourquoi ce choix:</p>
                          <ul className="text-xs text-gray-700">
                            {suitability.reasons.slice(0, 2).map((reason, index) => (
                              <li key={index}>• {reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {classesWithoutTeacher.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-green-600 font-medium">Toutes les classes ont un enseignant !</p>
                    <p className="text-sm text-gray-500">Aucune affectation nécessaire</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Zone d'affectation */}
          {(selectedTeacher || selectedClass) && (
            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Nouvelle Affectation</h3>
              
              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  {selectedTeacher ? (
                    <div className="p-4 bg-blue-100 rounded-lg">
                      <p className="font-medium text-blue-800">
                        {selectedTeacher.first_name} {selectedTeacher.last_name}
                      </p>
                      <p className="text-sm text-blue-600">{selectedTeacher.qualification}</p>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Sélectionner un enseignant</p>
                    </div>
                  )}
                </div>

                <ArrowRight className="h-8 w-8 text-gray-400" />

                <div className="text-center">
                  {selectedClass ? (
                    <div className="p-4 bg-purple-100 rounded-lg">
                      <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="font-medium text-purple-800">{selectedClass.name}</p>
                      <p className="text-sm text-purple-600">{selectedClass.level} • {selectedClass.current_students} élèves</p>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Sélectionner une classe</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedTeacher && selectedClass && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleAssignTeacher}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span>Créer l'Affectation</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Affectations en attente */}
          {pendingAssignments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Affectations en Attente de Validation</h3>
              
              <div className="space-y-3">
                {pendingAssignments.map((assignment, index) => (
                  <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">{assignment.teacherName}</span>
                        </div>
                        
                        <ArrowRight className="h-4 w-4 text-green-600" />
                        
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">{assignment.className}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeAssignment(index)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="mt-3 text-sm text-green-700">
                      <p><strong>Salaire:</strong> {assignment.salary.toLocaleString()} FCFA/mois</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Classes déjà assignées */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Classes avec Enseignant Assigné</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedClasses.map((classInfo) => (
                <div key={classInfo.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{classInfo.name}</h4>
                        <p className="text-sm text-gray-600">{classInfo.level}</p>
                        <p className="text-xs text-gray-500">
                          {classInfo.current_students}/{classInfo.capacity} élèves
                        </p>
                      </div>
                    </div>
                    
                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                      Changer
                    </button>
                  </div>
                  
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Enseignant: {classInfo.teacher_assignment?.[0]?.teacher 
                        ? `${classInfo.teacher_assignment[0].teacher.first_name} ${classInfo.teacher_assignment[0].teacher.last_name}`
                        : 'Non assigné'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(classInfo.subjects || []).slice(0, 3).map(subject => (
                        <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {subject}
                        </span>
                      ))}
                      {(classInfo.subjects || []).length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{(classInfo.subjects || []).length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandations automatiques */}
          {availableTeachers.length > 0 && classesWithoutTeacher.length > 0 && (
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-3">Recommandations Automatiques</h3>
              
              <div className="space-y-2">
                {classesWithoutTeacher.slice(0, 3).map((classInfo) => {
                  const bestTeacher = availableTeachers
                    .map(teacher => ({
                      teacher,
                      suitability: getTeacherSuitability(teacher, classInfo)
                    }))
                    .sort((a, b) => {
                      const scoreA = a.suitability.level === 'Excellent' ? 4 : 
                                   a.suitability.level === 'Bon' ? 3 :
                                   a.suitability.level === 'Convenable' ? 2 : 1;
                      const scoreB = b.suitability.level === 'Excellent' ? 4 : 
                                   b.suitability.level === 'Bon' ? 3 :
                                   b.suitability.level === 'Convenable' ? 2 : 1;
                      return scoreB - scoreA;
                    })[0];

                  if (!bestTeacher) return null;

                  return (
                    <div key={classInfo.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-700">
                          <strong>{classInfo.name}</strong> → <strong>{bestTeacher.teacher.first_name} {bestTeacher.teacher.last_name}</strong>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSuitabilityColor(bestTeacher.suitability.level)}`}>
                          {bestTeacher.suitability.level}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedTeacher(bestTeacher.teacher);
                          setSelectedClass(classInfo);
                        }}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                      >
                        Appliquer
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {pendingAssignments.length > 0 && (
                <span>{pendingAssignments.length} affectation(s) en attente de validation</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              
              {pendingAssignments.length > 0 && (
                <button
                  onClick={handleSaveAssignments}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Valider les Affectations ({pendingAssignments.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignmentModal;