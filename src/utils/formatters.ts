// Utilitaires de formatage pour l'application

// Formatage des montants
export const formatCurrency = (amount: number, currency: string = 'FCFA'): string => {
  return `${amount.toLocaleString('fr-FR')} ${currency}`;
};

// Formatage des dates
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'datetime' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'datetime':
      return dateObj.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return dateObj.toLocaleDateString('fr-FR');
  }
};

// Formatage des noms
export const formatFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

// Formatage des initiales
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
};

// Formatage des numéros de téléphone
export const formatPhoneNumber = (phone: string): string => {
  // Format: +229 XX XX XX XX
  if (phone.startsWith('+229')) {
    const digits = phone.replace(/\D/g, '').substring(3);
    if (digits.length === 8) {
      return `+229 ${digits.substring(0, 2)} ${digits.substring(2, 4)} ${digits.substring(4, 6)} ${digits.substring(6, 8)}`;
    }
  }
  return phone;
};

// Formatage des pourcentages
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Formatage des notes
export const formatGrade = (grade: number, maxGrade: number = 20): string => {
  return `${grade.toFixed(1)}/${maxGrade}`;
};

// Formatage de l'âge
export const calculateAge = (birthDate: string | Date): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Formatage de la durée
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}min`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }
};

// Formatage des tailles de fichier
export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// Formatage des adresses
export const formatAddress = (address: string, maxLength: number = 50): string => {
  if (address.length <= maxLength) return address;
  return `${address.substring(0, maxLength)}...`;
};

// Formatage des listes
export const formatList = (items: string[], maxItems: number = 3): string => {
  if (items.length <= maxItems) {
    return items.join(', ');
  }
  
  const visible = items.slice(0, maxItems);
  const remaining = items.length - maxItems;
  return `${visible.join(', ')} et ${remaining} autre${remaining > 1 ? 's' : ''}`;
};

// Formatage des rangs
export const formatRank = (rank: number, total: number): string => {
  const suffix = rank === 1 ? 'er' : 'ème';
  return `${rank}${suffix}/${total}`;
};

// Formatage des moyennes avec appréciation
export const formatGradeWithAppreciation = (grade: number): { grade: string; appreciation: string; color: string } => {
  const formattedGrade = formatGrade(grade);
  
  if (grade >= 16) {
    return { grade: formattedGrade, appreciation: 'Excellent', color: 'green' };
  } else if (grade >= 14) {
    return { grade: formattedGrade, appreciation: 'Très Bien', color: 'blue' };
  } else if (grade >= 12) {
    return { grade: formattedGrade, appreciation: 'Bien', color: 'yellow' };
  } else if (grade >= 10) {
    return { grade: formattedGrade, appreciation: 'Passable', color: 'orange' };
  } else {
    return { grade: formattedGrade, appreciation: 'Insuffisant', color: 'red' };
  }
};

// Formatage du temps relatif
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'À l\'instant';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else {
    return formatDate(dateObj);
  }
};

// Formatage des statuts avec couleurs
export const getStatusDisplay = (status: string, type: 'payment' | 'student' | 'teacher' = 'student') => {
  const configs = {
    payment: {
      'À jour': { label: 'À jour', color: 'green' },
      'En retard': { label: 'En retard', color: 'red' },
      'Partiel': { label: 'Partiel', color: 'yellow' }
    },
    student: {
      'Actif': { label: 'Actif', color: 'green' },
      'Inactif': { label: 'Inactif', color: 'red' },
      'Suspendu': { label: 'Suspendu', color: 'yellow' }
    },
    teacher: {
      'Actif': { label: 'Actif', color: 'green' },
      'Inactif': { label: 'Inactif', color: 'red' },
      'Congé': { label: 'En congé', color: 'yellow' }
    }
  };

  const config = configs[type][status as keyof typeof configs[typeof type]] || { label: status, color: 'gray' };
  
  return {
    label: config.label,
    className: `bg-${config.color}-50 text-${config.color}-700 border-${config.color}-200`
  };
};

// Sanitisation des données
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

// Validation des formats
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+223\s?[67]\d{7}$/;
  return phoneRegex.test(phone);
};

// Génération d'identifiants
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}`;
};

// Formatage des erreurs pour l'affichage
export const formatError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error_description) return error.error_description;
  return 'Une erreur est survenue';
};