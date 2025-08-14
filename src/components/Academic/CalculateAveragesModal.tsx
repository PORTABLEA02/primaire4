import React, { useState } from 'react';
import { X, Calculator, BookOpen, Users, TrendingUp, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';
import BulletinGenerationModal from './BulletinGenerationModal';
import { useAcademicYear } from '../../contexts/AcademicYearContext';

interface CalculateAveragesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ClassAverage {
  className: string;
  level: string;
  studentCount: number;
  subjects: SubjectAverage[];
  generalAverage: number;
  passRate: number;
  teacher: string;
}

interface SubjectAverage {
  subject: string;
  average: number;
  coefficient: number;
  gradeCount: number;
  minGrade: number;
  maxGrade: number;
}

interface StudentResult {
  id: string;
  name: string;
  class: string;
  subjects: Array<{
    subject: string;
    grades: number[];
    average: number;
    coefficient: number;
  }>;
  generalAverage: number;
  rank: number;
  status: 'Admis' | 'Redouble' | 'En cours';
}

const CalculateAveragesModal: React.FC<CalculateAveragesModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentAcademicYear } = useAcademicYear();
  const [selectedPeriod, setSelectedPeriod] = useState('Trimestre 1');
  const [selectedClass, setSelectedClass] = useState('all');
  const [calculationStep, setCalculationStep] = useState<'config' | 'calculating' | 'results'>('config');
  const [progress, setProgress] = useState(0);
  const [showBulletinModal, setShowBulletinModal] = useState(false);

  // Données d'exemple des moyennes calculées
  const [classAverages] = useState<ClassAverage[]>([
    {
      className: 'CM2A',
      level: 'CM2',
      studentCount: 42,
      teacher: 'M. Ouattara',
      generalAverage: 12.8,
      passRate: 78.6,
      subjects: [
        { subject: 'Français', average: 13.2, coefficient: 4, gradeCount: 42, minGrade: 8.5, maxGrade: 18.0 },
        { subject: 'Mathématiques', average: 11.8, coefficient: 4, gradeCount: 42, minGrade: 6.0, maxGrade: 19.5 },
        { subject: 'Sciences', average: 13.5, coefficient: 2, gradeCount: 42, minGrade: 9.0, maxGrade: 17.5 },
        { subject: 'Histoire-Géographie', average: 12.1, coefficient: 2, gradeCount: 42, minGrade: 7.5, maxGrade: 16.0 },
        { subject: 'Anglais', average: 11.9, coefficient: 2, gradeCount: 42, minGrade: 8.0, maxGrade: 15.5 }
      ]
    },
    {
      className: 'CE2B',
      level: 'CE2',
      studentCount: 38,
      teacher: 'M. Sidibe',
      generalAverage: 13.1,
      passRate: 84.2,
      subjects: [
        { subject: 'Français', average: 13.8, coefficient: 4, gradeCount: 38, minGrade: 9.0, maxGrade: 17.5 },
        { subject: 'Mathématiques', average: 12.5, coefficient: 4, gradeCount: 38, minGrade: 7.5, maxGrade: 18.0 },
        { subject: 'Sciences', average: 13.2, coefficient: 2, gradeCount: 38, minGrade: 10.0, maxGrade: 16.5 },
        { subject: 'Histoire-Géographie', average: 12.8, coefficient: 2, gradeCount: 38, minGrade: 8.5, maxGrade: 16.0 }
      ]
    },
    {
      className: 'CI A',
      level: 'CI',
      studentCount: 32,
      teacher: 'M. Traore',
      generalAverage: 11.9,
      passRate: 75.0,
      subjects: [
        { subject: 'Français', average: 12.3, coefficient: 4, gradeCount: 32, minGrade: 8.0, maxGrade: 16.5 },
        { subject: 'Mathématiques', average: 11.2, coefficient: 4, gradeCount: 32, minGrade: 6.5, maxGrade: 17.0 },
        { subject: 'Éveil Scientifique', average: 12.1, coefficient: 2, gradeCount: 32, minGrade: 9.0, maxGrade: 15.5 }
      ]
    }
  ]);

  const [topStudents] = useState<StudentResult[]>([
    {
      id: '1',
      name: 'Aminata Traore',
      class: 'CM2A',
      generalAverage: 16.8,
      rank: 1,
      status: 'Admis',
      subjects: [
        { subject: 'Français', grades: [17.5, 16.0, 18.0], average: 17.2, coefficient: 4 },
        { subject: 'Mathématiques', grades: [16.5, 17.0, 16.0], average: 16.5, coefficient: 4 },
        { subject: 'Sciences', grades: [17.0, 16.5], average: 16.8, coefficient: 2 }
      ]
    },
    {
      id: '2',
      name: 'Ibrahim Kone',
      class: 'CE2B',
      generalAverage: 16.2,
      rank: 1,
      status: 'Admis',
      subjects: [
        { subject: 'Français', grades: [16.0, 17.0, 15.5], average: 16.2, coefficient: 4 },
        { subject: 'Mathématiques', grades: [15.5, 16.5, 16.0], average: 16.0, coefficient: 4 }
      ]
    },
    {
      id: '3',
      name: 'Fatoumata Diallo',
      class: 'CI A',
      generalAverage: 15.1,
      rank: 1,
      status: 'Admis',
      subjects: [
        { subject: 'Français', grades: [15.0, 15.5, 14.5], average: 15.0, coefficient: 4 },
        { subject: 'Mathématiques', grades: [15.5, 15.0, 15.5], average: 15.3, coefficient: 4 }
      ]
    }
  ]);

  const classes = ['CM2A', 'CM2B', 'CM1A', 'CE2B', 'CE1A', 'CP1', 'CP2', 'CI A'];
  const periods = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];

  const startCalculation = async () => {
    setCalculationStep('calculating');
    setProgress(0);

    // Simulation du processus de calcul
    const steps = [
      'Récupération des notes...',
      'Calcul des moyennes par matière...',
      'Calcul des moyennes générales...',
      'Calcul des classements...',
      'Génération des statistiques...',
      'Finalisation...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(((i + 1) / steps.length) * 100);
    }

    setCalculationStep('results');
  };

  const exportResults = (format: 'pdf' | 'excel') => {
    console.log(`Export des résultats en ${format.toUpperCase()}`);
    alert(`Export ${format.toUpperCase()} en cours...`);
  };

  const getAverageColor = (average: number) => {
    if (average >= 16) return 'text-green-600';
    if (average >= 14) return 'text-blue-600';
    if (average >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAverageBg = (average: number) => {
    if (average >= 16) return 'bg-green-50';
    if (average >= 14) return 'bg-blue-50';
    if (average >= 10) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getPassRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 70) return 'text-blue-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Calcul des Moyennes</h2>
                <p className="text-gray-600">
                  {calculationStep === 'config' && 'Configuration du calcul'}
                  {calculationStep === 'calculating' && 'Calcul en cours...'}
                  {calculationStep === 'results' && 'Résultats du calcul'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Configuration */}
          {calculationStep === 'config' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Période d'Évaluation
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {periods.map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classe(s) à Traiter
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Toutes les classes</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-3">Paramètres de Calcul</h3>
                <div className="mb-4 p-3 bg-white rounded border">
                  <p className="text-sm text-blue-700">
                    <strong>Année scolaire:</strong> {currentAcademicYear}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-blue-700">Appliquer les coefficients</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-blue-700">Calculer les classements</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-blue-700">Générer les statistiques</span>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Seuil de passage
                      </label>
                      <input
                        type="number"
                        min="8"
                        max="12"
                        step="0.5"
                        defaultValue="10"
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Arrondi (décimales)
                      </label>
                      <select
                        defaultValue="1"
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="0">0 (entier)</option>
                        <option value="1">1 décimale</option>
                        <option value="2">2 décimales</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Information Importante</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Le calcul des moyennes va traiter toutes les notes saisies pour la période sélectionnée. 
                      Cette opération peut prendre quelques minutes selon le nombre d'élèves et de notes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={startCalculation}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Calculator className="h-5 w-5" />
                  <span>Lancer le Calcul</span>
                </button>
              </div>
            </div>
          )}

          {/* Calcul en cours */}
          {calculationStep === 'calculating' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Calcul en Cours</h3>
                <p className="text-gray-600">Traitement des données académiques...</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progression</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">
                    {selectedClass === 'all' ? classes.length : 1}
                  </p>
                  <p className="text-sm text-gray-600">Classes traitées</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">2,847</p>
                  <p className="text-sm text-gray-600">Notes analysées</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">1,247</p>
                  <p className="text-sm text-gray-600">Moyennes calculées</p>
                </div>
              </div>
            </div>
          )}

          {/* Résultats */}
          {calculationStep === 'results' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Calcul Terminé</h3>
                    <p className="text-gray-600">Moyennes calculées pour {selectedPeriod}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportResults('excel')}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={() => exportResults('pdf')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {/* Statistiques globales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Moyenne Générale</p>
                      <p className="text-2xl font-bold text-blue-800">12.6/20</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Taux de Réussite</p>
                      <p className="text-2xl font-bold text-green-800">79.2%</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Élèves Traités</p>
                      <p className="text-2xl font-bold text-purple-800">1,247</p>
                    </div>
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600">Classes Traitées</p>
                      <p className="text-2xl font-bold text-orange-800">{classAverages.length}</p>
                    </div>
                    <BookOpen className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Résultats par classe */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-medium text-gray-800">Moyennes par Classe</h4>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enseignant</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Effectif</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Moyenne Générale</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taux de Réussite</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meilleures Matières</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {classAverages.map((classData, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {classData.className.substring(0, 2)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{classData.className}</p>
                                <p className="text-sm text-gray-500">{classData.level}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-800">{classData.teacher}</p>
                            <p className="text-sm text-gray-500">Enseignant unique</p>
                          </td>
                          
                          <td className="px-6 py-4 text-center">
                            <span className="font-medium text-gray-800">{classData.studentCount}</span>
                          </td>
                          
                          <td className="px-6 py-4 text-center">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full ${getAverageBg(classData.generalAverage)}`}>
                              <span className={`font-bold ${getAverageColor(classData.generalAverage)}`}>
                                {classData.generalAverage.toFixed(1)}/20
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <span className={`font-medium ${getPassRateColor(classData.passRate)}`}>
                                {classData.passRate.toFixed(1)}%
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    classData.passRate >= 80 ? 'bg-green-500' :
                                    classData.passRate >= 70 ? 'bg-blue-500' :
                                    classData.passRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${classData.passRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {classData.subjects
                                .sort((a, b) => b.average - a.average)
                                .slice(0, 2)
                                .map(subject => (
                                  <span key={subject.subject} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                    {subject.subject} ({subject.average.toFixed(1)})
                                  </span>
                                ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top 3 des élèves */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-medium text-gray-800">Top 3 des Élèves par Classe</h4>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topStudents.map((student, index) => (
                      <div key={student.id} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 font-bold text-lg">
                              #{student.rank}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.class}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Moyenne générale:</span>
                            <span className="font-bold text-green-600">{student.generalAverage.toFixed(1)}/20</span>
                          </div>
                          
                          <div className="space-y-1">
                            {student.subjects.slice(0, 3).map(subject => (
                              <div key={subject.subject} className="flex justify-between text-sm">
                                <span className="text-gray-600">{subject.subject}:</span>
                                <span className="font-medium">{subject.average.toFixed(1)}/20</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analyse détaillée par matière */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-medium text-gray-800">Analyse par Matière</h4>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {classAverages.map((classData, classIndex) => (
                      <div key={classIndex} className="space-y-4">
                        <h5 className="font-medium text-gray-800 flex items-center space-x-2">
                          <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-sm">
                            {classData.className.substring(0, 2)}
                          </span>
                          <span>{classData.className}</span>
                        </h5>
                        
                        <div className="space-y-3">
                          {classData.subjects.map((subject, subjectIndex) => (
                            <div key={subjectIndex} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-800">{subject.subject}</span>
                                <span className={`font-bold ${getAverageColor(subject.average)}`}>
                                  {subject.average.toFixed(1)}/20
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                                <div>
                                  <span>Min: {subject.minGrade.toFixed(1)}</span>
                                </div>
                                <div>
                                  <span>Max: {subject.maxGrade.toFixed(1)}</span>
                                </div>
                                <div>
                                  <span>Coef: {subject.coefficient}</span>
                                </div>
                              </div>
                              
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div 
                                    className={`h-1 rounded-full ${
                                      subject.average >= 14 ? 'bg-green-500' :
                                      subject.average >= 12 ? 'bg-blue-500' :
                                      subject.average >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${(subject.average / 20) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions post-calcul */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-3">Actions Recommandées</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    onClick={() => setShowBulletinModal(true)}>
                    Générer les Bulletins
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Envoyer aux Parents
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    Conseil de Classe
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {calculationStep === 'results' && (
                <span>Calcul effectué le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {calculationStep === 'results' && (
                <button
                  onClick={() => setCalculationStep('config')}
                  className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Nouveau Calcul
                </button>
              )}
              
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {calculationStep === 'results' ? 'Fermer' : 'Annuler'}
              </button>
            </div>
          </div>
        </div>

        {/* Bulletin Generation Modal */}
        <BulletinGenerationModal
          isOpen={showBulletinModal}
          onClose={() => setShowBulletinModal(false)}
          selectedPeriod={selectedPeriod}
          classAverages={classAverages}
        />
      </div>
    </div>
  );
};

export default CalculateAveragesModal;