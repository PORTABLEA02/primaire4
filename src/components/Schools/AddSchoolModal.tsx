import React, { useState } from 'react';
import { X, School, MapPin, Phone, Mail, User, Calendar, Building } from 'lucide-react';
import { useSchool } from '../../contexts/SchoolContext';
import { School as SchoolType } from '../../types/School';

interface AddSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSchoolModal: React.FC<AddSchoolModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addSchool } = useSchool();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    director: '',
    foundedYear: new Date().getFullYear().toString(),
    studentCapacity: 500,
    motto: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'école est requis';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.director.trim()) {
      newErrors.director = 'Le nom du directeur est requis';
    }

    if (formData.studentCapacity < 50 || formData.studentCapacity > 5000) {
      newErrors.studentCapacity = 'La capacité doit être entre 50 et 5000 élèves';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const newSchool: SchoolType = {
        id: `school-${Date.now()}`,
        ...formData,
        isActive: true,
        createdDate: new Date().toISOString().split('T')[0],
        settings: {
          currency: 'FCFA',
          academicYear: '2024-2025',
          periods: [
            {
              id: '1',
              name: 'Trimestre 1',
              startDate: '2024-10-01',
              endDate: '2024-12-20',
              type: 'Trimestre'
            },
            {
              id: '2',
              name: 'Trimestre 2',
              startDate: '2025-01-08',
              endDate: '2025-03-28',
              type: 'Trimestre'
            },
            {
              id: '3',
              name: 'Trimestre 3',
              startDate: '2025-04-07',
              endDate: '2025-06-30',
              type: 'Trimestre'
            }
          ],
          feeTypes: [
            {
              id: '1',
              name: 'Frais de scolarité',
              amount: 350000,
              level: 'Tous',
              mandatory: true,
              description: 'Frais annuels de scolarité'
            },
            {
              id: '2',
              name: 'Frais d\'inscription',
              amount: 50000,
              level: 'Tous',
              mandatory: true,
              description: 'Frais d\'inscription annuelle'
            }
          ],
          paymentMethods: [
            {
              id: '1',
              name: 'Espèces',
              type: 'cash',
              enabled: true,
              fees: 0,
              config: {}
            },
            {
              id: '2',
              name: 'Mobile Money',
              type: 'mobile',
              enabled: true,
              fees: 1.5,
              config: {}
            }
          ],
          lateFeePercentage: 5,
          scholarshipPercentage: 10
        }
      };

      addSchool(newSchool);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      director: '',
      foundedYear: new Date().getFullYear().toString(),
      studentCapacity: 500,
      motto: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <School className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Nouvelle École</h2>
                <p className="text-gray-600">Ajouter un nouvel établissement au système</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Informations de l'École</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'École *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Adresse Complète *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.address ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Directeur/Directrice *
                </label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => setFormData(prev => ({ ...prev, director: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.director ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.director && <p className="text-red-500 text-sm mt-1">{errors.director}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Année de Fondation
                </label>
                <input
                  type="text"
                  value={formData.foundedYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, foundedYear: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacité d'Accueil *
                </label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  value={formData.studentCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentCapacity: parseInt(e.target.value) || 500 }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.studentCapacity ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.studentCapacity && <p className="text-red-500 text-sm mt-1">{errors.studentCapacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise de l'École
                </label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) => setFormData(prev => ({ ...prev, motto: e.target.value }))}
                  placeholder="Ex: Excellence, Innovation, Intégrité"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <School className="h-4 w-4" />
              <span>Créer l'École</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSchoolModal;