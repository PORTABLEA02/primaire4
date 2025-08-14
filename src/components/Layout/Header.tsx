import React from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';
import UserMenu from './UserMenu';
import SchoolSelector from './SchoolSelector';
import AcademicYearSelector from './AcademicYearSelector';
import SessionIndicator from './SessionIndicator';
import Breadcrumbs from './Breadcrumbs';
import { useAuth } from '../Auth/AuthProvider';
import { useRouter } from '../../contexts/RouterContext';
import { RouteUtils } from '../../utils/routeUtils';

interface HeaderProps {
  onToggleSidebar: () => void;
  isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isMobile }) => {
  const { user, userSchool, currentAcademicYear } = useAuth();
  const { currentRoute } = useRouter();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-800">
                {RouteUtils.getRouteTitle(currentRoute)}
              </h1>
              <p className="text-sm text-gray-600">
                {RouteUtils.getRouteDescription(currentRoute)}
              </p>
            </div>
            
            <div className="relative hidden sm:block lg:hidden">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Rechercher dans ${userSchool?.name || 'l\'école'}...`}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* School Selector */}
            <div className="hidden lg:block">
              <SchoolSelector />
            </div>

            {/* Year Selector */}
            <div className="hidden md:block">
              <AcademicYearSelector />
            </div>

            {/* Session Indicator */}
            <div className="hidden sm:block">
              <SessionIndicator />
            </div>
            
            {/* Mobile Search Button */}
            <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
      
      {/* Breadcrumbs */}
      <div className="px-4 sm:px-6 pb-4">
        <Breadcrumbs />
      </div>
    </header>
  );
};

export default Header;