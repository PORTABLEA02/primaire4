import { RouteModule } from '../contexts/RouterContext';

// Utilitaires pour la gestion des routes

export class RouteUtils {
  // Obtenir le titre d'une route
  static getRouteTitle(route: RouteModule): string {
    const titles: Record<RouteModule, string> = {
      dashboard: 'Tableau de Bord',
      enrollment: 'Inscription d\'Élève',
      students: 'Gestion des Élèves',
      classes: 'Gestion des Classes',
      finance: 'Gestion Financière',
      academic: 'Gestion Académique',
      teachers: 'Gestion des Enseignants',
      schedule: 'Emploi du Temps',
      settings: 'Paramètres'
    };
    return titles[route] || 'Page Inconnue';
  }

  // Obtenir la description d'une route
  static getRouteDescription(route: RouteModule): string {
    const descriptions: Record<RouteModule, string> = {
      dashboard: 'Vue d\'ensemble de l\'école et statistiques',
      enrollment: 'Interface simplifiée pour inscrire de nouveaux élèves',
      students: 'Gestion complète des élèves inscrits',
      classes: 'Configuration des classes et affectation des enseignants',
      finance: 'Suivi des paiements et gestion financière',
      academic: 'Notes, bulletins et suivi pédagogique',
      teachers: 'Gestion du personnel enseignant',
      schedule: 'Planification des emplois du temps',
      settings: 'Configuration du système et paramètres'
    };
    return descriptions[route] || 'Description non disponible';
  }

  // Obtenir l'icône d'une route
  static getRouteIcon(route: RouteModule): string {
    const icons: Record<RouteModule, string> = {
      dashboard: 'Home',
      enrollment: 'UserPlus',
      students: 'Users',
      classes: 'GraduationCap',
      finance: 'DollarSign',
      academic: 'BookOpen',
      teachers: 'UserCheck',
      schedule: 'Calendar',
      settings: 'Settings'
    };
    return icons[route] || 'Circle';
  }

  // Vérifier si une route nécessite des données spécifiques
  static requiresSchoolData(route: RouteModule): boolean {
    return route !== 'settings';
  }

  static requiresAcademicYear(route: RouteModule): boolean {
    return ['students', 'classes', 'finance', 'academic', 'enrollment'].includes(route);
  }

  // Obtenir les routes recommandées selon le rôle
  static getRecommendedRoutes(role: string): RouteModule[] {
    const recommendations: Record<string, RouteModule[]> = {
      'Admin': ['dashboard', 'settings', 'teachers', 'classes', 'students', 'finance'],
      'Directeur': ['dashboard', 'students', 'teachers', 'classes', 'academic', 'finance'],
      'Secrétaire': ['dashboard', 'enrollment', 'students', 'classes'],
      'Enseignant': ['dashboard', 'academic', 'students'],
      'Comptable': ['dashboard', 'finance', 'students']
    };
    return recommendations[role] || ['dashboard'];
  }

  // Obtenir la route par défaut selon le rôle
  static getDefaultRoute(role: string): RouteModule {
    const defaults: Record<string, RouteModule> = {
      'Admin': 'dashboard',
      'Directeur': 'dashboard',
      'Secrétaire': 'enrollment',
      'Enseignant': 'academic',
      'Comptable': 'finance'
    };
    return defaults[role] || 'dashboard';
  }

  // Valider une transition de route
  static canTransition(fromRoute: RouteModule, toRoute: RouteModule, userRole: string): boolean {
    // Certaines transitions peuvent être restreintes selon la logique métier
    // Par exemple, empêcher de quitter la page de paramètres si des modifications sont en cours
    
    // Pour l'instant, toutes les transitions sont autorisées
    return true;
  }

  // Obtenir l'URL de la route (pour future implémentation avec React Router)
  static getRouteUrl(route: RouteModule): string {
    return `/${route}`;
  }

  // Parser une URL pour extraire la route
  static parseUrl(url: string): RouteModule | null {
    const path = url.replace(/^\//, '');
    if (this.isValidRoute(path)) {
      return path as RouteModule;
    }
    return null;
  }

  // Vérifier si une chaîne est une route valide
  private static isValidRoute(route: string): boolean {
    const validRoutes: RouteModule[] = [
      'dashboard', 'enrollment', 'students', 'classes', 
      'finance', 'academic', 'teachers', 'schedule', 'settings'
    ];
    return validRoutes.includes(route as RouteModule);
  }

  // Obtenir les breadcrumbs pour une route
  static getBreadcrumbs(route: RouteModule): Array<{ label: string; route?: RouteModule }> {
    const breadcrumbs: Record<RouteModule, Array<{ label: string; route?: RouteModule }>> = {
      dashboard: [{ label: 'Tableau de Bord' }],
      enrollment: [
        { label: 'Tableau de Bord', route: 'dashboard' },
        { label: 'Inscription' }
      ],
      students: [
        { label: 'Tableau de Bord', route: 'dashboard' },
        { label: 'Gestion des Élèves' }
      ],
      classes: [
        { label: 'Tableau de Bord', route: 'dashboard' },
        { label: 'Gestion des Classes' }
      ],
      finance: [
        { label: 'Tableau de Bord', route: 'dashboard' },
        { label: 'Gestion Financière' }
      ],
      academic: [
        { label: 'Tableau de Bord', route: 'dashboard' },
        { label: 'Gestion Académique' }
      ],
      teachers: [
        { label: 'Tableau de Bord', route: 'dashboard' },
        { label: 'Gestion des Enseignants' }
      ],
      schedule: [
        { label: 'Tableau de Bord', route: 'dashboard' },
        { label: 'Emploi du Temps' }
      ],
      settings: [
        { label: 'Tableau de Bord', route: 'dashboard' },
        { label: 'Paramètres' }
      ]
    };
    return breadcrumbs[route] || [{ label: 'Page Inconnue' }];
  }
}