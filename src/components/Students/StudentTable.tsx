import React from 'react';
import { 
  Eye, 
  Edit, 
  UserMinus, 
  Phone, 
  Mail, 
  Users, 
  UserPlus,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { StudentHelpers } from '../../utils/studentHelpers';

interface StudentTableProps {
  students: any[];
  onViewStudent: (student: any) => void;
  onEditStudent: (student: any) => void;
  onTransferStudent: (student: any) => void;
  onWithdrawStudent: (student: any) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onViewStudent,
  onEditStudent,
  onTransferStudent,
  onWithdrawStudent,
}) => {
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200';
  };

  const getPaymentStatusColor = (status: string) => {
    const display = StudentHelpers.getPaymentStatusDisplay(status);
    return display.className;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Liste des Élèves</h2>
          <div className="text-sm text-gray-500">
            {students.length} élève(s)
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Élève</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent/Tuteur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Situation Financière</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => {
              const age = StudentHelpers.calculateAge(student.date_of_birth);
              const paymentProgress = StudentHelpers.calculatePaymentProgress(
                student.paid_amount, 
                student.total_fees
              );
              
              return (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {StudentHelpers.getInitials(student.first_name, student.last_name)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {StudentHelpers.formatFullName(student.first_name, student.last_name)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {student.gender} • {age} ans • {student.nationality}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {student.class_name}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{student.level}</p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-800">
                        {student.father_name && student.mother_name 
                          ? `${student.father_name} / ${student.mother_name}`
                          : student.father_name || student.mother_name || 'Non renseigné'
                        }
                      </p>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {student.father_phone || student.mother_phone || 'Non renseigné'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{student.parent_email}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(student.payment_status)}`}>
                        {student.payment_status}
                      </span>
                      <div className="text-sm text-gray-600">
                        {student.paid_amount.toLocaleString()}/{student.total_fees.toLocaleString()} FCFA
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${
                            paymentProgress === 100 ? 'bg-green-600' :
                            paymentProgress > 0 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                        ></div>
                      </div>
                      {student.outstanding_amount > 0 && (
                        <p className="text-xs text-red-600 font-medium">
                          Reste: {student.outstanding_amount.toLocaleString()} FCFA
                        </p>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-800">
                        {new Date(student.enrollment_date).toLocaleDateString('fr-FR')}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(student.is_active)}`}>
                        {student.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onViewStudent(student)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onEditStudent(student)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onTransferStudent(student)}
                        className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                        title="Transférer"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onWithdrawStudent(student)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Retirer"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun élève trouvé</h3>
          <p className="text-gray-600">Aucun élève ne correspond aux critères de recherche</p>
        </div>
      )}
    </div>
  );
};

export default StudentTable;