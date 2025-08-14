import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, User, MapPin, Plus, Edit, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { ScheduleService } from '../../services/scheduleService';
import { SubjectService } from '../../services/subjectService';
import { ClassroomService } from '../../services/classroomService';
import { ActivityLogService } from '../../services/activityLogService';

interface ClassScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: {
    id: string;
    name: string;
    level: string;
    teacher_assignment?: Array<{
      teacher: {
        id: string;
        first_name: string;
        last_name: string;
      };
    }>;
    subjects: string[];
  };
}

interface ScheduleSlot {
  id: string;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  teacher_first_name: string;
  teacher_last_name: string;
  classroom_name?: string;
  classroom_capacity?: number;
}

interface NewCourseData {
  subjectId: string;
  day: number;
  startTime: string;
  endTime: string;
  classroomId?: string;
}

const ClassScheduleModal: React.FC<ClassScheduleModalProps> = ({
  isOpen,
  onClose,
  classData
}) => {
  const { userSchool, currentAcademicYear, user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [availableClassrooms, setAvailableClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState<NewCourseData>({
    subjectId: '',
    day: 1,
    startTime: '',
    endTime: '',
    classroomId: ''
  });

  const days = [
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' }
  ];

  const timeSlots = [
    { start: '08:00', end: '10:00' },
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' }
  ];

  // Charger les données au montage
  useEffect(() => {
    if (isOpen && classData && userSchool && currentAcademicYear) {
      loadScheduleData();
    }
  }, [isOpen, classData, userSchool, currentAcademicYear]);

  const loadScheduleData = async () => {
    if (!userSchool || !currentAcademicYear || !classData) return;

    try {
      setLoading(true);
      setError(null);

      const [scheduleData, subjectsData, classroomsData] = await Promise.all([
        ScheduleService.getClassSchedule(classData.id, currentAcademicYear.id),
        SubjectService.getSubjectsByLevel(userSchool.id, classData.level),
        ClassroomService.getAvailableClassrooms(userSchool.id, currentAcademicYear.id)
      ]);

      setSchedule(scheduleData);
      setAvailableSubjects(subjectsData);
      setAvailableClassrooms(classroomsData);

    } catch (error: any) {
      console.error('Erreur lors du chargement de l\'emploi du temps:', error);
      setError(error.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getScheduleForSlot = (dayValue: number, timeSlot: { start: string; end: string }) => {
    return schedule.find(item => 
      item.day_of_week === dayValue && 
      item.start_time === timeSlot.start &&
      item.end_time === timeSlot.end
    );
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Français': 'bg-green-100 text-green-800 border-green-200',
      'Mathématiques': 'bg-blue-100 text-blue-800 border-blue-200',
      'Éveil Scientifique': 'bg-purple-100 text-purple-800 border-purple-200',
      'Sciences': 'bg-purple-100 text-purple-800 border-purple-200',
      'Histoire-Géographie': 'bg-orange-100 text-orange-800 border-orange-200',
      'Éducation Civique': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Éveil': 'bg-pink-100 text-pink-800 border-pink-200',
      'Langage': 'bg-green-100 text-green-800 border-green-200',
      'Graphisme': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Jeux éducatifs': 'bg-red-100 text-red-800 border-red-200',
      'Anglais': 'bg-teal-100 text-teal-800 border-teal-200',
      'Dessin': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleAddCourse = async () => {
    if (!userSchool || !currentAcademicYear || !classData.teacher_assignment?.[0]?.teacher) {
      alert('Informations manquantes pour créer le cours');
      return;
    }

    if (!newCourse.subjectId || !newCourse.startTime || !newCourse.endTime) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);

      // Vérifier les conflits d'horaire
      const conflicts = await ScheduleService.checkScheduleConflicts(
        classData.teacher_assignment[0].teacher.id,
        newCourse.classroomId || '',
        newCourse.day,
        newCourse.startTime,
        newCourse.endTime,
        currentAcademicYear.id
      );

      if (conflicts.length > 0) {
        alert('Conflit d\'horaire détecté. Veuillez choisir un autre créneau.');
        return;
      }

      // Créer le créneau
      await ScheduleService.createScheduleSlot({
        schoolId: userSchool.id,
        academicYearId: currentAcademicYear.id,
        classId: classData.id,
        teacherId: classData.teacher_assignment[0].teacher.id,
        subjectId: newCourse.subjectId,
        classroomId: newCourse.classroomId,
        dayOfWeek: newCourse.day,
        startTime: newCourse.startTime,
        endTime: newCourse.endTime
      });

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: userSchool.id,
        userId: user?.id,
        action: 'CREATE_SCHEDULE_SLOT',
        entityType: 'schedule',
        level: 'success',
        details: `Nouveau cours ajouté pour ${classData.name}`
      });

      // Recharger les données
      await loadScheduleData();
      
      // Reset du formulaire
      setNewCourse({
        subjectId: '',
        day: 1,
        startTime: '',
        endTime: '',
        classroomId: ''
      });
      setShowAddCourse(false);

      alert('Cours ajouté avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du cours:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCourse = async (slotId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      setLoading(true);

      await ScheduleService.deleteScheduleSlot(slotId);

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: userSchool?.id,
        userId: user?.id,
        action: 'DELETE_SCHEDULE_SLOT',
        entityType: 'schedule',
        entityId: slotId,
        level: 'warning',
        details: `Cours supprimé pour ${classData.name}`
      });

      // Recharger les données
      await loadScheduleData();
      alert('Cours supprimé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const totalHours = schedule.length;
  const subjectHours = schedule.reduce((acc, item) => {
    acc[item.subject_name] = (acc[item.subject_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const teacher = classData.teacher_assignment?.[0]?.teacher;
  const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Non assigné';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Emploi du Temps - {classData.name}</h2>
                <p className="text-gray-600">{classData.level} • Enseignant: {teacherName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadScheduleData}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
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

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Heures/Semaine</p>
                  <p className="text-2xl font-bold text-blue-800">{totalHours}h</p>
                </div>
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Matières</p>
                  <p className="text-2xl font-bold text-green-800">{Object.keys(subjectHours).length}</p>
                </div>
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Enseignant</p>
                  <p className="text-lg font-bold text-purple-800">Unique</p>
                </div>
                <User className="h-6 w-6 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Salle</p>
                  <p className="text-lg font-bold text-orange-800">
                    {schedule.length > 0 ? schedule[0].classroom_name || 'Variable' : 'N/A'}
                  </p>
                </div>
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Emploi du temps */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-800">Planning Hebdomadaire</h3>
              <button
                onClick={() => setShowAddCourse(true)}
                disabled={loading || !teacher}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Cours</span>
              </button>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Chargement de l'emploi du temps...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                        Horaires
                      </th>
                      {days.map(day => (
                        <th key={day.value} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          {day.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {timeSlots.map((timeSlot, timeIndex) => (
                      <tr key={timeIndex} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-700 bg-gray-50">
                          {timeSlot.start}-{timeSlot.end}
                        </td>
                        {days.map(day => {
                          const scheduleItem = getScheduleForSlot(day.value, timeSlot);
                          
                          return (
                            <td key={day.value} className="px-2 py-2 text-center">
                              {timeSlot.start === '12:00' ? (
                                <div className="h-20 flex items-center justify-center bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                                  <span className="text-yellow-700 font-medium">Pause</span>
                                </div>
                              ) : scheduleItem ? (
                                <div className={`p-3 rounded-lg border-2 ${getSubjectColor(scheduleItem.subject_name)} relative group`}>
                                  <div className="font-medium text-sm mb-1">{scheduleItem.subject_name}</div>
                                  <div className="text-xs opacity-75 mb-1">
                                    {scheduleItem.teacher_first_name} {scheduleItem.teacher_last_name}
                                  </div>
                                  {scheduleItem.classroom_name && (
                                    <div className="text-xs opacity-60 flex items-center justify-center">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {scheduleItem.classroom_name}
                                    </div>
                                  )}
                                  
                                  {/* Actions sur hover */}
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleRemoveCourse(scheduleItem.id)}
                                      disabled={loading}
                                      className="p-1 bg-white rounded shadow-sm hover:bg-red-50 disabled:opacity-50"
                                    >
                                      <Trash2 className="h-3 w-3 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setShowAddCourse(true)}
                                  disabled={loading || !teacher}
                                  className="w-full h-20 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center group disabled:opacity-50"
                                >
                                  <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Répartition des matières */}
          {Object.keys(subjectHours).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition Horaire par Matière</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(subjectHours).map(([subject, hours]) => (
                  <div key={subject} className={`p-4 rounded-lg border-2 ${getSubjectColor(subject)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{subject}</span>
                      <span className="text-sm font-bold">{hours}h</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                      <div 
                        className="bg-current h-2 rounded-full opacity-60"
                        style={{ width: `${(hours / totalHours) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1 opacity-75">
                      {Math.round((hours / totalHours) * 100)}% du temps
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message si pas d'enseignant */}
          {!teacher && (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-yellow-800">Aucun Enseignant Assigné</h4>
                  <p className="text-sm text-yellow-700">
                    Cette classe n'a pas d'enseignant assigné. Veuillez d'abord assigner un enseignant 
                    avant de créer l'emploi du temps.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modal d'ajout de cours */}
          {showAddCourse && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
              <div className="bg-white rounded-xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Ajouter un Cours</h3>
                    <button
                      onClick={() => setShowAddCourse(false)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Matière *</label>
                    <select
                      value={newCourse.subjectId}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, subjectId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner une matière</option>
                      {availableSubjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jour *</label>
                    <select
                      value={newCourse.day}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, day: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {days.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Début *</label>
                      <input
                        type="time"
                        value={newCourse.startTime}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fin *</label>
                      <input
                        type="time"
                        value={newCourse.endTime}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salle (Optionnel)</label>
                    <select
                      value={newCourse.classroomId}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, classroomId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Aucune salle spécifique</option>
                      {availableClassrooms.map(classroom => (
                        <option key={classroom.id} value={classroom.id}>
                          {classroom.name} (Capacité: {classroom.capacity})
                        </option>
                      ))}
                    </select>
                  </div>

                  {teacher && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Enseignant:</strong> {teacherName}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Système d'enseignant unique - Responsable de toutes les matières
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowAddCourse(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddCourse}
                    disabled={loading || !newCourse.subjectId || !newCourse.startTime || !newCourse.endTime}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Message si aucun cours */}
          {!loading && schedule.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun cours programmé</h3>
              <p className="text-gray-600 mb-4">
                {teacher 
                  ? 'Commencez par ajouter des cours à l\'emploi du temps'
                  : 'Assignez d\'abord un enseignant à cette classe'
                }
              </p>
              {teacher && (
                <button 
                  onClick={() => setShowAddCourse(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>Ajouter le Premier Cours</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Système d'enseignant unique - {teacherName} enseigne toutes les matières
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  // Ici vous pouvez implémenter l'export PDF
                  alert('Export PDF en cours...');
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Exporter PDF
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassScheduleModal;