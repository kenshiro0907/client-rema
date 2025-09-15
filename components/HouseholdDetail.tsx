import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Household, Demande, ContactData, ClotureMotif } from '../types';
import { useHouseholds } from '../contexts/AppContext';
import ContactModal from './ContactModal';
import ClotureModal from './ClotureModal';

declare var L: any;

interface HouseholdDetailProps {
  household: Household;
  onUpdateHousehold?: (householdId: string, updates: Partial<Household>) => void;
}

const HouseholdDetail: React.FC<HouseholdDetailProps> = ({ household, onUpdateHousehold }) => {
  const { updateHousehold } = useHouseholds();
  const [activeTab, setActiveTab] = useState('Infos générales');
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [isClotureModalOpen, setClotureModalOpen] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [geoState, setGeoState] = useState<{
    loading: boolean;
    error: string | null;
    coords: [number, number] | null;
  }>({ loading: false, error: null, coords: null });

  const HISTORY_PAGE_SIZE = 7;

  const geocodeAddress = useCallback(async (address: Demande['localisation']) => {
    if (!address || !address.adresse) {
      setGeoState({ loading: false, error: "Adresse non disponible.", coords: null });
      return;
    }
    
    setGeoState({ loading: true, error: null, coords: null });

    const fullAddress = `${address.adresse}, ${address.codePostal}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Le service de géocodage a échoué.");
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setGeoState({ loading: false, error: null, coords: [parseFloat(lat), parseFloat(lon)] });
      } else {
        setGeoState({ loading: false, error: "Adresse non trouvée.", coords: null });
      }
    } catch (e) {
      console.error("Geocoding error:", e);
      setGeoState({ loading: false, error: "Erreur de géocodage.", coords: null });
    }
  }, []);

  // Reset state when household changes
  useEffect(() => {
    setActiveTab('Infos générales');
    setHistoryCurrentPage(1);
    setGeoState({ loading: false, error: null, coords: null }); // Reset geo state
  }, [household.id]);

  // Effect to handle geocoding when tab is active
  useEffect(() => {
    if (activeTab === 'Demande active' && household.demande) {
      geocodeAddress(household.demande.localisation);
    }
  }, [activeTab, household.demande, geocodeAddress]);


  // Effect to initialize and update the map
  useEffect(() => {
    if (activeTab !== 'Demande active' || !mapContainerRef.current) {
      return;
    }

    if (geoState.coords) {
      const [lat, lon] = geoState.coords;

      if (!mapInstanceRef.current) {
        try {
          mapInstanceRef.current = L.map(mapContainerRef.current).setView([lat, lon], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(mapInstanceRef.current);
          markerRef.current = L.marker([lat, lon]).addTo(mapInstanceRef.current);
        } catch (e) {
          console.error("Map initialization failed:", e);
        }
      } else {
        mapInstanceRef.current.setView([lat, lon], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon]);
        } else {
          markerRef.current = L.marker([lat, lon]).addTo(mapInstanceRef.current);
        }
      }
      // Force map to re-render correctly when tab is shown
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);

    }

  }, [activeTab, geoState.coords]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const MapStateDisplay: React.FC = () => {
    let content;
    if (geoState.loading) {
        content = <p>Recherche des coordonnées...</p>;
    } else if (geoState.error) {
        content = <p className="text-red-600">{geoState.error}</p>;
    } else {
        return null; // The map itself is handled by the ref
    }
    return <div className="flex items-center justify-center h-full text-gray-500 font-medium">{content}</div>;
  };


  const ActionButton: React.FC<{ children: React.ReactNode, onClick?: () => void }> = ({ children, onClick }) => (
    <button onClick={onClick} className="bg-red-300 text-gray-900 font-semibold px-6 py-2 text-sm rounded-md hover:bg-red-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
      {children}
    </button>
  );

  const InfoBlock: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div className={className}>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
  
  const handleSaveContact = (data: ContactData) => {
    console.log("Saving contact data:", data);
    // In a real application, you would update the household's contact history
    // and persist it to your backend.
    setContactModalOpen(false);
  };
  
  const handleSaveCloture = (motif: ClotureMotif) => {
    console.log(`Clôture du ménage ${household.id} pour motif: ${motif}`);
    const updateFunction = onUpdateHousehold || updateHousehold;
    updateFunction(household.id, { statut: 'Clôturé' });
    setClotureModalOpen(false);
  };

  const history = household.history || [];
  const historyTotalPages = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
  const paginatedHistory = history.slice(
      (historyCurrentPage - 1) * HISTORY_PAGE_SIZE,
      historyCurrentPage * HISTORY_PAGE_SIZE
  );
  const emptyHistoryRowsCount = Math.max(0, HISTORY_PAGE_SIZE - paginatedHistory.length);
  const emptyHistoryRows = Array.from({ length: emptyHistoryRowsCount });

  // Define tabs based on requirements
  const getAvailableTabs = () => {
    const baseTabs = ['Infos générales', 'Evaluations', 'Suivi social', 'Prestations', 'Diagnostic'];
    
    // Add "Demande active" only if there's an active demand with "En attente de traitement" status
    if (household.demande && household.demande.statutDemandeSisiao === 'En attente de traitement') {
      return ['Infos générales', 'Demande active', ...baseTabs.slice(1)];
    }
    
    return baseTabs;
  };

  const tabs = getAvailableTabs();

  return (
    <>
    <div className="bg-rose-50 p-4 rounded-lg border border-rose-200 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-700">
          {household.prenom} {household.nom} - ID {household.idSisiao}
        </h2>
        <div className="flex gap-3">
          <ActionButton onClick={() => setContactModalOpen(true)}>Contact</ActionButton>
          <ActionButton onClick={() => setClotureModalOpen(true)}>Clôture</ActionButton>
          <ActionButton>Evaluation</ActionButton>
        </div>
      </div>

      {/* Tabs */}
      <nav className="mb-6">
        <div className="border-b border-gray-300">
          <div className="flex flex-wrap -mb-px gap-6">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 text-md font-medium transition-colors duration-200
                  ${activeTab === tab 
                    ? 'border-b-2 border-red-500 text-red-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-400 border-b-2 border-transparent'}`
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* General Information Section */}
      {activeTab === 'Infos générales' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mb-8 text-gray-800">
            <InfoBlock label="ID SISIAO" value={household.idSisiao} />
            <InfoBlock label="Statut ménage" value={household.statut} />
            <InfoBlock label="Composition familiale" value={household.compositionFamiliale} />
          </div>
          
          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-100/70">
                  {['Contact principal', 'Nom', 'Prénom', 'Tel', 'Naissance', 'Age', 'Sexe', 'Situation', 'Id'].map(header => (
                    <th key={header} className="p-2 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {household.members.map((member) => (
                  <tr key={member.id} className="bg-white hover:bg-rose-50/50 transition-colors duration-150 border-b border-gray-200">
                    <td className="p-2 text-sm text-gray-800 text-center">{member.isPrincipal && <span className="text-green-600 font-bold">✓</span>}</td>
                    <td className="p-2 text-sm text-gray-800">{member.nom}</td>
                    <td className="p-2 text-sm text-gray-800">{member.prenom}</td>
                    <td className="p-2 text-sm text-gray-800">{member.tel}</td>
                    <td className="p-2 text-sm text-gray-800">{member.naissance}</td>
                    <td className="p-2 text-sm text-gray-800">{member.age}</td>
                    <td className="p-2 text-sm text-gray-800">{member.sexe}</td>
                    <td className="p-2 text-sm text-gray-800">{member.situation}</td>
                    <td className="p-2 text-sm text-gray-800">{member.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Social Follow-up Section */}
      {activeTab === 'Suivi social' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mb-8 text-gray-800">
            <InfoBlock label="ID SISIAO" value={household.idSisiao} />
            <InfoBlock label="Statut ménage" value={household.statut} />
          </div>

          <div className="space-y-6">
            {/* Lieu de vie et condition matérielle */}
            <div className="bg-white rounded-lg border border-gray-300 p-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-2 mb-4">
                Lieu de vie et condition matérielle
              </h3>
              <div className="text-center text-gray-500 py-4">
                <p>Informations mises à jour suite aux diagnostics EMA</p>
                <p className="text-sm mt-2">Aucune information disponible actuellement</p>
              </div>
            </div>

            {/* Hygiène et santé */}
            <div className="bg-white rounded-lg border border-gray-300 p-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-2 mb-4">
                Hygiène et santé
              </h3>
              <div className="text-center text-gray-500 py-4">
                <p>Informations mises à jour suite aux diagnostics EMA</p>
                <p className="text-sm mt-2">Aucune information disponible actuellement</p>
              </div>
            </div>

            {/* Alimentation */}
            <div className="bg-white rounded-lg border border-gray-300 p-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-2 mb-4">
                Alimentation
              </h3>
              <div className="text-center text-gray-500 py-4">
                <p>Informations mises à jour suite aux diagnostics EMA</p>
                <p className="text-sm mt-2">Aucune information disponible actuellement</p>
              </div>
            </div>

            {/* Ressources personnelles et institutionnelles */}
            <div className="bg-white rounded-lg border border-gray-300 p-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-2 mb-4">
                Ressources personnelles et institutionnelles
              </h3>
              <div className="text-center text-gray-500 py-4">
                <p>Informations mises à jour suite aux diagnostics EMA</p>
                <p className="text-sm mt-2">Aucune information disponible actuellement</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demande active Section */}
      {activeTab === 'Demande active' && (
         <div>
          {household.demande ? (
            <div className="space-y-8 text-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                <InfoBlock label="ID Demande" value={household.demande.idDemande} />
                <InfoBlock label="Statut demande SISIAO" value={household.demande.statutDemandeSisiao} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-1 mb-4 underline decoration-red-400 decoration-2 underline-offset-4">Localisation</h3>
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 border border-gray-300 overflow-hidden z-0">
                   <div ref={mapContainerRef} className="w-full h-full" />
                   <MapStateDisplay />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <InfoBlock label="Adresse" value={household.demande.localisation.adresse} />
                  <InfoBlock label="Commentaire" value={household.demande.localisation.commentaire} />
                  <InfoBlock label="Code Postal" value={household.demande.localisation.codePostal} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-1 mb-4 underline decoration-red-400 decoration-2 underline-offset-4">Détails de la demande</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <InfoBlock label="Type de demandes" value={household.demande.details.typeDemandes} />
                  <InfoBlock label="Commentaire" value={household.demande.details.commentaire} />
                </div>
              </div>

            </div>
          ) : (
            <p className="text-gray-500">Aucune demande en cours pour ce ménage.</p>
          )}
        </div>
      )}

      {/* Evaluations Section */}
      {activeTab === 'Evaluations' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mb-8 text-gray-800">
            <InfoBlock label="ID SISIAO" value={household.idSisiao} />
            <InfoBlock label="Statut ménage" value={household.statut} />
          </div>
          
          <div className="bg-white rounded-lg border border-gray-300 p-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-2 mb-4">
              Évaluations sociales SISIAO
            </h3>
            <div className="text-center text-gray-500 py-8">
              <p>Aucune évaluation sociale disponible pour ce ménage.</p>
              <p className="text-sm mt-2">Les évaluations du SISIAO seront affichées ici.</p>
            </div>
          </div>
        </div>
      )}

      {/* Prestations Section */}
      {activeTab === 'Prestations' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mb-8 text-gray-800">
            <InfoBlock label="ID SISIAO" value={household.idSisiao} />
            <InfoBlock label="Statut ménage" value={household.statut} />
          </div>
          
          <div className="bg-white rounded-lg border border-gray-300 p-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-2 mb-4">
              Historique des prestations EMA
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-rose-100">
                    {['Date', 'Type de prestation', 'Intervenant', 'Commentaire'].map(header => (
                      <th key={header} className="border border-gray-300 p-2 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((demande: Demande) => (
                    <tr key={demande.idDemande} className="bg-white hover:bg-rose-50/50 transition-colors duration-150">
                      <td className="border border-gray-300 p-2 text-sm text-gray-800">{demande.date}</td>
                      <td className="border border-gray-300 p-2 text-sm text-gray-800">{demande.details.typeDemandes}</td>
                      <td className="border border-gray-300 p-2 text-sm text-gray-800">EMA</td>
                      <td className="border border-gray-300 p-2 text-sm text-gray-800">{demande.details.commentaire}</td>
                    </tr>
                  ))}
                  {emptyHistoryRows.map((_, index) => (
                     <tr key={`empty-prest-${index}`} className="bg-white h-[45px]">
                      <td className="border border-gray-300" colSpan={4}></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end items-center mt-2 text-sm font-medium text-gray-600 gap-2">
               <button
                  onClick={() => setHistoryCurrentPage(p => p - 1)}
                  disabled={historyCurrentPage === 1}
                  className="px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
              <span>{historyCurrentPage} sur {historyTotalPages}</span>
               <button
                  onClick={() => setHistoryCurrentPage(p => p + 1)}
                  disabled={historyCurrentPage === historyTotalPages}
                  className="px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Section */}
      {activeTab === 'Diagnostic' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mb-8 text-gray-800">
            <InfoBlock label="ID SISIAO" value={household.idSisiao} />
            <InfoBlock label="Statut ménage" value={household.statut} />
          </div>
          
          <div className="bg-white rounded-lg border border-gray-300 p-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-2 mb-4">
              Historique des diagnostics EMA
            </h3>
            <div className="text-center text-gray-500 py-8">
              <p>Aucun diagnostic disponible pour ce ménage.</p>
              <p className="text-sm mt-2">Les diagnostics réalisés par les EMA seront affichés ici.</p>
            </div>
          </div>
        </div>
      )}

    </div>
    <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSave={handleSaveContact}
        household={household}
    />
    <ClotureModal
        isOpen={isClotureModalOpen}
        onClose={() => setClotureModalOpen(false)}
        onSave={handleSaveCloture}
        household={household}
    />
    </>
  );
};

export default HouseholdDetail;
