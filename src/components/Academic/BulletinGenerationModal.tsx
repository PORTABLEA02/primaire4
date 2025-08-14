import React, { useState } from 'react';
import { X, FileText, Download, Printer, Mail, CheckCircle, Clock, User, Award, TrendingUp } from 'lucide-react';

interface BulletinGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPeriod: string;
  classAverages: ClassAverage[];
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

interface StudentBulletin {
  id: string;
  name: string;
  class: string;
  rank: number;
  generalAverage: number;
  subjects: Array<{
    subject: string;
    grades: number[];
    average: number;
    coefficient: number;
    appreciation: string;
  }>;
  conduct: string;
  absences: number;
  teacher: string;
  decision: 'Admis' | 'Redouble' | 'En cours';
}

const BulletinGenerationModal: React.FC<BulletinGenerationModalProps> = ({
  isOpen,
  onClose,
  selectedPeriod,
  classAverages
}) => {
  const [generationStep, setGenerationStep] = useState<'config' | 'generating' | 'preview' | 'complete'>('config');
  const [progress, setProgress] = useState(0);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [bulletinTemplate, setBulletinTemplate] = useState('standard');
  const [includeComments, setIncludeComments] = useState(true);
  const [includeRanking, setIncludeRanking] = useState(true);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<'print' | 'email' | 'both'>('both');

  // Données d'exemple des bulletins générés
  const [sampleBulletins] = useState<StudentBulletin[]>([
    {
      id: '1',
      name: 'Aminata Traore',
      class: 'CM2A',
      rank: 1,
      generalAverage: 16.8,
      teacher: 'M. Ouattara',
      decision: 'Admis',
      conduct: 'Très Bien',
      absences: 2,
      subjects: [
        { subject: 'Français', grades: [17.5, 16.0, 18.0], average: 17.2, coefficient: 4, appreciation: 'Excellent travail' },
        { subject: 'Mathématiques', grades: [16.5, 17.0, 16.0], average: 16.5, coefficient: 4, appreciation: 'Très bon niveau' },
        { subject: 'Sciences', grades: [17.0, 16.5], average: 16.8, coefficient: 2, appreciation: 'Remarquable' },
        { subject: 'Histoire-Géographie', grades: [16.0, 17.5], average: 16.8, coefficient: 2, appreciation: 'Très bien' },
        { subject: 'Anglais', grades: [15.5, 16.0], average: 15.8, coefficient: 2, appreciation: 'Bon niveau' }
      ]
    },
    {
      id: '2',
      name: 'Ibrahim Kone',
      class: 'CM2A',
      rank: 2,
      generalAverage: 15.2,
      teacher: 'M. Ouattara',
      decision: 'Admis',
      conduct: 'Bien',
      absences: 1,
      subjects: [
        { subject: 'Français', grades: [15.0, 16.0, 14.5], average: 15.2, coefficient: 4, appreciation: 'Bon travail' },
        { subject: 'Mathématiques', grades: [16.0, 15.5, 15.0], average: 15.5, coefficient: 4, appreciation: 'Très satisfaisant' },
        { subject: 'Sciences', grades: [15.5, 14.5], average: 15.0, coefficient: 2, appreciation: 'Satisfaisant' },
        { subject: 'Histoire-Géographie', grades: [14.0, 15.5], average: 14.8, coefficient: 2, appreciation: 'Peut mieux faire' },
        { subject: 'Anglais', grades: [15.0, 15.5], average: 15.3, coefficient: 2, appreciation: 'Bon niveau' }
      ]
    }
  ]);

  const templates = [
    { value: 'standard', label: 'Bulletin Standard', description: 'Format classique avec notes et appréciations' },
    { value: 'detailed', label: 'Bulletin Détaillé', description: 'Inclut graphiques et analyses détaillées' },
    { value: 'simplified', label: 'Bulletin Simplifié', description: 'Format condensé pour impression rapide' }
  ];

  const startGeneration = async () => {
    if (selectedClasses.length === 0) {
      alert('Veuillez sélectionner au moins une classe');
      return;
    }

    setGenerationStep('generating');
    setProgress(0);

    // Simulation du processus de génération
    const steps = [
      'Récupération des données élèves...',
      'Calcul des moyennes individuelles...',
      'Génération des classements...',
      'Création des appréciations...',
      'Mise en forme des bulletins...',
      'Finalisation...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(((i + 1) / steps.length) * 100);
    }

    setGenerationStep('preview');
  };

  const handleClassToggle = (className: string) => {
    setSelectedClasses(prev => 
      prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  const selectAllClasses = () => {
    setSelectedClasses(classAverages.map(c => c.className));
  };

  const deselectAllClasses = () => {
    setSelectedClasses([]);
  };

  const getAverageColor = (average: number) => {
    if (average >= 16) return 'text-green-600';
    if (average >= 14) return 'text-blue-600';
    if (average >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'Admis': return 'bg-green-100 text-green-800';
      case 'Redouble': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const generateBulletins = () => {
    setGenerationStep('complete');
    
    // Simulation de la génération finale
    setTimeout(() => {
      alert(`${selectedClasses.length} bulletins générés avec succès !`);
    }, 1000);
  };

  const sendByEmail = () => {
    alert('Envoi des bulletins par email en cours...');
  };

  const printBulletins = () => {
    alert('Impression des bulletins en cours...');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Génération des Bulletins</h2>
                <p className="text-gray-600">
                  {generationStep === 'config' && `Bulletins pour ${selectedPeriod}`}
                  {generationStep === 'generating' && 'Génération en cours...'}
                  {generationStep === 'preview' && 'Aperçu des bulletins'}
                  {generationStep === 'complete' && 'Bulletins générés'}
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
          {generationStep === 'config' && (
            <div className="space-y-6">
              {/* Sélection des classes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Classes à Traiter</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={selectAllClasses}
                      className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Tout sélectionner
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={deselectAllClasses}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Tout désélectionner
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classAverages.map((classData) => (
                    <div
                      key={classData.className}
                      onClick={() => handleClassToggle(classData.className)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedClasses.includes(classData.className)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{classData.className}</h4>
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(classData.className)}
                          onChange={() => {}}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Enseignant:</strong> {classData.teacher}</p>
                        <p><strong>Élèves:</strong> {classData.studentCount}</p>
                        <p><strong>Moyenne:</strong> <span className={getAverageColor(classData.generalAverage)}>{classData.generalAverage.toFixed(1)}/20</span></p>
                        <p><strong>Réussite:</strong> {classData.passRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration du bulletin */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Modèle de Bulletin</h3>
                  
                  <div className="space-y-3">
                    {templates.map(template => (
                      <div
                        key={template.value}
                        onClick={() => setBulletinTemplate(template.value)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          bulletinTemplate === template.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">{template.label}</h4>
                            <p className="text-sm text-gray-600">{template.description}</p>
                          </div>
                          <input
                            type="radio"
                            name="template"
                            checked={bulletinTemplate === template.value}
                            onChange={() => {}}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Options d'Inclusion</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={includeComments}
                        onChange={(e) => setIncludeComments(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-medium text-gray-800">Appréciations des enseignants</span>
                        <p className="text-sm text-gray-600">Commentaires personnalisés par matière</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={includeRanking}
                        onChange={(e) => setIncludeRanking(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-medium text-gray-800">Classement dans la classe</span>
                        <p className="text-sm text-gray-600">Position de l'élève par rapport aux autres</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={includeStatistics}
                        onChange={(e) => setIncludeStatistics(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-medium text-gray-800">Statistiques de classe</span>
                        <p className="text-sm text-gray-600">Moyennes et taux de réussite de la classe</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Méthode de livraison */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Méthode de Livraison</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'print', label: 'Impression', icon: Printer, description: 'Bulletins papier à distribuer' },
                    { value: 'email', label: 'Email', icon: Mail, description: 'Envoi automatique aux parents' },
                    { value: 'both', label: 'Les Deux', icon: FileText, description: 'Impression + Email' }
                  ].map(method => {
                    const Icon = method.icon;
                    const isSelected = deliveryMethod === method.value;
                    
                    return (
                      <div
                        key={method.value}
                        onClick={() => setDeliveryMethod(method.value as any)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="text-center">
                          <Icon className={`h-8 w-8 mx-auto mb-2 ${isSelected ? 'text-green-600' : 'text-gray-400'}`} />
                          <h4 className={`font-medium ${isSelected ? 'text-green-800' : 'text-gray-700'}`}>
                            {method.label}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Résumé de la configuration */}
              {selectedClasses.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">Résumé de la Génération</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <p><strong>Période:</strong> {selectedPeriod}</p>
                      <p><strong>Classes sélectionnées:</strong> {selectedClasses.length}</p>
                      <p><strong>Élèves concernés:</strong> {
                        classAverages
                          .filter(c => selectedClasses.includes(c.className))
                          .reduce((sum, c) => sum + c.studentCount, 0)
                      }</p>
                    </div>
                    <div>
                      <p><strong>Modèle:</strong> {templates.find(t => t.value === bulletinTemplate)?.label}</p>
                      <p><strong>Livraison:</strong> {
                        deliveryMethod === 'print' ? 'Impression' :
                        deliveryMethod === 'email' ? 'Email' : 'Impression + Email'
                      }</p>
                      <p><strong>Options:</strong> {
                        [includeComments && 'Appréciations', includeRanking && 'Classement', includeStatistics && 'Statistiques']
                          .filter(Boolean).join(', ') || 'Aucune'
                      }</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={startGeneration}
                  disabled={selectedClasses.length === 0}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                >
                  <FileText className="h-5 w-5" />
                  <span>Générer les Bulletins</span>
                </button>
              </div>
            </div>
          )}

          {/* Génération en cours */}
          {generationStep === 'generating' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Génération en Cours</h3>
                <p className="text-gray-600">Création des bulletins scolaires...</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progression</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">{selectedClasses.length}</p>
                  <p className="text-sm text-gray-600">Classes traitées</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">
                    {classAverages
                      .filter(c => selectedClasses.includes(c.className))
                      .reduce((sum, c) => sum + c.studentCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Bulletins générés</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">{Math.round(progress)}%</p>
                  <p className="text-sm text-gray-600">Progression</p>
                </div>
              </div>
            </div>
          )}

          {/* Aperçu */}
          {generationStep === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Bulletins Générés</h3>
                    <p className="text-gray-600">Aperçu et validation avant distribution</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={printBulletins}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Imprimer</span>
                  </button>
                  <button
                    onClick={sendByEmail}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Envoyer par Email</span>
                  </button>
                </div>
              </div>

              {/* Statistiques de génération */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Bulletins Créés</p>
                      <p className="text-2xl font-bold text-green-800">
                        {classAverages
                          .filter(c => selectedClasses.includes(c.className))
                          .reduce((sum, c) => sum + c.studentCount, 0)}
                      </p>
                    </div>
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Classes Traitées</p>
                      <p className="text-2xl font-bold text-blue-800">{selectedClasses.length}</p>
                    </div>
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Moyenne Générale</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {(classAverages
                          .filter(c => selectedClasses.includes(c.className))
                          .reduce((sum, c) => sum + c.generalAverage, 0) / selectedClasses.length
                        ).toFixed(1)}/20
                      </p>
                    </div>
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600">Taux de Réussite</p>
                      <p className="text-2xl font-bold text-orange-800">
                        {(classAverages
                          .filter(c => selectedClasses.includes(c.className))
                          .reduce((sum, c) => sum + c.passRate, 0) / selectedClasses.length
                        ).toFixed(1)}%
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Aperçu des bulletins */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-medium text-gray-800">Aperçu des Bulletins - Top 2 par Classe</h4>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sampleBulletins.map((bulletin) => (
                      <div key={bulletin.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        {/* En-tête du bulletin */}
                        <div className="text-center mb-4 pb-4 border-b border-gray-200">
                          <h5 className="font-bold text-gray-800">BULLETIN SCOLAIRE</h5>
                          <p className="text-sm text-gray-600">{selectedPeriod} - Année 2024-2025</p>
                        </div>

                        {/* Informations élève */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-medium text-gray-800">{bulletin.name}</h6>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                              {bulletin.class}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <p><strong>Rang:</strong> {bulletin.rank}e/{classAverages.find(c => c.className === bulletin.class)?.studentCount}</p>
                            <p><strong>Enseignant:</strong> {bulletin.teacher}</p>
                            <p><strong>Moyenne:</strong> <span className={getAverageColor(bulletin.generalAverage)}>{bulletin.generalAverage.toFixed(1)}/20</span></p>
                            <p><strong>Conduite:</strong> {bulletin.conduct}</p>
                          </div>
                        </div>

                        {/* Notes par matière */}
                        <div className="space-y-2">
                          <h6 className="font-medium text-gray-800 text-sm">Notes par Matière</h6>
                          {bulletin.subjects.slice(0, 3).map((subject) => (
                            <div key={subject.subject} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{subject.subject}</span>
                              <div className="text-right">
                                <span className={`font-medium ${getAverageColor(subject.average)}`}>
                                  {subject.average.toFixed(1)}/20
                                </span>
                                <span className="text-gray-500 ml-1">(Coef. {subject.coefficient})</span>
                              </div>
                            </div>
                          ))}
                          {bulletin.subjects.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              ... et {bulletin.subjects.length - 3} autres matières
                            </p>
                          )}
                        </div>

                        {/* Décision */}
                        <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDecisionColor(bulletin.decision)}`}>
                            {bulletin.decision}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={generateBulletins}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Valider et Distribuer</span>
                </button>
              </div>
            </div>
          )}

          {/* Génération terminée */}
          {generationStep === 'complete' && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Bulletins Générés avec Succès</h3>
                <p className="text-gray-600">Tous les bulletins ont été créés et sont prêts pour distribution</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-800">
                    {classAverages
                      .filter(c => selectedClasses.includes(c.className))
                      .reduce((sum, c) => sum + c.studentCount, 0)}
                  </p>
                  <p className="text-sm text-green-600">Bulletins créés</p>
                </div>

                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-800">
                    {deliveryMethod === 'email' || deliveryMethod === 'both' ? '100%' : '0%'}
                  </p>
                  <p className="text-sm text-blue-600">Envoyés par email</p>
                </div>

                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <Printer className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-800">
                    {deliveryMethod === 'print' || deliveryMethod === 'both' ? '100%' : '0%'}
                  </p>
                  <p className="text-sm text-purple-600">Prêts à imprimer</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-3">Actions Recommandées</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button 
                    onClick={() => alert('Archivage des bulletins...')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Archiver les Bulletins
                  </button>
                  <button 
                    onClick={() => alert('Notification aux parents...')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Notifier les Parents
                  </button>
                  <button 
                    onClick={() => alert('Préparation conseil de classe...')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Conseil de Classe
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setGenerationStep('config')}
                  className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mr-3"
                >
                  Nouvelle Génération
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulletinGenerationModal;