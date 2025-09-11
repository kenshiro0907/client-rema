import React, { useState, useEffect } from 'react';
import { Household, ContactData, MaterialPrestation } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContactData) => void;
  household: Household | null;
}

const defaultContactData: ContactData = {
  contactType: 'avec_echange',
  sansEchangeMotifs: [],
  avecEchangeMotifs: ['Ecoute, soutien', 'Transport'],
  prestationType: 'materielle',
  prestationsMat: {
    duvet: 1,
    kit: 0,
    vetement: 0,
  },
  commentaire: 'Monsieur et Madame sont bien a la localisation indiqué',
};

const StepperInput: React.FC<{ label: string; value: number; onChange: (newValue: number) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between w-full">
    <span className="text-gray-800 font-medium">{label}</span>
    <div className="flex items-center gap-2 border border-gray-300 rounded-md p-1">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-200 rounded-sm transition-colors">-</button>
      <span className="w-8 text-center font-semibold">{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-200 rounded-sm transition-colors">+</button>
    </div>
  </div>
);

const SelectableButton: React.FC<{ label: string; isSelected: boolean; onClick: () => void; className?: string }> = ({ label, isSelected, onClick, className = '' }) => {
  const baseClasses = 'px-3 py-2 text-sm rounded-md font-semibold border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500';
  const selectedClasses = 'bg-blue-900 text-white border-blue-900';
  const unselectedClasses = 'bg-white text-gray-800 border-gray-400 hover:bg-gray-100';
  return (
    <button onClick={onClick} className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses} ${className}`}>
      {label}
    </button>
  );
};

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSave, household }) => {
  const [formData, setFormData] = useState<ContactData>(defaultContactData);

  useEffect(() => {
    if (isOpen) {
      setFormData(defaultContactData);
    }
  }, [isOpen]);

  if (!isOpen || !household) {
    return null;
  }

  const handleSave = () => {
    onSave(formData);
  };

  const handleSelectMotif = (motif: string, type: 'sans' | 'avec') => {
    const key = type === 'sans' ? 'sansEchangeMotifs' : 'avecEchangeMotifs';
    const currentMotifs = formData[key];
    const newMotifs = currentMotifs.includes(motif)
      ? currentMotifs.filter(m => m !== motif)
      : [...currentMotifs, motif];
    setFormData(prev => ({ ...prev, [key]: newMotifs }));
  };

  const handleStepperChange = (item: keyof MaterialPrestation, value: number) => {
    setFormData(prev => ({
        ...prev,
        prestationsMat: {
            ...prev.prestationsMat,
            [item]: value,
        }
    }));
  };
  
  const sansEchangeMotifs = ['Contact non réalisé', 'Endormie', 'Non trouvé', 'Refus de l\'usager', 'Repérer, prospecter'];
  const avecEchangeMotifs = [
    'Accueil de jour', 'Autre', 'Douche', 'Ecoute, soutien', 'Evaluation sanitaire', 
    'Evaluation sociale', 'Point accueil', 'Service', 'Soin', 'Suivi social', 'Transport', 'Vestiaire'
  ];
  const prestationMap = { 'Denrées et bons': 'denrees', 'Prestation matérielle': 'materielle', 'Boisson': 'boisson' } as const;
  const prestationCategories: (keyof typeof prestationMap)[] = ['Denrées et bons', 'Prestation matérielle', 'Boisson'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-rose-100 rounded-lg shadow-xl w-full max-w-4xl border border-rose-300" onClick={e => e.stopPropagation()}>
        <div className="p-4 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 text-lg">{household.prenom} {household.nom} - ID {household.idSisiao}</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-3xl font-light" aria-label="Fermer">&times;</button>
        </div>

        <div className="p-4 pt-0 space-y-4">
            <div className="flex justify-center gap-1">
                <button 
                    onClick={() => setFormData(p => ({...p, contactType: 'sans_echange'}))}
                    className={`px-4 py-2 text-base font-semibold border-2 rounded-l-md ${formData.contactType === 'sans_echange' ? 'bg-gray-300 border-gray-500 z-10' : 'bg-gray-100 border-gray-300'}`}
                >
                    Contact sans échange
                </button>
                 <button 
                    onClick={() => setFormData(p => ({...p, contactType: 'avec_echange'}))}
                    className={`px-4 py-2 text-base font-semibold border-y-2 border-r-2 -ml-0.5 rounded-r-md ${formData.contactType === 'avec_echange' ? 'bg-gray-300 border-gray-500 z-10' : 'bg-gray-100 border-gray-300'}`}
                >
                    Contact avec échange
                </button>
            </div>

            <div className="bg-white p-4 border border-gray-300 rounded-md min-h-[300px]">
                {formData.contactType === 'sans_echange' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {sansEchangeMotifs.map(motif => (
                            <SelectableButton key={motif} label={motif} isSelected={formData.sansEchangeMotifs.includes(motif)} onClick={() => handleSelectMotif(motif, 'sans')} />
                        ))}
                    </div>
                )}
                 {formData.contactType === 'avec_echange' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                             {avecEchangeMotifs.map(motif => (
                                <SelectableButton key={motif} label={motif} isSelected={formData.avecEchangeMotifs.includes(motif)} onClick={() => handleSelectMotif(motif, 'avec')} />
                            ))}
                        </div>
                        <div className="border-t border-gray-300 pt-4 space-y-3">
                            <div className="flex justify-center gap-2">
                               {prestationCategories.map(catName => (
                                   <SelectableButton 
                                      key={catName} 
                                      label={catName} 
                                      isSelected={formData.prestationType === prestationMap[catName]} 
                                      onClick={() => {
                                        const value = prestationMap[catName];
                                        if (value === 'denrees' || value === 'materielle' || value === 'boisson') {
                                           setFormData(p => ({...p, prestationType: value}));
                                        }
                                      }}
                                      className="capitalize" 
                                    />
                               ))}
                            </div>
                            {formData.prestationType === 'materielle' && (
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md max-w-sm mx-auto space-y-3">
                                    <StepperInput label="Duvet" value={formData.prestationsMat.duvet} onChange={(v) => handleStepperChange('duvet', v)} />
                                    <StepperInput label="Kit" value={formData.prestationsMat.kit} onChange={(v) => handleStepperChange('kit', v)} />
                                    <StepperInput label="Vetement" value={formData.prestationsMat.vetement} onChange={(v) => handleStepperChange('vetement', v)} />
                                </div>
                            )}
                            {(formData.prestationType === 'denrees' || formData.prestationType === 'boisson') && (
                                <div className="p-3 text-center text-gray-500">Contenu non spécifié pour cette catégorie.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="contact-comment" className="text-sm font-medium text-gray-700 block mb-1">Commentaire</label>
                <textarea 
                    id="contact-comment"
                    rows={3}
                    value={formData.commentaire}
                    onChange={(e) => setFormData(p => ({...p, commentaire: e.target.value}))}
                    className="w-full border border-gray-400 rounded-md p-2 text-sm shadow-inner bg-white text-gray-900"
                />
            </div>
        </div>

        <footer className="flex justify-end p-3 bg-gray-200/70 rounded-b-lg border-t border-gray-300">
            <button onClick={onClose} className="px-6 py-2 rounded-md text-gray-800 font-semibold border border-gray-400 bg-white hover:bg-gray-100 transition mr-3 shadow-sm">
                Annuler
            </button>
            <button onClick={handleSave} className="px-6 py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition shadow-sm">
                Enregistrer
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ContactModal;