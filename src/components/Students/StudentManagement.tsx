import React, { useState, useEffect } from 'react';
import { Users, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import AddStudentModal from './AddStudentModal';
import StudentDetailModal from './StudentDetailModal';
import TransferStudentModal from './TransferStudentModal';
import StudentStatsCard from './StudentStatsCard';
import StudentFilters from './StudentFilters';
import StudentTable from './StudentTable';
import { useAuth } from '../Auth/AuthProvider';
import { StudentService } from '../../services/studentService';
import { PaymentService } from '../../services/paymentService';
import { ActivityLogService } from '../../services/activityLogService';
import { StudentHelpers } from '../../utils/studentHelpers';

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  gender: 'Masculin' | 'Féminin';
  date_of_birth: string;
  nationality: string;
  parent_email: string;
  father_name?: string;
  father_phone?: string;
  mother_name?: string;
  mother_phone?: string;
  address: string;
  class_name: string;
  level: string;
  enrollment_date: string;
  payment_status: 'À jour' | 'En retard' | 'Partiel';
  outstanding_amount: number;
  total_fees: number;
  paid_amount: number;
  is_active: boolean;
}

const StudentManagement: React.FC = () => {
  const { userSchool, currentAcademicYear, user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Charger les données
  useEffect(() => {
    if (userSchool && currentAcademicYear) {
      loadStudents();
      loadStats();
    }
  }, [userSchool, currentAcademicYear]);

  const loadStudents = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      setError(null);
      const data = await StudentService.getStudents(userSchool.id, currentAcademicYear.id);
      setStudents(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des élèves:', error);
      setError(error.message || 'Erreur lors du chargement des élèves');
    } finally {
    }
  };

  const loadStats = async () => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      const statsData = await StudentService.getStudentStats(userSchool.id, currentAcademicYear.id);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  // Filtrer les élèves
  const filteredStudents = React.useMemo(() => {
    return students.filter(student => {
      const matchesSearch = `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (student.father_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (student.mother_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (student.father_phone || '').includes(searchTerm) ||
                           (student.mother_phone || '').includes(searchTerm) ||
                           student.parent_email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = classFilter === 'all' || student.class_name === classFilter;
      const matchesStatus = statusFilter === 'all' || student.is_active.toString() === statusFilter;
      const matchesPayment = paymentFilter === 'all' || student.payment_status === paymentFilter;
      
      return matchesSearch && matchesClass && matchesStatus && matchesPayment;
    });
  }, [students, searchTerm, classFilter, statusFilter, paymentFilter]);

  // Obtenir les classes uniques pour le filtre
  const uniqueClasses = [...new Set(students.map(s => s.class_name))].sort();

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200';
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'À jour': return 'bg-green-50 text-green-700';
      case 'En retard': return 'bg-red-50 text-red-700';
      case 'Partiel': return 'bg-yellow-50 text-yellow-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const handleAddStudent = async (studentData: any, enrollmentData: any) => {
    if (!userSchool || !currentAcademicYear) return;

    try {
      // Créer l'élève et l'inscription
      const { student, enrollment } = await StudentService.createStudentWithEnrollment(
        studentData,
        enrollmentData
      );
      
      // Si un paiement initial est effectué, l'enregistrer
      if (enrollmentData.initialPayment > 0) {
        const referencePrefix = enrollmentData.paymentType === 'Inscription' ? 'INS' : 'SCO';
        await PaymentService.recordPayment({
          enrollmentId: enrollment.id,
          schoolId: userSchool.id,
          academicYearId: currentAcademicYear.id,
          amount: enrollmentData.initialPayment,
          paymentMethodId: enrollmentData.paymentMethodId || null,
          paymentType: enrollmentData.paymentType,
          paymentDate: new Date().toISOString().split('T')[0],
          referenceNumber: `${referencePrefix}-${Date.now()}`,
          mobileNumber: enrollmentData.mobileNumber,
          bankDetails: enrollmentData.bankDetails,
          notes: enrollmentData.notes,
          processedBy: user?.id
        });
        
        // Logger le paiement
        await ActivityLogService.logActivity({
          schoolId: userSchool.id,
          action: 'RECORD_INITIAL_PAYMENT',
          entityType: 'payment',
          level: 'success',
          details: `Paiement initial ${enrollmentData.paymentType} de ${enrollmentData.initialPayment.toLocaleString()} FCFA pour ${studentData.firstName} ${studentData.lastName}`
        });
      }
      
      // Recharger les données
      await loadStudents();
      await loadStats();
      
      const message = enrollmentData.initialPayment > 0 
        ? `Élève inscrit avec succès ! Paiement initial ${enrollmentData.paymentType} de ${enrollmentData.initialPayment.toLocaleString()} FCFA enregistré.`
        : 'Élève inscrit avec succès !';
      alert(message);
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleTransferStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowTransferModal(true);
  };

  const handleWithdrawStudent = async (student: Student) => {
    const reason = prompt('Raison du retrait:');
    if (reason && confirm(`Êtes-vous sûr de vouloir retirer ${student.first_name} ${student.last_name} ?`)) {
      try {
        // Trouver l'inscription active
        const enrollment = students.find(s => s.student_id === student.student_id);
        if (enrollment) {
          await StudentService.withdrawStudent(enrollment.id, reason);
          await loadStudents();
          await loadStats();
          alert('Élève retiré avec succès');
        }
      } catch (error: any) {
        alert(`Erreur: ${error.message}`);
      }
    }
  };

  const exportStudents = () => {
    const exportData = filteredStudents.map(student => 
      StudentHelpers.formatStudentForExport(student)
    );

    // Créer et télécharger le CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `eleves_${userSchool?.name}_${currentAcademicYear?.name}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadStudents}
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
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Élèves</h1>
          <p className="text-gray-600">
            {userSchool?.name} - Année {currentAcademicYear?.name}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAddStudentModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvel Élève</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <StudentStatsCard stats={stats} />}

      {/* Search and Filters */}
      <StudentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        classFilter={classFilter}
        onClassFilterChange={setClassFilter}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        availableClasses={uniqueClasses}
        onRefresh={loadStudents}
        onExport={exportStudents}
      />

      {/* Students Table */}
      <StudentTable
        students={filteredStudents}
        onViewStudent={handleViewStudent}
        onEditStudent={handleViewStudent}
        onTransferStudent={handleTransferStudent}
        onWithdrawStudent={handleWithdrawStudent}
      />

      {/* Modals */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onAddStudent={handleAddStudent}
      />

      {selectedStudent && (
        <>
          <StudentDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedStudent(null);
            }}
            student={selectedStudent}
            onUpdate={loadStudents}
          />

          <TransferStudentModal
            isOpen={showTransferModal}
            onClose={() => {
              setShowTransferModal(false);
              setSelectedStudent(null);
            }}
            student={selectedStudent}
            onTransfer={loadStudents}
          />
        </>
      )}
    </div>
  );
};

export default StudentManagement;