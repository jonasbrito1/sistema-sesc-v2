import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { auth } from '../services/auth';
import { toast } from 'react-toastify';

const AuthContext = createContext();

// Estado inicial
const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

// Actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
}

// Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar token ao carregar a aplicação
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      const response = await auth.verifyToken();
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.usuario,
            token,
          },
        });
      } else {
        localStorage.removeItem('token');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      localStorage.removeItem('token');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await auth.login(email, password);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: response.data,
        });
        toast.success('Login realizado com sucesso!');
        return { success: true };
      } else {
        toast.error(response.message || 'Erro ao fazer login');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao fazer login');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, message: 'Erro interno' };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await auth.register(userData);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: response.data,
        });
        toast.success('Cadastro realizado com sucesso!');
        return { success: true };
      } else {
        toast.error(response.message || 'Erro ao fazer cadastro');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro ao fazer cadastro');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, message: 'Erro interno' };
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.info('Logout realizado com sucesso');
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    isAdmin: state.user?.tipo === 'admin',
    isCliente: state.user?.tipo === 'cliente',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}