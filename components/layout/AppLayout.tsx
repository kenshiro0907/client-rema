import React from 'react';
import { useAuth, useNavigation, useUI } from '../../contexts/AppContext';
import AppHeader from '../AppHeader';
import Sidebar from '../Sidebar';
import LoginPage from '../LoginPage';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { activeView, setActiveView } = useNavigation();
  const { logoutMessage } = useUI();

  if (!isAuthenticated) {
    return (
      <>
        {logoutMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            {logoutMessage}
          </div>
        )}
        <LoginPage />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-screen-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg">
          <AppHeader />

          <main className="flex flex-col md:flex-row p-6 gap-6">
            <Sidebar activeView={activeView} onViewChange={setActiveView} />
            <div className="flex-grow">{children}</div>
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
    </div>
  );
};

export default AppLayout;
