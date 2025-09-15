import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Household, User, NavItem } from '../types';

// Types pour l'état global
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

interface AppState {
  // Authentication
  userId: string | null;
  isAuthenticated: boolean;
  
  // Navigation
  activeView: NavItem;
  
  // Households data
  allHouseholds: Household[];
  displayedHouseholds: Household[];
  selectedHouseholdId: string | null;
  
  // UI state
  filters: Filters;
  isModalOpen: boolean;
  logoutMessage: string | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

// Actions
type AppAction =
  | { type: 'SET_USER_ID'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_ACTIVE_VIEW'; payload: NavItem }
  | { type: 'SET_HOUSEHOLDS'; payload: Household[] }
  | { type: 'SET_DISPLAYED_HOUSEHOLDS'; payload: Household[] }
  | { type: 'SET_SELECTED_HOUSEHOLD'; payload: string | null }
  | { type: 'UPDATE_HOUSEHOLD'; payload: { id: string; updates: Partial<Household> } }
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'SET_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_LOGOUT_MESSAGE'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// État initial
const initialState: AppState = {
  userId: null,
  isAuthenticated: false,
  activeView: 'Ménage',
  allHouseholds: [],
  displayedHouseholds: [],
  selectedHouseholdId: null,
  filters: {
    nom: '',
    prenom: '',
    idSisiao: '',
    adresse: '',
    codePostal: '',
    secteur: '',
    statut: '',
    mesure: '',
    equipe: '',
  },
  isModalOpen: false,
  logoutMessage: null,
  isLoading: false,
  error: null,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER_ID':
      return {
        ...state,
        userId: action.payload,
        isAuthenticated: true,
        error: null,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        userId: null,
        isAuthenticated: false,
        activeView: 'Ménage',
        logoutMessage: null,
        // Nettoyage des données sensibles
        allHouseholds: [],
        displayedHouseholds: [],
        selectedHouseholdId: null,
        error: null,
      };
    
    case 'SET_ACTIVE_VIEW':
      return {
        ...state,
        activeView: action.payload,
        selectedHouseholdId: action.payload === 'Ménage' ? null : state.selectedHouseholdId,
      };
    
    case 'SET_HOUSEHOLDS':
      return {
        ...state,
        allHouseholds: action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'SET_DISPLAYED_HOUSEHOLDS':
      return {
        ...state,
        displayedHouseholds: action.payload,
      };
    
    case 'SET_SELECTED_HOUSEHOLD':
      return {
        ...state,
        selectedHouseholdId: action.payload,
      };
    
    case 'UPDATE_HOUSEHOLD':
      const updateHousehold = (households: Household[]) =>
        households.map((h) => (h.id === action.payload.id ? { ...h, ...action.payload.updates } : h));
      
      return {
        ...state,
        allHouseholds: updateHousehold(state.allHouseholds),
        displayedHouseholds: updateHousehold(state.displayedHouseholds),
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case 'SET_MODAL_OPEN':
      return {
        ...state,
        isModalOpen: action.payload,
      };
    
    case 'SET_LOGOUT_MESSAGE':
      return {
        ...state,
        logoutMessage: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personnalisé
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Hooks spécialisés
export const useAuth = () => {
  const { state, dispatch } = useApp();
  
  const login = (userId: string) => {
    dispatch({ type: 'SET_USER_ID', payload: userId });
  };
  
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };
  
  return {
    userId: state.userId,
    isAuthenticated: state.isAuthenticated,
    login,
    logout,
  };
};

export const useHouseholds = () => {
  const { state, dispatch } = useApp();
  
  const setHouseholds = (households: Household[]) => {
    dispatch({ type: 'SET_HOUSEHOLDS', payload: households });
  };
  
  const setDisplayedHouseholds = (households: Household[]) => {
    dispatch({ type: 'SET_DISPLAYED_HOUSEHOLDS', payload: households });
  };
  
  const updateHousehold = (id: string, updates: Partial<Household>) => {
    dispatch({ type: 'UPDATE_HOUSEHOLD', payload: { id, updates } });
  };
  
  const setSelectedHousehold = (id: string | null) => {
    dispatch({ type: 'SET_SELECTED_HOUSEHOLD', payload: id });
  };
  
  return {
    allHouseholds: state.allHouseholds,
    displayedHouseholds: state.displayedHouseholds,
    selectedHouseholdId: state.selectedHouseholdId,
    selectedHousehold: state.allHouseholds.find(h => h.id === state.selectedHouseholdId) || null,
    setHouseholds,
    setDisplayedHouseholds,
    updateHousehold,
    setSelectedHousehold,
  };
};

export const useNavigation = () => {
  const { state, dispatch } = useApp();
  
  const setActiveView = (view: NavItem) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  };
  
  return {
    activeView: state.activeView,
    setActiveView,
  };
};

export const useFilters = () => {
  const { state, dispatch } = useApp();
  
  const setFilters = (filters: Partial<Filters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };
  
  const updateFilter = (name: string, value: string) => {
    dispatch({ type: 'SET_FILTERS', payload: { [name]: value } });
  };
  
  return {
    filters: state.filters,
    setFilters,
    updateFilter,
  };
};

export const useUI = () => {
  const { state, dispatch } = useApp();
  
  const setModalOpen = (isOpen: boolean) => {
    dispatch({ type: 'SET_MODAL_OPEN', payload: isOpen });
  };
  
  const setLogoutMessage = (message: string | null) => {
    dispatch({ type: 'SET_LOGOUT_MESSAGE', payload: message });
  };
  
  return {
    isModalOpen: state.isModalOpen,
    logoutMessage: state.logoutMessage,
    isLoading: state.isLoading,
    error: state.error,
    setModalOpen,
    setLogoutMessage,
  };
};
