import React, { useState } from 'react';
import { Calendar, Clock, Users, BookOpen, Plus, Filter, Download, Edit, Trash2 } from 'lucide-react';
import AddCourseModal from './AddCourseModal';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  classroom: string;
  class: string;
  day: string;
}

const ScheduleManagement: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('CM2A');
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [viewMode, setViewMode] = useState<'week' | 'class' | 'teacher'>('week');
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([

    {
      id: '1',
      startTime: '08:00',
      endTime: '09:00',
      subject: 'Français',
      teacher: 'M. Traore (Enseignant unique)',
      classroom: 'Salle 12',
      class: 'CI A',
      day: 'Lundi'
    },
    {
      id: '2',
      startTime: '09:00',
      endTime: '10:00',
      subject: 'Mathématiques',
      teacher: 'M. Traore (Enseignant unique)',
      classroom: 'Salle 12',
      class: 'CI A',
      day: 'Lundi'
    },
    {
      id: '3',
      startTime: '10:30',
      endTime: '11:30',
      subject: 'Éveil Scientifique',
      teacher: 'M. Traore (Enseignant unique)',
      classroom: 'Salle 12',
      class: 'CI A',
      day: 'Lundi'
    },
    {
      id: '4',
      startTime: '08:00',
      endTime: '09:00',
      subject: 'Éducation Civique',
      teacher: 'M. Traore (Enseignant unique)',
      classroom: 'Salle 12',
      class: 'CI A',
      day: 'Mardi'
    }
  ]);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const timeSlotHours = [
    '08:00-10:00',
    '10:00-12:00',
    '12:00-14:00',
    '14:00-16:00',
    '16:00-18:00'
  ];

  const classes = ['Maternelle 1A', 'Maternelle 1B', 'CI A', 'CP1', 'CP2', 'CE1A', 'CE2B', 'CM2A'];
  const teachers = [
    { name: 'M. Traore', class: 'CI A' },
    { name: 'Mme Kone', class: 'Maternelle 1A' },
    { name: 'M. Sidibe', class: 'CE2B' },
    { name: 'Mlle Coulibaly', class: 'Disponible' }
  ];

  const handleAddCourse = (courseData: any) => {
    const newTimeSlot: TimeSlot = {
      id: (timeSlots.length + 1).toString(),
      startTime: courseData.startTime,
      endTime: courseData.endTime,
      subject: courseData.subject,
      teacher: `${courseData.teacherName} (Enseignant unique)`,
      classroom: courseData.classroom,
      class: courseData.className,
      day: courseData.day
    };
    
    setTimeSlots(prev => [...prev, newTimeSlot]);
    
    // Notification de succès (optionnel)
    console.log('Nouveau cours ajouté:', newTimeSlot);
  };

  const getScheduleForSlot = (day: string, timeSlot: string) => {
    return timeSlots.find(slot => 
      slot.day === day && 
      `${slot.startTime}-${slot.endTime}` === timeSlot &&
      slot.class === selectedClass
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Emploi du Temps</h1>
          <p className="text-gray-600">Système d'enseignant unique - Planification par matière</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
          <button 
            onClick={() => setShowAddCourseModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Cours</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cours Programmés</p>
              <p className="text-2xl font-bold text-gray-800">342</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-blue-600 font-medium">Cette semaine</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Classes Actives</p>
              <p className="text-2xl font-bold text-gray-800">21</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">1 enseignant/classe</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Heures/Semaine</p>
              <p className="text-2xl font-bold text-gray-800">30h</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-purple-600 font-medium">Par classe</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Classes sans Enseignant</p>
              <p className="text-2xl font-bold text-gray-800">2</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-red-600 font-medium">Affectation requise</span>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Vue:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setViewMode('class')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'class' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Classe
                </button>
                <button
                  onClick={() => setViewMode('teacher')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'teacher' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Enseignant
                </button>
              </div>
            </div>

            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <select 
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="current">Semaine Actuelle</option>
              <option value="next">Semaine Prochaine</option>
              <option value="previous">Semaine Précédente</option>
            </select>
          </div>

          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Système Éducatif Béninois:</strong> Un seul enseignant par classe assure toutes les matières. 
            L'emploi du temps organise les matières par créneaux horaires.
          </p>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Emploi du Temps - {selectedClass}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
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
              {timeSlotHours.map((timeSlot, timeIndex) => (
                <tr key={timeIndex} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-700 bg-gray-50">
                    {timeSlot}
                  </td>
                  {days.map(day => {
                    const schedule = getScheduleForSlot(day, timeSlot);
                    
                    return (
                      <td key={day} className="px-2 py-2 text-center">
                        {timeSlot === '12:00-14:00' ? (
                          <div className="h-20 flex items-center justify-center bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                            <span className="text-yellow-700 font-medium">Pause</span>
                          </div>
                        ) : schedule ? (
                          <div className={`p-3 rounded-lg border-2 ${getSubjectColor(schedule.subject)} cursor-pointer hover:shadow-md transition-all group`}>
                            <div className="font-medium text-sm mb-1">{schedule.subject}</div>
                            <div className="text-xs opacity-75 mb-1">
                              {schedule.teacher.split(' (')[0]}
                            </div>
                            <div className="text-xs opacity-60">{schedule.classroom}</div>
                            
                            {/* Action buttons - shown on hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex justify-center space-x-1">
                              <button className="p-1 bg-white rounded shadow-sm hover:bg-gray-50">
                                <Edit className="h-3 w-3 text-gray-600" />
                              </button>
                              <button className="p-1 bg-white rounded shadow-sm hover:bg-gray-50">
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button className="w-full h-20 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center group">
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
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues and Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Alertes Système</h3>
            <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">2</span>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-red-800">Classe sans enseignant</p>
                  <p className="text-sm text-red-600">CP1 - 30 élèves sans enseignant assigné</p>
                </div>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Assigner
                </button>
              </div>
            </div>
            
            <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-yellow-800">Emploi du temps incomplet</p>
                  <p className="text-sm text-yellow-600">CE1B - Seulement 18h/30h programmées</p>
                </div>
                <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
                  Compléter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Changes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Modifications Récentes</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Voir tout
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Enseignant assigné</p>
                <p className="text-xs text-gray-500">Mlle Coulibaly → CP1 (Enseignant unique)</p>
                <p className="text-xs text-gray-400">Il y a 2 heures</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Emploi du temps généré</p>
                <p className="text-xs text-gray-500">CP1 - Planning automatique créé</p>
                <p className="text-xs text-gray-400">Il y a 4 heures</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Changement d'enseignant</p>
                <p className="text-xs text-gray-500">CE2A - M. Diallo remplace Mme Bah</p>
                <p className="text-xs text-gray-400">Hier</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Benefits */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Avantages du Système d'Enseignant Unique</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Suivi Personnalisé</h4>
            <p className="text-sm text-green-600">L'enseignant connaît parfaitement chaque élève</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Cohérence Pédagogique</h4>
            <p className="text-sm text-blue-600">Approche unifiée dans toutes les matières</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Gestion Simplifiée</h4>
            <p className="text-sm text-purple-600">Moins de coordination entre enseignants</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">Relation Privilégiée</h4>
            <p className="text-sm text-orange-600">Lien fort enseignant-élèves-parents</p>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      <AddCourseModal
        isOpen={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
        onAddCourse={handleAddCourse}
      />
    </div>
  );
};

export default ScheduleManagement;