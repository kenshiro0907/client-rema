import React, { useState, useEffect, useRef } from 'react';
import { EncounterData, SignalementInfo } from '../types';

declare var L: any;

interface HouseholdEncounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EncounterData) => void;
}

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};


const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
        return null;
    } catch (e) {
        console.error(`Geocoding error:`, e);
        return null;
    }
};

const defaultEncounterData: EncounterData = {
  address: '15 Rue de la Solidarité',
  postalCode: '93100',
  city: 'Montreuil',
  locationComment: 'M. est dans une voiture garée en face de la pharmacie',
  composition: 'H + 1',
  lastName: 'Terrieur',
  firstName: 'Alain',
  dob: '1996-10-01',
  wanderingDuration: '3 mois',
  phone: '0689562485',
  generalComment: 'M. Terrieur est avec son fils, il est inconnu de nos services, ne possède pas de fiche SISIAO.',
  prestationDate: '2024-02-12',
  prestationTime: '23:45',
  prestationTypes: ['Douche', 'Soin', 'Denrées'],
  prestationDetails: '3 soupes / 2 cafés / 1 repas chaud / 5 bouteille d\'eau',
  prestationComment: 'Douche pour le fils de M.',
  signalements: {
      alimentation: {
          checked: true,
          comment: "M. a des difficultés pour nourrir son fils. Il va souvent à l'accueil de jour Emmaus de Bagnolet mais ne peut y aller chaque jour."
      },
      sante: { checked: false, comment: '' },
      administratif: {
          checked: true,
          comment: "M. n'a pas réussi a renouveler son titre de séjour car il a eu du retard dans l'envoi de pièces, cela l'a fait perdre son travail et a entrainer sa situation vers la rue"
      },
      psychoRelationnel: { checked: false, comment: '' },
      professionnel: { checked: false, comment: '' },
      logement: {
          checked: true,
          comment: "Besoin de faire une demande d'insertion logement pour M. et son fils."
      }
  }
};

const signalementCategories = [
    { key: 'alimentation', label: 'Alim/Vêtement', commentLabel: 'Commentaire alimentation' },
    { key: 'sante', label: 'Santé', commentLabel: 'Commentaire santé' },
    { key: 'administratif', label: 'Administratif', commentLabel: 'Commentaire administratif' },
    { key: 'psychoRelationnel', label: 'Psycho-relationnel', commentLabel: 'Commentaire psycho-relationnel' },
    { key: 'professionnel', label: 'Professionnel', commentLabel: 'Commentaire professionnel' },
    { key: 'logement', label: 'Logement', commentLabel: 'Commentaire logement' },
];

const EncounterMap = React.memo(({ address }: { address: string }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);
        }
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current || !address) return;

        const updateMap = async () => {
            const coords = await geocodeAddress(address);
            if (coords && mapInstanceRef.current) {
                mapInstanceRef.current.setView(coords, 16);
                
                const icon = L.divIcon({
                    html: '<svg xmlns="http://www.w3.org/2000/svg" fill="#008000" viewBox="0 0 24 24" width="24px" height="24px"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 7h2v2h-2V9zm0 4h2v6h-2v-6z"/></svg>',
                    className: 'bg-transparent border-0',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                if (markerRef.current) {
                    markerRef.current.setLatLng(coords);
                } else {
                    markerRef.current = L.marker(coords, { icon }).addTo(mapInstanceRef.current);
                }
                
                setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
            }
        };
        updateMap();
    }, [address]);

    return <div ref={mapContainerRef} className="w-full h-full bg-gray-200 rounded-md border border-gray-400 min-h-[200px]" />;
});
EncounterMap.displayName = 'EncounterMap';


const HouseholdEncounterModal: React.FC<HouseholdEncounterModalProps> = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('Localisation et info générales');
  const [formData, setFormData] = useState<EncounterData>(defaultEncounterData);
  const [prestationTypesOpen, setPrestationTypesOpen] = useState(false);
  const prestationTypesDropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedAddress = useDebounce(`${formData.address}, ${formData.postalCode} ${formData.city}`, 500);

  useEffect(() => {
    if (isOpen) {
        setFormData(defaultEncounterData);
        setActiveTab('Localisation et info générales');
        setPrestationTypesOpen(false);
    }
  }, [isOpen]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (prestationTypesDropdownRef.current && !prestationTypesDropdownRef.current.contains(event.target as Node)) {
        setPrestationTypesOpen(false);
      }
    };
    if (prestationTypesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [prestationTypesOpen]);

  if (!isOpen) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const prestationTypesOptions = ['Douche', 'Soin', 'Denrées', 'Café', 'Kit toilette', 'Vêtement', 'Repas', 'Soupe', 'Autre'];

  const handlePrestationTypeChange = (type: string) => {
    const currentTypes = formData.prestationTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    setFormData(prev => ({ ...prev, prestationTypes: newTypes }));
  };
  
  const handleSignalementCheckChange = (key: string) => {
      setFormData(prev => {
          const newSignalements = { ...(prev.signalements || {}) };
          if (newSignalements[key]) {
              newSignalements[key].checked = !newSignalements[key].checked;
          }
          return { ...prev, signalements: newSignalements };
      });
  };

  const handleSignalementCommentChange = (key: string, value: string) => {
      setFormData(prev => {
          const newSignalements = { ...(prev.signalements || {}) };
          if (newSignalements[key]) {
              newSignalements[key].comment = value;
          }
          return { ...prev, signalements: newSignalements };
      });
  };

  const handleSave = () => {
    onSave(formData);
  };

  const FormField: React.FC<{label: string, id:string, children: React.ReactNode}> = ({label, id, children}) => (
    <div>
        <label htmlFor={id} className="text-sm font-medium text-red-500 block mb-1">{label}</label>
        {children}
    </div>
  );
  
  const CustomCheckbox: React.FC<{checked: boolean, onChange: () => void}> = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={onChange}
        className={`w-5 h-5 border-2 border-black flex items-center justify-center cursor-pointer transition-all flex-shrink-0`}
        aria-checked={checked}
    >
        {checked && <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>}
    </button>
);


  const tabs = ['Localisation et info générales', 'Prestation', 'Signalements'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[1001]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 relative border border-gray-400" onClick={e => e.stopPropagation()}>
        <header className="bg-red-500 text-white font-bold text-lg p-3 rounded-t-lg flex justify-between items-center">
            Rencontre d'un ménage
            <div className="flex -mb-3">
              {tabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-semibold rounded-t-md ${activeTab === tab ? 'bg-white text-red-500' : 'bg-red-400 text-white hover:bg-red-300'}`}>
                      {tab}
                  </button>
              ))}
            </div>
        </header>
        
        <main className="p-4 min-h-[460px]">
            {activeTab === 'Localisation et info générales' && (
              <div className="space-y-4">
                 <fieldset className="border border-gray-300 p-3 rounded-md">
                    <legend className="px-2 font-semibold text-gray-700">Localisation</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <FormField label="Adresse" id="enc-address">
                                <input id="enc-address" type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                            </FormField>
                            <div className="flex gap-4">
                               <div className="flex-1">
                                <FormField label="Code postal" id="enc-postal">
                                    <input id="enc-postal" type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                                </FormField>
                               </div>
                               <div className="flex-1">
                                 <FormField label="Ville" id="enc-city">
                                    <input id="enc-city" type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                                </FormField>
                               </div>
                            </div>
                            <FormField label="Commentaire localisation" id="enc-loc-comment">
                                <input id="enc-loc-comment" type="text" name="locationComment" value={formData.locationComment} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                            </FormField>
                        </div>
                        <EncounterMap address={debouncedAddress} />
                    </div>
                </fieldset>
                
                <fieldset className="border border-gray-300 p-3 rounded-md">
                    <legend className="px-2 font-semibold text-gray-700">Informations générales</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                       <FormField label="Composition" id="enc-comp">
                          <input id="enc-comp" type="text" name="composition" value={formData.composition} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                       </FormField>
                       <FormField label="Nom DP" id="enc-lastname">
                          <input id="enc-lastname" type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                       </FormField>
                       <FormField label="Prénom DP" id="enc-firstname">
                          <input id="enc-firstname" type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                       </FormField>
                       <FormField label="DDN" id="enc-dob">
                          <input id="enc-dob" type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                       </FormField>
                       <FormField label="Durée d'errance" id="enc-wandering">
                          <input id="enc-wandering" type="text" name="wanderingDuration" value={formData.wanderingDuration} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                       </FormField>
                       <FormField label="Téléphone" id="enc-phone">
                          <input id="enc-phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                       </FormField>
                    </div>
                     <FormField label="Commentaire Info générales" id="enc-gen-comment">
                       <textarea id="enc-gen-comment" name="generalComment" value={formData.generalComment} onChange={handleInputChange} rows={2} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900"></textarea>
                    </FormField>
                </fieldset>
              </div>
            )}
            {activeTab === 'Prestation' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormField label="Date" id="prestation-date">
                        <input id="prestation-date" type="date" name="prestationDate" value={formData.prestationDate || ''} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                    </FormField>
                    <FormField label="Heure" id="prestation-time">
                        <input id="prestation-time" type="time" name="prestationTime" value={formData.prestationTime || ''} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                    </FormField>
                </div>
                <FormField label="Type de prestation" id="prestation-types">
                  <div className="relative" ref={prestationTypesDropdownRef}>
                      <button type="button" onClick={() => setPrestationTypesOpen(!prestationTypesOpen)} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900 text-left flex justify-between items-center h-[38px]">
                          <span className="truncate">{(formData.prestationTypes && formData.prestationTypes.length > 0) ? formData.prestationTypes.join(', ') : 'Sélectionner...'}</span>
                          <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                      {prestationTypesOpen && (
                          <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                              {prestationTypesOptions.map(option => (
                                  <label key={option} className="flex items-center p-2 hover:bg-rose-50 cursor-pointer text-gray-800">
                                      <input type="checkbox" checked={(formData.prestationTypes || []).includes(option)} onChange={() => handlePrestationTypeChange(option)} className="mr-2 h-4 w-4 rounded text-red-500 focus:ring-red-400 border-gray-300" />
                                      {option}
                                  </label>
                              ))}
                          </div>
                      )}
                  </div>
                </FormField>
                <FormField label="Précision Denrées" id="prestation-details">
                    <input id="prestation-details" type="text" name="prestationDetails" value={formData.prestationDetails || ''} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                </FormField>
                <FormField label="Commentaire prestation" id="prestation-comment">
                    <input id="prestation-comment" type="text" name="prestationComment" value={formData.prestationComment || ''} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                </FormField>
              </div>
            )}
            {activeTab === 'Signalements' && (
                <div className="space-y-4">
                    {signalementCategories.map(category => (
                        <div key={category.key} className="flex flex-wrap md:flex-nowrap items-start gap-x-4 gap-y-2">
                            <div className="flex items-center gap-3 w-full md:w-52 flex-shrink-0">
                                <CustomCheckbox 
                                    checked={formData.signalements?.[category.key]?.checked || false}
                                    onChange={() => handleSignalementCheckChange(category.key)}
                                />
                                <label className="font-semibold text-gray-800">{category.label}</label>
                            </div>

                            {formData.signalements?.[category.key]?.checked && (
                                <div className="flex items-start gap-3 flex-grow w-full pl-9 md:pl-0">
                                    <label className="text-sm font-medium text-red-500 w-40 flex-shrink-0 pt-2 text-right pr-2">{category.commentLabel}</label>
                                    <textarea 
                                        rows={3}
                                        value={formData.signalements?.[category.key]?.comment || ''}
                                        onChange={(e) => handleSignalementCommentChange(category.key, e.target.value)}
                                        className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900"
                                    />
                                </div>
                            )}
                             {!formData.signalements?.[category.key]?.checked && <div className="flex-grow hidden md:block"></div>}
                        </div>
                    ))}
                </div>
            )}
        </main>
        
        <footer className="flex justify-end p-3 bg-gray-100 rounded-b-lg border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 rounded-md text-gray-800 font-semibold border border-gray-400 bg-white hover:bg-gray-200 transition mr-3 shadow-sm">
            Annuler
          </button>
          <button onClick={handleSave} className="px-6 py-2 rounded-md bg-blue-900 text-white font-semibold hover:bg-blue-800 transition shadow-sm">
            Enregistrer
          </button>
        </footer>
      </div>
    </div>
  );
};

export default HouseholdEncounterModal;
