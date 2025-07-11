import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, MessageCircle, TrendingUp, DollarSign } from 'lucide-react';
import { StatsGrid, StatCard } from '../common/Stats';
import Card from '../common/Card';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { dashboardService } from '../../services/dashboard';
import { useApi } from '../../hooks/useApi';
import { Loading } from '../common/Loading';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const { loading, request } = useApi();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const result = await request(() => dashboardService.estatisticas());
    if (result.success) {
      setStats(result.data);
    }
  };

  if (loading && !stats) {
    return <Loading size="lg" text="Carregando dashboard..." />;
  }

  const statsCards = stats ? [
    {
      title: 'Total de Clientes',
      value: stats.resumo.totalClientes,
      change: `${stats.resumo.clientesAtivos} ativos`,
      changeType: 'neutral',
      icon: Users,
      color: 'primary',
    },
    {
      title: 'Atividades Ativas',
      value: stats.resumo.atividadesAtivas,
      change: `${stats.resumo.totalAtividades} total`,
      changeType: 'neutral',
      icon: Calendar,
      color: 'success',
    },
    {
      title: 'Inscrições Confirmadas',
      value: stats.resumo.inscricoesConfirmadas,
      change: `${stats.resumo.totalInscricoes} total`,
      changeType: 'increase',
      icon: FileText,
      color: 'warning',
    },
    {
      title: 'Receita Total',
      value: `R$ ${stats.resumo.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: 'Este mês',
      changeType: 'increase',
      icon: DollarSign,
      color: 'success',
    },
  ] : [];

  const inscricoesChartData = {
    labels: ['Pendente', 'Confirmada', 'Cancelada'],
    datasets: [
      {
        data: stats ? [
          stats.inscricoesPorStatus.pendente,
          stats.inscricoesPorStatus.confirmada,
          stats.inscricoesPorStatus.cancelada,
        ] : [],
        backgroundColor: [
          '#f59e0b',
          '#10b981',
          '#ef4444',
        ],
        borderWidth: 0,
      },
    ],
  };

  const avaliacoesChartData = {
    labels: ['Elogios', 'Críticas', 'Sugestões'],
    datasets: [
      {
        label: 'Avaliações',
        data: stats ? [
          stats.avaliacoesPorTipo.elogio,
          stats.avaliacoesPorTipo.critica,
          stats.avaliacoesPorTipo.sugestao,
        ] : [],
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do sistema SESC</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select className="form-select">
            <option>Últimos 30 dias</option>
            <option>Últimos 7 dias</option>
            <option>Este mês</option>
            <option>Este ano</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsGrid stats={statsCards} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inscrições Chart */}
        <Card title="Distribuição de Inscrições">
          <div className="h-64 flex items-center justify-center">
            {stats ? (
              <Doughnut data={inscricoesChartData} options={chartOptions} />
            ) : (
              <Loading />
            )}
          </div>
        </Card>

        {/* Avaliações Chart */}
        <Card title="Avaliações por Tipo">
          <div className="h-64">
            {stats ? (
              <Bar data={avaliacoesChartData} options={chartOptions} />
            ) : (
              <Loading />
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Ações Rápidas">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
            <Users className="text-primary-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900">Adicionar Cliente</h3>
            <p className="text-sm text-gray-500">Cadastrar novo cliente</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
            <Calendar className="text-success-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900">Nova Atividade</h3>
            <p className="text-sm text-gray-500">Criar nova atividade</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
            <FileText className="text-warning-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900">Relatórios</h3>
            <p className="text-sm text-gray-500">Gerar relatórios</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
            <MessageCircle className="text-error-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900">Avaliações</h3>
            <p className="text-sm text-gray-500">Gerenciar avaliações</p>
          </button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title="Atividade Recente">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nova inscrição confirmada</p>
              <p className="text-xs text-gray-500">João Silva se inscreveu em Natação Infantil</p>
            </div>
            <span className="text-xs text-gray-500">5 min atrás</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nova atividade criada</p>
              <p className="text-xs text-gray-500">Yoga para Idosos foi adicionada</p>
            </div>
            <span className="text-xs text-gray-500">1 hora atrás</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Avaliação recebida</p>
              <p className="text-xs text-gray-500">Maria Oliveira avaliou Dança de Salão</p>
            </div>
            <span className="text-xs text-gray-500">2 horas atrás</span>
          </div>
        </div>
      </Card>
    </div>
  );
}