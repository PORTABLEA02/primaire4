import React, { useState } from 'react';
import { X, Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAcademicYear } from '../../contexts/AcademicYearContext';
import { archiveCurrentYearData } from '../../utils/dataFilters';
import { useSchool } from '../../contexts/SchoolContext';

interface AcademicYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (yearData: AcademicYearData) => void;
}

interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: 'Trimestre' | 'Semestre';
}

interface AcademicYearData {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  periods: Period[];
  holidays: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  }>;
}

const AcademicYearModal: React.FC<AcademicYearModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { currentAcademicYear, availableYears, addAcademicYear, setCurrentAcademicYear } = useAcademicYear();
  const { currentSchool } = useSchool();
  const [formData, setFormData] = useState<AcademicYearData>({
    name: currentAcademicYear,
    startDate: '2024-10-01',
    endDate: '2025-06-30',
    isActive: true,
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
    holidays: [
      {
        id: '1',
        name: 'Vacances de Noël',
        startDate: '2024-12-21',
        endDate: '2025-01-07'
      },
      {
        id: '2',
        name: 'Vacances de Pâques',
        startDate: '2025-03-29',
        endDate: '2025-04-06'
      }
    ]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreateNewYear = () => {
    if (currentSchool) {
      // Archiver les données de l'année courante
      archiveCurrentYearData(currentSchool.id, currentAcademicYear);
      
      // Ajouter la nouvelle année
      addAcademicYear(formData.name);
      
      // Définir comme année courante
      setCurrentAcademicYear(formData.name);
      
      alert(`Nouvelle année scolaire ${formData.name} créée et activée. Les données de ${currentAcademicYear} ont été archivées.`);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'année scolaire est requis';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est requise';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La date de fin est requise';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'La date de fin doit être après la date de début';
    }

    if (formData.periods.length === 0) {
      newErrors.periods = 'Au moins une période doit être définie';
    }
    
    if (availableYears.includes(formData.name) && formData.name !== currentAcademicYear) {
      newErrors.name = 'Cette année scolaire existe déjà';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (formData.name === currentAcademicYear) {
        // Mise à jour de l'année courante
        onSave(formData);
      } else {
        // Création d'une nouvelle année
        handleCreateNewYear();
      }
      onClose();
    }
  };

  const addPeriod = () => {
    const newPeriod: Period = {
      id: Date.now().toString(),
      name: `Période ${formData.periods.length + 1}`,
      startDate: '',
      endDate: '',
      type: 'Trimestre'
    };
    
    setFormData(prev => ({
      ...prev,
      periods: [...prev.periods, newPeriod]
    }));
  };

  const removePeriod = (periodId: string) => {
    setFormData(prev => ({
      ...prev,
      periods: prev.periods.filter(p => p.id !== periodId)
    }));
  };

  const updatePeriod = (periodId: string, field: keyof Period, value: string) => {
    setFormData(prev => ({
      ...prev,
      periods: prev.periods.map(p => 
        p.id === periodId ? { ...p, [field]: value } : p
      )
    }));
  };

  const addHoliday = () => {
    const newHoliday = {
      id: Date.now().toString(),
      name: '',
      startDate: '',
      endDate: ''
    };
    
    setFormData(prev => ({
      ...prev,
      holidays: [...prev.holidays, newHoliday]
    }));
  };

  const removeHoliday = (holidayId: string) => {
    setFormData(prev => ({
      ...prev,
      holidays: prev.holidays.filter(h => h.id !== holidayId)
    }));
  };

  const updateHoliday = (holidayId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      holidays: prev.holidays.map(h => 
        h.id === holidayId ? { ...h, [field]: value } : h
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Configuration Année Scolaire</h2>
                <p className="text-gray-600">Définir les périodes et vacances</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Informations Générales</h3>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Année Scolaire Courante</h4>
              <p className="text-sm text-blue-700">
                Actuellement: <strong>{currentAcademicYear}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Seules les données de cette année sont visibles dans l'application
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'Année *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: 2024-2025"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de Début *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de Fin *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Année scolaire active
              </label>
            </div>
          </div>

          {/* Périodes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Périodes Scolaires</h3>
              <button
                type="button"
                onClick={addPeriod}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Période</span>
              </button>
            </div>

            {errors.periods && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-red-700 text-sm">{errors.periods}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {formData.periods.map((period, index) => (
                <div key={period.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-800">Période {index + 1}</h4>
                    {formData.periods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePeriod(period.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={period.name}
                        onChange={(e) => updatePeriod(period.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={period.type}
                        onChange={(e) => updatePeriod(period.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Trimestre">Trimestre</option>
                        <option value="Semestre">Semestre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de Début
                      </label>
                      <input
                        type="date"
                        value={period.startDate}
                        onChange={(e) => updatePeriod(period.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de Fin
                      </label>
                      <input
                        type="date"
                        value={period.endDate}
                        onChange={(e) => updatePeriod(period.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vacances */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Périodes de Vacances</h3>
              <button
                type="button"
                onClick={addHoliday}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Vacances</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.holidays.map((holiday, index) => (
                <div key={holiday.id} className="p-4 border border-gray-200 rounded-lg bg-green-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-800">Vacances {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeHoliday(holiday.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom des Vacances
                      </label>
                      <input
                        type="text"
                        value={holiday.name}
                        onChange={(e) => updateHoliday(holiday.id, 'name', e.target.value)}
                        placeholder="Ex: Vacances de Noël"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de Début
                      </label>
                      <input
                        type="date"
                        value={holiday.startDate}
                        onChange={(e) => updateHoliday(holiday.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de Fin
                      </label>
                      <input
                        type="date"
                        value={holiday.endDate}
                        onChange={(e) => updateHoliday(holiday.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcademicYearModal;