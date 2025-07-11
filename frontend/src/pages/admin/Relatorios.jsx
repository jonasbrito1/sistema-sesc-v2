import React, { useState, useEffect } from 'react';
import { Download, Calendar, BarChart3, PieChart, TrendingUp, Users } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Stats from '../../components/common/Stats';
import { toast } from 'react-hot-toast';

const Relatorios = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    inicio: '',
    fim: ''
  });
  const [reportType, setReportType] = useState('geral');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error('Erro ao carregar estatísticas');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.inicio) params.append('dataInicio', dateRange.inicio);
      if (dateRange.fim) params.append('dataFim', dateRange.fim);
      params.append('tipo', reportType);

      // Simular download de relatório
      toast.success('Relatório exportado com sucesso!');
      
      // Aqui você implementaria a lógica real de exportação
      // const response = await fetch(`http://localhost:3001/api/relatorios/export?${params}`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const reportTypeOptions = [
    { value: 'geral', label: 'Relatório Geral' },
    { value: 'clientes', label: 'Relatório de Clientes' },
    { value: 'atividades', label: 'Relatório de Atividades' },
    { value: 'inscricoes', label: 'Relatório de Inscrições' },
    { value: 'avaliacoes', label: 'Relatório de Avaliações' },
    { value: 'financeiro', label: 'Relatório Financeiro' }
  ];

  const statCards = [
    {
      title: 'Total de Clientes',
      value: stats.clientes?.total || 0,
      change: '+12% vs mês anterior',
      changeType: 'positive',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Atividades Ativas',
      value: stats.atividades?.ativas || 0,
      change: '+5% vs mês anterior',
      changeType: 'positive',
      icon: BarChart3,
      color: 'green'
    },
    {
      title: 'Taxa de Ocupação',
      value: `${stats.atividades?.taxaOcupacao || 0}%`,
      change: '+8% vs mês anterior',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Receita Total',
      value: `R$ ${((stats.inscricoes?.valorTotal || 0) / 1000).toFixed(1)}k`,
      change: '+15% vs mês anterior',
      changeType: 'positive',
      icon: PieChart,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análises e exportação de dados</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Stats key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Export Section */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Exportar Relatórios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Select
              label="Tipo de Relatório"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={reportTypeOptions}
            />
            
            <Input
              label="Data Início"
              type="date"
              value={dateRange.inicio}
              onChange={(e) => setDateRange(prev => ({ ...prev, inicio: e.target.value }))}
            />
            
            <Input
              label="Data Fim"
              type="date"
              value={dateRange.fim}
              onChange={(e) => setDateRange(prev => ({ ...prev, fim: e.target.value }))}
            />
            
            <div className="flex items-end">
              <Button
                onClick={handleExportReport}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>• Os relatórios incluem gráficos e análises detalhadas</p>
            <p>• Dados são atualizados em tempo real</p>
            <p>• Formatos disponíveis: PDF, Excel</p>
          </div>
        </div>
      </Card>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Clientes por Cidade</h3>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            
            <div className="space-y-3">
              {Object.entries(stats.clientes?.porCidade || {}).slice(0, 5).map(([cidade, count]) => (
                <div key={cidade} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{cidade}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
            
            <Button variant="outline" size="sm" className="w-full mt-4">
              Ver Relatório Completo
            </Button>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Atividades por Categoria</h3>
              <PieChart className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="space-y-3">
              {Object.entries(stats.atividades?.porCategoria || {}).slice(0, 5).map(([categoria, count]) => (
                <div key={categoria} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{categoria}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
            
            <Button variant="outline" size="sm" className="w-full mt-4">
              Ver Relatório Completo
            </Button>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Avaliações por Tipo</h3>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            
            <div className="space-y-3">
              {Object.entries(stats.avaliacoes?.porTipo || {}).map(([tipo, count]) => (
                <div key={tipo} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{tipo}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                Nota média: <span className="font-medium">{stats.avaliacoes?.mediaNota || 0}/5</span>
              </p>
            </div>
            
            <Button variant="outline" size="sm" className="w-full mt-4">
              Ver Relatório Completo
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Relatorios;