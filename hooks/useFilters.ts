import { useCallback } from 'react';
import { useFilters as useFiltersContext } from '../contexts/AppContext';

export const useFilters = () => {
  const { filters, setFilters, updateFilter } = useFiltersContext();

  /**
   * Met à jour un filtre spécifique
   */
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFilter(name, value);
  }, [updateFilter]);

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = useCallback(() => {
    setFilters({
      nom: '',
      prenom: '',
      idSisiao: '',
      adresse: '',
      codePostal: '',
      secteur: '',
      statut: '',
      mesure: '',
      equipe: '',
    });
  }, [setFilters]);

  /**
   * Met à jour plusieurs filtres en une fois
   */
  const updateMultipleFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
  }, [setFilters]);

  return {
    filters,
    handleFilterChange,
    resetFilters,
    updateMultipleFilters,
    updateFilter,
  };
};
