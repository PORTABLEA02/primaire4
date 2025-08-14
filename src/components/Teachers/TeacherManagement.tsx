import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Calendar, 
  Phone, 
  Mail, 
  BookOpen, 
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Award,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import AddTeacherModal from './AddTeacherModal';
import TeacherDetailModal from './TeacherDetailModal';
import { useAuth } from '../Auth/AuthProvider';
import { TeacherService } from '../../services/teacherService';
import { ActivityLogService } from '../../services/activityLogService';

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  specializations: string[];
  hire_date: string;
  status: 'Actif' | 'Inactif' | 'Congé';
  performance_rating: number;
  hasUserAccount?: boolean;
  current_assignment?: {
    class: {
      name: string;
      level: string;
    };
    salary_amount: number;
    is_active: boolean;
  }[];
}

interface TeacherStats {
  total: number;
  active: number;
  assigned: number;
  available: number;
  onLeave: number;
  averageExperience: number;
  averagePerformance: number;
  totalSalaryCost: number;
  byQualification: Record<string, number>;
  byExperience: Record<string, number>;
}

const TeacherManagement: React.FC = () => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [absences, setAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  
  // Modals
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'absences' | 'performance'>('list');

  // Charger les données au montage
  useEffect(() => {
    if (userSchool && currentAcademicYear) {
      loadData();
    }
  }, [userSchool, currentAcademicYear]);

  const loadData = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);
      setError(null);

      const [teachersData, statsData, absencesData] = await Promise.all([
        TeacherService.getTeachers(userSchool.id),
        TeacherService.getTeacherStats(userSchool.id, currentAcademicYear.id),
        TeacherService.getTeacherAbsences(userSchool.id)
      ]);

      setTeachers(teachersData);
      setTeacherStats(statsData);
      setAbsences(absencesData);

    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      setError(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les enseignants
  const filteredTeachers = React.useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (teacher.phone || '').includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [teachers, searchTerm, statusFilter]);

  const handleAddTeacher = async (teacherData: any) => {
    if (!userSchool) return;

    try {
      await TeacherService.createTeacher({
        ...teacherData,
        schoolId: userSchool.id
      });

      await loadData();
      alert('Enseignant ajouté avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailModal(true);
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${teacher.first_name} ${teacher.last_name} ?`)) {
      try {
        await TeacherService.deleteTeacher(teacher.id);
        await loadData();
        alert('Enseignant supprimé avec succès');
      } catch (error: any) {
        alert(`Erreur: ${error.message}`);
      }
    }
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const getAssignedClass = (teacher: Teacher) => {
    const activeAssignment = teacher.current_assignment?.find(a => a.is_active);
    return activeAssignment?.class?.name || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Chargement des enseignants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Enseignants</h1>
          <p className="text-gray-600">
            {userSchool?.name} - Personnel enseignant, affectations et suivi des performances
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadData}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
          
          <button 
            onClick={() => setShowAddTeacherModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvel Enseignant</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {teacherStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enseignants</p>
                <p className="text-2xl font-bold text-gray-800">{teacherStats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{teacherStats.active}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avec Classe</p>
                <p className="text-2xl font-bold text-blue-600">{teacherStats.assigned}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-orange-600">{teacherStats.available}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Moyenne Perf.</p>
                <p className="text-2xl font-bold text-purple-600">{teacherStats.averagePerformance}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Liste des Enseignants ({teachers.length})
            </button>
            <button
              onClick={() => setActiveTab('absences')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'absences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Absences ({absences.filter(a => a.status === 'En attente').length})
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Performances
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'list' && (
            <>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email ou téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                  <option value="Congé">En congé</option>
                </select>
                
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filtres</span>
                </button>
              </div>

              {/* Teachers Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enseignant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classe Assignée</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expérience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTeachers.map((teacher) => {
                      const assignedClass = getAssignedClass(teacher);
                      
                      return (
                        <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {teacher.first_name[0]}{teacher.last_name[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{teacher.first_name} {teacher.last_name}</p>
                                <p className="text-sm text-gray-500">{teacher.qualification || 'Qualification non renseignée'}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-600">{teacher.phone || 'Non renseigné'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-600">{teacher.email}</span>
                              </div>
                              {teacher.hasUserAccount && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-blue-600">🔐</span>
                                  <span className="text-xs text-blue-600">Accès système</span>
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            {assignedClass ? (
                              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                {assignedClass}
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-sm">
                                Disponible
                              </span>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 text-gray-600">{teacher.experience || 'Non renseigné'}</td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {renderStars(teacher.performance_rating)}
                              <span className={`font-medium ${getPerformanceColor(teacher.performance_rating)}`}>
                                {teacher.performance_rating.toFixed(1)}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(teacher.status)}`}>
                              {teacher.status}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewTeacher(teacher)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                title="Voir détails"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteTeacher(teacher)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredTeachers.length === 0 && (
                <div className="text-center py-12">
                  <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun enseignant trouvé</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Aucun enseignant ne correspond aux critères de recherche'
                      : 'Commencez par ajouter votre premier enseignant'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <button 
                      onClick={() => setShowAddTeacherModal(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Ajouter un Enseignant</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'absences' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Gestion des Absences</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Nouvelle Demande
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enseignant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raison</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remplaçant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {absences.map((absence) => (
                      <tr key={absence.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-800">{absence.teacher_name}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {absence.end_date ? 
                            `${new Date(absence.start_date).toLocaleDateString('fr-FR')} - ${new Date(absence.end_date).toLocaleDateString('fr-FR')}` :
                            new Date(absence.start_date).toLocaleDateString('fr-FR')
                          }
                        </td>
                        <td className="px-6 py-4 text-gray-600">{absence.reason}</td>
                        <td className="px-6 py-4 text-gray-600">{absence.substitute_teacher || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            absence.status === 'Approuvée' 
                              ? 'bg-green-50 text-green-700'
                              : absence.status === 'Refusée'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {absence.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {absence.status === 'En attente' && (
                            <div className="flex items-center space-x-2">
                              <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                                Approuver
                              </button>
                              <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors">
                                Refuser
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {absences.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune demande d'absence</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Évaluation des Performances</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.filter(t => t.status === 'Actif').map((teacher) => {
                  const assignedClass = getAssignedClass(teacher);
                  
                  return (
                    <div key={teacher.id} className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {teacher.first_name[0]}{teacher.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{teacher.first_name} {teacher.last_name}</p>
                          <p className="text-sm text-gray-500">{assignedClass || 'Disponible'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Performance Globale</span>
                          <div className="flex items-center space-x-2">
                            {renderStars(teacher.performance_rating)}
                            <span className={`font-medium ${getPerformanceColor(teacher.performance_rating)}`}>
                              {teacher.performance_rating.toFixed(1)}/5
                            </span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              teacher.performance_rating >= 4.5 ? 'bg-green-500' :
                              teacher.performance_rating >= 4.0 ? 'bg-blue-500' :
                              teacher.performance_rating >= 3.5 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(teacher.performance_rating / 5) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <p>Expérience: {teacher.experience || 'Non renseigné'}</p>
                          <p>Embauché: {teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString('fr-FR') : 'Non renseigné'}</p>
                        </div>

                        {teacher.specializations && teacher.specializations.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-1">Spécialisations:</p>
                            <div className="flex flex-wrap gap-1">
                              {teacher.specializations.slice(0, 2).map(spec => (
                                <span key={spec} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                  {spec}
                                </span>
                              ))}
                              {teacher.specializations.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{teacher.specializations.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {teachers.filter(t => t.status === 'Actif').length === 0 && (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun enseignant actif</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddTeacherModal
        isOpen={showAddTeacherModal}
        onClose={() => setShowAddTeacherModal(false)}
        onAddTeacher={handleAddTeacher}
        availableClasses={[]} // Sera chargé dynamiquement dans le modal
      />

      {selectedTeacher && (
        <TeacherDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTeacher(null);
          }}
          teacher={selectedTeacher}
          onUpdate={loadData}
        />
      )}
    </div>
  );
};

export default TeacherManagement;