import { Household, HouseholdAPI } from '../types';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface HouseholdResponse {
  households: Household[];
  isUsingFallback: boolean;
  source: 'api' | 'fallback';
}

export class HouseholdService {
  private static baseUrl = '/api/rema';
  private static fallbackUrl = '/data';

  /**
   * Convertit les données API vers l'interface locale
   */
  private static mapAPIToLocal(apiHousehold: HouseholdAPI): Household {
    return {
      id: String(apiHousehold.id),
      nom: apiHousehold.nom,
      prenom: apiHousehold.prenom,
      idSisiao: String(apiHousehold.id), // L'API utilise id au lieu de idSisiao
      adresse: apiHousehold.ville, // L'API utilise ville au lieu de adresse
      codePostal: apiHousehold.cp, // L'API utilise cp au lieu de codePostal
      secteur: 0, // Pas dans l'API, valeur par défaut
      statut: this.mapStatut(apiHousehold.statut), // Conversion du statut numérique
      synthese: '', // Pas dans l'API, valeur par défaut
      compositionFamiliale: '', // Pas dans l'API, valeur par défaut
      members: [], // Pas dans l'API, valeur par défaut
      // Champs API supplémentaires
      naissance: apiHousehold.naissance,
      tel: apiHousehold.tel,
      alerte_personnelle: apiHousehold.alerte_personnelle,
      date_alerte: apiHousehold.date_alerte,
      date_mesure_veille: apiHousehold.date_mesure_veille,
      duree_veille: apiHousehold.duree_veille,
      mesure_veille: apiHousehold.mesure_veille,
      precision: apiHousehold.precision,
    };
  }

  /**
   * Convertit le statut numérique en statut textuel
   */
  private static mapStatut(statutNumber: number): "A rencontrer" | "Rencontré" | "Clôturé" {
    switch (statutNumber) {
      case 1:
        return "A rencontrer";
      case 2:
        return "Rencontré";
      case 3:
        return "Clôturé";
      default:
        return "A rencontrer";
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié en testant directement l'API des ménages
   */
  private static async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gère les erreurs de manière centralisée
   */
  private static handleError(error: any, operation: string): never {
    console.error(`Error in ${operation}:`, error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
    }
    
    if (error.message.includes('401')) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    
    if (error.message.includes('403')) {
      throw new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
    }
    
    if (error.message.includes('404')) {
      throw new Error('Ressource non trouvée.');
    }
    
    if (error.message.includes('500')) {
      throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
    }
    
    throw new Error(`Erreur lors de ${operation}: ${error.message}`);
  }

  /**
   * Récupère tous les ménages
   */
  static async fetchHouseholds(): Promise<HouseholdResponse> {
    try {
      // Tentative avec l'API principale
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Pour inclure les cookies d'authentification
      });
      
      if (!response.ok) {
        // Si 403, l'utilisateur n'est pas authentifié
        if (response.status === 403) {
          console.warn('Utilisateur non authentifié (403), utilisation du fallback local');
          const fallbackData = await this.fetchFallbackData();
          return {
            households: fallbackData,
            isUsingFallback: true,
            source: 'fallback'
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiData: HouseholdAPI[] = await response.json();
      console.info('Données API chargées avec succès');
      
      // Convertir les données API vers l'interface locale
      const households: Household[] = apiData.map(apiHousehold => this.mapAPIToLocal(apiHousehold));
      
      return {
        households,
        isUsingFallback: false,
        source: 'api'
      };
    } catch (error) {
      // Fallback vers les données locales en cas d'erreur
      console.warn('API principale indisponible, utilisation du fallback local:', error);
      const fallbackData = await this.fetchFallbackData();
      return {
        households: fallbackData,
        isUsingFallback: true,
        source: 'fallback'
      };
    }
  }

  /**
   * Récupère les données de fallback
   */
  private static async fetchFallbackData(): Promise<Household[]> {
    try {
      const fallbackResponse = await fetch(`${this.fallbackUrl}/households.json`);
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback error! status: ${fallbackResponse.status}`);
      }
      
      const fallbackData: Household[] = await fallbackResponse.json();
      console.info('Données de fallback chargées avec succès');
      return fallbackData;
    } catch (fallbackError) {
      this.handleError(fallbackError, 'récupération des ménages (fallback)');
    }
  }

  /**
   * Met à jour un ménage
   */
  static async updateHousehold(id: string, updates: Partial<Household>): Promise<Household> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedHousehold: Household = await response.json();
      return updatedHousehold;
    } catch (error) {
      this.handleError(error, 'mise à jour du ménage');
    }
  }

  /**
   * Ajoute un nouveau ménage
   */
  static async addHousehold(household: Omit<Household, 'id'>): Promise<Household> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(household),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newHousehold: Household = await response.json();
      return newHousehold;
    } catch (error) {
      this.handleError(error, 'ajout du ménage');
    }
  }

  /**
   * Supprime un ménage
   */
  static async deleteHousehold(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      this.handleError(error, 'suppression du ménage');
    }
  }

  /**
   * Recherche des ménages par critères
   */
  static async searchHouseholds(filters: Record<string, string>): Promise<Household[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${this.baseUrl}/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const households: Household[] = await response.json();
      return households;
    } catch (error) {
      this.handleError(error, 'recherche des ménages');
    }
  }
}
