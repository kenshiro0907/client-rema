import { AuthSecurity } from '../security/authSecurity';
import { DataProtection } from '../security/dataProtection';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user_id: string | number;
  success?: boolean;
  message?: string;
}

export class AuthService {
  private static baseUrl = '/api/auth';

  /**
   * Authentifie un utilisateur
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Validation des entrées
      if (!AuthSecurity.validateEmail(credentials.username)) {
        throw new Error('Format d\'email invalide');
      }

     /* const passwordValidation = AuthSecurity.validatePassword(credentials.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }*/

      // Vérification du rate limiting
      const rateLimitCheck = AuthSecurity.checkLoginAttempts(credentials.username);
      if (!rateLimitCheck.canAttempt) {
        const remainingMinutes = Math.ceil((rateLimitCheck.remainingTime || 0) / 60000);
        throw new Error(`Trop de tentatives. Réessayez dans ${remainingMinutes} minutes.`);
      }

      // Enregistrement de la tentative
      AuthSecurity.recordLoginAttempt(credentials.username);

      const response = await fetch(`${this.baseUrl}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // Protection CSRF basique
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      // Response status and headers logged for debugging if needed
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login error response:', errorData);
        throw new Error(errorData.message || 'Erreur de connexion');
      }

      // Parse response JSON
      const responseText = await response.text();
      
      // Parser le JSON
      let data: LoginResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Réponse serveur invalide');
      }
      
      // Réinitialiser les tentatives en cas de succès
      // Si success n'est pas défini mais qu'on a un user_id, considérer comme succès
      const isSuccess = data.success !== false && !!data.user_id;
      if (isSuccess) {
        AuthSecurity.resetLoginAttempts(credentials.username);
      }
      
      // Retourner la réponse avec success défini
      return {
        user_id: data.user_id,
        success: isSuccess,
        message: data.message
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur de connexion');
    }
  }

  /**
   * Déconnecte l'utilisateur de manière complète
   */
  static async logout(): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Tentative de logout serveur
      const response = await fetch(`${this.baseUrl}/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
      });
      
      // 2. Nettoyage local immédiat (peu importe la réponse serveur)
      this.clearLocalStorage();
      
      // 3. Suppression manuelle des cookies côté client
      this.clearAllCookies();
      
      if (response.ok) {
        return { success: true, message: 'Déconnexion réussie.' };
      } else {
        return { success: true, message: 'Déconnexion locale effectuée.' };
      }
    } catch (error) {
      console.warn('Erreur lors du logout:', error);
      // Même en cas d'erreur, nettoyer localement
      this.clearLocalStorage();
      this.clearAllCookies();
      return { success: true, message: 'Déconnexion locale effectuée.' };
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   * Retourne true si authentifié, false sinon
   */
  static async checkAuth(): Promise<boolean> {
    try {
      // Vérifier l'authentification en testant l'API des ménages
      const response = await fetch('/api/rema/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        return true;
      } else if (response.status === 403) {
        return false;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }



  /**
   * Nettoie le stockage local de manière sécurisée
   */
  static clearLocalStorage(): void {
    // Nettoyage sécurisé des données sensibles
    DataProtection.clearAllSecureData();
    
    // Nettoyage standard
    localStorage.clear();
    sessionStorage.clear();
  }

  /**
   * Supprime tous les cookies de manière simple
   */
  static clearAllCookies(): void {
    try {
      const cookies = document.cookie.split(';');
      
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        if (name) {
          // Supprimer le cookie avec différents chemins et domaines
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
        }
      });
      
             // Cookies supprimés
    } catch (error) {
      console.warn('Erreur lors de la suppression des cookies:', error);
    }
  }
}
