import React, { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import SearchFilters from "./components/SearchFilters";
import ResultsTable from "./components/ResultsTable";
import HouseholdDetail from "./components/HouseholdDetail";
import AddHouseholdModal from "./components/AddHouseholdModal";
import StatisticsPage from "./components/StatisticsPage";
import PlaceholderPage from "./components/PlaceholderPage";
import LoginPage from "./components/LoginPage";
import DashboardPage from "./components/DashboardPage";
import AppHeader from "./components/AppHeader";
import { Household, NavItem, User } from "./types";

interface Filters {
  nom: string;
  prenom: string;
  idSisiao: string;
  adresse: string;
  codePostal: string;
  secteur: string;
  statut: string;
  mesure: string;
  equipe: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<NavItem>("Ménage");
  const [allHouseholds, setAllHouseholds] = useState<Household[]>([]);
  const [displayedHouseholds, setDisplayedHouseholds] = useState<Household[]>(
    []
  );
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    nom: "",
    prenom: "",
    idSisiao: "",
    adresse: "",
    codePostal: "",
    secteur: "",
    statut: "",
    mesure: "",
    equipe: "",
  });
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchHouseholds = async () => {
      try {
        const response = await fetch("/data/households.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Household[] = await response.json();
        setAllHouseholds(data);
      } catch (error) {
        console.error("Could not fetch households data:", error);
      }
    };

    fetchHouseholds();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleAddHousehold = useCallback(
    (idSisiao: string): "success" | "already_exists" | "not_found" => {
      const householdToAdd = allHouseholds.find((h) => h.idSisiao === idSisiao);

      if (householdToAdd) {
        if (!displayedHouseholds.some((h) => h.id === householdToAdd.id)) {
          setDisplayedHouseholds((prev) => [householdToAdd, ...prev]);
          return "success";
        } else {
          return "already_exists";
        }
      } else {
        return "not_found";
      }
    },
    [allHouseholds, displayedHouseholds]
  );

  const handleUpdateHousehold = (
    householdId: string,
    updates: Partial<Household>
  ) => {
    const update = (households: Household[]) =>
      households.map((h) => (h.id === householdId ? { ...h, ...updates } : h));
    setAllHouseholds(update);
    setDisplayedHouseholds(update);
  };

  const filteredHouseholds = useMemo(() => {
    return displayedHouseholds.filter((h) => {
      return (
        h.nom.toLowerCase().includes(filters.nom.toLowerCase()) &&
        h.prenom.toLowerCase().includes(filters.prenom.toLowerCase()) &&
        h.idSisiao.toLowerCase().includes(filters.idSisiao.toLowerCase()) &&
        h.adresse.toLowerCase().includes(filters.adresse.toLowerCase()) &&
        h.codePostal.toLowerCase().includes(filters.codePostal.toLowerCase()) &&
        h.secteur
          .toString()
          .toLowerCase()
          .includes(filters.secteur.toLowerCase()) &&
        h.statut.toLowerCase().includes(filters.statut.toLowerCase())
      );
    });
  }, [displayedHouseholds, filters]);

  const handleSelectHousehold = (id: string) => {
    setSelectedHouseholdId(id);
  };

  const handleViewChange = (view: NavItem) => {
    setActiveView(view);
    if (view === "Ménage") {
      setSelectedHouseholdId(null);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveView("Ménage"); // Set default view to Ménage on login
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout/", {
        method: "POST",
        credentials: "include",
      });
      localStorage.clear();
      sessionStorage.clear();
      setLogoutMessage("Déconnexion réussie.");
    } catch (e) {
      setLogoutMessage(
        "Déconnexion locale uniquement. La session serveur n'a pas pu être fermée."
      );
      console.warn("Erreur lors du logout serveur", e);
    }
    setCurrentUser(null);
    setActiveView("Ménage"); // Reset view on logout
    setTimeout(() => {
      setLogoutMessage(null);
      window.location.reload();
    }, 4000);
  };

  const selectedHousehold =
    allHouseholds.find((h) => h.id === selectedHouseholdId) || null;

  if (!currentUser) {
    return (
      <>
        {logoutMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            {logoutMessage}
          </div>
        )}
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case "Ménage":
        return selectedHousehold ? (
          <HouseholdDetail
            household={selectedHousehold}
            onUpdateHousehold={handleUpdateHousehold}
          />
        ) : (
          <>
            <SearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            <ResultsTable
              households={filteredHouseholds}
              onSelectHousehold={handleSelectHousehold}
              onOpenAddModal={() => setIsModalOpen(true)}
            />
          </>
        );
      case "Statistiques":
        return <StatisticsPage />;
      case "Intervenants":
        return <PlaceholderPage title="Intervenants" />;
      case "Dashboard":
        return <DashboardPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-screen-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg">
          <AppHeader user={currentUser} onLogout={handleLogout} />

          <main className="flex flex-col md:flex-row p-6 gap-6">
            <Sidebar activeView={activeView} onViewChange={handleViewChange} />
            <div className="flex-grow">{renderContent()}</div>
          </main>
        </div>

        <footer className="bg-red-500 text-white text-xs p-3 mt-4 rounded-md shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold">
            <span>Ariane</span>
          </div>
          <div className="flex flex-col text-right">
            <span>sisisao.social.gouv.fr</span>
            <span>interlogement93.net</span>
          </div>
        </footer>
      </div>

      <AddHouseholdModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddHousehold}
      />
    </div>
  );
};

export default App;
