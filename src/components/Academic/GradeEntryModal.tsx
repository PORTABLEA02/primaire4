import React, { useState } from 'react';
import { X, BookOpen, Save, Users, Calculator, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useAcademicYear } from '../../contexts/AcademicYearContext';

interface GradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: string;
  selectedSubject: string;
  selectedPeriod: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  currentGrade: number | null;
  previousGrade?: number;
  attendance: number;
}

interface GradeEntry {
  studentId: string;
  grade: number | null;
  comment?: string;
}

const GradeEntryModal: React.FC<GradeEntryModalProps> = ({
  isOpen,
  onClose,
  selectedClass,
  selectedSubject,
  selectedPeriod
}) => {
  const { currentAcademicYear } = useAcademicYear();
  
  // Données d'exemple des élèves selon la classe
  const getStudentsForClass = (className: string): Student[] => {
    const baseStudents = {
      'CM2A': [
        { id: '1', firstName: 'Kofi', lastName: 'Mensah', currentGrade: null, previousGrade: 14.5, attendance: 95 },
        { id: '2', firstName: 'Aminata', lastName: 'Traore', currentGrade: null, previousGrade: 16.0, attendance: 98 },
        { id: '3', firstName: 'Ibrahim', lastName: 'Kone', currentGrade: null, previousGrade: 12.5, attendance: 92 },
        { id: '4', firstName: 'Fatoumata', lastName: 'Diallo', currentGrade: null, previousGrade: 15.5, attendance: 96 },
        { id: '5', firstName: 'Sekou', lastName: 'Sangare', currentGrade: null, previousGrade: 11.0, attendance: 88 }
      ],
      'CE2B': [
        { id: '6', firstName: 'Aissata', lastName: 'Ba', currentGrade: null, previousGrade: 13.5, attendance: 94 },
        { id: '7', firstName: 'Moussa', lastName: 'Coulibaly', currentGrade: null, previousGrade: 12.0, attendance: 90 },
        { id: '8', firstName: 'Mariam', lastName: 'Sidibe', currentGrade: null, previousGrade: 15.0, attendance: 97 }
      ],
      'CM1A': [
        { id: '9', firstName: 'Ousmane', lastName: 'Keita', currentGrade: null, previousGrade: 14.0, attendance: 93 },
        { id: '10', firstName: 'Kadiatou', lastName: 'Toure', currentGrade: null, previousGrade: 16.5, attendance: 99 }
      ]
    };
    
    return baseStudents[className as keyof typeof baseStudents] || [];
  };

  const [students, setStudents] = useState<Student[]>(getStudentsForClass(selectedClass));
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
  const [evaluationType, setEvaluationType] = useState<'devoir' | 'composition' | 'interrogation'>('devoir');
  const [evaluationTitle, setEvaluationTitle] = useState('');
  const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().split('T')[0]);
  const [coefficient, setCoefficient] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (selectedClass) {
      const classStudents = getStudentsForClass(selectedClass);
      setStudents(classStudents);
      
      // Initialiser les notes vides
      const initialGrades: Record<string, GradeEntry> = {};
      classStudents.forEach(student => {
        initialGrades[student.id] = {
          studentId: student.id,
          grade: null,
          comment: ''
        };
      });
      setGrades(initialGrades);
    }
  }, [selectedClass]);

  const updateGrade = (studentId: string, grade: number | null) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        grade: grade
      }
    }));
  };

  const updateComment = (studentId: string, comment: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment: comment
      }
    }));
  };

  const calculateClassAverage = () => {
    const validGrades = Object.values(grades)
      .map(entry => entry.grade)
      .filter(grade => grade !== null && grade !== undefined) as number[];
    
    if (validGrades.length === 0) return 0;
    return validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null || grade === undefined) return 'border-gray-200';
    if (grade >= 16) return 'border-green-500 bg-green-50';
    if (grade >= 14) return 'border-blue-500 bg-blue-50';
    if (grade >= 10) return 'border-yellow-500 bg-yellow-50';
    return 'border-red-500 bg-red-50';
  };

  const getGradeStatus = (grade: number | null) => {
    if (grade === null || grade === undefined) return null;
    if (grade >= 16) return { text: 'Excellent', color: 'text-green-600' };
    if (grade >= 14) return { text: 'Bien', color: 'text-blue-600' };
    if (grade >= 10) return { text: 'Passable', color: 'text-yellow-600' };
    return { text: 'Insuffisant', color: 'text-red-600' };
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulation de sauvegarde
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Notes sauvegardées:', {
      class: selectedClass,
      subject: selectedSubject,
      period: selectedPeriod,
      academicYear: currentAcademicYear,
      evaluationType,
      evaluationTitle,
      evaluationDate,
      coefficient,
      grades: Object.values(grades).filter(g => g.grade !== null)
    });
    
    setIsSaving(false);
    onClose();
    
    // Notification de succès
    alert(`Notes sauvegardées avec succès pour ${selectedClass} - ${selectedSubject}`);
  };

  const completedGrades = Object.values(grades).filter(g => g.grade !== null).length;
  const totalStudents = students.length;
  const classAverage = calculateClassAverage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Saisie des Notes</h2>
                <p className="text-gray-600">
                  {selectedClass} • {selectedSubject} • {selectedPeriod}
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
          {/* Configuration de l'évaluation */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-4">Configuration de l'Évaluation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'Évaluation
                </label>
                <select
                  value={evaluationType}
                  onChange={(e) => setEvaluationType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="devoir">Devoir</option>
                  <option value="composition">Composition</option>
                  <option value="interrogation">Interrogation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de l'Évaluation
                </label>
                <input
                  type="text"
                  value={evaluationTitle}
                  onChange={(e) => setEvaluationTitle(e.target.value)}
                  placeholder="Ex: Devoir n°1, Composition..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'Évaluation
                </label>
                <input
                  type="date"
                  value={evaluationDate}
                  onChange={(e) => setEvaluationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coefficient
                </label>
                <select
                  value={coefficient}
                  onChange={(e) => setCoefficient(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Élèves</p>
                  <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
                </div>
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Notes Saisies</p>
                  <p className="text-2xl font-bold text-green-600">{completedGrades}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(completedGrades / totalStudents) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Moyenne Classe</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {completedGrades > 0 ? classAverage.toFixed(1) : '--'}/20
                  </p>
                </div>
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progression</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round((completedGrades / totalStudents) * 100)}%
                  </p>
                </div>
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => {
                const newGrades = { ...grades };
                students.forEach(student => {
                  if (!newGrades[student.id].grade) {
                    newGrades[student.id].grade = student.previousGrade || 10;
                  }
                });
                setGrades(newGrades);
              }}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
            >
              Reprendre notes précédentes
            </button>
            
            <button
              onClick={() => {
                const newGrades = { ...grades };
                students.forEach(student => {
                  newGrades[student.id].grade = null;
                });
                setGrades(newGrades);
              }}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              Effacer tout
            </button>
            
            <button
              onClick={() => {
                const average = 12;
                const newGrades = { ...grades };
                students.forEach(student => {
                  if (!newGrades[student.id].grade) {
                    newGrades[student.id].grade = average;
                  }
                });
                setGrades(newGrades);
              }}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
            >
              Appliquer moyenne (12/20)
            </button>
          </div>

          {/* Table de saisie */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Élève</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Note Précédente</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Assiduité</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Note /20</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Appréciation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commentaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student, index) => {
                    const currentGrade = grades[student.id]?.grade;
                    const gradeStatus = getGradeStatus(currentGrade);
                    
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-medium">
                                {student.firstName[0]}{student.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-gray-500">#{index + 1}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          {student.previousGrade ? (
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              student.previousGrade >= 14 ? 'bg-green-100 text-green-700' :
                              student.previousGrade >= 10 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {student.previousGrade}/20
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">--</span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  student.attendance >= 95 ? 'bg-green-500' :
                                  student.attendance >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${student.attendance}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{student.attendance}%</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.25"
                              value={currentGrade || ''}
                              onChange={(e) => updateGrade(student.id, e.target.value ? parseFloat(e.target.value) : null)}
                              className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getGradeColor(currentGrade)}`}
                              placeholder="--"
                            />
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          {gradeStatus && (
                            <span className={`text-sm font-medium ${gradeStatus.color}`}>
                              {gradeStatus.text}
                            </span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={grades[student.id]?.comment || ''}
                            onChange={(e) => updateComment(student.id, e.target.value)}
                            placeholder="Commentaire optionnel..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Résumé et statistiques */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3">Statistiques de Classe</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span>Notes saisies:</span>
                  <span className="font-medium">{completedGrades}/{totalStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span>Moyenne de classe:</span>
                  <span className="font-medium">
                    {completedGrades > 0 ? `${classAverage.toFixed(2)}/20` : 'En attente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taux de réussite:</span>
                  <span className="font-medium">
                    {completedGrades > 0 ? 
                      `${Math.round((Object.values(grades).filter(g => g.grade && g.grade >= 10).length / completedGrades) * 100)}%` : 
                      'En attente'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-3">Répartition des Notes</h4>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span>Excellent (16-20):</span>
                  <span className="font-medium">
                    {Object.values(grades).filter(g => g.grade && g.grade >= 16).length} élèves
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bien (14-16):</span>
                  <span className="font-medium">
                    {Object.values(grades).filter(g => g.grade && g.grade >= 14 && g.grade < 16).length} élèves
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Passable (10-14):</span>
                  <span className="font-medium">
                    {Object.values(grades).filter(g => g.grade && g.grade >= 10 && g.grade < 14).length} élèves
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Insuffisant (&lt;10):</span>
                  <span className="font-medium">
                    {Object.values(grades).filter(g => g.grade && g.grade < 10).length} élèves
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alertes */}
          {completedGrades < totalStudents && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Notes Incomplètes</h4>
                  <p className="text-sm text-yellow-700">
                    {totalStudents - completedGrades} élève(s) n'ont pas encore de note saisie. 
                    Vous pouvez sauvegarder et compléter plus tard.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Progression: {completedGrades}/{totalStudents} notes saisies
              {completedGrades > 0 && ` • Moyenne: ${classAverage.toFixed(1)}/20`}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              
              <button
                onClick={handleSave}
                disabled={completedGrades === 0 || isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Sauvegarder les Notes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeEntryModal;