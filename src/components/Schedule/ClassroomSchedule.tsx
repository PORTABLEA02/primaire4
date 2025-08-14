import React, { useState } from 'react';
import { MapPin, Users, Clock, AlertCircle } from 'lucide-react';

const ClassroomSchedule: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState('salle-12');

  const classrooms = [
    { id: 'salle-12', name: 'Salle 12', capacity: 45, type: 'Classe Standard', equipment: ['Tableau', 'Projecteur'] },
    { id: 'salle-8', name: 'Salle 8', capacity: 40, type: 'Classe Standard', equipment: ['Tableau'] },
    { id: 'labo-1', name: 'Laboratoire 1', capacity: 30, type: 'Laboratoire', equipment: ['Équipement Scientifique', 'Tableau'] },
    { id: 'salle-15', name: 'Salle 15', capacity: 35, type: 'Classe Standard', equipment: ['Tableau', 'Ordinateur'] },
    { id: 'biblio', name: 'Bibliothèque', capacity: 50, type: 'Espace Lecture', equipment: ['Livres', 'Tables'] },
    { id: 'gym', name: 'Gymnase', capacity: 100, type: 'Sport', equipment: ['Équipement Sportif'] }
  ];

  const roomSchedules = {
    'salle-12': [
      { day: 'Lundi', time: '08:00-09:00', subject: 'Mathématiques', class: 'CM2A', teacher: 'M. Traore' },
      { day: 'Lundi', time: '10:30-11:30', subject: 'Mathématiques', class: 'CM2B', teacher: 'M. Traore' },
      { day: 'Mardi', time: '09:00-10:00', subject: 'Sciences', class: 'CM1A', teacher: 'M. Sidibe' },
      { day: 'Mercredi', time: '08:00-09:00', subject: 'Mathématiques', class: 'CM2A', teacher: 'M. Traore' },
      { day: 'Jeudi', time: '14:00-15:00', subject: 'Français', class: 'CM1B', teacher: 'Mme Kone' },
      { day: 'Vendredi', time: '08:00-09:00', subject: 'Mathématiques', class: 'CM2B', teacher: 'M. Traore' }
    ],
    'labo-1': [
      { day: 'Lundi', time: '09:00-10:00', subject: 'Sciences', class: 'CM1A', teacher: 'M. Traore' },
      { day: 'Mardi', time: '08:00-09:00', subject: 'Sciences', class: 'CM2A', teacher: 'M. Traore' },
      { day: 'Mercredi', time: '10:30-11:30', subject: 'Sciences', class: 'CM2B', teacher: 'M. Sidibe' },
      { day: 'Jeudi', time: '09:00-10:00', subject: 'Sciences', class: 'CM1A', teacher: 'M. Traore' },
      { day: 'Vendredi', time: '14:00-15:00', subject: 'Sciences', class: 'CE2A', teacher: 'M. Sidibe' }
    ]
  };

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const timeSlots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];

  const currentRoom = classrooms.find(r => r.id === selectedRoom);
  const schedule = roomSchedules[selectedRoom as keyof typeof roomSchedules] || [];

  const getScheduleForSlot = (day: string, timeSlot: string) => {
    return schedule.find(item => item.day === day && item.time === timeSlot);
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Mathématiques': 'bg-blue-100 text-blue-800 border-blue-200',
      'Français': 'bg-green-100 text-green-800 border-green-200',
      'Sciences': 'bg-purple-100 text-purple-800 border-purple-200',
      'Histoire': 'bg-orange-100 text-orange-800 border-orange-200',
      'Anglais': 'bg-pink-100 text-pink-800 border-pink-200',
      'Arts': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Sport': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const occupancyRate = (schedule.length / (days.length * timeSlots.length)) * 100;

  return (
    <div className="space-y-6">
      {/* Room Selection */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Occupation des Salles</h2>
              <p className="text-gray-600">Gestion et planification des espaces</p>
            </div>
          </div>
          
          <select 
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {classrooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Info */}
      {currentRoom && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Capacité</p>
                <p className="text-2xl font-bold text-gray-800">{currentRoom.capacity}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">places</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux d'Occupation</p>
                <p className="text-2xl font-bold text-gray-800">{Math.round(occupancyRate)}%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${occupancyRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cours/Semaine</p>
                <p className="text-2xl font-bold text-gray-800">{schedule.length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-lg font-bold text-gray-800">{currentRoom.type}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Info */}
      {currentRoom && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Équipements Disponibles</h3>
          <div className="flex flex-wrap gap-2">
            {currentRoom.equipment.map((item, index) => (
              <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Planning - {currentRoom?.name}
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
                            <div className="text-xs opacity-75 mb-1">{scheduleItem.class}</div>
                            <div className="text-xs opacity-60">{scheduleItem.teacher}</div>
                          </div>
                        ) : (
                          <div className="h-20 flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-lg">
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

      {/* Room Utilization Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Utilisation par Jour</h3>
          
          <div className="space-y-3">
            {days.map(day => {
              const daySchedule = schedule.filter(item => item.day === day);
              const dayOccupancy = (daySchedule.length / timeSlots.length) * 100;
              
              return (
                <div key={day} className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 w-20">{day}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          dayOccupancy >= 80 ? 'bg-red-500' :
                          dayOccupancy >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${dayOccupancy}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12">
                    {Math.round(dayOccupancy)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertes et Recommandations</h3>
          
          <div className="space-y-3">
            {occupancyRate > 80 && (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Salle surchargée</p>
                    <p className="text-sm text-red-600">Taux d'occupation élevé ({Math.round(occupancyRate)}%)</p>
                  </div>
                </div>
              </div>
            )}
            
            {occupancyRate < 40 && (
              <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Sous-utilisation</p>
                    <p className="text-sm text-yellow-600">Possibilité d'optimiser l'usage de cette salle</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">💡</span>
                <div>
                  <p className="font-medium text-blue-800">Suggestion</p>
                  <p className="text-sm text-blue-600">
                    Créneaux libres disponibles pour activités supplémentaires
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomSchedule;