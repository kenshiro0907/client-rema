
import React, { useState, useEffect } from 'react';

interface AddHouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (idSisiao: string) => 'success' | 'already_exists' | 'not_found';
}

const AddHouseholdModal: React.FC<AddHouseholdModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [idSisiao, setIdSisiao] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIdSisiao('');
      setMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdSisiao(e.target.value);
    if (message) {
      setMessage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idSisiao.trim()) return;

    const trimmedId = idSisiao.trim();
    const result = onAdd(trimmedId);

    switch (result) {
      case 'success':
        onClose();
        break;
      case 'already_exists':
        setMessage(`Ménage déjà ajouté dans la liste.`);
        break;
      case 'not_found':
        setMessage(`Ménage non trouvé.`);
        break;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm m-4 relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          aria-label="Fermer la fenêtre modale"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ajout d'un ménage rencontré</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="id-sisiao-input" className="block text-sm font-medium text-gray-700 mb-2">
            ID SISIAO
          </label>
          <input
            id="id-sisiao-input"
            type="text"
            value={idSisiao}
            onChange={handleInputChange}
            className="w-full border border-gray-400 rounded-md px-3 py-2 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
            placeholder="Entrez l'ID SISIAO"
            autoFocus
          />
          <div className="h-6 mt-1">
            {message && (
                <p className="text-sm text-red-600">{message}</p>
            )}
          </div>
          <button 
            type="submit"
            className="w-full mt-2 bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
            disabled={!idSisiao.trim()}
          >
            Valider
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHouseholdModal;
