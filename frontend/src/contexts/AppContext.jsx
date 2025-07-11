import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

// Estado inicial
const initialState = {
  sidebarOpen: false,
  theme: 'light',
  notifications: [],
  filters: {},
  pageTitle: 'SESC - Sistema de Inscrições',
};

// Actions
const APP_ACTIONS = {
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR: 'SET_SIDEBAR',
  SET_THEME: 'SET_THEME',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGE_TITLE: 'SET_PAGE_TITLE',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };
    case APP_ACTIONS.SET_SIDEBAR:
      return {
        ...state,
        sidebarOpen: action.payload,
      };
    case APP_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    case APP_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case APP_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case APP_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case APP_ACTIONS.SET_PAGE_TITLE:
      return {
        ...state,
        pageTitle: action.payload,
      };
    default:
      return state;
  }
}

// Provider Component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toggleSidebar = () => {
    dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR });
  };

  const setSidebar = (open) => {
    dispatch({ type: APP_ACTIONS.SET_SIDEBAR, payload: open });
  };

  const setTheme = (theme) => {
    dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme });
    localStorage.setItem('theme', theme);
  };

  const addNotification = (notification) => {
    const id = Date.now().toString();
    dispatch({
      type: APP_ACTIONS.ADD_NOTIFICATION,
      payload: { id, ...notification },
    });

    // Auto remove após 5 segundos
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    dispatch({ type: APP_ACTIONS.REMOVE_NOTIFICATION, payload: id });
  };

  const setFilters = (filters) => {
    dispatch({ type: APP_ACTIONS.SET_FILTERS, payload: filters });
  };

  const setPageTitle = (title) => {
    dispatch({ type: APP_ACTIONS.SET_PAGE_TITLE, payload: title });
    document.title = title;
  };

  const value = {
    ...state,
    toggleSidebar,
    setSidebar,
    setTheme,
    addNotification,
    removeNotification,
    setFilters,
    setPageTitle,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}