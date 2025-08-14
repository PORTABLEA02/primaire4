import { useAcademicYear } from '../contexts/AcademicYearContext';

/**
 * Utilitaires pour filtrer les données par année scolaire
 */

export const createDataKey = (schoolId: string, academicYear: string, dataType: string): string => {
  return `${dataType}_${schoolId}_${academicYear}`;
};

export const getCurrentYearData = <T extends { academicYear: string }>(
  data: T[], 
  currentAcademicYear: string
): T[] => {
  return data.filter(item => item.academicYear === currentAcademicYear);
};

export const saveDataForCurrentYear = (
  schoolId: string, 
  academicYear: string, 
  dataType: string, 
  data: any[]
): void => {
  const key = createDataKey(schoolId, academicYear, dataType);
  localStorage.setItem(key, JSON.stringify(data));
};

export const loadDataForCurrentYear = <T>(
  schoolId: string, 
  academicYear: string, 
  dataType: string
): T[] => {
  const key = createDataKey(schoolId, academicYear, dataType);
  const savedData = localStorage.getItem(key);
  
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (error) {
      console.error(`Erreur lors du chargement des données ${dataType}:`, error);
      return [];
    }
  }
  
  return [];
};

export const archiveCurrentYearData = (
  schoolId: string, 
  academicYear: string
): void => {
  const dataTypes = ['students', 'teachers', 'classes', 'grades', 'payments'];
  const archiveData: Record<string, any> = {};
  
  dataTypes.forEach(dataType => {
    const key = createDataKey(schoolId, academicYear, dataType);
    const data = localStorage.getItem(key);
    if (data) {
      archiveData[dataType] = JSON.parse(data);
    }
  });
  
  // Sauvegarder l'archive
  const archiveKey = `archive_${schoolId}_${academicYear}`;
  localStorage.setItem(archiveKey, JSON.stringify({
    schoolId,
    academicYear,
    archivedDate: new Date().toISOString(),
    data: archiveData
  }));
  
  console.log(`Données de l'année ${academicYear} archivées pour l'école ${schoolId}`);
};

export const getArchivedYears = (schoolId: string): string[] => {
  const keys = Object.keys(localStorage);
  const archiveKeys = keys.filter(key => key.startsWith(`archive_${schoolId}_`));
  
  return archiveKeys.map(key => {
    const parts = key.split('_');
    return parts[parts.length - 1]; // Dernière partie = année
  }).sort().reverse();
};

export const restoreArchivedData = (
  schoolId: string, 
  academicYear: string
): boolean => {
  const archiveKey = `archive_${schoolId}_${academicYear}`;
  const archivedData = localStorage.getItem(archiveKey);
  
  if (archivedData) {
    try {
      const archive = JSON.parse(archivedData);
      
      // Restaurer chaque type de données
      Object.entries(archive.data).forEach(([dataType, data]) => {
        const key = createDataKey(schoolId, academicYear, dataType);
        localStorage.setItem(key, JSON.stringify(data));
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      return false;
    }
  }
  
  return false;
};