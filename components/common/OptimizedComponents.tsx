import React from 'react';

// Composant de chargement optimisé
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = React.memo(({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-red-500 ${sizeClasses[size]}`}></div>
      <span className="ml-2 text-gray-600">Chargement...</span>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

// Composant d'erreur optimisé
export const ErrorMessage: React.FC<{ 
  message: string; 
  onRetry?: () => void;
  className?: string;
}> = React.memo(({ message, onRetry, className = '' }) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Erreur
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

// Composant de message de succès optimisé
export const SuccessMessage: React.FC<{ 
  message: string; 
  onClose?: () => void;
  className?: string;
}> = React.memo(({ message, onClose, className = '' }) => {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800">
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

SuccessMessage.displayName = 'SuccessMessage';

// Composant de placeholder optimisé
export const PlaceholderCard: React.FC<{ 
  title: string; 
  description?: string;
  className?: string;
}> = React.memo(({ title, description, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-300 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-2 mb-4">
        {title}
      </h3>
      <div className="text-center text-gray-500 py-8">
        <p>{description || 'Aucune donnée disponible pour le moment.'}</p>
        <p className="text-sm mt-2">Les données seront affichées ici une fois disponibles.</p>
      </div>
    </div>
  );
});

PlaceholderCard.displayName = 'PlaceholderCard';
