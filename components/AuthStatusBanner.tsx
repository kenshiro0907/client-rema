import React from 'react';

interface AuthStatusBannerProps {
  isAuthenticated: boolean;
  isUsingFallback: boolean;
}

const AuthStatusBanner: React.FC<AuthStatusBannerProps> = ({ isAuthenticated, isUsingFallback }) => {
  if (isAuthenticated && !isUsingFallback) {
    return null; // Pas de bannière si tout est normal
  }

  return (
    <div className={`p-3 mb-4 rounded-md border-l-4 ${
      isAuthenticated 
        ? 'bg-blue-50 border-blue-400 text-blue-700' 
        : 'bg-yellow-50 border-yellow-400 text-yellow-700'
    }`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {isAuthenticated ? (
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {isAuthenticated ? (
              'Mode déconnecté'
            ) : (
              'Mode démonstration'
            )}
          </p>
          <p className="text-sm mt-1">
            {isAuthenticated ? (
              'Vous êtes connecté mais les données proviennent du cache local. Certaines fonctionnalités peuvent être limitées.'
            ) : (
              'Vous n\'êtes pas connecté. Les données affichées sont des exemples locaux. Connectez-vous pour accéder aux données en temps réel.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthStatusBanner;
