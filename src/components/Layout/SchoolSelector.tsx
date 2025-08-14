import React, { useState } from 'react';
import { School, ChevronDown, Plus, Settings } from 'lucide-react';
import { useSchool } from '../../contexts/SchoolContext';
import AddSchoolModal from '../Schools/AddSchoolModal';

const SchoolSelector: React.FC = () => {
  const { currentSchool, schools, setCurrentSchool } = useSchool();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);

  if (!currentSchool) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full"
      >
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <School className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-gray-800">{currentSchool.name}</p>
          <p className="text-sm text-gray-500">{currentSchool.director}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* Liste des écoles */}
            <div className="py-2">
              {schools.map((school) => (
                <button
                  key={school.id}
                  onClick={() => {
                    setCurrentSchool(school);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    currentSchool.id === school.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <School className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{school.name}</p>
                      <p className="text-sm text-gray-500">{school.address.split(',')[0]}</p>
                    </div>
                    {currentSchool.id === school.id && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 py-2">
              <button
                onClick={() => {
                  setShowAddSchoolModal(true);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 text-blue-600"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter une École</span>
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 text-gray-600"
              >
                <Settings className="h-4 w-4" />
                <span>Gérer les Écoles</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add School Modal */}
      <AddSchoolModal
        isOpen={showAddSchoolModal}
        onClose={() => setShowAddSchoolModal(false)}
      />
    </div>
  );
};

export default SchoolSelector;