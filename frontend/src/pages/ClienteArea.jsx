import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Calendar, FileText, Star, TrendingUp, Clock, Award } from 'lucide-react';
import { StatsGrid } from '../components/common/Stats';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { inscricaoService } from '../services/inscricoes';
import { useApi } from '../hooks/useApi';
import { Loading } from '../components/common/Loading';

export default function ClienteArea() {
  const { user } = useAuth();
  const { setPageTitle } = useApp();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const { loading, request } = useApi();

  useEffect(() => {
    setPageTitle('SESC - Área do Cliente');
    loadUserStats();
    loadRecentActivities();
  }, [setPageTitle]);

  const loadUserStats = async () => {
    // Carregar estatísticas do usuário
    // Por enquanto, dados mock
    setStats({
      inscricoesAtivas: 3,
      atividadesParticipadas: 12,
      avaliacoesFeitas: 8,
      proximasAtividades: 2,
    });
  };

  const loadRecentActivities = async () => {
    // Carregar atividades recentes do usuário
    // Por enquanto, dados mock
    setRecentActivities([
      {
        id: 1,
        titulo: 'Aula de Natação',
        data: '2024-01-15T10:00:00',
        status: 'confirmada',
        unidade: 'SESC Centro',
      },
      {
        id: 2,
        titulo: 'Yoga para Iniciantes',
        data: '2024-01-18T14:00:00',
        status: 'confirmada',
        unidade: 'SESC Balneário',
      },
    ]);
  };

  const statsCards = [
    {
      title: 'Inscrições Ativas',
      value: stats?.inscricoesAtivas || 0,
      icon: FileText,
      color: 'primary',
    },
    {
      title: 'Atividades Participadas',
      value: stats?.atividadesParticipadas || 0,
      icon: Calendar,
      color: 'success',
    },
    {
      title: 'Avaliações Feitas',
      value: stats?.avaliacoesFeitas || 0,
      icon: Star,
      color: 'warning',
    },
    {
      title: 'Próximas Atividades',
      value: stats?.proximasAtividades || 0,
      icon: Clock,
      color: 'error',
    },
  ];

  if (loading && !stats) {
    return <Loading size="lg" text="Carregando área do cliente..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="gradient-bg text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Olá, {user?.nome}! 👋
            </h1>
            <p className="text-primary-100">
              Bem-vindo de volta! Veja suas atividades e continue sua jornada de bem-estar.
            </p>
          </div>
          <div className="hidden sm:block">
            <Award size={48} className="text-primary-200" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid stats={statsCards} />

      {/* Quick Actions & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card title="Ações Rápidas">
          <div className="space-y-3">
            <Button
              as={Link}
              to="/cliente/atividades"
              variant="outline"
              className="w-full justify-start"
              icon={Calendar}
            >
              Buscar Novas Atividades
            </Button>
            
            <Button
              as={Link}
              to="/cliente/inscricoes"
              variant="outline"
              className="w-full justify-start"
              icon={FileText}
            >
              Ver Minhas Inscrições
            </Button>
            
            <Button
              as={Link}
              to="/cliente/avaliacoes"
              variant="outline"
              className="w-full justify-start"
              icon={Star}
            >
              Avaliar Atividades
            </Button>
            
            <Button
              as={Link}
              to="/cliente/perfil"
              variant="outline"
              className="w-full justify-start"
              icon={FileText}
            >
              Atualizar Perfil
            </Button>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card 
          title="Próximas Atividades"
          actions={
            <Button as={Link} to="/cliente/inscricoes" variant="ghost" size="sm">
              Ver todas
            </Button>
          }
        >
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
              <p>Nenhuma atividade próxima</p>
              <Button
                as={Link}
                to="/cliente/atividades"
                variant="primary"
                size="sm"
                className="mt-4"
              >
                Buscar Atividades
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{activity.titulo}</h4>
                    <p className="text-sm text-gray-500">{activity.unidade}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.data).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(activity.data).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-success text-xs">
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Progress Section */}
      <Card title="Seu Progresso">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="text-primary-600" size={24} />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Nível Iniciante</h3>
            <p className="text-sm text-gray-500">Continue participando para evoluir!</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="text-success-600" size={24} />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">12 Atividades</h3>
            <p className="text-sm text-gray-500">Participadas este ano</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="text-warning-600" size={24} />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">4.8 Estrelas</h3>
            <p className="text-sm text-gray-500">Média das suas avaliações</p>
          </div>
        </div>
      </Card>
    </div>
  );
}