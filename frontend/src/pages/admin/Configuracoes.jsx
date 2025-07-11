import React, { useState } from 'react';
import { Save, Bell, Mail, Shield, Database, Palette } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { toast } from 'react-hot-toast';

const Configuracoes = () => {
  const [config, setConfig] = useState({
    // Configurações Gerais
    nomeInstituicao: 'SESC Amazonas',
    emailContato: 'contato@sesc-am.com.br',
    telefoneContato: '(92) 3234-5678',
    enderecoSede: 'Rua Principal, 123 - Centro, Manaus/AM',
    
    // Configurações de Sistema
    limiteCadastrosPorHora: '10',
    tempoSessao: '30',
    backupAutomatico: true,
    manterLogs: '90',
    
    // Configurações de Email
    servidorEmail: 'smtp.gmail.com',
    portaEmail: '587',
    emailRemetente: 'sistema@sesc-am.com.br',
    nomeRemetente: 'Sistema SESC',
    
    // Configurações de Notificações
    notificarNovaInscricao: true,
    notificarCancelamento: true,
    notificarAvaliacao: true,
    notificarVagasEsgotadas: true,
    
    // Configurações de Interface
    temaCor: 'blue',
    logoUrl: '/logo-sesc.png',
    favicon: '/favicon.ico',
    rodape: '© 2025 SESC Amazonas. Todos os direitos reservados.'
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async (secao) => {
    setLoading(true);
    
    try {
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Configurações de ${secao} salvas com sucesso!`);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const temaOptions = [
    { value: 'blue', label: 'Azul (SESC)' },
    { value: 'green', label: 'Verde' },
    { value: 'purple', label: 'Roxo' },
    { value: 'gray', label: 'Cinza' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Gerais */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold">Configurações Gerais</h2>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Nome da Instituição"
                value={config.nomeInstituicao}
                onChange={(e) => handleInputChange('nomeInstituicao', e.target.value)}
              />
              
              <Input
                label="Email de Contato"
                type="email"
                value={config.emailContato}
                onChange={(e) => handleInputChange('emailContato', e.target.value)}
              />
              
              <Input
                label="Telefone de Contato"
                value={config.telefoneContato}
                onChange={(e) => handleInputChange('telefoneContato', e.target.value)}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço da Sede
                </label>
                <textarea
                  value={config.enderecoSede}
                  onChange={(e) => handleInputChange('enderecoSede', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <Button
                onClick={() => handleSave('Gerais')}
                loading={loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações Gerais
              </Button>
            </div>
          </div>
        </Card>

        {/* Configurações de Sistema */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Database className="w-5 h-5 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold">Configurações de Sistema</h2>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Limite de Cadastros por Hora"
                type="number"
                value={config.limiteCadastrosPorHora}
                onChange={(e) => handleInputChange('limiteCadastrosPorHora', e.target.value)}
              />
              
              <Input
                label="Tempo de Sessão (minutos)"
                type="number"
                value={config.tempoSessao}
                onChange={(e) => handleInputChange('tempoSessao', e.target.value)}
              />
              
              <Input
                label="Manter Logs por (dias)"
                type="number"
                value={config.manterLogs}
                onChange={(e) => handleInputChange('manterLogs', e.target.value)}
              />
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="backupAutomatico"
                  checked={config.backupAutomatico}
                  onChange={(e) => handleInputChange('backupAutomatico', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="backupAutomatico" className="ml-2 text-sm text-gray-700">
                  Backup automático diário
                </label>
              </div>
              
              <Button
                onClick={() => handleSave('Sistema')}
                loading={loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações de Sistema
              </Button>
            </div>
          </div>
        </Card>

        {/* Configurações de Email */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Mail className="w-5 h-5 text-purple-500 mr-2" />
              <h2 className="text-lg font-semibold">Configurações de Email</h2>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Servidor SMTP"
                value={config.servidorEmail}
                onChange={(e) => handleInputChange('servidorEmail', e.target.value)}
              />
              
              <Input
                label="Porta SMTP"
                value={config.portaEmail}
                onChange={(e) => handleInputChange('portaEmail', e.target.value)}
              />
              
              <Input
                label="Email Remetente"
                type="email"
                value={config.emailRemetente}
                onChange={(e) => handleInputChange('emailRemetente', e.target.value)}
              />
              
              <Input
                label="Nome do Remetente"
                value={config.nomeRemetente}
                onChange={(e) => handleInputChange('nomeRemetente', e.target.value)}
              />
              
              <Button
                onClick={() => handleSave('Email')}
                loading={loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações de Email
              </Button>
            </div>
          </div>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-yellow-500 mr-2" />
              <h2 className="text-lg font-semibold">Notificações</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notificarNovaInscricao"
                  checked={config.notificarNovaInscricao}
                  onChange={(e) => handleInputChange('notificarNovaInscricao', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notificarNovaInscricao" className="ml-2 text-sm text-gray-700">
                  Notificar nova inscrição
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notificarCancelamento"
                  checked={config.notificarCancelamento}
                  onChange={(e) => handleInputChange('notificarCancelamento', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notificarCancelamento" className="ml-2 text-sm text-gray-700">
                  Notificar cancelamento
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notificarAvaliacao"
                  checked={config.notificarAvaliacao}
                  onChange={(e) => handleInputChange('notificarAvaliacao', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notificarAvaliacao" className="ml-2 text-sm text-gray-700">
                  Notificar nova avaliação
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notificarVagasEsgotadas"
                  checked={config.notificarVagasEsgotadas}
                  onChange={(e) => handleInputChange('notificarVagasEsgotadas', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notificarVagasEsgotadas" className="ml-2 text-sm text-gray-700">
                  Notificar vagas esgotadas
                </label>
              </div>
              
              <Button
                onClick={() => handleSave('Notificações')}
                loading={loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações de Notificações
              </Button>
            </div>
          </div>
        </Card>

        {/* Configurações de Interface */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Palette className="w-5 h-5 text-pink-500 mr-2" />
              <h2 className="text-lg font-semibold">Configurações de Interface</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tema de Cores"
                value={config.temaCor}
                onChange={(e) => handleInputChange('temaCor', e.target.value)}
                options={temaOptions}
              />
              
              <Input
                label="URL do Logo"
                value={config.logoUrl}
                onChange={(e) => handleInputChange('logoUrl', e.target.value)}
              />
              
              <Input
                label="Favicon"
                value={config.favicon}
                onChange={(e) => handleInputChange('favicon', e.target.value)}
              />
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto do Rodapé
                </label>
                <textarea
                  value={config.rodape}
                  onChange={(e) => handleInputChange('rodape', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <Button
                  onClick={() => handleSave('Interface')}
                  loading={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações de Interface
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Configuracoes;