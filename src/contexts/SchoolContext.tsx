import React, { createContext, useContext, useState, useEffect } from 'react';
import { School } from '../types/School';
import { useAuth } from '../components/Auth/AuthProvider';

interface SchoolContextType {
  currentSchool: School | null;
  schools: School[];
  setCurrentSchool: (school: School) => void;
  addSchool: (school: School) => void;
  updateSchool: (schoolId: string, updates: Partial<School>) => void;
  deleteSchool: (schoolId: string) => void;
  isLoading: boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};

interface SchoolProviderProps {
  children: React.ReactNode;
}

export const SchoolProvider: React.FC<SchoolProviderProps> = ({ children }) => {
  const { userSchool, isAuthenticated } = useAuth();
  const [currentSchool, setCurrentSchoolState] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);

  // Écoles de démonstration
  const defaultSchools: School[] = [
    {
      id: 'ecole-1',
      name: 'École Technique Moderne',
      address: 'Quartier ACI 2000, Bamako, Mali',
      phone: '+223 20 22 33 44',
      email: 'contact@ecoletech.edu.ml',
      director: 'Dr. Amadou Sanogo',
      foundedYear: '2010',
      studentCapacity: 1500,
      motto: 'Excellence, Innovation, Intégrité',
      isActive: true,
      createdDate: '2010-09-01',
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
            amount: 400000,
            level: 'CE2',
            mandatory: true,
            description: 'Frais annuels de scolarité'
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
          }
        ],
        lateFeePercentage: 5,
        scholarshipPercentage: 10
      }
    },
    {
      id: 'ecole-2',
      name: 'Complexe Scolaire Les Palmiers',
      address: 'Quartier Magnambougou, Bamako, Mali',
      phone: '+223 20 25 36 47',
      email: 'info@lespalmiers.edu.ml',
      director: 'Mme Fatoumata Keita',
      foundedYear: '2015',
      studentCapacity: 800,
      motto: 'Savoir, Sagesse, Succès',
      isActive: true,
      createdDate: '2015-09-01',
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
          }
        ],
        feeTypes: [],
        paymentMethods: [],
        lateFeePercentage: 3,
        scholarshipPercentage: 15
      }
    }
  ];

  useEffect(() => {
    // Si l'utilisateur est authentifié et a une école, l'utiliser
    if (isAuthenticated && userSchool) {
      setCurrentSchoolState(userSchool);
      setSchools([userSchool]); // Pour l'instant, on ne charge que l'école de l'utilisateur
      return;
    }

    // Sinon, charger depuis localStorage (fallback)
    // Charger les écoles depuis le localStorage ou utiliser les données par défaut
    const savedSchools = localStorage.getItem('ecoletech_schools');
    const savedCurrentSchool = localStorage.getItem('ecoletech_current_school');
    
    if (savedSchools) {
      try {
        const schoolsData = JSON.parse(savedSchools);
        setSchools(schoolsData);
        
        if (savedCurrentSchool) {
          const currentSchoolData = JSON.parse(savedCurrentSchool);
          setCurrentSchoolState(currentSchoolData);
        } else if (schoolsData.length > 0) {
          setCurrentSchoolState(schoolsData[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des écoles:', error);
        setSchools(defaultSchools);
        setCurrentSchoolState(defaultSchools[0]);
      }
    } else {
      setSchools(defaultSchools);
      setCurrentSchoolState(defaultSchools[0]);
    }
    
  }, [isAuthenticated, userSchool]);

  const setCurrentSchool = (school: School) => {
    setCurrentSchoolState(school);
    localStorage.setItem('ecoletech_current_school', JSON.stringify(school));
  };

  const addSchool = (school: School) => {
    const newSchools = [...schools, school];
    setSchools(newSchools);
    localStorage.setItem('ecoletech_schools', JSON.stringify(newSchools));
  };

  const updateSchool = (schoolId: string, updates: Partial<School>) => {
    const updatedSchools = schools.map(school =>
      school.id === schoolId ? { ...school, ...updates } : school
    );
    setSchools(updatedSchools);
    localStorage.setItem('ecoletech_schools', JSON.stringify(updatedSchools));
    
    // Mettre à jour l'école courante si c'est celle qui est modifiée
    if (currentSchool?.id === schoolId) {
      const updatedCurrentSchool = { ...currentSchool, ...updates };
      setCurrentSchoolState(updatedCurrentSchool);
      localStorage.setItem('ecoletech_current_school', JSON.stringify(updatedCurrentSchool));
    }
  };

  const deleteSchool = (schoolId: string) => {
    const filteredSchools = schools.filter(school => school.id !== schoolId);
    setSchools(filteredSchools);
    localStorage.setItem('ecoletech_schools', JSON.stringify(filteredSchools));
    
    // Si l'école supprimée était l'école courante, sélectionner la première disponible
    if (currentSchool?.id === schoolId && filteredSchools.length > 0) {
      setCurrentSchool(filteredSchools[0]);
    }
  };

  const value: SchoolContextType = {
    currentSchool,
    schools,
    setCurrentSchool,
    addSchool,
    updateSchool,
    deleteSchool,
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
};