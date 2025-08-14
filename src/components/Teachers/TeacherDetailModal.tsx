import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  Award,
  Users,
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle,
  Building
} from 'lucide-react';
import { TeacherService } from '../../services/teacherService';
import { useAuth } from '../Auth/AuthProvider';

interface TeacherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: any;
  onUpdate: () => void;
}

const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onUpdate
}) => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'assignment' | 'schedule' | 'performance'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [teacherSchedule, setTeacherSchedule] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && teacher) {
      setEditData({
        firstName: teacher.first_name,
        lastName: teacher.last_name,
        email: teacher.email,
        phone: teacher.phone,
        address: teacher.address,
        qualification: teacher.qualification,
        experience: teacher.experience,
        specializations: teacher.specializations || [],
        emergencyContact: teacher.emergency_contact,
        performanceRating: teacher.performance_rating
      });
      
      loadTeacherDetails();
    }
  }, [isOpen, teacher]);

  const loadTeacherDetails = async () => {
    if (!teacher || !currentAcademicYear) return;

    try {
      setLoading(true);

      const [details, schedule] = await Promise.all([
        TeacherService.getTeacherById(teacher.id),
        TeacherService.getTeacherSchedule(teacher.id, currentAcademicYear.id)
      ]);

      setTeacherDetails(details);
      setTeacherSchedule(schedule);

    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      await TeacherService.updateTeacher(teacher.id, editData);
      setIsEditing(false);
      onUpdate();
      alert('Informations mises à jour avec succès');
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'bg-green-50 text-green-700 border-green-200';
      case 'Inactif': return 'bg-red-50 text-red-700 border-red-200';
      case 'Congé': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAssignedClass = () => {
    const activeAssignment = teacherDetails?.current_assignment?.find((a: any) => a.is_active);
    return activeAssignment?.class;
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">
                  {teacher.first_name[0]}{teacher.last_name[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {teacher.first_name} {teacher.last_name}
                </h2>
                <p className="text-gray-600">{teacher.qualification || 'Qualification non renseignée'}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    {renderStars(teacher.performance_rating)}
                    <span className={`font-medium ${getPerformanceColor(teacher.performance_rating)}`}>
                      {teacher.performance_rating.toFixed(1)}/5
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(teacher.status)}`}>
                    {teacher.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Edit className="h-4 w-4" />
                <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mt-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab('assignment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Affectation
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Emploi du Temps
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Performance
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Informations personnelles */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informations de base */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations Personnelles</h3>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                            <input
                              type="text"
                              value={editData.firstName}
                              onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                            <input
                              type="text"
                              value={editData.lastName}
                              onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                          <input
                            type="tel"
                            value={editData.phone || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                          <textarea
                            value={editData.address || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contact d'urgence</label>
                          <input
                            type="tel"
                            value={editData.emergencyContact || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{teacher.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{teacher.phone || 'Non renseigné'}</span>
                        </div>
                        {teacher.address && (
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                            <span className="text-gray-700">{teacher.address}</span>
                          </div>
                        )}
                        {teacher.emergency_contact && (
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-400">🚨</span>
                            <span className="text-gray-700">{teacher.emergency_contact}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Spécialisations */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Spécialisations</h3>
                    {teacher.specializations && teacher.specializations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {teacher.specializations.map((spec: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Aucune spécialisation renseignée</p>
                    )}
                  </div>
                </div>

                {/* Informations professionnelles */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations Professionnelles</h3>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                          <input
                            type="text"
                            value={editData.qualification || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, qualification: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expérience</label>
                          <input
                            type="text"
                            value={editData.experience || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, experience: e.target.value }))}
                            placeholder="Ex: 5 ans, 10 ans..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Note de performance (1-5)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={editData.performanceRating}
                            onChange={(e) => setEditData(prev => ({ ...prev, performanceRating: parseFloat(e.target.value) || 4.0 }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Qualification:</span>
                          <span className="font-medium text-gray-800">{teacher.qualification || 'Non renseignée'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expérience:</span>
                          <span className="font-medium text-gray-800">{teacher.experience || 'Non renseignée'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date d'embauche:</span>
                          <span className="font-medium text-gray-800">
                            {teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString('fr-FR') : 'Non renseignée'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Performance:</span>
                          <div className="flex items-center space-x-2">
                            {renderStars(teacher.performance_rating)}
                            <span className={`font-medium ${getPerformanceColor(teacher.performance_rating)}`}>
                              {teacher.performance_rating.toFixed(1)}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Classe assignée */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Affectation Actuelle</h3>
                    {getAssignedClass() ? (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-800">{getAssignedClass().name}</p>
                            <p className="text-sm text-blue-600">{getAssignedClass().level} • {getAssignedClass().current_students || 0} élèves</p>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-blue-700">
                          <p><strong>Système d'enseignant unique:</strong> Responsable de toutes les matières de la classe</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-800">Aucune classe assignée</p>
                            <p className="text-sm text-gray-600">Enseignant disponible pour affectation</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Compte utilisateur */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Compte Utilisateur</h3>
                    {teacher.user_profile_id ? (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">Compte système actif</p>
                            <p className="text-sm text-green-600">
                              Rôle: {teacher.user_profile?.role || 'Enseignant'} • 
                              Statut: {teacher.user_profile?.is_active ? 'Actif' : 'Inactif'}
                            </p>
                            <p className="text-xs text-green-500 mt-1">
                              L'enseignant peut se connecter pour saisir des notes et consulter ses classes
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-800">Aucun compte système</p>
                              <p className="text-sm text-gray-600">
                                L'enseignant ne peut pas se connecter au système
                              </p>
                            </div>
                          </div>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                            Créer Compte
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>Sauvegarder</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Affectation */}
          {activeTab === 'assignment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Historique des Affectations</h3>
              
              {teacherDetails?.current_assignment && teacherDetails.current_assignment.length > 0 ? (
                <div className="space-y-4">
                  {teacherDetails.current_assignment.map((assignment: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      assignment.is_active ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Users className={`h-5 w-5 ${assignment.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-medium text-gray-800">{assignment.class?.name}</p>
                            <p className="text-sm text-gray-600">{assignment.class?.level} • {assignment.academic_year?.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            assignment.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {assignment.is_active ? 'Actuelle' : 'Archivée'}
                          </span>
                          {assignment.salary_amount && (
                            <p className="text-sm text-gray-600 mt-1">
                              Salaire: {assignment.salary_amount.toLocaleString()} FCFA
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune affectation trouvée</p>
                </div>
              )}
            </div>
          )}

          {/* Emploi du temps */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Emploi du Temps</h3>
              
              {teacherSchedule.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jour</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horaire</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matière</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classe</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {teacherSchedule.map((slot, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-800">{slot.day_name}</td>
                            <td className="px-6 py-4 text-gray-600">{slot.start_time} - {slot.end_time}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                {slot.subject_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{slot.class_name}</td>
                            <td className="px-6 py-4 text-gray-600">{slot.classroom_name || 'Non assignée'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun cours programmé</p>
                  <p className="text-sm text-gray-400">L'emploi du temps sera généré après affectation à une classe</p>
                </div>
              )}
            </div>
          )}

          {/* Performance */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Évaluation des Performances</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Note Globale</h4>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {teacher.performance_rating.toFixed(1)}/5
                    </div>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {renderStars(teacher.performance_rating)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          teacher.performance_rating >= 4.5 ? 'bg-green-500' :
                          teacher.performance_rating >= 4.0 ? 'bg-blue-500' :
                          teacher.performance_rating >= 3.5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(teacher.performance_rating / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Critères d'Évaluation</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pédagogie:</span>
                      <span className="font-medium text-blue-600">4.5/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ponctualité:</span>
                      <span className="font-medium text-green-600">4.8/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Relation élèves:</span>
                      <span className="font-medium text-blue-600">4.2/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Innovation:</span>
                      <span className="font-medium text-purple-600">4.0/5</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-800 mb-4">Commentaires et Observations</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Points forts:</strong> Excellente maîtrise des programmes, très bon contact avec les élèves, 
                      méthodes pédagogiques innovantes.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Axes d'amélioration:</strong> Pourrait développer l'utilisation des outils numériques 
                      en classe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-end space-x-3">
            {getAssignedClass() && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Gérer la Classe</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailModal;