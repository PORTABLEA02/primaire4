import React from 'react';
import { BookOpen, FileText, Calculator, Award, TrendingUp } from 'lucide-react';
import GradeEntryModal from './GradeEntryModal';
import CalculateAveragesModal from './CalculateAveragesModal';
import { useAcademicYear } from '../../contexts/AcademicYearContext';

const AcademicManagement: React.FC = () => {
  const [selectedClass, setSelectedClass] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState('');
  const [selectedPeriod, setSelectedPeriod] = React.useState('Trimestre 1');
  const { currentAcademicYear } = useAcademicYear();
  const [showGradeEntryModal, setShowGradeEntryModal] = React.useState(false);
  const [showCalculateAveragesModal, setShowCalculateAveragesModal] = React.useState(false);

  const subjects = [
    { name: 'Français', classes: 12, notes: 456, average: 12.8 },
    { name: 'Mathématiques', classes: 12, notes: 445, average: 11.2 },
    { name: 'Sciences', classes: 8, notes: 280, average: 13.5 },
    { name: 'Histoire-Géographie', classes: 10, notes: 350, average: 12.1 },
    { name: 'Anglais', classes: 6, notes: 210, average: 11.9 }
  ];

  const recentGrades = [
    {
      subject: 'Mathématiques',
      class: 'CM2A',
      teacher: 'M. Traore',
      students: 42,
      date: 'Aujourd\'hui',
      average: 11.8
    },
    {
      subject: 'Français',
      class: 'CE2B',
      teacher: 'Mme Kone',
      students: 38,
      date: 'Hier',
      average: 13.2
    },
    {
      subject: 'Sciences',
      class: 'CM1A',
      teacher: 'M. Sidibe',
      students: 35,
      date: '2 jours',
      average: 12.5
    }
  ];

  const classes = ['CM2A', 'CM2B', 'CM1A', 'CE2B', 'CE1A', 'CP1', 'CP2', 'CI A'];
  const subjectOptions = ['Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie', 'Anglais', 'Éducation Civique'];
  const periods = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];

  const handleStartGradeEntry = () => {
    if (selectedClass && selectedSubject) {
      setShowGradeEntryModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gestion Académique</h1>
          <p className="text-sm sm:text-base text-gray-600">Notes, bulletins, moyennes et suivi pédagogique - Année {currentAcademicYear}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Notes Saisies</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">2,847</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-50 rounded-xl flex-shrink-0">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs sm:text-sm text-blue-600 font-medium">Trimestre 1</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Moyenne Générale</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">12.3<span className="text-xs sm:text-sm text-gray-500">/20</span></p>
            </div>
            <div className="p-2 sm:p-3 bg-green-50 rounded-xl flex-shrink-0">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs sm:text-sm text-green-600 font-medium">+0.4 pts</span>
            <span className="text-xs sm:text-sm text-gray-500 ml-1">vs trimestre dernier</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bulletins Générés</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">1,089</p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-50 rounded-xl flex-shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs sm:text-sm text-purple-600 font-medium">87%</span>
            <span className="text-xs sm:text-sm text-gray-500 ml-1">des élèves</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de Réussite</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">78%</p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-50 rounded-xl flex-shrink-0">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Matières - Vue d'Ensemble</h2>
          
          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-800">{subject.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{subject.classes} classes • {subject.notes} notes</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm sm:text-base font-semibold text-gray-800">{subject.average}/20</p>
                  <p className={`text-xs sm:text-sm ${subject.average >= 12 ? 'text-green-600' : 'text-red-600'}`}>
                    Moyenne
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Grade Entries */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Saisies de Notes Récentes</h2>
            <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">
              Voir tout
            </button>
          </div>
          
          <div className="space-y-4">
            {recentGrades.map((grade, index) => (
              <div key={index} className="p-3 sm:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-800">{grade.subject}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{grade.class} • {grade.teacher}</p>
                    <p className="text-xs text-gray-500 mt-1">{grade.students} élèves • {grade.date}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-base sm:text-lg text-gray-800">{grade.average}/20</p>
                    <p className="text-xs text-gray-500">Moyenne classe</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Performance</span>
                    <span>{Math.round((grade.average / 20) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        grade.average >= 14 ? 'bg-green-500' :
                        grade.average >= 12 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(grade.average / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner une matière</option>
              {subjectOptions.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
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