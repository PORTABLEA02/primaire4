import React, { useState } from 'react';
import { User, Clock, MapPin, BookOpen, Calendar } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { TeacherService } from '../../services/teacherService';
import { ScheduleService } from '../../services/scheduleService';

interface TeacherScheduleProps {
  teacherId?: string;
}

const TeacherSchedule: React.FC<TeacherScheduleProps> = ({ teacherId }) => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [selectedTeacher, setSelectedTeacher] = useState(teacherId || 'traore');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherSchedule, setTeacherSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les données au montage
  React.useEffect(() => {
    if (userSchool && currentAcademicYear) {
      loadTeacherData();
    }
  }, [userSchool, currentAcademicYear]);

  // Charger les enseignants et l'emploi du temps
  React.useEffect(() => {
    if (selectedTeacher && currentAcademicYear) {
      loadTeacherSchedule();
    }
  }, [selectedTeacher, currentAcademicYear]);

  const loadTeacherData = async () => {
    if (!userSchool) return;

    try {
      setLoading(true);
      const teachersData = await TeacherService.getTeachers(userSchool.id);
      
      // Mapper les enseignants avec leurs classes assignées
      const mappedTeachers = teachersData.map(teacher => {
        const activeAssignment = teacher.current_assignment?.find((a: any) => a.is_active);
        return {
          id: teacher.id,
          name: `${teacher.first_name} ${teacher.last_name}`,
          assignedClass: activeAssignment?.class?.name || null,
          subjects: activeAssignment?.class?.subjects || []
        };
      });
      
      setTeachers(mappedTeachers);
      
      // Sélectionner le premier enseignant si aucun n'est sélectionné
      if (!selectedTeacher && mappedTeachers.length > 0) {
        setSelectedTeacher(mappedTeachers[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des enseignants:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherSchedule = async () => {
    if (!selectedTeacher || !currentAcademicYear) return;

    try {
      setLoading(true);
      const scheduleData = await TeacherService.getTeacherSchedule(selectedTeacher, currentAcademicYear.id);
      
      // Mapper les données de l'emploi du temps
      const mappedSchedule = scheduleData.map(slot => ({
        day: slot.day_name,
        time: `${slot.start_time}-${slot.end_time}`,
        subject: slot.subject_name,
        class: slot.class_name,
        room: slot.classroom_name || 'Non assignée'
      }));
      
      setTeacherSchedule(mappedSchedule);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'emploi du temps:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentTeacher = teachers.find(t => t.id === selectedTeacher);
  const schedule = teacherSchedule;
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const timeSlots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];

  const getScheduleForSlot = (day: string, timeSlot: string) => {
    return schedule.find(item => item.day === day && item.time === timeSlot);
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

  const totalHours = schedule.length;
  const uniqueClass = schedule.length > 0 ? schedule[0].class : 'Aucune';
  const subjectHours = schedule.reduce((acc, item) => {
    acc[item.subject] = (acc[item.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'emploi du temps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Teacher Selection */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Planning Enseignant Unique</h2>
              <p className="text-gray-600">Un enseignant, une classe, toutes les matières</p>
            </div>
          </div>
          
          <select 
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* System Info */}
      <div className="bg-blue-50 p-4 rounded-xl">
        <h3 className="font-medium text-blue-800 mb-2">Système d'Enseignant Unique</h3>
        <p className="text-sm text-blue-700">
          Chaque enseignant est responsable d'une seule classe et assure l'ensemble des matières du programme. 
          Cela garantit un suivi personnalisé et une cohérence pédagogique optimale.
        </p>
      </div>

      {/* Teacher Info */}
      {currentTeacher && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Heures Programmées</p>
                <p className="text-2xl font-bold text-gray-800">{totalHours}h</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Classe Assignée</p>
                <p className="text-lg font-bold text-gray-800">{uniqueClass}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Matières Enseignées</p>
                <p className="text-2xl font-bold text-gray-800">{Object.keys(subjectHours).length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Salle Principale</p>
                <p className="text-lg font-bold text-gray-800">{schedule.length > 0 ? schedule[0].room : 'N/A'}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {currentTeacher?.name} 
              {currentTeacher?.assignedClass && (
                <span className="text-sm text-gray-500 ml-2">- {currentTeacher.assignedClass}</span>
              )}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Semaine du 14-18 Octobre 2024</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                  Horaires
                </th>
                {days.map(day => (
                  <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {timeSlots.map((timeSlot, timeIndex) => (
                <tr key={timeIndex} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-700 bg-gray-50">
                    {timeSlot}
                  </td>
                  {days.map(day => {
                    const scheduleItem = getScheduleForSlot(day, timeSlot);
                    
                    return (
                      <td key={day} className="px-2 py-2 text-center">
                        {timeSlot === '12:00-14:00' ? (
                          <div className="h-20 flex items-center justify-center bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                            <span className="text-yellow-700 font-medium">Pause</span>
                          </div>
                        ) : scheduleItem ? (
                          <div className={`p-3 rounded-lg border-2 ${getSubjectColor(scheduleItem.subject)}`}>
                            <div className="font-medium text-sm mb-1">{scheduleItem.subject}</div>
                            <div className="text-xs opacity-75 mb-1">Même classe</div>
                            <div className="text-xs opacity-60 flex items-center justify-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {scheduleItem.room}
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 flex items-center justify-center text-gray-300">
                            <span className="text-sm">Libre</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject Distribution and Benefits */}
      {currentTeacher && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition des Matières</h3>
            
            {Object.keys(subjectHours).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(subjectHours).map(([subject, hours]) => (
                  <div key={subject} className={`p-4 rounded-lg border-2 ${getSubjectColor(subject)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subject}</span>
                      <span className="text-sm font-bold">{hours}h</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                        <div 
                          className="bg-current h-2 rounded-full opacity-60"
                          style={{ width: `${(hours / totalHours) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun cours programmé</p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Avantages du Système</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">Suivi Personnalisé</h4>
                <p className="text-sm text-green-600">Connaissance approfondie de chaque élève</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Cohérence Pédagogique</h4>
                <p className="text-sm text-blue-600">Approche unifiée dans toutes les matières</p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-1">Relation Privilégiée</h4>
                <p className="text-sm text-purple-600">Lien fort avec les élèves et leurs familles</p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-1">Gestion Simplifiée</h4>
                <p className="text-sm text-orange-600">Moins de coordination, plus d'efficacité</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Unavailable Teachers */}
      {!currentTeacher?.assignedClass && (
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">Enseignant Disponible</h3>
              <p className="text-sm text-yellow-600">
                {currentTeacher?.name} n'a pas encore de classe assignée. 
                Cet enseignant peut être affecté à une classe qui a besoin d'un enseignant unique.
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
              Assigner une Classe
            </button>
          </div>
        </div>
      )}

      {teachers.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun enseignant trouvé</h3>
          <p className="text-gray-600">Ajoutez des enseignants pour voir leurs emplois du temps</p>
        </div>
      )}
    </div>
  );
};

export default TeacherSchedule;