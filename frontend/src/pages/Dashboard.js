import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiService.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Erro ao carregar stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          📊 Dashboard Administrativo
        </h1>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.resumo.totalClientes}</div>
              <p className="text-gray-600">👥 Total de Clientes</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-3xl font-bold text-green-600">{stats.resumo.totalAtividades}</div>
              <p className="text-gray-600">🏃 Total de Atividades</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.resumo.totalInscricoes}</div>
              <p className="text-gray-600">📋 Total de Inscrições</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.resumo.mediaAvaliacoes}⭐</div>
              <p className="text-gray-600">⭐ Avaliação Média</p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">🚧 Funcionalidades em Desenvolvimento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <h3 className="font-semibold">👥 Gerenciar Clientes</h3>
              <p className="text-sm text-gray-600">Em breve...</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-semibold">🏃 Gerenciar Atividades</h3>
              <p className="text-sm text-gray-600">Em breve...</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-semibold">📊 Relatórios</h3>
              <p className="text-sm text-gray-600">Em breve...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
