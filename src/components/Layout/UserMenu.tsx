import React, { useState } from 'react';
import { User, LogOut, Settings, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { useRouter } from '../../contexts/RouterContext';
import { useSessionSecurity } from '../../hooks/useSessionSecurity';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userSchool, logout } = useAuth();
  const { navigate } = useRouter();
  const { lastActivity, config } = useSessionSecurity();

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  const handleNavigateToSettings = () => {
    navigate('settings');
    setIsOpen(false);
  };
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-700';
      case 'Directeur': return 'bg-purple-100 text-purple-700';
      case 'Secrétaire': return 'bg-blue-100 text-blue-700';
      case 'Enseignant': return 'bg-green-100 text-green-700';
      case 'Comptable': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTimeSinceActivity = (): string => {
    if (!lastActivity) return 'Inconnue';
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Maintenant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}m`;
    return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
  };
  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-sm font-medium text-gray-800">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
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
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400">{userSchool?.name}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              
              {/* Session Info */}
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Dernière activité:</span>
                  <span>{getTimeSinceActivity()}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Timeout session:</span>
                  <span>{config.maxInactivityTime}min</span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Mon Profil</span>
              </button>
              
              <button className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3">
                onClick={handleNavigateToSettings}
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Paramètres</span>
              </button>
              
              <button className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Sécurité</span>
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200 py-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left hover:bg-red-50 transition-colors flex items-center space-x-3 text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Se Déconnecter</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;