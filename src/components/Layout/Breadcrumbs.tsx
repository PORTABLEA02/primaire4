import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useRouter } from '../../contexts/RouterContext';
import { RouteUtils } from '../../utils/routeUtils';

const Breadcrumbs: React.FC = () => {
  const { currentRoute, navigate } = useRouter();
  const breadcrumbs = RouteUtils.getBreadcrumbs(currentRoute);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Home className="h-4 w-4" />
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          {crumb.route ? (
            <button
              onClick={() => navigate(crumb.route!)}
              className="hover:text-blue-600 transition-colors"
            >
              {crumb.label}
            </button>
          ) : (
            <span className="text-gray-800 font-medium">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;