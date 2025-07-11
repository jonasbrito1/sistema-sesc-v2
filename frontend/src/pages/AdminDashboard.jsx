import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/admin/Dashboard';
import Breadcrumb from '../components/common/Breadcrumb';

export default function AdminDashboard() {
  const { setPageTitle } = useApp();
  const { user } = useAuth();

  React.useEffect(() => {
    setPageTitle('SESC - Dashboard Administrativo');
  }, [setPageTitle]);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Olá, {user?.nome}!
          </h1>
          <p className="text-gray-600">
            Bem-vindo ao painel administrativo do SESC
          </p>
        </div>
      </div>

      <Dashboard />
    </div>
  );
}