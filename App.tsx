import React from 'react';
import { AppProvider } from './contexts/AppContext';
import AppLayout from './components/layout/AppLayout';
import MainContent from './components/layout/MainContent';

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppLayout>
        <MainContent />
      </AppLayout>
    </AppProvider>
  );
};

export default App;
