import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

// Componente de proteção de rotas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Páginas temporárias para evitar erros
const TempPage = ({ title, description, emoji }) => (
  <div style={{
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb'
  }}>
    <div style={{ textAlign: 'center', padding: '32px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>{emoji}</div>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
        {title}
      </h1>
      <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '24px' }}>
        {description}
      </p>
      <button 
        onClick={() => window.history.back()}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
         Voltar
      </button>
    </div>
  </div>
);

const Login = () => <TempPage title="Login" description="Página de login em desenvolvimento" emoji="🔐" />;
const Register = () => <TempPage title="Cadastro" description="Página de cadastro em desenvolvimento" emoji="" />;
const Atividades = () => <TempPage title="Atividades" description="Lista de atividades em desenvolvimento" emoji="" />;
const Inscricoes = () => <TempPage title="Inscrições" description="Suas inscrições em desenvolvimento" emoji="" />;
const Dashboard = () => <TempPage title="Dashboard" description="Dashboard administrativo em desenvolvimento" emoji="" />;
const Profile = () => <TempPage title="Perfil" description="Seu perfil em desenvolvimento" emoji="" />;

function AppContent() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/atividades" element={<Atividades />} />
          
          <Route path="/inscricoes" element={
            <ProtectedRoute>
              <Inscricoes />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={
            <div style={{
              minHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '96px', fontWeight: 'bold', color: '#d1d5db' }}>404</h1>
                <p style={{ fontSize: '20px', color: '#6b7280', margin: '16px 0' }}>
                  Página não encontrada
                </p>
                <button 
                  onClick={() => window.history.back()}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                   Voltar
                </button>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
