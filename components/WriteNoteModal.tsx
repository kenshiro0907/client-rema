import React, { useState, useEffect, useRef } from 'react';
import { NoteData } from '../types';

declare var L: any;

interface WriteNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: NoteData) => void;
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
        if (!response.ok) {
            console.error(`Geocoding failed for ${address}: ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            return [parseFloat(lat), parseFloat(lon)];
        }
        console.warn(`Geocoding: Address not found for ${address}`);
        return null;
    } catch (e) {
        console.error(`Geocoding error for ${address}:`, e);
        return null;
    }
};

const defaultNoteData: NoteData = {
  address: "48 rue Condorcet\n93100\nMontreuil",
  locationComment: "A côté de l'aqueduc de la Dhuys",
  noteType: "Lieu de vie",
  urgency: "1",
  object: "Il semble qu'il y a un nouveau lieu de vie à cet emplacement avec 2-3 tentes A confirmer"
};

const NoteMap = React.memo(({ address }: { address: string }) => {
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
            const fullAddress = address.replace(/\n/g, ', ');
            const coords = await geocodeAddress(fullAddress);
            if (coords && mapInstanceRef.current) {
                mapInstanceRef.current.setView(coords, 16);
                const redIcon = L.divIcon({
                    html: '<svg xmlns="http://www.w3.org/2000/svg" fill="#ff0000" viewBox="0 0 24 24" width="24px" height="24px"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
                    className: 'bg-transparent border-0',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24]
                });

                if (markerRef.current) {
                    markerRef.current.setLatLng(coords);
                } else {
                    markerRef.current = L.marker(coords, { icon: redIcon }).addTo(mapInstanceRef.current);
                }
                
                setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
            }
        };
        updateMap();
    }, [address]);

    return <div ref={mapContainerRef} className="w-full h-full bg-gray-200 rounded-md border border-gray-400 min-h-[160px]" />;
});
NoteMap.displayName = 'NoteMap';


const WriteNoteModal: React.FC<WriteNoteModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<NoteData>(defaultNoteData);
  const debouncedAddress = useDebounce(formData.address, 500);

  useEffect(() => {
    if (isOpen) {
        setFormData(defaultNoteData);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
      onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[1001]" onClick={onClose} aria-modal="true" role="dialog">
      <div 
        className="bg-white rounded-lg shadow-xl p-0 w-full max-w-3xl m-4 relative border border-gray-400"
        onClick={e => e.stopPropagation()}
      >
        <header className="bg-red-500 text-white font-bold text-lg p-3 rounded-t-lg">
          Nouvelle note
        </header>
        
        <main className="p-4 space-y-4">
          <fieldset className="border border-gray-300 p-3 rounded-md">
            <legend className="px-2 font-semibold text-gray-700">Localisation</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label htmlFor="note-address" className="text-sm font-medium text-red-500 block">Adresse</label>
                  <textarea id="note-address" name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900"></textarea>
                </div>
                <div>
                  <label htmlFor="note-loc-comment" className="text-sm font-medium text-red-500 block">Commentaire localisation</label>
                  <input id="note-loc-comment" name="locationComment" type="text" value={formData.locationComment} onChange={handleInputChange} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900" />
                </div>
              </div>
              <NoteMap address={debouncedAddress} />
            </div>
          </fieldset>

          <fieldset className="border border-gray-300 p-3 rounded-md">
            <legend className="px-2 font-semibold text-gray-700">Informations générales</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
               <div>
                  <label htmlFor="note-type" className="text-sm font-medium text-red-500 block mb-1">Type de note</label>
                  <select id="note-type" name="noteType" value={formData.noteType} onChange={handleInputChange} className="w-full border border-gray-400 bg-white rounded-md p-2 text-sm shadow-inner appearance-none bg-no-repeat bg-right pr-8 text-gray-900" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em'}}>
                    <option>Lieu de vie</option>
                    <option>Information</option>
                    <option>Action</option>
                  </select>
                </div>
                 <div>
                  <label htmlFor="note-urgency" className="text-sm font-medium text-red-500 block mb-1">Urgence</label>
                  <select id="note-urgency" name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full border border-gray-400 bg-white rounded-md p-2 text-sm shadow-inner appearance-none bg-no-repeat bg-right pr-8 text-gray-900" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em'}}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </div>
            </div>
             <div>
              <label htmlFor="note-object" className="text-sm font-medium text-red-500 block">Objet</label>
              <textarea id="note-object" name="object" value={formData.object} onChange={handleInputChange} rows={3} className="w-full border border-gray-400 bg-rose-100 rounded-md p-2 text-sm shadow-inner text-gray-900"></textarea>
            </div>
          </fieldset>
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

export default WriteNoteModal;