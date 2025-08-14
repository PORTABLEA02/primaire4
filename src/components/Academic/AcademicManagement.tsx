import React from 'react';
import { BookOpen, FileText, Calculator, Award, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import GradeEntryModal from './GradeEntryModal';
import CalculateAveragesModal from './CalculateAveragesModal';
import { useAcademicYear } from '../../contexts/AcademicYearContext';
import { useAuth } from '../Auth/AuthProvider';
import { GradeService } from '../../services/gradeService';
import { SubjectService } from '../../services/subjectService';
import { ClassService } from '../../services/classService';
import { supabase } from '../../lib/supabase';

const AcademicManagement: React.FC = () => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [subjects, setSubjects] = React.useState<any[]>([]);
  const [recentGrades, setRecentGrades] = React.useState<any[]>([]);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [academicStats, setAcademicStats] = React.useState<any>(null);
  const [selectedClass, setSelectedClass] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState('');
  const [selectedPeriod, setSelectedPeriod] = React.useState('Trimestre 1');
  const [showGradeEntryModal, setShowGradeEntryModal] = React.useState(false);
  const [showCalculateAveragesModal, setShowCalculateAveragesModal] = React.useState(false);

  const periods = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];

  // Charger les données au montage
  React.useEffect(() => {
    if (userSchool && currentAcademicYear) {
      loadAcademicData();
    }
  }, [userSchool, currentAcademicYear]);

  const loadAcademicData = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);
      setError(null);

      const [subjectsData, classesData, statsData] = await Promise.all([
        SubjectService.getSubjects(userSchool.id),
        ClassService.getClasses(userSchool.id, currentAcademicYear.id),
        loadAcademicStats()
      ]);

      setSubjects(subjectsData);
      setClasses(classesData);
      setAcademicStats(statsData);

      // Charger les notes récentes
      await loadRecentGrades();

    } catch (error: any) {
      console.error('Erreur lors du chargement des données académiques:', error);
      setError(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadAcademicStats = async () => {
    if (!userSchool || !currentAcademicYear) return null;

    try {
      // Obtenir les statistiques depuis la base de données
      const { data: enrollments } = await supabase
        .from('enrollment_details')
        .select('*')
        .eq('school_id', userSchool.id)
        .eq('academic_year_id', currentAcademicYear.id)
        .eq('is_active', true);

      const { data: grades } = await supabase
        .from('grades')
        .select('grade_value')
        .eq('school_id', userSchool.id)
        .eq('academic_year_id', currentAcademicYear.id);

      const { data: bulletins } = await supabase
        .from('bulletins')
        .select('id')
        .eq('school_id', userSchool.id)
        .eq('academic_year_id', currentAcademicYear.id);

      const totalStudents = enrollments?.length || 0;
      const totalGrades = grades?.length || 0;
      const totalBulletins = bulletins?.length || 0;
      const averageGrade = grades?.length > 0 
        ? grades.reduce((sum, g) => sum + g.grade_value, 0) / grades.length 
        : 0;
      const passRate = grades?.length > 0 
        ? (grades.filter(g => g.grade_value >= 10).length / grades.length) * 100 
        : 0;

      return {
        totalGrades,
        averageGrade,
        totalBulletins,
        passRate,
        totalStudents
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return null;
    }
  };

  const loadRecentGrades = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      const { data, error } = await supabase
        .from('grade_details')
        .select('*')
        .eq('school_id', userSchool.id)
        .eq('academic_year_id', currentAcademicYear.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Grouper par classe/matière pour obtenir les saisies récentes
      const groupedGrades = (data || []).reduce((acc, grade) => {
        const key = `${grade.class_name}-${grade.subject_name}`;
        if (!acc[key]) {
          acc[key] = {
            subject: grade.subject_name,
            class: grade.class_name,
            teacher: `${grade.teacher_first_name} ${grade.teacher_last_name}`,
            students: 1,
            date: new Date(grade.created_at).toLocaleDateString('fr-FR'),
            grades: [grade.grade_value]
          };
        } else {
          acc[key].students += 1;
          acc[key].grades.push(grade.grade_value);
        }
        return acc;
      }, {} as Record<string, any>);

      const recentGradesData = Object.values(groupedGrades).map((group: any) => ({
        ...group,
        average: group.grades.reduce((sum: number, grade: number) => sum + grade, 0) / group.grades.length
      }));

      setRecentGrades(recentGradesData);
    } catch (error) {
      console.error('Erreur lors du chargement des notes récentes:', error);
    }
  };

  const handleStartGradeEntry = () => {
    if (selectedClass && selectedSubject) {
      setShowGradeEntryModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Chargement des données académiques...</p>
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
            onClick={loadAcademicData}
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gestion Académique</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Notes, bulletins, moyennes et suivi pédagogique - Année {currentAcademicYear?.name || currentAcademicYear}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={loadAcademicData}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
          
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            onClick={() => setShowCalculateAveragesModal(true)}>
            <Calculator className="h-4 w-4" />
            <span>Calculer Moyennes</span>
          </button>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base">
            <FileText className="h-4 w-4" />
            <span>Générer Bulletins</span>
          </button>
        </div>
      </div>

      {/* Academic Stats */}
      {academicStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notes Saisies</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">{academicStats.totalGrades}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-xl flex-shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs sm:text-sm text-blue-600 font-medium">{selectedPeriod}</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Moyenne Générale</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">
                  {academicStats.averageGrade ? academicStats.averageGrade.toFixed(1) : '--'}
                  <span className="text-xs sm:text-sm text-gray-500">/20</span>
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-xl flex-shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs sm:text-sm text-green-600 font-medium">
                {academicStats.totalStudents} élèves
              </span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bulletins Générés</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">{academicStats.totalBulletins}</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 rounded-xl flex-shrink-0">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs sm:text-sm text-purple-600 font-medium">
                {academicStats.totalStudents > 0 
                  ? Math.round((academicStats.totalBulletins / academicStats.totalStudents) * 100)
                  : 0}%
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1">des élèves</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de Réussite</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">
                  {academicStats.passRate ? academicStats.passRate.toFixed(0) : '--'}%
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-50 rounded-xl flex-shrink-0">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${academicStats.passRate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Matières - Vue d'Ensemble</h2>
          
          {subjects.length > 0 ? (
            <div className="space-y-4">
              {subjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-gray-800">{subject.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Coefficient {subject.coefficient} • {subject.levels?.length || 0} niveaux
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm sm:text-base font-semibold text-gray-800">
                      {subject.description ? 'Configuré' : 'À configurer'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Statut
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune matière configurée</p>
              <p className="text-sm text-gray-400">Configurez les matières dans les paramètres</p>
            </div>
          )}
        </div>

        {/* Recent Grade Entries */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Saisies de Notes Récentes</h2>
            <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">
              Voir tout
            </button>
          </div>
          
          {recentGrades.length > 0 ? (
            <div className="space-y-4">
              {recentGrades.map((grade, index) => (
                <div key={index} className="p-3 sm:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm sm:text-base font-medium text-gray-800">{grade.subject}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{grade.class} • {grade.teacher}</p>
                      <p className="text-xs text-gray-500 mt-1">{grade.students} note(s) • {grade.date}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-base sm:text-lg text-gray-800">
                        {grade.average ? grade.average.toFixed(1) : '--'}/20
                      </p>
                      <p className="text-xs text-gray-500">Moyenne</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Performance</span>
                      <span>{grade.average ? Math.round((grade.average / 20) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (grade.average || 0) >= 14 ? 'bg-green-500' :
                          (grade.average || 0) >= 12 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${((grade.average || 0) / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune note récente</p>
              <p className="text-sm text-gray-400">Les notes saisies apparaîtront ici</p>
            </div>
          )}
        </div>
      </div>

      {/* Grade Entry Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Saisie des Notes</h2>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner une classe</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
            
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner une matière</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.name}>{subject.name}</option>
              ))}
            </select>
            
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
          
          {selectedClass && selectedSubject ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Prêt pour la Saisie</h3>
              <p className="text-gray-600 mb-4">
                Classe: <strong>{selectedClass}</strong> • Matière: <strong>{selectedSubject}</strong> • Période: <strong>{selectedPeriod}</strong>
              </p>
              <button 
                onClick={handleStartGradeEntry}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
              >
                Commencer la Saisie
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-500">Sélectionnez une classe et une matière pour commencer la saisie des notes</p>
              <div className="mt-4 space-y-2">
                {!selectedClass && (
                  <p className="text-sm text-red-500">• Veuillez sélectionner une classe</p>
                )}
                {!selectedSubject && (
                  <p className="text-sm text-red-500">• Veuillez sélectionner une matière</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grade Entry Modal */}
      <GradeEntryModal
        isOpen={showGradeEntryModal}
        onClose={() => setShowGradeEntryModal(false)}
        selectedClass={selectedClass}
        selectedSubject={selectedSubject}
        selectedPeriod={selectedPeriod}
      />

      {/* Calculate Averages Modal */}
      <CalculateAveragesModal
        isOpen={showCalculateAveragesModal}
        onClose={() => setShowCalculateAveragesModal(false)}
      />
    </div>
  );
};

export default AcademicManagement;