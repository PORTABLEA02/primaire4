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
  DollarSign,
  BookOpen,
  AlertCircle,
  CheckCircle,
  FileText,
  Users,
  Clock
} from 'lucide-react';
import { StudentService } from '../../services/studentService';
import { PaymentService } from '../../services/paymentService';
import { GradeService } from '../../services/gradeService';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onUpdate: () => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'academic' | 'financial' | 'history'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && student) {
      setEditData({
        firstName: student.first_name,
        lastName: student.last_name,
        gender: student.gender,
        dateOfBirth: student.date_of_birth,
        nationality: student.nationality,
        parentEmail: student.parent_email,
        fatherName: student.father_name,
        fatherPhone: student.father_phone,
        motherName: student.mother_name,
        motherPhone: student.mother_phone,
        address: student.address
      });
      
      loadAdditionalData();
    }
  }, [isOpen, student]);

  const loadAdditionalData = async () => {
    if (!student) return;

    try {
      
      // Charger l'historique des paiements
      const payments = await PaymentService.getPaymentHistory(student.id);
      setPaymentHistory(payments);

      // Charger les notes (si disponible)
      // const studentGrades = await GradeService.getStudentGrades(student.student_id, 'current-period');
      // setGrades(studentGrades);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données supplémentaires:', error);
    } finally {
    }
  };

  const handleSave = async () => {
    try {
      await StudentService.updateStudent(student.student_id, editData);
      setIsEditing(false);
      onUpdate();
      alert('Informations mises à jour avec succès');
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    }
  };

  const calculateAge = (birthDate: string) => {
    return StudentService.calculateAge(birthDate);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'À jour': return 'bg-green-50 text-green-700 border-green-200';
      case 'En retard': return 'bg-red-50 text-red-700 border-red-200';
      case 'Partiel': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">
                  {student.first_name[0]}{student.last_name[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {student.first_name} {student.last_name}
                </h2>
                <p className="text-gray-600">
                  {student.class_name} • {student.level} • {student.gender}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(student.payment_status)}`}>
                    {student.payment_status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Inscrit le {new Date(student.enrollment_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
              onClick={() => setActiveTab('financial')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'financial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Financier
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Historique
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Informations personnelles */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informations de l'élève */}
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
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sexe</label>
                            <select
                              value={editData.gender}
                              onChange={(e) => setEditData(prev => ({ ...prev, gender: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="Masculin">Masculin</option>
                              <option value="Féminin">Féminin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                            <input
                              type="date"
                              value={editData.dateOfBirth}
                              onChange={(e) => setEditData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email principal</label>
                          <input
                            type="email"
                            value={editData.parentEmail}
                            onChange={(e) => setEditData(prev => ({ ...prev, parentEmail: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                          <textarea
                            value={editData.address}
                            onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400">👤</span>
                          <span className="text-gray-700">{student.gender}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">
                            Né(e) le {new Date(student.date_of_birth).toLocaleDateString('fr-FR')} ({calculateAge(student.date_of_birth)} ans)
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400">🏳️</span>
                          <span className="text-gray-700">Nationalité {student.nationality}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{student.parent_email}</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <span className="text-gray-700">{student.address}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact famille */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Famille</h3>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-3">Père</h4>
                          <div className="grid grid-cols-1 gap-3">
                            <input
                              type="text"
                              placeholder="Nom du père"
                              value={editData.fatherName || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, fatherName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                              type="tel"
                              placeholder="Téléphone du père"
                              value={editData.fatherPhone || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, fatherPhone: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-pink-50 rounded-lg">
                          <h4 className="font-medium text-pink-800 mb-3">Mère</h4>
                          <div className="grid grid-cols-1 gap-3">
                            <input
                              type="text"
                              placeholder="Nom de la mère"
                              value={editData.motherName || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, motherName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                              type="tel"
                              placeholder="Téléphone de la mère"
                              value={editData.motherPhone || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, motherPhone: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {student.father_name && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Père</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Nom:</strong> {student.father_name}</p>
                              {student.father_phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-3 w-3 text-blue-600" />
                                  <span>{student.father_phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {student.mother_name && (
                          <div className="p-3 bg-pink-50 rounded-lg">
                            <h4 className="font-medium text-pink-800 mb-2">Mère</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Nom:</strong> {student.mother_name}</p>
                              {student.mother_phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-3 w-3 text-pink-600" />
                                  <span>{student.mother_phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations scolaires */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations Scolaires</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Classe:</span>
                            <p className="font-medium text-gray-800">{student.class_name}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Niveau:</span>
                            <p className="font-medium text-gray-800">{student.level}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Enseignant:</span>
                            <p className="font-medium text-gray-800">
                              {student.teacher_first_name} {student.teacher_last_name}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Année scolaire:</span>
                            <p className="font-medium text-gray-800">{student.academic_year}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Situation Financière</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Total à payer</p>
                            <p className="text-xl font-bold text-gray-800">
                              {student.total_fees.toLocaleString()} FCFA
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Déjà payé</p>
                            <p className="text-xl font-bold text-green-600">
                              {student.paid_amount.toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progression du paiement</span>
                            <span>{Math.round((student.paid_amount / student.total_fees) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full ${
                                student.payment_status === 'À jour' ? 'bg-green-600' :
                                student.payment_status === 'Partiel' ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${Math.min((student.paid_amount / student.total_fees) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {student.outstanding_amount > 0 && (
                          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <span className="font-medium text-red-800">
                                Reste à payer: {student.outstanding_amount.toLocaleString()} FCFA
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
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

          {/* Suivi académique */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Suivi Académique</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Moyenne Générale</p>
                      <p className="text-2xl font-bold text-blue-800">14.2/20</p>
                    </div>
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Rang en Classe</p>
                      <p className="text-2xl font-bold text-green-800">3e/42</p>
                    </div>
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Assiduité</p>
                      <p className="text-2xl font-bold text-purple-800">96%</p>
                    </div>
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-800 mb-4">Notes par Matière (Trimestre 1)</h4>
                <div className="space-y-3">
                  {[
                    { subject: 'Français', grade: 15.5, coefficient: 4 },
                    { subject: 'Mathématiques', grade: 13.8, coefficient: 4 },
                    { subject: 'Sciences', grade: 14.2, coefficient: 2 },
                    { subject: 'Histoire-Géographie', grade: 13.5, coefficient: 2 },
                    { subject: 'Anglais', grade: 14.8, coefficient: 2 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-800">{item.subject}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">Coef. {item.coefficient}</span>
                        <span className={`font-bold ${
                          item.grade >= 16 ? 'text-green-600' :
                          item.grade >= 14 ? 'text-blue-600' :
                          item.grade >= 10 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {item.grade}/20
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Suivi financier */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Suivi Financier</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Résumé Financier</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais totaux:</span>
                      <span className="font-bold text-gray-800">{student.total_fees.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant payé:</span>
                      <span className="font-bold text-green-600">{student.paid_amount.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-600">Reste à payer:</span>
                      <span className="font-bold text-red-600">{student.outstanding_amount.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Historique des Paiements</h4>
                  {paymentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {paymentHistory.slice(0, 3).map((payment, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between">
                            <span className="font-medium">{new Date(payment.payment_date).toLocaleDateString('fr-FR')}</span>
                            <span className="text-green-600 font-bold">{payment.amount.toLocaleString()} FCFA</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {payment.payment_type} • {payment.payment_method?.name || 'Espèces'}
                          </div>
                        </div>
                      ))}
                      {paymentHistory.length > 3 && (
                        <p className="text-sm text-blue-600 text-center">
                          +{paymentHistory.length - 3} autres paiements
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <DollarSign className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p>Aucun paiement enregistré</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Historique */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Historique</h3>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-800 mb-4">Parcours Scolaire</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-800">Inscription actuelle</p>
                      <p className="text-sm text-blue-600">
                        {student.class_name} • Depuis le {new Date(student.enrollment_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={() => handleTransferStudent(student)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Transférer</span>
            </button>
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

export default StudentDetailModal;