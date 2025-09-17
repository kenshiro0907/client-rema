import React, { lazy, Suspense } from 'react';
import { useNavigation, useHouseholds, useAuth } from '../../contexts/AppContext';
import { useHouseholds as useHouseholdsHook } from '../../hooks/useHouseholds';
import { useFilters } from '../../hooks/useFilters';
import { LoadingSpinner } from '../common';
import SearchFilters from '../SearchFilters';
import ResultsTable from '../ResultsTable';
import HouseholdDetail from '../HouseholdDetail';
import AddHouseholdModal from '../AddHouseholdModal';
import PlaceholderPage from '../PlaceholderPage';
import AuthStatusBanner from '../AuthStatusBanner';
import { useUI } from '../../contexts/AppContext';

// Lazy loading des composants lourds
const DashboardPage = lazy(() => import('../DashboardPage'));
const StatisticsPage = lazy(() => import('../StatisticsPage'));

const MainContent: React.FC = () => {
  const { activeView } = useNavigation();
  const { selectedHousehold, setSelectedHousehold } = useHouseholds();
  const { filteredHouseholds, addHouseholdToDisplay, isUsingFallback } = useHouseholdsHook();
  const { handleFilterChange, filters } = useFilters();
  const { isModalOpen, setModalOpen } = useUI();
  const { isAuthenticated } = useAuth();

  const handleSelectHousehold = (id: string) => {
    setSelectedHousehold(id);
  };

  const handleOpenAddModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'Ménage':
        return selectedHousehold ? (
          <HouseholdDetail
            household={selectedHousehold}
            onUpdateHousehold={(id, updates) => {
              // Cette logique sera gérée par le hook useHouseholds
            }}
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
              onOpenAddModal={handleOpenAddModal}
            />
          </>
        );

      case 'Statistiques':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <StatisticsPage />
          </Suspense>
        );

      case 'Intervenants':
        return <PlaceholderPage title="Intervenants" />;

      case 'Dashboard':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardPage />
          </Suspense>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <AuthStatusBanner 
        isAuthenticated={isAuthenticated} 
        isUsingFallback={isUsingFallback} 
      />
      {renderContent()}
      
      <AddHouseholdModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={addHouseholdToDisplay}
      />
    </>
  );
};

export default MainContent;
