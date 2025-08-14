import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../components/Auth/AuthProvider';

export type RouteModule = 
  | 'dashboard' 
  | 'enrollment' 
  | 'students' 
  | 'classes' 
  | 'finance' 
  | 'academic' 
  | 'teachers' 
  | 'schedule' 
  | 'settings';

interface RouterContextType {
  currentRoute: RouteModule;
  navigate: (route: RouteModule) => void;
  canAccess: (route: RouteModule) => boolean;
  routeHistory: RouteModule[];
  goBack: () => void;
  isValidRoute: (route: string) => boolean;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

interface RouterProviderProps {
  children: React.ReactNode;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({ children }) => {
  const { hasPermission, isAuthenticated } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<RouteModule>('dashboard');
  const [routeHistory, setRouteHistory] = useState<RouteModule[]>(['dashboard']);

  // Définition des permissions requises pour chaque route
  const routePermissions: Record<RouteModule, string | null> = {
    dashboard: null, // Accessible à tous les utilisateurs connectés
    enrollment: 'students',
    students: 'students',
    classes: 'classes',
    finance: 'finance',
    academic: 'academic',
    teachers: 'teachers',
    schedule: 'schedule',
    settings: 'settings'
  };

  // Charger la route depuis l'URL ou localStorage au démarrage
  useEffect(() => {
    if (isAuthenticated) {
      const savedRoute = localStorage.getItem('ecoletech_current_route');
      if (savedRoute && isValidRoute(savedRoute) && canAccess(savedRoute as RouteModule)) {
        setCurrentRoute(savedRoute as RouteModule);
      }
    }
  }, [isAuthenticated]);

  // Sauvegarder la route actuelle
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('ecoletech_current_route', currentRoute);
    }
  }, [currentRoute, isAuthenticated]);

  const isValidRoute = (route: string): boolean => {
    return Object.keys(routePermissions).includes(route);
  };

  const canAccess = (route: RouteModule): boolean => {
    if (!isAuthenticated) return false;
    
    const requiredPermission = routePermissions[route];
    if (!requiredPermission) return true; // Route accessible à tous
    
    return hasPermission(requiredPermission);
  };

  const navigate = (route: RouteModule) => {
    if (!canAccess(route)) {
      console.warn(`Accès refusé à la route: ${route}`);
      return;
    }

    // Ajouter à l'historique si différent de la route actuelle
    if (route !== currentRoute) {
      setRouteHistory(prev => {
        const newHistory = [...prev, route];
        // Limiter l'historique à 10 entrées
        return newHistory.slice(-10);
      });
    }

    setCurrentRoute(route);
  };

  const goBack = () => {
    if (routeHistory.length > 1) {
      const newHistory = [...routeHistory];
      newHistory.pop(); // Retirer la route actuelle
      const previousRoute = newHistory[newHistory.length - 1];
      
      if (canAccess(previousRoute)) {
        setRouteHistory(newHistory);
        setCurrentRoute(previousRoute);
      }
    }
  };

  const value: RouterContextType = {
    currentRoute,
    navigate,
    canAccess,
    routeHistory,
    goBack,
    isValidRoute
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};