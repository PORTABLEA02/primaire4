import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import AddClassModal from './AddClassModal';
import TeacherAssignmentModal from './TeacherAssignmentModal';
import ClassDetailModal from './ClassDetailModal';
import ClassScheduleModal from './ClassScheduleModal';
import ChangeTeacherModal from './ChangeTeacherModal';
import { useAuth } from '../Auth/AuthProvider';
import { ClassService } from '../../services/classService';
import { TeacherService } from '../../services/teacherService';
import { ActivityLogService } from '../../services/activityLogService';

interface ClassData {
  id: string;
  name: string;
  level: string;
  capacity: number;
  current_students: number;
  subjects: string[];
  teacher_assignment?: Array<{
    teacher: {
      first_name: string;
      last_name: string;
      email: string;
    };
    salary_amount: number;
  }>;
  classroom_assignment?: {
    classroom: {
      name: string;
      capacity: number;
    };
  };
}

interface TeacherAssignment {
  id: string;
  teacher_id: string;
  first_name: string;
  last_name: string;
  email: string;
  class_id: string;
  class_name: string;
  level: string;
  salary_amount: number;
  is_active: boolean;
}

// Helper functions - moved before component to avoid hoisting issues
const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    'Maternelle': 'purple',
    'CI': 'blue',
    'CP': 'green',
    'CE1': 'yellow',
    'CE2': 'orange',
    'CM1': 'red',
    'CM2': 'indigo'
  };
  return colors[level] || 'blue';
};

const getColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
    indigo: 'bg-indigo-50 text-indigo-700'
  };
  return colorMap[color] || colorMap.blue;
};

const ClassManagement: React.FC = () => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showChangeTeacherModal, setShowChangeTeacherModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);

  // Charger les données au montage du composant
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

      const [classesData, assignmentsData, teachersData] = await Promise.all([
        ClassService.getClasses(userSchool.id, currentAcademicYear.id),
        TeacherService.getTeacherAssignments(userSchool.id, currentAcademicYear.id),
        TeacherService.getAvailableTeachers(userSchool.id, currentAcademicYear.id)
      ]);

      setClasses(classesData);
      setTeacherAssignments(assignmentsData);
      setAvailableTeachers(teachersData);

    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      setError(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques par niveau
  const levelStats = React.useMemo(() => {
    const stats: Record<string, { classes: number; students: number; color: string }> = {};
    
    classes.forEach(cls => {
      if (!stats[cls.level]) {
        stats[cls.level] = { classes: 0, students: 0, color: getLevelColor(cls.level) };
      }
      stats[cls.level].classes += 1;
      stats[cls.level].students += cls.current_students;
    });

    return Object.entries(stats).map(([level, data]) => ({
      name: level,
      ...data
    }));
  }, [classes]);

  const handleAddClass = async (classData: any) => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);
      await ClassService.createClass({
        schoolId: userSchool.id,
        academicYearId: currentAcademicYear.id,
        name: classData.name,
        level: classData.level,
        capacity: classData.capacity,
        subjects: classData.subjects
      });

      // Si un enseignant est assigné, créer l'affectation
      if (classData.teacherId) {
        // Recharger les classes pour obtenir l'ID de la nouvelle classe
        const updatedClasses = await ClassService.getClasses(userSchool.id, currentAcademicYear.id);
        const createdClass = updatedClasses.find(c => c.name === classData.name);
        
        if (createdClass) {
          await TeacherService.assignTeacherToClass({
            teacherId: classData.teacherId,
            classId: createdClass.id,
            schoolId: userSchool.id,
            academicYearId: currentAcademicYear.id,
            salaryAmount: classData.salary || 150000
          });
        }
      }

      await ActivityLogService.logActivity({
        schoolId: userSchool.id,
        action: 'CREATE_CLASS',
        entityType: 'class',
        level: 'success',
        details: `Nouvelle classe créée: ${classData.name}`
      });

      await loadData();
      alert('Classe créée avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherAssignment = async (assignments: any[]) => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);
      for (const assignment of assignments) {
        await TeacherService.assignTeacherToClass({
          teacherId: assignment.teacherId,
          classId: assignment.classId,
          schoolId: userSchool.id,
          academicYearId: currentAcademicYear.id,
          salaryAmount: assignment.salary || 150000
        });
      }

      await ActivityLogService.logActivity({
        schoolId: userSchool.id,
        action: 'ASSIGN_TEACHERS',
        entityType: 'teacher_assignment',
        level: 'success',
        details: `${assignments.length} affectation(s) d'enseignants créée(s)`
      });

      await loadData();
      alert(`${assignments.length} affectation(s) enregistrée(s) avec succès !`);
    } catch (error: any) {
      console.error('Erreur lors des affectations:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManageClass = (classItem: ClassData) => {
    setSelectedClass(classItem);
    setShowDetailModal(true);
  };

  const handleViewSchedule = (classItem: ClassData) => {
    setSelectedClass(classItem);
    setShowScheduleModal(true);
  };

  const handleChangeTeacher = (classItem: ClassData) => {
    setSelectedClass(classItem);
    setShowChangeTeacherModal(true);
  };

  const handleUpdateClass = async (updatedClass: any) => {
    try {
      setLoading(true);
      await ClassService.updateClass(updatedClass.id, {
        name: updatedClass.name,
        capacity: updatedClass.capacity,
        subjects: updatedClass.subjects
      });

      await loadData();
      alert('Classe mise à jour avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = async (classId: string, newTeacherId: string, newTeacherName: string) => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);
      await TeacherService.changeTeacherAssignment(
        newTeacherId,
        classId,
        currentAcademicYear.id,
        userSchool.id
      );

      await ActivityLogService.logActivity({
        schoolId: userSchool.id,
        action: 'CHANGE_TEACHER',
        entityType: 'teacher_assignment',
        entityId: classId,
        level: 'info',
        details: `Changement d'enseignant pour la classe`
      });

      await loadData();
      alert(`Enseignant changé avec succès !`);
    } catch (error: any) {
      console.error('Erreur lors du changement:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Chargement des classes...</p>
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gestion des Classes</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {userSchool?.name} - Année {currentAcademicYear?.name}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
          
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Classe</span>
          </button>
        </div>
      </div>

      {/* Levels Overview */}
      {levelStats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
        {levelStats.map((level, index) => (
          <div key={index} className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getColorClasses(level.color)}`}>
                {level.name}
              </span>
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Classes</span>
                <span className="font-medium text-gray-800">{level.classes}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Élèves</span>
                <span className="font-medium text-gray-800">{level.students}</span>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Classes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Liste des Classes</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-gray-500">Total: {classes.length} classes</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classe</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveau</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enseignant Titulaire</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effectif</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Taux de Remplissage</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classes.map((classItem) => {
                const fillRate = (classItem.current_students / classItem.capacity) * 100;
                const teacher = classItem.teacher_assignment?.[0]?.teacher;
                
                return (
                  <tr key={classItem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-xs sm:text-sm">
                            {classItem.name.substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-medium text-gray-800">{classItem.name}</p>
                          <p className="text-xs text-gray-500">
                            {classItem.subjects?.length || 0} matières
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-3 sm:px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {classItem.level}
                      </span>
                    </td>
                    
                    <td className="px-3 sm:px-6 py-4">
                      {teacher ? (
                        <div>
                          <p className="text-sm sm:text-base font-medium text-gray-800">
                            {teacher.first_name} {teacher.last_name}
                          </p>
                          <p className="text-xs text-gray-500">Enseignant unique</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-red-600 font-medium">Non assigné</p>
                          <p className="text-xs text-red-500">Affectation requise</p>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        <span className="text-sm sm:text-base text-gray-800">
                          {classItem.current_students}/{classItem.capacity}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              fillRate >= 90 ? 'bg-red-500' : 
                              fillRate >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${fillRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-12">
                          {Math.round(fillRate)}%
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <button 
                          onClick={() => handleManageClass(classItem)}
                          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                        >
                          Gérer
                        </button>
                        <span className="text-gray-300 hidden sm:inline">|</span>
                        <button 
                          onClick={() => handleViewSchedule(classItem)}
                          className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium"
                        >
                          Planning
                        </button>
                        {teacher && (
                          <>
                            <span className="text-gray-300 hidden sm:inline">|</span>
                            <button 
                              onClick={() => handleChangeTeacher(classItem)}
                              className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm font-medium"
                            >
                              Changer Enseignant
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {classes.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune classe configurée</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre première classe</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Créer une Classe</span>
            </button>
          </div>
        )}
      </div>

      {/* Teacher Assignment Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Affectation des Enseignants</h3>
            <p className="text-sm sm:text-base text-gray-600">Système d'enseignant unique - Un enseignant par classe pour toutes les matières</p>
          </div>
          <button 
            onClick={() => setShowAssignmentModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            Gérer les Affectations
          </button>
        </div>
        
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-100 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Classes sans enseignant</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {classes.filter(c => !c.teacher_assignment || c.teacher_assignment.length === 0).length}
            </p>
          </div>
          <div className="p-4 border border-gray-100 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Enseignants disponibles</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {availableTeachers.length}
            </p>
          </div>
          <div className="p-4 border border-gray-100 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Affectations actives</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {teacherAssignments.filter(a => a.is_active).length}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddClassModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddClass={handleAddClass}
        availableTeachers={availableTeachers.map(t => ({
          id: t.id,
          name: `${t.first_name} ${t.last_name}`,
          isAvailable: true
        }))}
      />

      <TeacherAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        onAssignTeacher={handleTeacherAssignment}
      />

      {selectedClass && (
        <>
          <ClassDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedClass(null);
            }}
            classData={selectedClass}
            onUpdateClass={handleUpdateClass}
          />

          <ClassScheduleModal
            isOpen={showScheduleModal}
            onClose={() => {
              setShowScheduleModal(false);
              setSelectedClass(null);
            }}
            classData={selectedClass}
          />

          {selectedClass.teacher_assignment?.[0]?.teacher && (
            <ChangeTeacherModal
              isOpen={showChangeTeacherModal}
              onClose={() => {
                setShowChangeTeacherModal(false);
                setSelectedClass(null);
              }}
              classData={{
                id: selectedClass.id,
                name: selectedClass.name,
                level: selectedClass.level,
                teacher: `${selectedClass.teacher_assignment[0].teacher.first_name} ${selectedClass.teacher_assignment[0].teacher.last_name}`,
                teacherId: 'current-teacher-id',
                subjects: selectedClass.subjects || []
              }}
              onChangeTeacher={handleTeacherChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ClassManagement;