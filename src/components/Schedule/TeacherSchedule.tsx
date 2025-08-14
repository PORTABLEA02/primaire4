import React, { useState } from 'react';
import { User, Clock, MapPin, BookOpen, Calendar } from 'lucide-react';

interface TeacherScheduleProps {
  teacherId?: string;
}

const TeacherSchedule: React.FC<TeacherScheduleProps> = ({ teacherId }) => {
  const [selectedTeacher, setSelectedTeacher] = useState(teacherId || 'traore');

  const teachers = [
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
      assignedClass: null,
      subjects: []
    }
  ];

  const teacherSchedules = {
    traore: [
      { day: 'Lundi', time: '08:00-09:00', subject: 'Français', class: 'CI A', room: 'Salle 12' },
      { day: 'Lundi', time: '09:00-10:00', subject: 'Mathématiques', class: 'CI A', room: 'Salle 12' },
      { day: 'Lundi', time: '10:30-11:30', subject: 'Éveil Scientifique', class: 'CI A', room: 'Salle 12' },
      { day: 'Lundi', time: '14:00-15:00', subject: 'Éducation Civique', class: 'CI A', room: 'Salle 12' },
      { day: 'Mardi', time: '08:00-09:00', subject: 'Français', class: 'CI A', room: 'Salle 12' },
      { day: 'Mardi', time: '09:00-10:00', subject: 'Mathématiques', class: 'CI A', room: 'Salle 12' },
      { day: 'Mardi', time: '14:00-15:00', subject: 'Éveil Scientifique', class: 'CI A', room: 'Salle 12' },
      { day: 'Mercredi', time: '08:00-09:00', subject: 'Français', class: 'CI A', room: 'Salle 12' },
      { day: 'Mercredi', time: '09:00-10:00', subject: 'Mathématiques', class: 'CI A', room: 'Salle 12' },
      { day: 'Jeudi', time: '08:00-09:00', subject: 'Français', class: 'CI A', room: 'Salle 12' },
      { day: 'Jeudi', time: '09:00-10:00', subject: 'Mathématiques', class: 'CI A', room: 'Salle 12' },
      { day: 'Jeudi', time: '14:00-15:00', subject: 'Éducation Civique', class: 'CI A', room: 'Salle 12' },
      { day: 'Vendredi', time: '08:00-09:00', subject: 'Français', class: 'CI A', room: 'Salle 12' },
      { day: 'Vendredi', time: '09:00-10:00', subject: 'Mathématiques', class: 'CI A', room: 'Salle 12' }
    ],
    kone: [
      { day: 'Lundi', time: '08:00-09:00', subject: 'Éveil', class: 'Maternelle 1A', room: 'Salle 3' },
      { day: 'Lundi', time: '09:00-10:00', subject: 'Langage', class: 'Maternelle 1A', room: 'Salle 3' },
      { day: 'Lundi', time: '10:30-11:30', subject: 'Jeux éducatifs', class: 'Maternelle 1A', room: 'Salle 3' },
      { day: 'Mardi', time: '08:00-09:00', subject: 'Graphisme', class: 'Maternelle 1A', room: 'Salle 3' },
      { day: 'Mardi', time: '09:00-10:00', subject: 'Éveil', class: 'Maternelle 1A', room: 'Salle 3' },
      { day: 'Mercredi', time: '08:00-09:00', subject: 'Langage', class: 'Maternelle 1A', room: 'Salle 3' },
      { day: 'Jeudi', time: '08:00-09:00', subject: 'Jeux éducatifs', class: 'Maternelle 1A', room: 'Salle 3' },
      { day: 'Vendredi', time: '08:00-09:00', subject: 'Graphisme', class: 'Maternelle 1A', room: 'Salle 3' }
    ],
    sidibe: [
      { day: 'Lundi', time: '08:00-09:00', subject: 'Français', class: 'CE2B', room: 'Salle 8' },
      { day: 'Lundi', time: '09:00-10:00', subject: 'Mathématiques', class: 'CE2B', room: 'Salle 8' },
      { day: 'Lundi', time: '10:30-11:30', subject: 'Sciences', class: 'CE2B', room: 'Salle 8' },
      { day: 'Mardi', time: '08:00-09:00', subject: 'Histoire-Géographie', class: 'CE2B', room: 'Salle 8' },
      { day: 'Mardi', time: '09:00-10:00', subject: 'Français', class: 'CE2B', room: 'Salle 8' },
      { day: 'Mercredi', time: '08:00-09:00', subject: 'Mathématiques', class: 'CE2B', room: 'Salle 8' },
      { day: 'Jeudi', time: '08:00-09:00', subject: 'Éducation Civique', class: 'CE2B', room: 'Salle 8' },
      { day: 'Vendredi', time: '08:00-09:00', subject: 'Sciences', class: 'CE2B', room: 'Salle 8' }
    ]
  };

  const currentTeacher = teachers.find(t => t.id === selectedTeacher);
  const schedule = teacherSchedules[selectedTeacher as keyof typeof teacherSchedules] || [];

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
                <p className="text-2xl font-bold text-gray-800">{currentTeacher.subjects.length}</p>
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
    </div>
  );
};

export default TeacherSchedule;