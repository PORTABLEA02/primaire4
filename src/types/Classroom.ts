export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: 'Classe Standard' | 'Laboratoire' | 'Espace Lecture' | 'Sport' | 'Informatique';
  equipment: string[];
  isAvailable: boolean;
  schoolId: string; // Nouvelle propriété
  assignedClass?: string;
  floor?: number;
  building?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  level: string;
  students: number;
  capacity: number;
  teacher: string;
  teacherId: string;
  subjects: string[];
  classroom?: string;
  schoolId: string; // Nouvelle propriété
  academicYear: string; // Année scolaire
}