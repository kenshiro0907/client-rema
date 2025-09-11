
import React from 'react';
import FilterInput from './FilterInput';

interface SearchFiltersProps {
  filters: {
    nom: string;
    prenom: string;
    idSisiao: string;
    adresse: string;
    codePostal: string;
    secteur: string;
    statut: string;
    mesure: string;
    equipe: string;
  };
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Filtres de recherche</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
        <FilterInput label="Nom" name="nom" value={filters.nom} onChange={onFilterChange} />
        <FilterInput label="Prénom" name="prenom" value={filters.prenom} onChange={onFilterChange} />
        <FilterInput label="ID SISIAO" name="idSisiao" value={filters.idSisiao} onChange={onFilterChange} />
        <FilterInput label="Adresse" name="adresse" value={filters.adresse} onChange={onFilterChange} className="lg:col-span-2" />
        <FilterInput label="Code Postal" name="codePostal" value={filters.codePostal} onChange={onFilterChange} />
        <FilterInput label="Secteur" name="secteur" value={filters.secteur} onChange={onFilterChange} />
        <FilterInput label="Statut" name="statut" value={filters.statut} onChange={onFilterChange} />
        <FilterInput label="Mesure" name="mesure" value={filters.mesure} onChange={onFilterChange} />
        <FilterInput label="Equipe" name="equipe" value={filters.equipe} onChange={onFilterChange} />
      </div>
    </div>
  );
};

export default SearchFilters;
