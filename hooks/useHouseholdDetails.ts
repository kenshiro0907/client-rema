import { useState, useCallback, useEffect } from 'react';
import { HouseholdDetailsAPI } from '../types';
import { HouseholdService } from '../services/householdService';

export const useHouseholdDetails = () => {
  const [householdDetails, setHouseholdDetails] = useState<HouseholdDetailsAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère les détails d'un ménage
   */
  const fetchHouseholdDetails = useCallback(async (householdId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const details = await HouseholdService.fetchHouseholdDetails(householdId);
      setHouseholdDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des détails');
      setHouseholdDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Nettoie les détails du ménage
   */
  const clearHouseholdDetails = useCallback(() => {
    setHouseholdDetails(null);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * Formate la composition familiale pour l'affichage
   */
  const formatCompositionFamiliale = useCallback((compositionFamiliale: [string, number][]) => {
    if (!compositionFamiliale || compositionFamiliale.length === 0) {
      return 'Non renseignée';
    }

    const compositionMap: { [key: string]: string } = {
      'Hs': 'Homme seul',
      'Fs': 'Femme seule',
      'C': 'Couple',
      'Ce': 'Couple avec enfant(s)',
      'Cs': 'Couple sans enfant',
      'F': 'Famille monoparentale',
      'G': 'Groupe'
    };

    const formatted = compositionFamiliale
      .map(([type, count]) => {
        const typeName = compositionMap[type] || type;
        return count > 1 ? `${typeName} (${count})` : typeName;
      })
      .join(', ');

    return formatted;
  }, []);

  /**
   * Formate les demandes de prestation pour l'affichage
   */
  const formatDemandesPrestation = useCallback((demandes: any[]) => {
    if (!demandes || demandes.length === 0) {
      return 'Aucune demande';
    }

    const statutMap: { [key: number]: string } = {
      1: 'En attente',
      2: 'En cours',
      3: 'Terminée',
      4: 'Annulée'
    };

    const typePrestationMap: { [key: number]: string } = {
      1: 'Alimentaire',
      2: 'Matérielle',
      3: 'Hébergement',
      4: 'Vestimentaire'
    };

    return demandes
      .map(demande => {
        const statut = statutMap[demande.statut] || `Statut ${demande.statut}`;
        const type = typePrestationMap[demande.type_prestation] || `Type ${demande.type_prestation}`;
        return `${type} - ${statut}`;
      })
      .join(', ');
  }, []);

  return {
    householdDetails,
    isLoading,
    error,
    fetchHouseholdDetails,
    clearHouseholdDetails,
    formatCompositionFamiliale,
    formatDemandesPrestation,
  };
};
