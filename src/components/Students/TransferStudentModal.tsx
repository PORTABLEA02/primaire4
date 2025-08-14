import React, { useState, useEffect } from 'react';
import { X, Users, ArrowRight, CheckCircle, AlertCircle, User } from 'lucide-react';
import { StudentService } from '../../services/studentService';
import { useAuth } from '../Auth/AuthProvider';

interface TransferStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onTransfer: () => void;
}

interface AvailableClass {
  id: string;
  name: string;
  level: string;
  capacity: number;
  current_students: number;
  teacher_assignment?: {
    teacher: {
      first_name: string;
      last_name: string;
    };
  };
}

const TransferStudentModal: React.FC<TransferStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onTransfer
}) => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<AvailableClass | null>(null);
  const [transferReason, setTransferReason] = useState('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  useEffect(() => {
    if (isOpen && userSchool && currentAcademicYear) {
      loadAvailableClasses();
    }
  }, [isOpen, userSchool, currentAcademicYear]);

  const loadAvailableClasses = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      const classes = await StudentService.getAvailableClassesForEnrollment(
        userSchool.id, 
        currentAcademicYear.id
      );
      
      // Exclure la classe actuelle de l'élève
      const filteredClasses = classes.filter(cls => 
        cls.name !== student.class_name && cls.current_students < cls.capacity
      );
      setAvailableClasses(filteredClasses);
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    } finally {
    }
  };

  const handleTransfer = async () => {
    if (!selectedClass || !student) return;

    try {
      
      await StudentService.transferStudent(
        student.id, // enrollment ID
        selectedClass.id,
        transferReason
      );

      onTransfer();
      onClose();
      alert(`${student.first_name} ${student.last_name} a été transféré(e) en ${selectedClass.name} avec succès !`);
    } catch (error: any) {
      console.error('Erreur lors du transfert:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
    }
  };

  const getCapacityColor = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const isClassFull = (cls: AvailableClass) => {
    return cls.current_students >= cls.capacity;
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Transfert d'Élève</h2>
                <p className="text-gray-600">
                  {student.first_name} {student.last_name} • {student.class_name}
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
        </div>

        <div className="p-6">
          {step === 'select' && (
            <>
              {/* Informations de l'élève */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">Élève à Transférer</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-sm text-blue-600">
                      Actuellement en {student.class_name} ({student.level})
                    </p>
                  </div>
                </div>
              </div>

              {/* Classes disponibles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Classes Disponibles</h3>
                
                {availableClasses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableClasses.map((cls) => {
                      const isFull = isClassFull(cls);
                      const isSelected = selectedClass?.id === cls.id;
                      
                      return (
                        <div
                          key={cls.id}
                          onClick={() => !isFull && setSelectedClass(cls)}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            isFull 
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                              : isSelected
                                ? 'border-green-500 bg-green-50 cursor-pointer'
                                : 'border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-800">{cls.name}</h4>
                              <p className="text-sm text-gray-600">{cls.level}</p>
                            </div>
                            {isFull && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                Complète
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Enseignant:</span>
                              <span className="font-medium">
                                {cls.teacher_assignment?.teacher 
                                  ? `${cls.teacher_assignment.teacher.first_name} ${cls.teacher_assignment.teacher.last_name}`
                                  : 'Non assigné'
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Places:</span>
                              <span className={`font-medium ${getCapacityColor(cls.current_students, cls.capacity)}`}>
                                {cls.capacity - cls.current_students} disponibles
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (cls.current_students / cls.capacity) >= 0.9 ? 'bg-red-500' :
                                  (cls.current_students / cls.capacity) >= 0.75 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${(cls.current_students / cls.capacity) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {cls.current_students}/{cls.capacity} élèves
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune classe disponible pour le transfert</p>
                  </div>
                )}
              </div>

              {/* Raison du transfert */}
              {selectedClass && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Raison du Transfert</h3>
                  <textarea
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder="Expliquez la raison du transfert (optionnel)..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Aperçu du transfert */}
              {selectedClass && (
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Aperçu du Transfert</h3>
                  
                  <div className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                      <div className="p-4 bg-red-100 rounded-lg">
                        <User className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <p className="font-medium text-red-800">{student.class_name}</p>
                        <p className="text-sm text-red-600">Classe actuelle</p>
                      </div>
                    </div>

                    <ArrowRight className="h-8 w-8 text-gray-400" />

                    <div className="text-center">
                      <div className="p-4 bg-green-100 rounded-lg">
                        <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="font-medium text-green-800">{selectedClass.name}</p>
                        <p className="text-sm text-green-600">Nouvelle classe</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setStep('confirm')}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>Procéder au Transfert</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'confirm' && selectedClass && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirmer le Transfert</h3>
                <p className="text-gray-600">Vérifiez les informations avant de confirmer</p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-4">Détails du Transfert</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Élève:</span>
                    <span className="font-medium">{student.first_name} {student.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Classe actuelle:</span>
                    <span className="font-medium text-red-600">{student.class_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nouvelle classe:</span>
                    <span className="font-medium text-green-600">{selectedClass.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nouvel enseignant:</span>
                    <span className="font-medium">
                      {selectedClass.teacher_assignment?.teacher 
                        ? `${selectedClass.teacher_assignment.teacher.first_name} ${selectedClass.teacher_assignment.teacher.last_name}`
                        : 'Non assigné'
                      }
                    </span>
                  </div>
                  {transferReason && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Raison:</span>
                      <span className="font-medium">{transferReason}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Actions Automatiques</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ Désactivation de l'inscription actuelle</li>
                  <li>✓ Création d'une nouvelle inscription</li>
                  <li>✓ Conservation des paiements effectués</li>
                  <li>✓ Mise à jour des effectifs des classes</li>
                  <li>✓ Notification aux enseignants concernés</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {step === 'confirm' && (
                <button
                  onClick={() => setStep('select')}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              
              {step === 'confirm' && selectedClass && (
                <button
                  onClick={handleTransfer}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Confirmer le Transfert</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferStudentModal;