import React from 'react';
import { 
  Home, 
  Users, 
  UserPlus,
  GraduationCap, 
  DollarSign, 
  BookOpen, 
  UserCheck, 
  Settings,
  ChevronLeft,
  School,
  Calendar
} from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { useRouter, RouteModule } from '../../contexts/RouterContext';

interface SidebarProps {
  activeModule: RouteModule;
  onModuleChange: (module: RouteModule) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobile: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: Home },
  { id: 'enrollment', label: 'Inscription', icon: UserPlus },
  { id: 'students', label: 'Élèves', icon: Users },
  { id: 'classes', label: 'Classes & Niveaux', icon: GraduationCap },
  { id: 'finance', label: 'Gestion Financière', icon: DollarSign },
  { id: 'academic', label: 'Académique', icon: BookOpen },
  { id: 'teachers', label: 'Enseignants', icon: UserCheck },
  { id: 'schedule', label: 'Emploi du Temps', icon: Calendar },
  { id: 'settings', label: 'Paramètres', icon: Settings },
] as const;

const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onModuleChange,
  collapsed,
  onToggleCollapse,
  isMobile
}) => {
  const { user, userSchool, currentAcademicYear } = useAuth();
  const { canAccess } = useRouter();

  // Filtrer les éléments du menu selon les permissions
  const filteredMenuItems = menuItems.filter(item => {
    return canAccess(item.id as RouteModule);
  });

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-30 ${
      isMobile 
        ? collapsed 
          ? '-translate-x-full w-64' 
          : 'translate-x-0 w-64'
        : collapsed 
          ? 'w-16' 
          : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {(!collapsed || isMobile) && (
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <School className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-800">
                {userSchool?.name.split(' ')[0] || 'EcoleTech'}
              </h1>
              <p className="text-xs text-gray-500">
                Année {currentAcademicYear?.name || '2024-2025'}
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <ChevronLeft 
            className={`h-5 w-5 text-gray-600 transition-transform ${
              (collapsed && !isMobile) ? 'rotate-180' : ''
            }`} 
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id as RouteModule;
          
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id as RouteModule)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                isActive ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-600' : 'text-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'} ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`} />
              {(!collapsed || isMobile) && (
                <span className={`font-medium ${isActive ? 'text-blue-600' : ''}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User info in collapsed mode */}
      {collapsed && !isMobile && user && (
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xs font-medium">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">{user.role}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;