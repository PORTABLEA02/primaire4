import React, { useState, useEffect } from 'react';
import { X, Users, BookOpen, User, MapPin, Calendar, Edit, Save, Phone, Mail, Award, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { ClassService } from '../../services/classService';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabase';

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
  onUpdateClass: (updatedClass: any) => void;
}



const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  isOpen,
  onClose,
  classData,
  onUpdateClass
}) => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'academic' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(classData);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [classStats, setClassStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Charger les données de la classe
  useEffect(() => {
    if (isOpen && classData && userSchool && currentAcademicYear) {
      loadClassData();
    }
  }, [isOpen, classData, userSchool, currentAcademicYear]);

  const loadClassData = async () => {
    if (!classData || !userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);

      const [students] = await Promise.all([
        ClassService.getClassDetails(classData.id, currentAcademicYear.id),
        // Note: getClassStats nécessite un gradePeriodId, on le charge séparément si nécessaire
      ]);

      setClassStudents(students);
      
      // Charger les stats si on a une période active
      try {
        const { data: activePeriod } = await supabase
          .from('grade_periods')
          .select('id')
          .eq('school_id', userSchool.id)
          .eq('is_active', true)
          .single();
          
        if (activePeriod) {
          const stats = await ClassService.getClassStats(classData.id, activePeriod.id);
          setClassStats(stats);
        }
      } catch (error) {
        console.log('Aucune période d\'évaluation active trouvée');
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données de la classe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onUpdateClass(editData);
    setIsEditing(false);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'À jour': return 'bg-green-50 text-green-700';
      case 'En retard': return 'bg-red-50 text-red-700';
      case 'Partiel': return 'bg-yellow-50 text-yellow-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600';
    if (grade >= 14) return 'text-blue-600';
    if (grade >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const computedStats = React.useMemo(() => {
    if (!classStudents.length) return null;

    return {
      averageAge: classStudents.reduce((sum, s) => sum + calculateAge(s.date_of_birth), 0) / classStudents.length,
      paymentUpToDate: classStudents.filter(s => s.payment_status === 'À jour').length,
      paymentLate: classStudents.filter(s => s.payment_status === 'En retard').length,
      paymentPartial: classStudents.filter(s => s.payment_status === 'Partiel').length
    };
  }, [classStudents]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">
                  {classData.name.substring(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{classData.name}</h2>
                <p className="text-gray-600">{classData.level} • {classData.current_students}/{classData.capacity} élèves</p>
                <p className="text-sm text-gray-500">
                  Enseignant: {classData.teacher_assignment?.teacher 
                    ? `${classData.teacher_assignment.teacher.first_name} ${classData.teacher_assignment.teacher.last_name}`
                    : 'Non assigné'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mt-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Élèves ({classStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('academic')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'academic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Académique
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Paramètres
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Effectif</p>
                      <p className="text-2xl font-bold text-blue-800">{classData.current_students}/{classData.capacity}</p>
                    </div>
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(classData.current_students / classData.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {classStats && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600">Moyenne Classe</p>
                          <p className="text-2xl font-bold text-green-800">
                            {classStats.classAverage ? classStats.classAverage.toFixed(1) : '--'}/20
                          </p>
                        </div>
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600">Taux de Réussite</p>
                          <p className="text-2xl font-bold text-purple-800">
                            {classStats.passRate ? classStats.passRate.toFixed(0) : '--'}%
                          </p>
                        </div>
                        <Award className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </>
                )}

                {computedStats && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600">Âge Moyen</p>
                        <p className="text-2xl font-bold text-orange-800">{computedStats.averageAge.toFixed(1)} ans</p>
                      </div>
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Informations de la classe */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations Générales</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Niveau:</span>
                      <span className="font-medium">{classData.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Enseignant titulaire:</span>
                      <span className="font-medium">
                        {classData.teacher_assignment?.teacher 
                          ? `${classData.teacher_assignment.teacher.first_name} ${classData.teacher_assignment.teacher.last_name}`
                          : 'Non assigné'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salle de classe:</span>
                      <span className="font-medium">
                        {classData.classroom_assignment?.classroom?.name || 'Non assignée'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Matières enseignées:</span>
                      <span className="font-medium">{classData.subjects?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Situation Financière</h3>
                  {computedStats ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paiements à jour:</span>
                        <span className="font-medium text-green-600">{computedStats.paymentUpToDate} élèves</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paiements en retard:</span>
                        <span className="font-medium text-red-600">{computedStats.paymentLate} élèves</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paiements partiels:</span>
                        <span className="font-medium text-yellow-600">{computedStats.paymentPartial} élèves</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taux de collecte:</span>
                        <span className="font-medium">{Math.round((computedStats.paymentUpToDate / classStudents.length) * 100)}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Aucune donnée disponible</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Matières enseignées */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Matières du Programme</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(classData.subjects || []).map(subject => (
                    <div key={subject} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium text-blue-800">{subject}</p>
                      <p className="text-xs text-blue-600">
                        Enseigné par {classData.teacher_assignment?.teacher?.first_name || 'Enseignant'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Liste des élèves */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Liste des Élèves</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Ajouter Élève
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Élève</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Parent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscription</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {classStudents.map((student) => (
                      <tr key={student.student_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {student.first_name[0]}{student.last_name[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{student.first_name} {student.last_name}</p>
                              <p className="text-sm text-gray-500">{calculateAge(student.date_of_birth)} ans • {student.gender}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {student.father_phone || student.mother_phone || 'Non renseigné'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">{student.parent_email}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(student.payment_status)}`}>
                            {student.payment_status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {student.paid_amount.toLocaleString()}/{student.total_fees.toLocaleString()} FCFA
                          </p>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-800">
                              {new Date(student.enrollment_date).toLocaleDateString('fr-FR')}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              student.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {student.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Voir Profil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {classStudents.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun élève inscrit dans cette classe</p>
                </div>
              )}
            </div>
          )}

          {/* Suivi académique */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Suivi Académique</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Performances par Matière</h4>
                  {classStats?.subjectStats ? (
                    <div className="space-y-3">
                      {classStats.subjectStats.map((subjectStat: any) => (
                        <div key={subjectStat.subject} className="flex items-center justify-between">
                          <span className="text-gray-700">{subjectStat.subject}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  subjectStat.average >= 14 ? 'bg-green-500' :
                                  subjectStat.average >= 12 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${(subjectStat.average / 20) * 100}%` }}
                              ></div>
                            </div>
                            <span className={`font-medium ${getGradeColor(subjectStat.average)}`}>
                              {subjectStat.average.toFixed(1)}/20
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Aucune note saisie</p>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Actions Rapides</h4>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left">
                      Saisir des Notes
                    </button>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left">
                      Générer Bulletins
                    </button>
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-left">
                      Voir Emploi du Temps
                    </button>
                    <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-left">
                      Conseil de Classe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paramètres */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Paramètres de la Classe</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la Classe
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editData.name : classData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacité Maximum
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={isEditing ? editData.capacity : classData.capacity}
                    onChange={(e) => setEditData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 30 }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Sauvegarder</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditData(classData);
                    }}
                    className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-end">
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

export default ClassDetailModal;