import { useCallback } from 'react';
import { useUI } from '../contexts/AppContext';

export const useErrorHandler = () => {
  const { state, dispatch } = useUI();

  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;
    
    console.error('Application Error:', fullMessage, error);
    
    dispatch({ type: 'SET_ERROR', payload: fullMessage });
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError]);

  return {
    error: state.error,
    handleError,
    clearError,
    handleAsyncError,
  };
};
