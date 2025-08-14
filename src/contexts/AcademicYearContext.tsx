import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../components/Auth/AuthProvider';

interface AcademicYearContextType {
  currentAcademicYear: string;
  setCurrentAcademicYear: (year: string) => void;
  availableYears: string[];
  addAcademicYear: (year: string) => void;
  isCurrentYear: (year: string) => boolean;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export const useAcademicYear = () => {
  const context = useContext(AcademicYearContext);
  if (context === undefined) {
    throw new Error('useAcademicYear must be used within an AcademicYearProvider');
  }
  return context;
};

interface AcademicYearProviderProps {
  children: React.ReactNode;
}

export const AcademicYearProvider: React.FC<AcademicYearProviderProps> = ({ children }) => {
  const { currentAcademicYear: authAcademicYear, isAuthenticated } = useAuth();
  const [currentAcademicYear, setCurrentAcademicYearState] = useState('2024-2025');
  const [availableYears, setAvailableYears] = useState(['2024-2025', '2023-2024', '2022-2023']);

  useEffect(() => {
    // Si l'utilisateur est authentifié et a une année scolaire active, l'utiliser
    if (isAuthenticated && authAcademicYear) {
      setCurrentAcademicYearState(authAcademicYear.name);
      // Ajouter l'année à la liste si elle n'y est pas
      setAvailableYears(prev => {
        if (!prev.includes(authAcademicYear.name)) {
          return [authAcademicYear.name, ...prev].sort().reverse();
        }
        return prev;
      });
      return;
    }

    // Sinon, charger depuis localStorage (fallback)
    // Charger l'année scolaire courante depuis le localStorage
    const savedYear = localStorage.getItem('ecoletech_current_academic_year');
    if (savedYear) {
      setCurrentAcademicYearState(savedYear);
    }

    // Charger les années disponibles
    const savedYears = localStorage.getItem('ecoletech_available_years');
    if (savedYears) {
      try {
        setAvailableYears(JSON.parse(savedYears));
      } catch (error) {
        console.error('Erreur lors du chargement des années:', error);
      }
    }
  }, [isAuthenticated, authAcademicYear]);

  const setCurrentAcademicYear = (year: string) => {
    setCurrentAcademicYearState(year);
    localStorage.setItem('ecoletech_current_academic_year', year);
  };

  const addAcademicYear = (year: string) => {
    if (!availableYears.includes(year)) {
      const newYears = [...availableYears, year].sort().reverse();
      setAvailableYears(newYears);
      localStorage.setItem('ecoletech_available_years', JSON.stringify(newYears));
    }
  };

  const isCurrentYear = (year: string) => {
    return year === currentAcademicYear;
  };

  const value: AcademicYearContextType = {
    currentAcademicYear,
    setCurrentAcademicYear,
    availableYears,
    addAcademicYear,
    isCurrentYear
  };

  return (
    <AcademicYearContext.Provider value={value}>
      {children}
    </AcademicYearContext.Provider>
  );
};