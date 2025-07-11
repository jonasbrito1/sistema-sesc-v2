import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import {
  Home, Users, Calendar, UserCheck, MessageCircle,
  BarChart3, Settings, X, FileText, Award, Building
} from 'lucide-react';

export default function Sidebar() {
  const { isAdmin, isCliente } = useAuth();
  const { sidebarOpen, setSidebar } = useApp();
  const location = useLocation();

  const adminMenuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/clientes', icon: Users, label: 'Clientes' },
    { path: '/admin/atividades', icon: Calendar, label: 'Atividades' },
    { path: '/admin/responsaveis', icon: UserCheck, label: 'Responsáveis' },
    { path: '/admin/inscricoes', icon: FileText, label: 'Inscrições' },
    { path: '/admin/avaliacoes', icon: MessageCircle, label: 'Avaliações' },
    { path: '/admin/relatorios', icon: BarChart3, label: 'Relatórios' },
    { path: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const clienteMenuItems = [
    { path: '/cliente', icon: Home, label: 'Início' },
    { path: '/cliente/atividades', icon: Calendar, label: 'Atividades' },
    { path: '/cliente/inscricoes', icon: FileText, label: 'Minhas Inscrições' },
    { path: '/cliente/avaliacoes', icon: MessageCircle, label: 'Avaliações' },
    { path: '/cliente/perfil', icon: Users, label: 'Meu Perfil' },
  ];

  const menuItems = isAdmin ? adminMenuItems : clienteMenuItems;

  const isActiveRoute = (path) => {
    return location.pathname === path || 
           (path !== '/admin' && path !== '/cliente' && location.pathname.startsWith(path));
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-strong transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building className="text-white" size={20} />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {isAdmin ? 'Admin' : 'Cliente'}
              </span>
            </div>
            <button
              onClick={() => setSidebar(false)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-200 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebar(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white text-center">
              <Award size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium">SESC Amazonas</p>
              <p className="text-xs opacity-90">Sistema de Inscrições</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}