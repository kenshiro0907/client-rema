import { useCallback, useEffect } from 'react';
import { User } from '../types';
import { useAuth as useAuthContext, useUI } from '../contexts/AppContext';
import { AuthService } from '../services/authService';

export const useAuth = () => {
  const { userId, isAuthenticated, login, logout: contextLogout } = useAuthContext();
  const { setLogoutMessage, logoutMessage } = useUI();

  /**
   * Connecte un utilisateur
   */
  const handleLogin = useCallback(async (credentials: { username: string; password: string }) => {
    try {
      const response = await AuthService.login(credentials);
      
      if (response.success && response.user_id) {
        const userId = String(response.user_id); // S'assurer que c'est une chaîne
        login(userId);
        console.log('User ID stocké:', userId);
        return { success: true, userId };
      } else {
        return { success: false, message: response.message || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur de connexion' 
      };
    }
  }, [login]);

  /**
   * Déconnecte l'utilisateur de manière complète
   */
  const handleLogout = useCallback(async () => {
    try {
      console.log('🚪 Début du processus de logout...');
      
      // 1. Tentative de logout serveur
      const logoutResult = await AuthService.logout();
      console.log('📡 Résultat logout serveur:', logoutResult);
      
      // 2. Affichage du message de résultat
      setLogoutMessage('✅ Déconnexion en cours...');

      // 3. Nettoyage du contexte
      contextLogout();
      console.log('🧹 Contexte nettoyé');

      // 4. Redirection immédiate
      setTimeout(() => {
        console.log('🔄 Redirection...');
        setLogoutMessage(null);
        window.location.replace('/');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erreur lors du logout:', error);
      
      // En cas d'erreur, forcer la déconnexion
      setLogoutMessage('❌ Déconnexion forcée...');
      contextLogout();
      
      setTimeout(() => {
        setLogoutMessage(null);
        window.location.replace('/');
      }, 500);
    }
  }, [contextLogout, setLogoutMessage]);

  /**
   * Vérifie l'authentification au chargement de l'app
   */
  const checkAuth = useCallback(async () => {
    try {
      // Ne pas vérifier l'auth si on est déjà en cours de logout
      if (logoutMessage) {
        console.log('Auth check ignoré: logout en cours');
        return;
      }

      const isAuth = await AuthService.checkAuth();
      if (isAuth && !userId) {
        // L'utilisateur est authentifié mais on n'a pas son user_id
        // On utilise un placeholder seulement si on n'a pas déjà un user_id
        login('authenticated_user');
        console.log('Auth check: utilisateur authentifié sans user_id, placeholder utilisé');
      } else if (!isAuth && userId) {
        // L'utilisateur n'est plus authentifié côté serveur
        console.log('Auth check: session expirée, déconnexion locale');
        contextLogout();
        AuthService.clearLocalStorage();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // En cas d'erreur, considérer comme non authentifié
      if (userId) {
        console.log('Auth check: erreur, déconnexion locale');
        contextLogout();
        AuthService.clearLocalStorage();
      }
    }
  }, [login, userId, logoutMessage, contextLogout]);

  /**
   * Vérifie l'authentification au montage
   */
  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  return {
    userId,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    checkAuth,
  };
};
