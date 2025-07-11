import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, MapPin } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { toast } from 'react-hot-toast';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [formData, setFormData] = useState({
    NOME_CLIENTE: '',
    DATA_NASCIMENTO: '',
    CEP: '',
    EMAIL: '',
    TELEFONE: '',
    LOGRADOURO: '',
    NUMERO: '',
    BAIRRO: '',
    CIDADE: '',
    ESTADO: ''
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/clientes');
      const data = await response.json();
      
      if (data.success) {
        setClientes(data.data || []);
      } else {
        toast.error('Erro ao carregar clientes');
      }
    } catch (error) {
      toast.error('Erro de conexão');
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
          setFormData(prev => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = modalMode === 'create' 
        ? 'http://localhost:3001/api/clientes'
        : `http://localhost:3001/api/clientes/${selectedCliente.ID_CLIENTE}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(modalMode === 'create' ? 'Cliente criado!' : 'Cliente atualizado!');
        setShowModal(false);
        fetchClientes();
        resetForm();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao salvar cliente');
    }
  };

  const handleDelete = async (cliente) => {
    if (window.confirm(`Deseja excluir ${cliente.NOME_CLIENTE}?`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/clientes/${cliente.ID_CLIENTE}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Cliente excluído!');
          fetchClientes();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error('Erro ao excluir cliente');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      NOME_CLIENTE: '',
      DATA_NASCIMENTO: '',
      CEP: '',
      EMAIL: '',
      TELEFONE: '',
      LOGRADOURO: '',
      NUMERO: '',
      BAIRRO: '',
      CIDADE: '',
      ESTADO: ''
    });
    setSelectedCliente(null);
  };

  const openModal = (mode, cliente = null) => {
    setModalMode(mode);
    setSelectedCliente(cliente);
    
    if (cliente) {
      setFormData({
        NOME_CLIENTE: cliente.NOME_CLIENTE || '',
        DATA_NASCIMENTO: cliente.DATA_NASCIMENTO?.split('T')[0] || '',
        CEP: cliente.CEP || '',
        EMAIL: cliente.EMAIL || '',
        TELEFONE: cliente.TELEFONE || '',
        LOGRADOURO: cliente.LOGRADOURO || '',
        NUMERO: cliente.NUMERO || '',
        BAIRRO: cliente.BAIRRO || '',
        CIDADE: cliente.CIDADE || '',
        ESTADO: cliente.ESTADO || ''
      });
    } else {
      resetForm();
    }
    
    setShowModal(true);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.NOME_CLIENTE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.CIDADE?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'NOME_CLIENTE',
      label: 'Nome',
      render: (cliente) => (
        <div>
          <div className="font-medium">{cliente.NOME_CLIENTE}</div>
          <div className="text-sm text-gray-500">{cliente.EMAIL}</div>
        </div>
      )
    },
    {
      key: 'CIDADE',
      label: 'Localização',
      render: (cliente) => (
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{cliente.CIDADE} - {cliente.ESTADO}</span>
        </div>
      )
    },
    {
      key: 'TELEFONE',
      label: 'Telefone',
    },
    {
      key: 'STATUS',
      label: 'Status',
      render: (cliente) => (
        <Badge color={cliente.STATUS === 'ATIVO' ? 'green' : 'red'}>
          {cliente.STATUS || 'ATIVO'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (cliente) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openModal('view', cliente)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openModal('edit', cliente)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="red"
            onClick={() => handleDelete(cliente)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes do SESC</p>
        </div>
        <Button onClick={() => openModal('create')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome, email ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredClientes}
          loading={loading}
          emptyMessage="Nenhum cliente encontrado"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalMode === 'create' ? 'Novo Cliente' :
          modalMode === 'edit' ? 'Editar Cliente' :
          'Detalhes do Cliente'
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              value={formData.NOME_CLIENTE}
              onChange={(e) => setFormData(prev => ({ ...prev, NOME_CLIENTE: e.target.value }))}
              required
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Data de Nascimento"
              type="date"
              value={formData.DATA_NASCIMENTO}
              onChange={(e) => setFormData(prev => ({ ...prev, DATA_NASCIMENTO: e.target.value }))}
              required
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="CEP"
              value={formData.CEP}
              onChange={(e) => {
                const cepValue = e.target.value.replace(/\D/g, '');
                setFormData(prev => ({ ...prev, CEP: cepValue }));
                if (cepValue.length === 8) {
                  handleCEPSearch(cepValue);
                }
              }}
              placeholder="00000000"
              maxLength={8}
              required
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.EMAIL}
              onChange={(e) => setFormData(prev => ({ ...prev, EMAIL: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Telefone"
              value={formData.TELEFONE}
              onChange={(e) => setFormData(prev => ({ ...prev, TELEFONE: e.target.value }))}
              placeholder="(00) 00000-0000"
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Logradouro"
              value={formData.LOGRADOURO}
              onChange={(e) => setFormData(prev => ({ ...prev, LOGRADOURO: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Número"
              value={formData.NUMERO}
              onChange={(e) => setFormData(prev => ({ ...prev, NUMERO: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Bairro"
              value={formData.BAIRRO}
              onChange={(e) => setFormData(prev => ({ ...prev, BAIRRO: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Cidade"
              value={formData.CIDADE}
              onChange={(e) => setFormData(prev => ({ ...prev, CIDADE: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Estado"
              value={formData.ESTADO}
              onChange={(e) => setFormData(prev => ({ ...prev, ESTADO: e.target.value }))}
              maxLength={2}
              placeholder="SP"
              disabled={modalMode === 'view'}
            />
          </div>

          {modalMode !== 'view' && (
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {modalMode === 'create' ? 'Criar Cliente' : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Clientes;