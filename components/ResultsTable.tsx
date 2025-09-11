import React, { useState, useEffect } from 'react';
import { Household } from '../types';

const ITEMS_PER_PAGE = 10;

interface ResultsTableProps {
  households: Household[];
  onSelectHousehold: (id: string) => void;
  onOpenAddModal: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ households, onSelectHousehold, onOpenAddModal }) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [households]);

  const totalPages = Math.max(1, Math.ceil(households.length / ITEMS_PER_PAGE));
  const paginatedHouseholds = households.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const emptyRowsCount = households.length === 0 
    ? ITEMS_PER_PAGE 
    : Math.max(0, ITEMS_PER_PAGE - paginatedHouseholds.length);
  const emptyRows = Array.from({ length: emptyRowsCount });

  return (
    <div className="bg-rose-50 p-4 rounded-lg mt-6 border border-rose-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <span className="text-sm text-gray-600 font-medium">
          {households.length} ménage{households.length !== 1 ? 's' : ''} trouvé{households.length !== 1 ? 's' : ''}
        </span>
        <h2 className="text-xl font-semibold text-gray-700 order-first sm:order-none mx-auto">Liste de résultats</h2>
        <button 
          onClick={onOpenAddModal}
          className="bg-red-300 text-gray-900 font-semibold px-3 py-2 text-sm rounded-md hover:bg-red-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 whitespace-nowrap"
        >
          Ajout d'un ménage rencontré
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-rose-100">
              {['Nom', 'Prénom', 'ID SISIAO', 'Adresse', 'Code Postal', 'Secteur', 'Statut', 'Synthèse'].map(header => (
                <th key={header} className="border border-gray-300 p-2 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedHouseholds.map((household) => (
              <tr 
                key={household.id} 
                className="bg-white hover:bg-rose-50/50 transition-colors duration-150 cursor-pointer"
                onClick={() => onSelectHousehold(household.id)}
              >
                <td className="border border-gray-300 p-2 text-sm text-gray-800">{household.nom}</td>
                <td className="border border-gray-300 p-2 text-sm text-gray-800">{household.prenom}</td>
                <td className="border border-gray-300 p-2 text-sm text-gray-800">{household.idSisiao}</td>
                <td className="border border-gray-300 p-2 text-sm text-gray-800">{household.adresse}</td>
                <td className="border border-gray-300 p-2 text-sm text-gray-800">{household.codePostal}</td>
                <td className="border border-gray-300 p-2 text-sm text-gray-800 text-center">{household.secteur}</td>
                <td className="border border-gray-300 p-2 text-sm text-gray-800">{household.statut}</td>
                <td className="border border-gray-300 p-2 text-sm text-gray-800">{household.synthese}</td>
              </tr>
            ))}
            {emptyRows.map((_, index) => (
               <tr key={`empty-${index}`} className="bg-white h-[45px]">
                <td className="border border-gray-300" colSpan={8}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-end items-center mt-2 text-sm font-medium text-gray-600 gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            aria-label="Page précédente"
          >
            Précédent
          </button>
          <span>{currentPage} sur {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            aria-label="Page suivante"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;