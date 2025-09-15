import { useEffect, useCallback, useMemo, useState } from 'react';
import { Household } from '../types';
import { useHouseholds as useHouseholdsContext, useFilters } from '../contexts/AppContext';
import { HouseholdService } from '../services/householdService';

export const useHouseholds = () => {
  const {
    allHouseholds,
    displayedHouseholds,
    selectedHouseholdId,
    selectedHousehold,
    setHouseholds,
    setDisplayedHouseholds,
    updateHousehold,
    setSelectedHousehold,
  } = useHouseholdsContext();

  const { filters } = useFilters();
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  /**
   * Charge tous les ménages depuis l'API
   */
  const fetchHouseholds = useCallback(async () => {
    try {
      const response = await HouseholdService.fetchHouseholds();
      console.log('Données ménages reçues:', response.households);
      if (response.households.length > 0) {
        console.log('Premier ménage:', response.households[0]);
        console.log('Type de statut:', typeof response.households[0].statut);
        console.log('Valeur de statut:', response.households[0].statut);
      }
      setHouseholds(response.households);
      // Afficher automatiquement tous les ménages chargés
      setDisplayedHouseholds(response.households);
      setIsUsingFallback(response.isUsingFallback);
    } catch (error) {
      console.error('Failed to fetch households:', error);
      setIsUsingFallback(true);
      throw error;
    }
  }, [setHouseholds, setDisplayedHouseholds]);

  /**
   * Met à jour un ménage
   */
  const handleUpdateHousehold = useCallback(async (
    householdId: string,
    updates: Partial<Household>
  ) => {
    try {
      // Mise à jour optimiste dans le state local
      updateHousehold(householdId, updates);
      
      // Mise à jour sur le serveur (optionnel pour l'instant)
      // await HouseholdService.updateHousehold(householdId, updates);
    } catch (error) {
      console.error('Failed to update household:', error);
      throw error;
    }
  }, [updateHousehold]);

  /**
   * Ajoute un ménage à la liste affichée
   */
  const addHouseholdToDisplay = useCallback((idSisiao: string): 'success' | 'already_exists' | 'not_found' => {
    const householdToAdd = allHouseholds.find((h) => h.idSisiao === idSisiao);

    if (householdToAdd) {
      if (!displayedHouseholds.some((h) => h.id === householdToAdd.id)) {
        setDisplayedHouseholds([householdToAdd, ...displayedHouseholds]);
        return 'success';
      } else {
        return 'already_exists';
      }
    } else {
      return 'not_found';
    }
  }, [allHouseholds, displayedHouseholds, setDisplayedHouseholds]);

  /**
   * Recharge automatiquement tous les ménages depuis l'API
   */
  const refreshHouseholds = useCallback(async () => {
    try {
      await fetchHouseholds();
    } catch (error) {
      console.error('Failed to refresh households:', error);
    }
  }, [fetchHouseholds]);

  /**
   * Filtre les ménages affichés selon les critères
   */
  const filteredHouseholds = useMemo(() => {
    return displayedHouseholds.filter((household) => {
      return (
        String(household.nom || '').toLowerCase().includes(filters.nom.toLowerCase()) &&
        String(household.prenom || '').toLowerCase().includes(filters.prenom.toLowerCase()) &&
        String(household.idSisiao || '').toLowerCase().includes(filters.idSisiao.toLowerCase()) &&
        String(household.adresse || '').toLowerCase().includes(filters.adresse.toLowerCase()) &&
        String(household.codePostal || '').toLowerCase().includes(filters.codePostal.toLowerCase()) &&
        String(household.secteur || '').toLowerCase().includes(filters.secteur.toLowerCase()) &&
        String(household.statut || '').toLowerCase().includes(filters.statut.toLowerCase())
      );
    });
  }, [displayedHouseholds, filters]);

  /**
   * Charge les ménages au montage du composant et rafraîchit automatiquement
   */
  useEffect(() => {
    if (allHouseholds.length === 0) {
      fetchHouseholds();
    }
  }, [allHouseholds.length, fetchHouseholds]);

  /**
   * Rafraîchissement automatique périodique (toutes les 5 minutes)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      refreshHouseholds();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshHouseholds]);

  /**
   * S'assure que tous les ménages sont toujours affichés
   */
  useEffect(() => {
    if (allHouseholds.length > 0 && displayedHouseholds.length !== allHouseholds.length) {
      setDisplayedHouseholds(allHouseholds);
    }
  }, [allHouseholds, displayedHouseholds.length, setDisplayedHouseholds]);

  return {
    // Data
    allHouseholds,
    displayedHouseholds,
    filteredHouseholds,
    selectedHouseholdId,
    selectedHousehold,
    isUsingFallback,
    
    // Actions
    fetchHouseholds,
    handleUpdateHousehold,
    addHouseholdToDisplay,
    setSelectedHousehold,
    setDisplayedHouseholds,
  };
};
