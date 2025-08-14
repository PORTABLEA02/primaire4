// Constantes pour l'application

// Rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'Admin',
  DIRECTOR: 'Directeur', 
  SECRETARY: 'Secrétaire',
  TEACHER: 'Enseignant',
  ACCOUNTANT: 'Comptable'
} as const;

// Permissions
export const PERMISSIONS = {
  ALL: 'all',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  CLASSES: 'classes',
  ACADEMIC: 'academic',
  FINANCE: 'finance',
  SCHEDULE: 'schedule',
  REPORTS: 'reports',
  SETTINGS: 'settings'
} as const;

// Statuts des élèves
export const STUDENT_STATUS = {
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
  SUSPENDED: 'Suspendu'
} as const;

// Statuts de paiement
export const PAYMENT_STATUS = {
  UP_TO_DATE: 'À jour',
  LATE: 'En retard',
  PARTIAL: 'Partiel'
} as const;

// Types de paiement
export const PAYMENT_TYPES = {
  REGISTRATION: 'Inscription',
  TUITION: 'Scolarité',
  CANTEEN: 'Cantine',
  TRANSPORT: 'Transport',
  SUPPLIES: 'Fournitures',
  OTHER: 'Autre'
} as const;

// Méthodes de paiement
export const PAYMENT_METHODS = {
  CASH: 'Espèces',
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Virement Bancaire'
} as const;

// Statuts des enseignants
export const TEACHER_STATUS = {
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
  LEAVE: 'Congé'
} as const;

// Niveaux scolaires
export const SCHOOL_LEVELS = {
  KINDERGARTEN: 'Maternelle',
  CI: 'CI',
  CP: 'CP', 
  CE1: 'CE1',
  CE2: 'CE2',
  CM1: 'CM1',
  CM2: 'CM2'
} as const;

// Types d'évaluation
export const EVALUATION_TYPES = {
  HOMEWORK: 'devoir',
  EXAM: 'composition',
  QUIZ: 'interrogation'
} as const;

// Jours de la semaine
export const DAYS_OF_WEEK = {
  MONDAY: { value: 1, label: 'Lundi' },
  TUESDAY: { value: 2, label: 'Mardi' },
  WEDNESDAY: { value: 3, label: 'Mercredi' },
  THURSDAY: { value: 4, label: 'Jeudi' },
  FRIDAY: { value: 5, label: 'Vendredi' },
  SATURDAY: { value: 6, label: 'Samedi' },
  SUNDAY: { value: 7, label: 'Dimanche' }
} as const;

// Niveaux de log
export const LOG_LEVELS = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
} as const;

// Configuration par défaut
export const DEFAULT_CONFIG = {
  PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  SESSION_TIMEOUT: 30, // minutes
  AUTO_SAVE_INTERVAL: 5, // minutes
  BACKUP_RETENTION_DAYS: 30,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  SUPPORTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
} as const;

// Validation
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_AGE: 3,
  MAX_AGE: 18,
  MIN_GRADE: 0,
  MAX_GRADE: 20,
  MIN_CAPACITY: 10,
  MAX_CAPACITY: 60,
  MIN_SALARY: 50000,
  MAX_SALARY: 1000000
} as const;

// Formats de date
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm'
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion réseau',
  UNAUTHORIZED: 'Accès non autorisé',
  FORBIDDEN: 'Action non autorisée',
  NOT_FOUND: 'Ressource non trouvée',
  VALIDATION_ERROR: 'Erreur de validation des données',
  SERVER_ERROR: 'Erreur serveur interne',
  TIMEOUT: 'Délai d\'attente dépassé'
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  STUDENT_CREATED: 'Élève ajouté avec succès',
  TEACHER_CREATED: 'Enseignant ajouté avec succès',
  CLASS_CREATED: 'Classe créée avec succès',
  PAYMENT_RECORDED: 'Paiement enregistré avec succès',
  GRADE_SAVED: 'Note sauvegardée avec succès',
  BULLETIN_GENERATED: 'Bulletin généré avec succès',
  BACKUP_CREATED: 'Sauvegarde créée avec succès',
  DATA_EXPORTED: 'Données exportées avec succès'
} as const;

// Configuration des couleurs par statut
export const STATUS_COLORS = {
  success: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200'
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  }
} as const;

// Configuration des grades
export const GRADE_CONFIG = {
  EXCELLENT: { min: 16, max: 20, label: 'Excellent', color: 'green' },
  VERY_GOOD: { min: 14, max: 16, label: 'Très Bien', color: 'blue' },
  GOOD: { min: 12, max: 14, label: 'Bien', color: 'yellow' },
  SATISFACTORY: { min: 10, max: 12, label: 'Passable', color: 'orange' },
  INSUFFICIENT: { min: 0, max: 10, label: 'Insuffisant', color: 'red' }
} as const;

// Configuration des matières par niveau
export const SUBJECTS_BY_LEVEL = {
  [SCHOOL_LEVELS.KINDERGARTEN]: ['Éveil', 'Langage', 'Graphisme', 'Jeux éducatifs', 'Motricité'],
  [SCHOOL_LEVELS.CI]: ['Français', 'Mathématiques', 'Éveil Scientifique', 'Éducation Civique', 'Dessin'],
  [SCHOOL_LEVELS.CP]: ['Français', 'Mathématiques', 'Éveil Scientifique', 'Éducation Civique', 'Dessin'],
  [SCHOOL_LEVELS.CE1]: ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Dessin'],
  [SCHOOL_LEVELS.CE2]: ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Dessin'],
  [SCHOOL_LEVELS.CM1]: ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Anglais', 'Dessin'],
  [SCHOOL_LEVELS.CM2]: ['Français', 'Mathématiques', 'Histoire-Géographie', 'Sciences', 'Éducation Civique', 'Anglais', 'Dessin']
} as const;

// Frais par niveau (en FCFA)
export const FEES_BY_LEVEL = {
  [SCHOOL_LEVELS.KINDERGARTEN]: 300000,
  [SCHOOL_LEVELS.CI]: 350000,
  [SCHOOL_LEVELS.CP]: 350000,
  [SCHOOL_LEVELS.CE1]: 400000,
  [SCHOOL_LEVELS.CE2]: 400000,
  [SCHOOL_LEVELS.CM1]: 450000,
  [SCHOOL_LEVELS.CM2]: 450000
} as const;

// Âges recommandés par niveau
export const AGE_RANGES = {
  [SCHOOL_LEVELS.KINDERGARTEN]: { min: 3, max: 5 },
  [SCHOOL_LEVELS.CI]: { min: 6, max: 7 },
  [SCHOOL_LEVELS.CP]: { min: 7, max: 8 },
  [SCHOOL_LEVELS.CE1]: { min: 8, max: 9 },
  [SCHOOL_LEVELS.CE2]: { min: 9, max: 10 },
  [SCHOOL_LEVELS.CM1]: { min: 10, max: 11 },
  [SCHOOL_LEVELS.CM2]: { min: 11, max: 12 }
} as const;

// Utilitaires
export const getGradeConfig = (grade: number) => {
  if (grade >= GRADE_CONFIG.EXCELLENT.min) return GRADE_CONFIG.EXCELLENT;
  if (grade >= GRADE_CONFIG.VERY_GOOD.min) return GRADE_CONFIG.VERY_GOOD;
  if (grade >= GRADE_CONFIG.GOOD.min) return GRADE_CONFIG.GOOD;
  if (grade >= GRADE_CONFIG.SATISFACTORY.min) return GRADE_CONFIG.SATISFACTORY;
  return GRADE_CONFIG.INSUFFICIENT;
};

export const getSubjectsByLevel = (level: string): string[] => {
  return SUBJECTS_BY_LEVEL[level as keyof typeof SUBJECTS_BY_LEVEL] || [];
};

export const getFeesByLevel = (level: string): number => {
  return FEES_BY_LEVEL[level as keyof typeof FEES_BY_LEVEL] || 350000;
};

export const getAgeRange = (level: string) => {
  return AGE_RANGES[level as keyof typeof AGE_RANGES] || { min: 6, max: 12 };
};

// Validation des données avant envoi
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+229\s?[0-9]\d{7}$|^[0-9]\d{7}$/;
  return phoneRegex.test(phone);
};