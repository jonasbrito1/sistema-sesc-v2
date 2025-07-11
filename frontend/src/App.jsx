import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { LoadingPage } from './components/common/Loading';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ClienteArea from './pages/ClienteArea';

// Admin Pages
const AdminClientes = React.lazy(() => import('./pages/admin/Clientes'));
const AdminAtividades = React.lazy(() => import('./pages/admin/Atividades'));
const AdminResponsaveis = React.lazy(() => import('./pages/admin/Responsaveis'));
const AdminInscricoes = React.lazy(() => import('./pages/admin/Inscricoes'));
const AdminAvaliacoes = React.lazy(() => import('./pages/admin/Avaliacoes'));
const AdminRelatorios = React.lazy(() => import('./pages/admin/Relatorios'));
const AdminConfiguracoes = React.lazy(() => import('./pages/admin/Configuracoes'));

// Cliente Pages
const ClienteAtividades = React.lazy(() => import('./pages/cliente/Atividades'));
const ClienteInscricoes = React.lazy(() => import('./pages/cliente/Inscricoes'));
const ClienteAvaliacoes = React.lazy(() => import('./pages/cliente/Avaliacoes'));
const ClientePerfil = React.lazy(() => import('./pages/cliente/Perfil'));

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route
                    path="clientes"
                    element={
                      <React.Suspense fallback={<LoadingPage />}>
                        <AdminClientes />
                      </React.Suspense>
                    }
                  />
                  <Route
                    path="atividades"
                    element={
                      <React.Suspense fallback={<LoadingPage />}>
                        <AdminAtividades />
                      </React.Suspense>
                    }
                  />
                  <Route
                    path="responsaveis"
                    element={
                      <React.Suspense fallback={<LoadingPage />}>
                        <AdminResponsaveis />
                      </React.Suspense>
                    }
                  />
                  <Route
                    path="inscricoes"
                    element={
                      <React.Suspense fallback={<LoadingPage />}>
                        <AdminInscricoes />
                      </React.Suspense>
                    }
                  />
                  <Route
                    path="avaliacoes"
                    element={
                      <React.Suspense fallback={<LoadingPage />}>
                        <AdminAvaliacoes />
                      </React.Suspense>
                    }
                  />
                  <Route
                    path="relatorios"
                    element={
                      <React.Suspense fallback={<LoadingPage />}>
                        <AdminRelatorios />
                      </React.Suspense>
                    }
                  />
                  <Route
                    path="configuracoes"
                    element={
                      <React.Suspense fallback={<LoadingPage />}>
                        <AdminConfiguracoes />
                      </React.Suspense>
                    }
                  />
                </Route>

                {/* Protected Cliente Routes */}
                <Route
                  path="/cliente"
                  element={
                    <ProtectedRoute requireCliente>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ClienteArea />} />
                  <Route
                    path="atividades"
                    element={
                      <React.Suspense fallback={<LoadingPage />}>
                        <ClienteAtividades />
                      </React.Suspense>
                    }
                  />
                  <Route
                    path="inscricoes"
                    element={
                      <React.Suspense fallback={<LoadingPage />}>
                        <ClienteInscricoes />
                      </React.Suspense>
                    }
                  />
                  <Route
                    path="avaliacoes"
                    element={
                      <React.Suspense fallback={<LoadingPage />}>
                        <ClienteAvaliacoes />
                      </React.Suspense>
                    }
                  />
                  <Route
                    path="perfil"
                    element={
                      <React.Suspense fallback={<LoadingPage />}>
                        <ClientePerfil />
                      </React.Suspense>
                    }
                  />
                </Route>

                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              {/* Toast Container */}
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </Router>
        </AuthProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;