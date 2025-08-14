import React, { useState } from 'react';
import { UserPlus, School, Calendar, Users, CheckCircle, AlertCircle, User, BookOpen } from 'lucide-react';
import { useAcademicYear } from '../../contexts/AcademicYearContext';
import { useAuth } from '../Auth/AuthProvider';
import { PaymentService } from '../../services/paymentService';
import { StudentService } from '../../services/studentService';
import { ClassService } from '../../services/classService';
import { supabase } from '../../lib/supabase';

interface EnrollmentData {
  studentId?: string; // Pour les étudiants existants
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Masculin' | 'Féminin';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  classId: string;
  className: string;
  enrollmentDate: string;
  isNewStudent: boolean;
  paymentType: 'Inscription' | 'Scolarité';
  paymentMethodId: string;
  initialPayment: number;
}

interface ClassOption {
  id: string;
  name: string;
  level: string;
  capacity: number;
  enrolled: number;
  teacher: string;
  fees: number;
}

interface ExistingStudent {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Masculin' | 'Féminin';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  currentClass?: string;
}

const EnrollmentInterface: React.FC = () => {
  const [step, setStep] = useState<'student' | 'class' | 'confirmation'>('student');
  const { currentAcademicYear } = useAcademicYear();
  const { userSchool } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Masculin',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    classId: '',
    className: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    isNewStudent: true,
    paymentType: 'Inscription',
    paymentMethodId: null,
    initialPayment: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<ExistingStudent | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // États pour les données réelles
  const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([]);
  const [existingStudents, setExistingStudents] = useState<ExistingStudent[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les données au montage
  React.useEffect(() => {
    if (userSchool) {
      loadAllData();
    }
  }, [userSchool, currentAcademicYear]);

  const loadAllData = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setLoading(true);
      
      const [methods, fees, classes, students] = await Promise.all([
        PaymentService.getPaymentMethods(userSchool.id),
        supabase
          .from('fee_types')
          .select('*')
          .eq('school_id', userSchool.id)
          .order('name'),
        ClassService.getClasses(userSchool.id, currentAcademicYear.id),
        StudentService.getStudents(userSchool.id, currentAcademicYear.id)
      ]);

      setPaymentMethods(methods);
      setFeeTypes(fees.data || []);
      
      // Mapper les classes
      const mappedClasses: ClassOption[] = classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        level: cls.level,
        capacity: cls.capacity,
        enrolled: cls.current_students,
        teacher: cls.teacher_assignment?.[0]?.teacher 
          ? `${cls.teacher_assignment[0].teacher.first_name} ${cls.teacher_assignment[0].teacher.last_name}`
          : 'Non assigné',
        fees: getFeeForLevel(cls.level)
      }));
      setAvailableClasses(mappedClasses);
      
      // Mapper les étudiants existants
      const mappedStudents: ExistingStudent[] = students.map(student => ({
        id: student.student_id,
        firstName: student.first_name,
        lastName: student.last_name,
        dateOfBirth: student.date_of_birth,
        gender: student.gender as 'Masculin' | 'Féminin',
        parentName: student.father_name || student.mother_name || 'Non renseigné',
        parentPhone: student.father_phone || student.mother_phone || 'Non renseigné',
        parentEmail: student.parent_email,
        currentClass: student.class_name
      }));
      setExistingStudents(mappedStudents);

      // Sélectionner la première méthode par défaut
      if (methods.length > 0) {
        setEnrollmentData(prev => ({
          ...prev,
          paymentMethodId: methods[0].id
        }));
      } else {
        setEnrollmentData(prev => ({
          ...prev,
          paymentMethodId: null
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de paiement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir les frais selon le niveau
  const getFeeForLevel = (level: string): number => {
    const fee = feeTypes.find(f => 
      f.name.toLowerCase().includes('scolarité') && 
      (f.level.toLowerCase() === level.toLowerCase() || f.level === 'Tous')
    );
    console.log(f.level.toLowerCase());
    console.log(level.toLowerCase());
    return fee?.amount || 350000;
  };

  const filteredStudents = existingStudents.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.parentPhone.includes(searchTerm)
  );

  const validateStep = (currentStep: string) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'student') {
      if (enrollmentData.isNewStudent) {
        if (!enrollmentData.firstName.trim()) {
          newErrors.firstName = 'Le prénom est requis';
        }
        if (!enrollmentData.lastName.trim()) {
          newErrors.lastName = 'Le nom est requis';
        }
        if (!enrollmentData.dateOfBirth) {
          newErrors.dateOfBirth = 'La date de naissance est requise';
        }
        if (!enrollmentData.parentName.trim()) {
          newErrors.parentName = 'Le nom du parent est requis';
        }
        if (!enrollmentData.parentPhone.trim()) {
          newErrors.parentPhone = 'Le téléphone du parent est requis';
        }
        if (!enrollmentData.parentEmail.trim()) {
          newErrors.parentEmail = 'L\'email du parent est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enrollmentData.parentEmail)) {
          newErrors.parentEmail = 'Format d\'email invalide';
        }
      } else if (!selectedStudent) {
        newErrors.selectedStudent = 'Veuillez sélectionner un étudiant existant';
      }
    }

    if (currentStep === 'class') {
      if (!enrollmentData.classId) {
        newErrors.classId = 'Veuillez sélectionner une classe';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 'student') {
        setStep('class');
      } else if (step === 'class') {
        setStep('confirmation');
      }
    }
  };

  const handleBack = () => {
    if (step === 'class') {
      setStep('student');
    } else if (step === 'confirmation') {
      setStep('class');
    }
  };

  const handleStudentTypeChange = (isNew: boolean) => {
    setEnrollmentData(prev => ({
      ...prev,
      isNewStudent: isNew,
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Masculin',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      paymentType: 'Inscription',
      initialPayment: 0
    }));
    setSelectedStudent(null);
    setErrors({});
  };

  const handleExistingStudentSelect = (student: ExistingStudent) => {
    setSelectedStudent(student);
    setEnrollmentData(prev => ({
      ...prev,
      studentId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      isNewStudent: false
    }));
  };

  const handleClassSelect = (classOption: ClassOption) => {
    setEnrollmentData(prev => ({
      ...prev,
      classId: classOption.id,
      className: classOption.name,
      // Recalculer les frais selon le type sélectionné
      initialPayment: 0 // Reset le paiement initial
    }));
    
    // Recalculer les frais selon le type de paiement sélectionné
    updateFeesForPaymentType(enrollmentData.paymentType, classOption.level);
  };

  const updateFeesForPaymentType = (paymentType: 'Inscription' | 'Scolarité', level: string) => {
    let feeAmount = 0;
    
    if (paymentType === 'Inscription') {
      const inscriptionFee = feeTypes.find(f => 
        f.name.toLowerCase().includes('inscription') && 
        (f.level === 'Tous' || f.level.toLowerCase() === level.toLowerCase())
      );
      feeAmount = inscriptionFee?.amount || 50000;
    } else {
      const scolariteFee = feeTypes.find(f => 
        f.name.toLowerCase().includes('scolarité') && 
        f.level.toLowerCase() === level.toLowerCase()
      );
      feeAmount = scolariteFee?.amount || 350000;
    }
    
    // Note: Cette fonction ne met pas à jour l'état directement
    // Elle retourne la valeur pour être utilisée ailleurs
    return feeAmount;
  };

  const handlePaymentTypeChange = (paymentType: 'Inscription' | 'Scolarité') => {
    const selectedClass = availableClasses.find(c => c.id === enrollmentData.classId);
    if (!selectedClass) return;

    const feeAmount = updateFeesForPaymentType(paymentType, selectedClass.level);
    
    setEnrollmentData(prev => ({
      ...prev,
      paymentType,
      initialPayment: feeAmount // Proposer le montant complet par défaut
    }));
  };

  const handleSubmit = async () => {
    if (validateStep('class')) {
      try {
        setLoading(true);
        
        if (enrollmentData.isNewStudent) {
          // Créer un nouvel élève avec inscription
          const studentData = {
            schoolId: userSchool!.id,
            firstName: enrollmentData.firstName,
            lastName: enrollmentData.lastName,
            gender: enrollmentData.gender,
            dateOfBirth: enrollmentData.dateOfBirth,
            nationality: 'Béninoise',
            parentEmail: enrollmentData.parentEmail,
            fatherName: enrollmentData.parentName,
            fatherPhone: enrollmentData.parentPhone,
            address: 'Adresse à compléter'
          };
          
          const selectedClass = availableClasses.find(c => c.id === enrollmentData.classId);
          const enrollmentDataForDB = {
            classId: enrollmentData.classId,
            schoolId: userSchool!.id,
            academicYearId: currentAcademicYear!.id,
            paidAmount: enrollmentData.initialPayment,
            paymentMethod: enrollmentData.paymentType
          };
          
          const result = await StudentService.createStudentWithEnrollment(studentData, enrollmentDataForDB);
          
          // Si un paiement initial est effectué, l'enregistrer
          if (enrollmentData.initialPayment > 0) {
            await PaymentService.recordPayment({
              enrollmentId: result.enrollment.id,
              schoolId: userSchool!.id,
              academicYearId: currentAcademicYear!.id,
              amount: enrollmentData.initialPayment,
              paymentMethodId: enrollmentData.paymentMethodId,
              paymentType: enrollmentData.paymentType as any,
              paymentDate: new Date().toISOString().split('T')[0],
              referenceNumber: `INS-${Date.now()}`,
              notes: `Paiement initial ${enrollmentData.paymentType}`
            });
          }
          
        } else if (selectedStudent) {
          // Réinscrire un élève existant
          const selectedClass = availableClasses.find(c => c.id === enrollmentData.classId);
          
          await StudentService.enrollStudent({
            studentId: selectedStudent.id,
            classId: enrollmentData.classId,
            schoolId: userSchool!.id,
            academicYearId: currentAcademicYear!.id,
            paidAmount: enrollmentData.initialPayment,
            paymentMethod: enrollmentData.paymentType
          });
          
          // Si un paiement initial est effectué, l'enregistrer
          if (enrollmentData.initialPayment > 0) {
            // Récupérer l'ID de l'inscription créée
            const { data: enrollment } = await supabase
              .from('student_class_enrollments')
              .select('id')
              .eq('student_id', selectedStudent.id)
              .eq('academic_year_id', currentAcademicYear!.id)
              .eq('is_active', true)
              .single();
              
            if (enrollment) {
              await PaymentService.recordPayment({
                enrollmentId: enrollment.id,
                schoolId: userSchool!.id,
                academicYearId: currentAcademicYear!.id,
                amount: enrollmentData.initialPayment,
                paymentMethodId: enrollmentData.paymentMethodId,
                paymentType: enrollmentData.paymentType as any,
                paymentDate: new Date().toISOString().split('T')[0],
                referenceNumber: `REINS-${Date.now()}`,
                notes: `Paiement initial réinscription ${enrollmentData.paymentType}`
              });
            }
          }
        }
        
        // Recharger les données
        await loadAllData();
        
        const paymentMessage = enrollmentData.initialPayment > 0 
          ? ` avec un paiement ${enrollmentData.paymentType.toLowerCase()} de ${enrollmentData.initialPayment.toLocaleString()} FCFA`
          : ' sans paiement initial';
        alert(`Inscription réussie ! ${enrollmentData.firstName} ${enrollmentData.lastName} a été inscrit(e) en ${enrollmentData.className}${paymentMessage}.`);
        handleReset();
        
      } catch (error: any) {
        console.error('Erreur lors de l\'inscription:', error);
        alert(`Erreur lors de l'inscription: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmitOld = () => {
    if (validateStep('class')) {
      
      // Simulation de l'inscription
      setTimeout(() => {
        const paymentMessage = enrollmentData.initialPayment > 0 
          ? ` avec un paiement ${enrollmentData.paymentType.toLowerCase()} de ${enrollmentData.initialPayment.toLocaleString()} FCFA`
          : ' sans paiement initial';
        alert(`Inscription réussie ! ${enrollmentData.firstName} ${enrollmentData.lastName} a été inscrit(e) en ${enrollmentData.className}${paymentMessage}.`);
        handleReset();
      }, 1000);
    }
  };

  const handleReset = () => {
    setStep('student');
    setEnrollmentData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Masculin',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      classId: '',
      className: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      isNewStudent: true,
      paymentType: 'Inscription',
      paymentMethodId: paymentMethods.length > 0 ? paymentMethods[0].id : null,
      initialPayment: 0
    });
    setSelectedStudent(null);
    setErrors({});
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return (age - 1).toString();
    }
    return age.toString();
  };

  const getCapacityColor = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inscription d'Élève</h1>
          <p className="text-gray-600">Interface simplifiée pour l'inscription dans une classe</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Année Scolaire: {currentAcademicYear}</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${step === 'student' ? 'text-blue-600' : ['class', 'confirmation'].includes(step) ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'student' ? 'bg-blue-100' : ['class', 'confirmation'].includes(step) ? 'bg-green-100' : 'bg-gray-100'}`}>
              1
            </div>
            <span className="text-sm font-medium">Étudiant</span>
          </div>
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className={`flex items-center space-x-2 ${step === 'class' ? 'text-blue-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'class' ? 'bg-blue-100' : step === 'confirmation' ? 'bg-green-100' : 'bg-gray-100'}`}>
              2
            </div>
            <span className="text-sm font-medium">Classe</span>
          </div>
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className={`flex items-center space-x-2 ${step === 'confirmation' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'confirmation' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              3
            </div>
            <span className="text-sm font-medium">Confirmation</span>
          </div>
        </div>
      </div>

      {/* Step 1: Student Selection */}
      {step === 'student' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">Sélection de l'Étudiant</h2>
          
          {/* Type d'inscription */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="studentType"
                checked={enrollmentData.isNewStudent}
                onChange={() => handleStudentTypeChange(true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">Nouvel Étudiant</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="studentType"
                checked={!enrollmentData.isNewStudent}
                onChange={() => handleStudentTypeChange(false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">Étudiant Existant</span>
            </label>
          </div>

          {enrollmentData.isNewStudent ? (
            /* Formulaire nouvel étudiant */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={enrollmentData.firstName}
                    onChange={(e) => setEnrollmentData(prev => ({ ...prev, firstName: e.target.value }))}
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
                    value={enrollmentData.lastName}
                    onChange={(e) => setEnrollmentData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lastName ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de Naissance *
                  </label>
                  <input
                    type="date"
                    value={enrollmentData.dateOfBirth}
                    onChange={(e) => setEnrollmentData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.dateOfBirth ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                  {enrollmentData.dateOfBirth && (
                    <p className="text-sm text-gray-500 mt-1">Âge: {calculateAge(enrollmentData.dateOfBirth)} ans</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexe *
                  </label>
                  <select
                    value={enrollmentData.gender}
                    onChange={(e) => setEnrollmentData(prev => ({ ...prev, gender: e.target.value as 'Masculin' | 'Féminin' }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Masculin">Masculin</option>
                    <option value="Féminin">Féminin</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-3">Contact Parent/Tuteur</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du Parent *
                    </label>
                    <input
                      type="text"
                      value={enrollmentData.parentName}
                      onChange={(e) => setEnrollmentData(prev => ({ ...prev, parentName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.parentName ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.parentName && <p className="text-red-500 text-sm mt-1">{errors.parentName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={enrollmentData.parentPhone}
                      onChange={(e) => setEnrollmentData(prev => ({ ...prev, parentPhone: e.target.value }))}
                      placeholder="+229 01 XX XX XX XX"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.parentPhone ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.parentPhone && <p className="text-red-500 text-sm mt-1">{errors.parentPhone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={enrollmentData.parentEmail}
                      onChange={(e) => setEnrollmentData(prev => ({ ...prev, parentEmail: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.parentEmail ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.parentEmail && <p className="text-red-500 text-sm mt-1">{errors.parentEmail}</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Sélection étudiant existant */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher un Étudiant
                </label>
                <input
                  type="text"
                  placeholder="Nom de l'étudiant ou du parent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {errors.selectedStudent && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.selectedStudent}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleExistingStudentSelect(student)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedStudent?.id === student.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {student.firstName[0]}{student.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-gray-600">
                            {calculateAge(student.dateOfBirth)} ans • {student.gender}
                          </p>
                          <p className="text-sm text-gray-500">{student.parentName}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {student.currentClass && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                            Actuellement en {student.currentClass}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Class Selection */}
      {step === 'class' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Sélection de la Classe</h2>
            <div className="text-sm text-gray-500">
              Étudiant: {enrollmentData.firstName} {enrollmentData.lastName}
            </div>
          </div>

          {errors.classId && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.classId}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableClasses.map((classOption) => {
              const isSelected = enrollmentData.classId === classOption.id;
              const availablePlaces = classOption.capacity - classOption.enrolled;
              const isFull = availablePlaces <= 0;
              
              return (
                <div
                  key={classOption.id}
                  onClick={() => !isFull && handleClassSelect(classOption)}
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
                      <h3 className="font-medium text-gray-800">{classOption.name}</h3>
                      <p className="text-sm text-gray-600">{classOption.level}</p>
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
                      <span className="font-medium">{classOption.teacher}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Places:</span>
                      <span className={`font-medium ${getCapacityColor(classOption.enrolled, classOption.capacity)}`}>
                        {availablePlaces} disponibles
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais annuels:</span>
                      <span className="font-medium">{classOption.fees.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (classOption.enrolled / classOption.capacity) >= 0.9 ? 'bg-red-500' :
                          (classOption.enrolled / classOption.capacity) >= 0.75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(classOption.enrolled / classOption.capacity) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {classOption.enrolled}/{classOption.capacity} élèves
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirmation' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirmation d'Inscription</h2>
            <p className="text-gray-600">Vérifiez les informations avant de confirmer</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Informations de l'Étudiant</span>
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Nom complet:</strong> {enrollmentData.firstName} {enrollmentData.lastName}</p>
                <p><strong>Date de naissance:</strong> {new Date(enrollmentData.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                <p><strong>Âge:</strong> {calculateAge(enrollmentData.dateOfBirth)} ans</p>
                <p><strong>Sexe:</strong> {enrollmentData.gender}</p>
                <p><strong>Type:</strong> {enrollmentData.isNewStudent ? 'Nouvel étudiant' : 'Réinscription'}</p>
                {selectedStudent?.currentClass && (
                  <p><strong>Classe actuelle:</strong> {selectedStudent.currentClass}</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-3 flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Contact Parent/Tuteur</span>
              </h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p><strong>Nom:</strong> {enrollmentData.parentName}</p>
                <p><strong>Téléphone:</strong> {enrollmentData.parentPhone}</p>
                <p><strong>Email:</strong> {enrollmentData.parentEmail}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-3 flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Détails de l'Inscription</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
              <div>
                <p><strong>Année scolaire:</strong> {currentAcademicYear}</p>
                <p><strong>Classe:</strong> {enrollmentData.className}</p>
                <p><strong>Niveau:</strong> {availableClasses.find(c => c.id === enrollmentData.classId)?.level}</p>
              </div>
              <div>
                <p><strong>Enseignant:</strong> {availableClasses.find(c => c.id === enrollmentData.classId)?.teacher}</p>
                <p><strong>Date d'inscription:</strong> {new Date(enrollmentData.enrollmentDate).toLocaleDateString('fr-FR')}</p>
                <p><strong>Type de frais:</strong> {enrollmentData.paymentType}</p>
                <p><strong>Paiement initial:</strong> {enrollmentData.initialPayment.toLocaleString()} FCFA</p>
                <p><strong>Méthode:</strong> {paymentMethods.find(m => m.id === enrollmentData.paymentMethodId)?.name || 'Non sélectionnée'}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Information Importante</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Cette inscription sera effective immédiatement. L'étudiant sera ajouté à la classe sélectionnée 
                  et les informations seront enregistrées dans le système. Les frais de scolarité devront être 
                  réglés selon les modalités de paiement de l'école.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            {step !== 'student' && !loading && (
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
              onClick={handleReset}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Recommencer
            </button>
            
            {step !== 'confirmation' ? (
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Inscription...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Confirmer l'Inscription</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <School className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Classes Disponibles</p>
              <p className="text-lg font-bold text-gray-800">
                {loading ? '--' : availableClasses.filter(c => c.capacity > c.enrolled).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Places Libres</p>
              <p className="text-lg font-bold text-gray-800">
                {loading ? '--' : availableClasses.reduce((sum, c) => sum + (c.capacity - c.enrolled), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <UserPlus className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inscriptions Aujourd'hui</p>
              <p className="text-lg font-bold text-gray-800">{loading ? '--' : '0'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Année Active</p>
              <p className="text-lg font-bold text-gray-800">{currentAcademicYear?.name || currentAcademicYear}</p>
            </div>
          </div>
        </div>
        </div>
      )}
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      )}
    </div>
  );
};

export default EnrollmentInterface;