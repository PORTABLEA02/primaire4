import React, { useState, useEffect } from 'react';
import { X, User, Users, Phone, Mail, MapPin, Calendar, DollarSign, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { StudentService } from '../../services/studentService';
import { PaymentService } from '../../services/paymentService';
import { supabase } from '../../lib/supabase';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (studentData: any, enrollmentData: any) => void;
}

interface NewStudentData {
  firstName: string;
  lastName: string;
  gender: 'Masculin' | 'Féminin';
  nationality: string;
  birthPlace: string;
  religion?: string;
  bloodType?: string;
  allergies?: string;
  previousSchool?: string;
  motherTongue: string;
  fatherName: string;
  fatherPhone: string;
  fatherOccupation: string;
  motherName: string;
  motherPhone: string;
  motherOccupation: string;
  guardianType: 'Parents' | 'Tuteur' | 'Famille élargie' | 'Autre';
  numberOfSiblings: number;
  transportMode: 'À pied' | 'Transport scolaire' | 'Transport familial' | 'Transport public';
  medicalInfo?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  dateOfBirth: string;
  parentEmail: string;
  address: string;
}

interface EnrollmentData {
  classId: string;
  totalFees: number;
  initialPayment: number;
  paymentMethodId: string;
  paymentType: 'Inscription' | 'Scolarité';
  mobileNumber?: string;
  bankDetails?: string;
  notes?: string;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent
}) => {
  const { userSchool, currentAcademicYear } = useAuth();
  const [step, setStep] = useState<'student' | 'parent' | 'financial' | 'confirmation'>('student');
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<NewStudentData>({
    firstName: '',
    lastName: '',
    gender: 'Masculin',
    nationality: 'Béninoise',
    birthPlace: '',
    religion: '',
    bloodType: '',
    allergies: '',
    previousSchool: '',
    motherTongue: 'Bambara',
    fatherName: '',
    fatherPhone: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    motherOccupation: '',
    guardianType: 'Parents',
    numberOfSiblings: 0,
    transportMode: 'À pied',
    medicalInfo: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    dateOfBirth: '',
    parentEmail: '',
    address: ''
  });

  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    classId: '',
    totalFees: 0,
    initialPayment: 0,
    paymentMethodId: '',
    paymentType: 'Inscription',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les classes disponibles
  useEffect(() => {
    if (isOpen && userSchool && currentAcademicYear) {
      loadAvailableClasses();
      loadPaymentMethods();
      loadFeeTypes();
    }
  }, [isOpen, userSchool, currentAcademicYear]);

  const loadAvailableClasses = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      const classes = await StudentService.getAvailableClassesForEnrollment(
        userSchool.id,
        currentAcademicYear.id
      );
      // Filter classes with available spots on the client side
      const availableClasses = classes.filter(cls => cls.current_students < cls.capacity);
      setAvailableClasses(availableClasses);
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    }
  };

  const loadPaymentMethods = async () => {
    if (!userSchool) return;

    try {
      const methods = await PaymentService.getPaymentMethods(userSchool.id);
      setPaymentMethods(methods);
      
      // Sélectionner la première méthode par défaut
      if (methods.length > 0) {
        setEnrollmentData(prev => ({
          ...prev,
          paymentMethodId: methods[0].id
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des méthodes de paiement:', error);
    }
  };

  const loadFeeTypes = async () => {
    if (!userSchool) return;

    try {
      const { data, error } = await supabase
        .from('fee_types')
        .select('*')
        .eq('school_id', userSchool.id)
        .order('name');
       

      if (error) throw error;
      setFeeTypes(data || []);
      console.log(data);
      
    } catch (error) {
      console.error('Erreur lors du chargement des types de frais:', error);
    }
  };

  const validateStep = (currentStep: string) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'student') {
      if (!studentData.firstName.trim()) {
        newErrors.firstName = 'Le prénom est requis';
      }
      if (!studentData.lastName.trim()) {
        newErrors.lastName = 'Le nom est requis';
      }
      if (!studentData.birthPlace.trim()) {
        newErrors.birthPlace = 'Le lieu de naissance est requis';
      }
      if (!studentData.dateOfBirth) {
        newErrors.dateOfBirth = 'La date de naissance est requise';
      }
    }

    if (currentStep === 'parent') {
      if (!studentData.fatherName.trim() && !studentData.motherName.trim() && studentData.guardianType === 'Parents') {
        newErrors.parentInfo = 'Au moins un parent doit être renseigné';
      }
      if (!studentData.fatherPhone.trim() && !studentData.motherPhone.trim()) {
        newErrors.parentPhone = 'Au moins un numéro de téléphone est requis';
      }
      if (!studentData.parentEmail.trim()) {
        newErrors.parentEmail = 'L\'email est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.parentEmail)) {
        newErrors.parentEmail = 'Format d\'email invalide';
      }
      if (!studentData.address.trim()) {
        newErrors.address = 'L\'adresse est requise';
      }
      if (!studentData.emergencyContactName.trim()) {
        newErrors.emergencyContactName = 'Le contact d\'urgence est requis';
      }
      if (!studentData.emergencyContactPhone.trim()) {
        newErrors.emergencyContactPhone = 'Le téléphone du contact d\'urgence est requis';
      }
    }

    if (currentStep === 'financial') {
      if (!enrollmentData.classId) {
        newErrors.classId = 'Veuillez sélectionner une classe';
      }
      if (enrollmentData.initialPayment < 0) {
        newErrors.initialPayment = 'Le montant ne peut pas être négatif';
      }
      if (enrollmentData.initialPayment > enrollmentData.totalFees) {
        newErrors.initialPayment = 'Le paiement initial ne peut pas dépasser les frais totaux';
      }
      
      const selectedMethod = paymentMethods.find(m => m.id === enrollmentData.paymentMethodId);
      if (selectedMethod?.type === 'mobile' && !enrollmentData.mobileNumber) {
        newErrors.mobileNumber = 'Numéro de téléphone requis pour Mobile Money';
      }
      if (selectedMethod?.type === 'bank' && !enrollmentData.bankDetails) {
        newErrors.bankDetails = 'Détails bancaires requis pour le virement';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      switch (step) {
        case 'student':
          setStep('parent');
          break;
        case 'parent':
          setStep('financial');
          break;
        case 'financial':
          setStep('confirmation');
          break;
      }
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'parent':
        setStep('student');
        break;
      case 'financial':
        setStep('parent');
        break;
      case 'confirmation':
        setStep('financial');
        break;
    }
  };

  const handleSubmit = () => {
    if (validateStep('financial')) {
      // Préparer les données complètes pour l'inscription avec paiement
      const completeStudentData = {
        ...studentData,
        schoolId: userSchool?.id
      };
      
      const completeEnrollmentData = {
        ...enrollmentData,
        schoolId: userSchool?.id,
        academicYearId: currentAcademicYear?.id,
        enrollmentDate: new Date().toISOString().split('T')[0]
      };
      
      onAddStudent(completeStudentData, completeEnrollmentData);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('student');
    setStudentData({
      firstName: '',
      lastName: '',
      gender: 'Masculin',
      nationality: 'Malienne',
      birthPlace: '',
      religion: '',
      bloodType: '',
      allergies: '',
      previousSchool: '',
      motherTongue: 'Bambara',
      fatherName: '',
      fatherPhone: '',
      fatherOccupation: '',
      motherName: '',
      motherPhone: '',
      motherOccupation: '',
      guardianType: 'Parents',
      numberOfSiblings: 0,
      transportMode: 'À pied',
      medicalInfo: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      dateOfBirth: '',
      parentEmail: '',
      address: ''
    });
    setEnrollmentData({
      classId: '',
      totalFees: 0,
      initialPayment: 0,
      paymentMethodId: '',
      paymentType: 'Inscription',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const handleClassChange = (classId: string) => {
        

    const selectedClass = availableClasses.find(c => c.id === classId);
    if (selectedClass) {
      setEnrollmentData(prev => ({
        ...prev,
        classId: classId
      }));
       
    }
  };

  const handlePaymentTypeChange = (paymentType: 'Inscription' | 'Scolarité') => {
    // Trouver le type de frais correspondant
    const selectedClass = availableClasses.find(c => c.id === enrollmentData.classId);
    if (!selectedClass) return;

    let feeAmount = 0;
    
    if (paymentType === 'Inscription') {
      // Chercher les frais d'inscription
        

      const inscriptionFee = feeTypes.find(f => 
        f.name.toLowerCase().includes('inscription') && 
        (f.level.toLowerCase() === selectedClass.level.toLowerCase())
      );
       
      feeAmount = inscriptionFee?.amount || 50000; // Valeur par défaut
      
    } else {
      // Chercher les frais de scolarité pour ce niveau
      const scolariteFee = feeTypes.find(f => 
        f.name.toLowerCase().includes('scolarité') && 
        f.level.toLowerCase() === selectedClass.level.toLowerCase()
      );
      feeAmount = scolariteFee?.amount || 350000; // Valeur par défaut
    }
    console.log(feeAmount);

    setEnrollmentData(prev => ({
      ...prev,
      paymentType,
      totalFees: feeAmount,
      initialPayment: 0 // Reset le paiement initial
        
    }));
  };

  const handlePaymentMethodChange = (methodId: string) => {
    setEnrollmentData(prev => ({
      ...prev,
      paymentMethodId: methodId,
      mobileNumber: '',
      bankDetails: ''
    }));

  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'cash': return DollarSign;
      case 'mobile': return Phone;
      case 'bank': return BookOpen;
      default: return DollarSign;
    }
  };

  const getPaymentMethodColor = (type: string) => {
    switch (type) {
      case 'cash': return 'green';
      case 'mobile': return 'blue';
      case 'bank': return 'purple';
      default: return 'gray';
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    return StudentService.calculateAge(birthDate).toString();
  };

  // Listes de données
  const nationalities = [
    'Malienne', 'Burkinabè', 'Ivoirienne', 'Sénégalaise', 'Guinéenne', 
    'Nigérienne', 'Ghanéenne', 'Togolaise', 'Béninoise', 'Mauritanienne', 'Autre'
  ];

  const languages = [
    'Bambara', 'Peul', 'Soninké', 'Dogon', 'Malinké', 'Sonrhaï', 
    'Tamasheq', 'Bobo', 'Sénoufo', 'Français', 'Autre'
  ];

  const religions = [
    'Islam', 'Christianisme', 'Animisme', 'Autre', 'Non spécifié'
  ];

  const bloodTypes = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Non déterminé'
  ];

  const occupations = [
    'Agriculteur/Agricultrice', 'Commerçant(e)', 'Fonctionnaire', 'Enseignant(e)', 
    'Artisan(e)', 'Chauffeur', 'Ménagère', 'Ouvrier/Ouvrière', 'Cadre', 
    'Professionnel libéral', 'Étudiant(e)', 'Sans emploi', 'Autre'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Nouvel Élève</h2>
                <p className="text-gray-600">
                  {step === 'student' && 'Informations de l\'élève'}
                  {step === 'parent' && 'Informations du parent/tuteur'}
                  {step === 'financial' && 'Informations financières'}
                  {step === 'confirmation' && 'Confirmation d\'inscription'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'student' ? 'text-blue-600' : ['parent', 'financial', 'confirmation'].includes(step) ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'student' ? 'bg-blue-100' : ['parent', 'financial', 'confirmation'].includes(step) ? 'bg-green-100' : 'bg-gray-100'}`}>
                1
              </div>
              <span className="text-sm font-medium">Élève</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step === 'parent' ? 'text-blue-600' : ['financial', 'confirmation'].includes(step) ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'parent' ? 'bg-blue-100' : ['financial', 'confirmation'].includes(step) ? 'bg-green-100' : 'bg-gray-100'}`}>
                2
              </div>
              <span className="text-sm font-medium">Parent</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step === 'financial' ? 'text-blue-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'financial' ? 'bg-blue-100' : step === 'confirmation' ? 'bg-green-100' : 'bg-gray-100'}`}>
                3
              </div>
              <span className="text-sm font-medium">Paiement</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step === 'confirmation' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'confirmation' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                4
              </div>
              <span className="text-sm font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Student Information */}
          {step === 'student' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={studentData.firstName}
                    onChange={(e) => setStudentData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.firstName ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={studentData.lastName}
                    onChange={(e) => setStudentData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lastName ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexe *
                  </label>
                  <select
                    value={studentData.gender}
                    onChange={(e) => setStudentData(prev => ({ ...prev, gender: e.target.value as 'Masculin' | 'Féminin' }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Masculin">Masculin</option>
                    <option value="Féminin">Féminin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationalité *
                  </label>
                  <select
                    value={studentData.nationality}
                    onChange={(e) => setStudentData(prev => ({ ...prev, nationality: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {nationalities.map(nationality => (
                      <option key={nationality} value={nationality}>{nationality}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue Maternelle *
                  </label>
                  <select
                    value={studentData.motherTongue}
                    onChange={(e) => setStudentData(prev => ({ ...prev, motherTongue: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {languages.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de Naissance *
                  </label>
                  <input
                    type="date"
                    value={studentData.dateOfBirth}
                    onChange={(e) => setStudentData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.dateOfBirth ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                  {studentData.dateOfBirth && (
                    <p className="text-sm text-gray-500 mt-1">Âge: {calculateAge(studentData.dateOfBirth)} ans</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu de Naissance *
                  </label>
                  <input
                    type="text"
                    value={studentData.birthPlace}
                    onChange={(e) => setStudentData(prev => ({ ...prev, birthPlace: e.target.value }))}
                    placeholder="Ville, Région, Pays"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.birthPlace ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.birthPlace && <p className="text-red-500 text-sm mt-1">{errors.birthPlace}</p>}
                </div>
              </div>

              {/* Informations optionnelles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Religion (Optionnel)
                  </label>
                  <select
                    value={studentData.religion || ''}
                    onChange={(e) => setStudentData(prev => ({ ...prev, religion: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    {religions.map(religion => (
                      <option key={religion} value={religion}>{religion}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groupe Sanguin (Optionnel)
                  </label>
                  <select
                    value={studentData.bloodType || ''}
                    onChange={(e) => setStudentData(prev => ({ ...prev, bloodType: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Frères/Sœurs
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={studentData.numberOfSiblings}
                    onChange={(e) => setStudentData(prev => ({ ...prev, numberOfSiblings: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Parent Information */}
          {step === 'parent' && (
            <div className="space-y-6">
              {/* Type de tuteur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de Tuteur *
                </label>
                <select
                  value={studentData.guardianType}
                  onChange={(e) => setStudentData(prev => ({ ...prev, guardianType: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Parents">Parents</option>
                  <option value="Tuteur">Tuteur légal</option>
                  <option value="Famille élargie">Famille élargie</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Informations du père */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-4">Informations du Père</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom Complet
                    </label>
                    <input
                      type="text"
                      value={studentData.fatherName}
                      onChange={(e) => setStudentData(prev => ({ ...prev, fatherName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={studentData.fatherPhone}
                      onChange={(e) => setStudentData(prev => ({ ...prev, fatherPhone: e.target.value }))}
                      placeholder="+229 XX XX XX XX"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profession
                    </label>
                    <select
                      value={studentData.fatherOccupation}
                      onChange={(e) => setStudentData(prev => ({ ...prev, fatherOccupation: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner une profession</option>
                      {occupations.map(occupation => (
                        <option key={occupation} value={occupation}>{occupation}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Informations de la mère */}
              <div className="p-4 bg-pink-50 rounded-lg">
                <h4 className="font-medium text-pink-800 mb-4">Informations de la Mère</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom Complet
                    </label>
                    <input
                      type="text"
                      value={studentData.motherName}
                      onChange={(e) => setStudentData(prev => ({ ...prev, motherName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={studentData.motherPhone}
                      onChange={(e) => setStudentData(prev => ({ ...prev, motherPhone: e.target.value }))}
                      placeholder="+229 XX XX XX XX"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profession
                    </label>
                    <select
                      value={studentData.motherOccupation}
                      onChange={(e) => setStudentData(prev => ({ ...prev, motherOccupation: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner une profession</option>
                      {occupations.map(occupation => (
                        <option key={occupation} value={occupation}>{occupation}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {errors.parentInfo && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.parentInfo}</p>
                </div>
              )}
              {errors.parentPhone && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.parentPhone}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Principal de Contact *
                </label>
                <input
                  type="email"
                  value={studentData.parentEmail}
                  onChange={(e) => setStudentData(prev => ({ ...prev, parentEmail: e.target.value }))}
                  placeholder="Email pour les communications officielles"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.parentEmail ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.parentEmail && <p className="text-red-500 text-sm mt-1">{errors.parentEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Adresse Familiale *
                </label>
                <textarea
                  value={studentData.address}
                  onChange={(e) => setStudentData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Adresse complète : quartier, rue, ville, région"
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              {/* Contact d'urgence */}
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-4">Contact d'Urgence</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom Complet *
                    </label>
                    <input
                      type="text"
                      value={studentData.emergencyContactName}
                      onChange={(e) => setStudentData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.emergencyContactName ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.emergencyContactName && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={studentData.emergencyContactPhone}
                      onChange={(e) => setStudentData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      placeholder="+229 01 XX XX XX XX"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.emergencyContactPhone ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.emergencyContactPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPhone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lien de Parenté *
                    </label>
                    <input
                      type="text"
                      value={studentData.emergencyContactRelation}
                      onChange={(e) => setStudentData(prev => ({ ...prev, emergencyContactRelation: e.target.value }))}
                      placeholder="Ex: Oncle, Tante, Grand-mère..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Financial Information */}
          {step === 'financial' && (
            <div className="space-y-6">
              {/* Sélection de la classe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classe *
                </label>
                <select
                  value={enrollmentData.classId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.classId ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Sélectionner une classe</option>
                  {availableClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.level}) - {cls.capacity - cls.current_students} places libres
                    </option>
                  ))}
                </select>
                {errors.classId && <p className="text-red-500 text-sm mt-1">{errors.classId}</p>}
              </div>

              {/* Type de paiement */}
              {enrollmentData.classId && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Type de Frais à Payer *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        onClick={() => handlePaymentTypeChange('Inscription')}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          enrollmentData.paymentType === 'Inscription'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <User className={`h-5 w-5 ${
                            enrollmentData.paymentType === 'Inscription' ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <h4 className={`font-medium ${
                              enrollmentData.paymentType === 'Inscription' ? 'text-blue-800' : 'text-gray-700'
                            }`}>
                              Frais d'Inscription
                            </h4>
                            <p className="text-sm text-gray-600">
                            {(() => {
                                const selectedClass = availableClasses.find(c => c.id === enrollmentData.classId);
                                const scolariteFee = feeTypes.find(f => 
                                  f.name.toLowerCase().includes('inscription') && 
                                  f.level.toLowerCase() === selectedClass?.level.toLowerCase()
                                );
                                return scolariteFee?.amount.toLocaleString() || '5,000';
                              })()} FCFA
                              </p>
                            <p className="text-xs text-gray-500">Paiement unique à l'inscription</p>
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => handlePaymentTypeChange('Scolarité')}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          enrollmentData.paymentType === 'Scolarité'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <BookOpen className={`h-5 w-5 ${
                            enrollmentData.paymentType === 'Scolarité' ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <h4 className={`font-medium ${
                              enrollmentData.paymentType === 'Scolarité' ? 'text-green-800' : 'text-gray-700'
                            }`}>
                              Frais de Scolarité
                            </h4>
                            <p className="text-sm text-gray-600">
                              {(() => {
                                const selectedClass = availableClasses.find(c => c.id === enrollmentData.classId);
                                const scolariteFee = feeTypes.find(f => 
                                  f.name.toLowerCase().includes('scolarité') && 
                                  f.level.toLowerCase() === selectedClass?.level.toLowerCase()
                                );
                                return scolariteFee?.amount.toLocaleString() || '350,000';
                              })()} FCFA
                            </p>
                            <p className="text-xs text-gray-500">Frais annuels de scolarité</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Affichage des frais sélectionnés */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Frais Sélectionnés: {enrollmentData.paymentType}
                    </h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><strong>Montant total:</strong> {enrollmentData.totalFees.toLocaleString()} FCFA</p>
                      {enrollmentData.paymentType === 'Scolarité' && (
                        <p className="text-xs text-gray-600">
                          Note: Les frais de scolarité peuvent être payés en plusieurs tranches
                        </p>
                      )}
                      {enrollmentData.paymentType === 'Inscription' && (
                        <p className="text-xs text-gray-600">
                          Note: Les frais d'inscription sont généralement payés en une seule fois
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paiement Initial (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  max={enrollmentData.totalFees}
                  value={enrollmentData.initialPayment}
                  onChange={(e) => setEnrollmentData(prev => ({ ...prev, initialPayment: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.initialPayment ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.initialPayment && <p className="text-red-500 text-sm mt-1">{errors.initialPayment}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  Solde restant: {(enrollmentData.totalFees - enrollmentData.initialPayment).toLocaleString()} FCFA
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Méthode de Paiement *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paymentMethods.map(method => {
                    const Icon = getPaymentMethodIcon(method.type);
                    const color = getPaymentMethodColor(method.type);
                    const isSelected = enrollmentData.paymentMethodId === method.id;
                    
                    return (
                      <div
                        key={method.id}
                        onClick={() => handlePaymentMethodChange(method.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? `border-${color}-500 bg-${color}-50` 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-5 w-5 ${isSelected ? `text-${color}-600` : 'text-gray-400'}`} />
                          <div>
                            <span className={`font-medium ${isSelected ? `text-${color}-800` : 'text-gray-700'}`}>
                              {method.name}
                            </span>
                            {method.fees_percentage > 0 && (
                              <p className="text-xs text-gray-500">
                                Frais: {method.fees_percentage}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Fields based on Payment Method */}
              {paymentMethods.find(m => m.id === enrollmentData.paymentMethodId)?.type === 'mobile' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={enrollmentData.mobileNumber || ''}
                    onChange={(e) => setEnrollmentData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    placeholder="+229 01 XX XX XX XX"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.mobileNumber ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
                </div>
              )}

              {paymentMethods.find(m => m.id === enrollmentData.paymentMethodId)?.type === 'bank' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Référence Bancaire *
                  </label>
                  <input
                    type="text"
                    value={enrollmentData.bankDetails || ''}
                    onChange={(e) => setEnrollmentData(prev => ({ ...prev, bankDetails: e.target.value }))}
                    placeholder="Numéro de référence ou RIB"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.bankDetails ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.bankDetails && <p className="text-red-500 text-sm mt-1">{errors.bankDetails}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optionnel)
                </label>
                <textarea
                  value={enrollmentData.notes || ''}
                  onChange={(e) => setEnrollmentData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Commentaires ou informations supplémentaires..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirmation' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Inscription Prête</h3>
                <p className="text-gray-600">Vérifiez les informations avant de confirmer l'inscription</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-3">Informations de l'Élève</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nom complet:</strong> {studentData.firstName} {studentData.lastName}</p>
                    <p><strong>Date de naissance:</strong> {new Date(studentData.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Âge:</strong> {calculateAge(studentData.dateOfBirth)} ans</p>
                    <p><strong>Sexe:</strong> {studentData.gender}</p>
                    <p><strong>Nationalité:</strong> {studentData.nationality}</p>
                    <p><strong>Langue maternelle:</strong> {studentData.motherTongue}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-3">Contact Famille</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p><strong>Type de tuteur:</strong> {studentData.guardianType}</p>
                    {studentData.fatherName && (
                      <p><strong>Père:</strong> {studentData.fatherName}</p>
                    )}
                    {studentData.motherName && (
                      <p><strong>Mère:</strong> {studentData.motherName}</p>
                    )}
                    <p><strong>Email principal:</strong> {studentData.parentEmail}</p>
                    <p><strong>Contact d'urgence:</strong> {studentData.emergencyContactName}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-3">Inscription</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                  <div>
                    <p><strong>Année scolaire:</strong> {currentAcademicYear?.name}</p>
                    <p><strong>Classe:</strong> {availableClasses.find(c => c.id === enrollmentData.classId)?.name}</p>
                    <p><strong>Niveau:</strong> {availableClasses.find(c => c.id === enrollmentData.classId)?.level}</p>
                  </div>
                  <div>
                    <p><strong>Type de frais:</strong> {enrollmentData.paymentType}</p>
                    <p><strong>Montant:</strong> {enrollmentData.totalFees.toLocaleString()} FCFA</p>
                    <p><strong>Paiement initial:</strong> {enrollmentData.initialPayment.toLocaleString()} FCFA</p>
                    <p><strong>Méthode:</strong> {paymentMethods.find(m => m.id === enrollmentData.paymentMethodId)?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {step !== 'student' && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              
              {step !== 'confirmation' ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Confirmer l'Inscription</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;