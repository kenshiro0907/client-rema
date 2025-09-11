import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { DashboardData, MarkerData, MarkerType, NoteData, EncounterData } from '../types';
import WriteNoteModal from './WriteNoteModal';
import HouseholdEncounterModal from './HouseholdEncounterModal';

// Déclare L pour TypeScript car il est chargé globalement
declare var L: any;

const USER_NOTES_KEY = 'user_created_notes';

// A dedicated component to safely render SVG strings.
const SvgIcon: React.FC<{ svgString: string; className?: string }> = ({ svgString, className = '' }) => (
    <div className={className} dangerouslySetInnerHTML={{ __html: svgString }} />
);

const ActionButton: React.FC<{ children: React.ReactNode, onClick?: () => void }> = ({ children, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-blue-900 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base">
        {children}
    </button>
);

const SummaryTable: React.FC<{ title: string, headers: string[], rows: (string|number)[][] }> = ({title, headers, rows}) => (
     <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 flex-1 min-w-[280px] w-full">
        <h3 className="font-bold text-center text-gray-700 mb-2">{title}</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
                <thead>
                    <tr className="bg-rose-100">
                        <th className="p-1 font-semibold whitespace-nowrap"></th>
                        {headers.map(h => <th key={h} className="p-1 font-semibold whitespace-nowrap text-gray-700">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-t border-rose-200">
                            <td className="p-1 font-semibold text-left whitespace-nowrap text-gray-800">{row[0]}</td>
                            {row.slice(1).map((cell, j) => <td key={j} className="p-1 text-gray-800">{cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


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

const DashboardPage: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [userMarkers, setUserMarkers] = useState<MarkerData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNoteModalOpen, setNoteModalOpen] = useState(false);
    const [isEncounterModalOpen, setEncounterModalOpen] = useState(false);

    const layerGroups = useRef<{ [key in MarkerType]?: any }>({});

    useEffect(() => {
        const savedMarkers = localStorage.getItem(USER_NOTES_KEY);
        if (savedMarkers) {
            try {
                setUserMarkers(JSON.parse(savedMarkers));
            } catch (e) {
                console.error("Failed to parse user markers from localStorage", e);
                setUserMarkers([]);
            }
        }
    }, []);

    const saveUserMarkers = (markers: MarkerData[]) => {
        setUserMarkers(markers);
        localStorage.setItem(USER_NOTES_KEY, JSON.stringify(markers));
    };

    const icons = useMemo(() => {
        if (typeof L === 'undefined' || !L.divIcon) return null;

        const createIcon = (svg: string) => L.divIcon({
            html: svg,
            className: 'bg-transparent border-0',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        return {
            position: createIcon('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="24px" height="24px"><path d="M0 0h24v24H0z" fill="none"/><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h4v1.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V19h4c1.1 0 2-.9 2-2v-4h1.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/></svg>'),
            note: createIcon('<svg xmlns="http://www.w3.org/2000/svg" fill="#ff0000" viewBox="0 0 24 24" width="24px" height="24px"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'),
            signalement: createIcon(`<svg width="20" height="20" viewBox="0 0 20 20"><path fill="none" stroke="#0000ff" stroke-width="3" d="M 2,2 L 18,18 M 18,2 L 2,18" /></svg>`),
            veille: createIcon(`<svg width="20" height="20" viewBox="0 0 20 20"><path fill="none" stroke="#000000" stroke-width="3" d="M 2,2 L 18,18 M 18,2 L 2,18" /></svg>`),
            exploratoire: createIcon(`<svg width="20" height="20" viewBox="0 0 20 20"><path fill="none" stroke="#ff0000" stroke-width="3" d="M 2,2 L 18,18 M 18,2 L 2,18" /></svg>`),
            rencontre: createIcon('<svg xmlns="http://www.w3.org/2000/svg" fill="#008000" viewBox="0 0 24 24" width="24px" height="24px"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 7h2v2h-2V9zm0 4h2v6h-2v-6z"/></svg>'),
        };
    }, []);

    const addMarkerToMap = useCallback(async (markerData: MarkerData) => {
        if (!mapRef.current || !icons) return;

        const coords = await geocodeAddress(markerData.address.replace(/\n/g, ', '));

        // After geocoding, the map might have been destroyed by a re-render.
        // Check for the map's existence again before proceeding.
        if (coords && mapRef.current) {
            const group = layerGroups.current[markerData.type];
            if (!group) return;

            const icon = icons[markerData.type];
            if (icon) {
                L.marker(coords, { icon }).addTo(group);
            }
        } else if (!coords) {
            console.warn(`Could not geocode address to add marker: ${markerData.address}`);
        }
    }, [icons]);


    const handleSaveNote = (noteData: NoteData) => {
        const newMarker: MarkerData = { 
            type: 'note', 
            address: noteData.address, 
            note: noteData 
        };
        addMarkerToMap(newMarker);
        saveUserMarkers([...userMarkers, newMarker]);
        setNoteModalOpen(false);
    };
    
    const handleSaveEncounter = (encounterData: EncounterData) => {
        const fullAddress = `${encounterData.address}, ${encounterData.postalCode} ${encounterData.city}`;
        const newMarker: MarkerData = {
            type: 'rencontre',
            address: fullAddress,
            encounter: encounterData,
        };
        addMarkerToMap(newMarker);
        saveUserMarkers([...userMarkers, newMarker]);
        setEncounterModalOpen(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/dashboard.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: DashboardData = await response.json();
                
                const counts = { signalement: 0, veille: 0, exploratoire: 0 };
                data.markers.forEach(marker => {
                    if (marker.type === 'signalement' || marker.type === 'veille' || marker.type === 'exploratoire') {
                        counts[marker.type]++;
                    }
                });
                data.summary.laTournee.rows = [
                    ["A rencontrer", counts.signalement, counts.veille, counts.exploratoire],
                    ["Rencontré", 0, 0, 0]
                ];

                setDashboardData(data);
            } catch (e) {
                console.error("Failed to fetch dashboard data:", e);
                setError("Impossible de charger les données du dashboard.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (mapRef.current || !mapContainer.current || !dashboardData || !icons) return;

        let isMounted = true;

        const initializeMap = async () => {
            try {
                mapRef.current = L.map(mapContainer.current, { center: [48.88, 2.42], zoom: 12 });
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                }).addTo(mapRef.current);

                // Initialize layer groups
                (Object.keys(icons) as MarkerType[]).forEach(type => {
                    layerGroups.current[type] = L.layerGroup().addTo(mapRef.current);
                });

                // Geocode and add markers from initial data
                dashboardData.markers.forEach(markerInfo => addMarkerToMap(markerInfo));
                
                // Add user created markers
                userMarkers.forEach(markerInfo => addMarkerToMap(markerInfo));
                
                // Geocode addresses for the exploration zone
                const zonePromises = dashboardData.zoneToExplore.map(address => geocodeAddress(address));
                const zoneCoordinates = (await Promise.all(zonePromises)).filter(coords => coords !== null) as [number, number][];
                if (zoneCoordinates.length > 2) {
                    L.polygon(zoneCoordinates, { color: '#ff9999', fillColor: '#ff0000', fillOpacity: 0.2, weight: 2 }).addTo(mapRef.current);
                }

                // Add user position marker
                if (navigator.geolocation && icons.position) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            // isMounted guards against unmounts. mapRef.current guards against re-renders.
                            if (!isMounted || !mapRef.current) return;
                            const group = layerGroups.current.position;
                            if (!group) return;
                            const { latitude, longitude } = position.coords;
                            L.marker([latitude, longitude], { icon: icons.position }).addTo(group);
                        },
                        (err) => console.warn("Could not get user location:", err.message)
                    );
                }
                
            } catch (error) {
                console.error("Failed to initialize Leaflet map:", error);
                setError("Impossible d'initialiser la carte.");
            }
        };
        
        initializeMap();

        return () => {
            isMounted = false;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [dashboardData, icons, addMarkerToMap, userMarkers]);

    const LegendItem: React.FC<{children:React.ReactNode}> = ({children}) => (
        <li className="flex items-center gap-3">
            {children}
        </li>
    );
    
    if (isLoading) return <div className="flex justify-center items-center h-full min-h-[600px]"><p className="text-gray-500 font-semibold">Chargement...</p></div>;
    if (error) return <div className="flex justify-center items-center h-full min-h-[600px] bg-red-100 p-4"><p className="text-red-600 font-semibold">{error}</p></div>;
    if (!dashboardData || !icons) return <div className="flex justify-center items-center h-full min-h-[600px] bg-red-100 p-4"><p className="text-red-600 font-semibold">Erreur critique de chargement.</p></div>;

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full flex flex-wrap justify-end gap-2 sm:gap-4 mb-4">
                <ActionButton onClick={() => setEncounterModalOpen(true)}>Rencontre d'un ménage</ActionButton>
                <ActionButton>Définir une zone</ActionButton>
                <ActionButton onClick={() => setNoteModalOpen(true)}>Ecrire une note</ActionButton>
            </div>

            <div className="relative border-2 border-gray-300 rounded-lg h-[600px] w-full">
                <div ref={mapContainer} className="w-full h-full rounded-lg z-0" />
                
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 z-10">
                    <h4 className="font-bold text-md mb-2 text-gray-900">Légende</h4>
                    <ul className="space-y-1 text-sm">
                        <LegendItem><SvgIcon svgString={icons.position.options.html} /><span className="text-gray-900 font-medium">Votre position</span></LegendItem>
                        <LegendItem><SvgIcon svgString={icons.signalement.options.html} /><span className="text-gray-900 font-medium">Signalements</span></LegendItem>
                        <LegendItem><SvgIcon svgString={icons.veille.options.html} /><span className="text-gray-900 font-medium">Veilles</span></LegendItem>
                        <LegendItem><SvgIcon svgString={icons.exploratoire.options.html} /><span className="text-gray-900 font-medium">Exploratoire</span></LegendItem>
                        <LegendItem><span className="w-5 h-5 border-2 border-red-400 bg-red-500/20 block"></span><span className="text-gray-900 font-medium">Zone à explorer</span></LegendItem>
                        <LegendItem><SvgIcon svgString={icons.note.options.html} /><span className="text-gray-900 font-medium">Note</span></LegendItem>
                    </ul>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-6 w-full justify-center">
                <SummaryTable {...dashboardData.summary.laTournee} />
                <SummaryTable {...dashboardData.summary.lesDistributions} />
                <SummaryTable {...dashboardData.summary.lesPrestationsSociales} />
            </div>

            <WriteNoteModal isOpen={isNoteModalOpen} onClose={() => setNoteModalOpen(false)} onSave={handleSaveNote} />
            <HouseholdEncounterModal isOpen={isEncounterModalOpen} onClose={() => setEncounterModalOpen(false)} onSave={handleSaveEncounter} />
        </div>
    );
};

export default DashboardPage;