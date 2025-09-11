import React, { useState, useEffect } from 'react';
import { Household, ClotureMotif } from '../types';

interface ClotureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (motif: ClotureMotif) => void;
  household: Household | null;
}

const clotureMotifs: ClotureMotif[] = ["Ménage plus en demande", "Ménage hébergé/hospitalisé"];

const ClotureModal: React.FC<ClotureModalProps> = ({ isOpen, onClose, onSave, household }) => {
  const [selectedMotif, setSelectedMotif] = useState<ClotureMotif>(clotureMotifs[0]);

  useEffect(() => {
    if (isOpen) {
      setSelectedMotif(clotureMotifs[0]);
    }
  }, [isOpen]);

  if (!isOpen || !household) {
    return null;
  }

  const handleSave = () => {
    onSave(selectedMotif);
  };

  const InfoLine: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <p><span className="font-semibold">{label}</span> {value || 'N/A'}</p>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative border border-gray-300" onClick={e => e.stopPropagation()}>
        <div className="p-5">
            <h2 className="text-xl font-bold text-gray-800 text-center">Cloture de la demande</h2>
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-3xl font-light" aria-label="Fermer">&times;</button>
        </div>
        
        <div className="p-6 pt-2 space-y-6">
            <div className="text-center text-gray-700 space-y-1">
                <p className="font-semibold">{household.prenom} {household.nom} - ID {household.idSisiao}</p>
                <InfoLine label="Demande n°" value={household.demande?.idDemande} />
                <InfoLine label="Date :" value={household.demande?.date} />
                <InfoLine label="Statut :" value={household.statut} />
            </div>

            <div className="space-y-2">
                <label htmlFor="cloture-motif" className="block text-md font-semibold text-gray-700 text-center">
                    Motif de cloture
                </label>
                <select
                    id="cloture-motif"
                    value={selectedMotif}
                    onChange={(e) => setSelectedMotif(e.target.value as ClotureMotif)}
                    className="w-full border border-gray-400 rounded-md px-3 py-2 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition appearance-none text-center"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                >
                    {clotureMotifs.map(motif => (
                        <option key={motif} value={motif}>{motif}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="px-6 py-4 flex justify-center">
             <button onClick={handleSave} className="px-8 py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition shadow-sm">
                Valider
            </button>
        </div>
      </div>
    </div>
  );
};

export default ClotureModal;
