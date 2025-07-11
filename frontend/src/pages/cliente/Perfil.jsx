import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { toast } from 'react-hot-toast';

const PerfilCliente = () => {
  const [cliente, setCliente] = useState({
    NOME_CLIENTE: '',
    EMAIL: '',
    TELEFONE: '',
    DATA_NASCIMENTO: '',
    CEP: '',
    LOGRADOURO: '',
    NUMERO: '',
    BAIRRO: '',
    CIDADE: '',
    ESTADO: ''
  });
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalInscricoes: 0,
    inscricoesAtivas: 0,
    avaliacoes: 0
  });

  useEffect(() => {
    loadClienteData();
    loadStats();
  }, []);

  const loadClienteData = () => {
    // Simular carregamento dos dados do cliente do localStorage
    // Em um app real, viria de uma API autenticada
    const dadosCliente = {
      NOME_CLIENTE: localStorage.getItem('sesc_cliente_nome') || 'João Silva',
      EMAIL: localStorage.getItem('sesc_cliente_email') || 'joao@email.com',
      TELEFONE: localStorage.getItem('sesc_cliente_telefone') || '(11) 99999-9999',
      DATA_NASCIMENTO: localStorage.getItem('sesc_cliente_nascimento') || '1990-05-15',
      CEP: localStorage.getItem('sesc_cliente_cep') || '01310100',
      LOGRADOURO: localStorage.getItem('sesc_cliente_logradouro') || 'Avenida Paulista',
      NUMERO: localStorage.getItem('sesc_cliente_numero') || '1000',
      BAIRRO: localStorage.getItem('sesc_cliente_bairro') || 'Bela Vista',
      CIDADE: localStorage.getItem('sesc_cliente_cidade') || 'São Paulo',
      ESTADO: localStorage.getItem('sesc_cliente_estado') || 'SP'
    };
    
    setCliente(dadosCliente);
  };

  const loadStats = async () => {
    try {
      // Simular carregamento das estatísticas
      // Em um app real, faria requisições para as APIs
      setStats({
        totalInscricoes: parseInt(localStorage.getItem('sesc_total_inscricoes')) || 5,
        inscricoesAtivas: parseInt(localStorage.getItem('sesc_inscricoes_ativas')) || 3,
        avaliacoes: parseInt(localStorage.getItem('sesc_total_avaliacoes')) || 2
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Simular salvamento (em um app real, faria PUT para API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Salvar no localStorage
      Object.keys(cliente).forEach(key => {
        localStorage.setItem(`sesc_cliente_${key.toLowerCase()}`, cliente[key]);
      });
      
      toast.success('Perfil atualizado com sucesso!');
      setEditMode(false);
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCEPSearch = async (cep) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`http://localhost:3001/api/clientes/cep/${cep}`);
        const data = await response.json();
        
        if (data.success) {
          setCliente(prev => ({
            ...prev,
            LOGRADOURO: data.data.LOGRADOURO || '',
            BAIRRO: data.data.BAIRRO || '',
            CIDADE: data.data.CIDADE || '',
            ESTADO: data.data.ESTADO || ''
          }));
          toast.success('Endereço encontrado!');
        }
      } catch (error) {
        toast.error('CEP não encontrado');
      }
    }
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return 0;
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const diferenciaMes = hoje.getMonth() - nascimento.getMonth();
    
    if (diferenciaMes < 0 || (diferenciaMes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  const handleInputChange = (field, value) => {
    setCliente(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-2">Gerencie suas informações pessoais</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalInscricoes}</div>
            <div className="text-gray-600">Total de Inscrições</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.inscricoesAtivas}</div>
            <div className="text-gray-600">Inscrições Ativas</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.avaliacoes}</div>
            <div className="text-gray-600">Avaliações Feitas</div>
          </div>
        </Card>
      </div>

      {/* Profile Info */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Informações Pessoais</h2>
            
            {!editMode ? (
              <Button onClick={() => setEditMode(true)} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSave} 
                  loading={loading}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button 
                  onClick={() => {
                    setEditMode(false);
                    loadClienteData(); // Recarregar dados originais
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Dados Básicos</h3>
              
              <div className="space-y-4">
                <Input
                  label="Nome Completo"
                  value={cliente.NOME_CLIENTE}
                  onChange={(e) => handleInputChange('NOME_CLIENTE', e.target.value)}
                  disabled={!editMode}
                  icon={User}
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={cliente.EMAIL}
                  onChange={(e) => handleInputChange('EMAIL', e.target.value)}
                  disabled={!editMode}
                  icon={Mail}
                />
                
                <Input
                  label="Telefone"
                  value={cliente.TELEFONE}
                  onChange={(e) => handleInputChange('TELEFONE', e.target.value)}
                  disabled={!editMode}
                  icon={Phone}
                />
                
                <Input
                  label="Data de Nascimento"
                  type="date"
                  value={cliente.DATA_NASCIMENTO}
                  onChange={(e) => handleInputChange('DATA_NASCIMENTO', e.target.value)}
                  disabled={!editMode}
                  icon={Calendar}
                />
                
                {cliente.DATA_NASCIMENTO && (
                  <div className="text-sm text-gray-600">
                    Idade: {calcularIdade(cliente.DATA_NASCIMENTO)} anos
                  </div>
                )}
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Endereço</h3>
              
              <div className="space-y-4">
                <Input
                  label="CEP"
                  value={cliente.CEP}
                  onChange={(e) => {
                    const cepValue = e.target.value.replace(/\D/g, '');
                    handleInputChange('CEP', cepValue);
                    if (editMode && cepValue.length === 8) {
                      handleCEPSearch(cepValue);
                    }
                  }}
                  disabled={!editMode}
                  placeholder="00000000"
                  maxLength={8}
                  icon={MapPin}
                />
                
                <Input
                  label="Logradouro"
                  value={cliente.LOGRADOURO}
                  onChange={(e) => handleInputChange('LOGRADOURO', e.target.value)}
                  disabled={!editMode}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Número"
                    value={cliente.NUMERO}
                    onChange={(e) => handleInputChange('NUMERO', e.target.value)}
                    disabled={!editMode}
                  />
                  
                  <Input
                    label="Bairro"
                    value={cliente.BAIRRO}
                    onChange={(e) => handleInputChange('BAIRRO', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Cidade"
                    value={cliente.CIDADE}
                    onChange={(e) => handleInputChange('CIDADE', e.target.value)}
                    disabled={!editMode}
                  />
                  
                  <Input
                    label="Estado"
                    value={cliente.ESTADO}
                    onChange={(e) => handleInputChange('ESTADO', e.target.value)}
                    disabled={!editMode}
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <Calendar className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm">Ver Inscrições</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <User className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm">Explorar Atividades</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <Mail className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm">Fazer Avaliação</div>
              </div>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PerfilCliente;