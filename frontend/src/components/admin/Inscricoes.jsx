import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, CreditCard, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import { toast } from 'react-hot-toast';

const Inscricoes = () => {
  const [inscricoes, setInscricoes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagamentoFilter, setPagamentoFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedInscricao, setSelectedInscricao] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inscricoesRes, clientesRes, atividadesRes] = await Promise.all([
        fetch('http://localhost:3001/api/inscricoes'),
        fetch('http://localhost:3001/api/clientes'),
        fetch('http://localhost:3001/api/atividades')
      ]);

      const [inscricoesData, clientesData, atividadesData] = await Promise.all([
        inscricoesRes.json(),
        clientesRes.json(),
        atividadesRes.json()
      ]);

      if (inscricoesData.success) {
        setInscricoes(inscricoesData.data || []);
      }

      if (clientesData.success) {
        setClientes(clientesData.data || []);
      }

      if (atividadesData.success) {
        setAtividades(atividadesData.data || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async (inscricao) => {
    try {
      const response = await fetch(`http://localhost:3001/api/inscricoes/${inscricao.ID_INSCRICAO}/confirmar`, {
        method: 'PATCH'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Inscrição confirmada!');
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao confirmar inscrição');
    }
  };

  const handleCancelar = async (inscricao) => {
    const motivo = prompt('Motivo do cancelamento:');
    if (!motivo) return;

    try {
      const response = await fetch(`http://localhost:3001/api/inscricoes/${inscricao.ID_INSCRICAO}/cancelar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Inscrição cancelada!');
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao cancelar inscrição');
    }
  };

  const handlePagamento = async (inscricao, status) => {
    try {
      const response = await fetch(`http://localhost:3001/api/inscricoes/${inscricao.ID_INSCRICAO}/pagamento`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          dadosPagamento: {
            DATA_PAGAMENTO: status === 'PAGO' ? new Date().toISOString() : null
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Pagamento marcado como ${status.toLowerCase()}!`);
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao atualizar pagamento');
    }
  };

  const getClienteNome = (idCliente) => {
    const cliente = clientes.find(c => c.ID_CLIENTE === idCliente);
    return cliente?.NOME_CLIENTE || 'Cliente não encontrado';
  };

  const getAtividadeNome = (idAtividade) => {
    const atividade = atividades.find(a => a.ID_ATIVIDADE === idAtividade);
    return atividade?.NOME_ATIVIDADE || 'Atividade não encontrada';
  };

  const filteredInscricoes = inscricoes.filter(inscricao => {
    const clienteNome = getClienteNome(inscricao.ID_CLIENTE).toLowerCase();
    const atividadeNome = getAtividadeNome(inscricao.ID_ATIVIDADE).toLowerCase();
    
    const matchesSearch = clienteNome.includes(searchTerm.toLowerCase()) ||
                         atividadeNome.includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || inscricao.STATUS === statusFilter;
    const matchesPagamento = !pagamentoFilter || inscricao.STATUS_PAGAMENTO === pagamentoFilter;
    
    return matchesSearch && matchesStatus && matchesPagamento;
  });

  const columns = [
    {
      key: 'cliente',
      label: 'Cliente',
      render: (inscricao) => (
        <div>
          <div className="font-medium">{getClienteNome(inscricao.ID_CLIENTE)}</div>
          <div className="text-sm text-gray-500">
            {new Date(inscricao.DATA_INSCRICAO).toLocaleDateString('pt-BR')}
          </div>
        </div>
      )
    },
    {
      key: 'atividade',
      label: 'Atividade',
      render: (inscricao) => getAtividadeNome(inscricao.ID_ATIVIDADE)
    },
    {
      key: 'STATUS',
      label: 'Status',
      render: (inscricao) => (
        <Badge color={
          inscricao.STATUS === 'ATIVA' ? 'green' :
          inscricao.STATUS === 'CONFIRMADA' ? 'blue' :
          inscricao.STATUS === 'CANCELADA' ? 'red' :
          inscricao.STATUS === 'LISTA_ESPERA' ? 'yellow' : 'gray'
        }>
          {inscricao.STATUS}
        </Badge>
      )
    },
    {
      key: 'STATUS_PAGAMENTO',
      label: 'Pagamento',
      render: (inscricao) => (
        <Badge color={
          inscricao.STATUS_PAGAMENTO === 'PAGO' ? 'green' :
          inscricao.STATUS_PAGAMENTO === 'PENDENTE' ? 'yellow' :
          inscricao.STATUS_PAGAMENTO === 'CANCELADO' ? 'red' : 'gray'
        }>
          {inscricao.STATUS_PAGAMENTO}
        </Badge>
      )
    },
    {
      key: 'CANAL_INSCRICAO',
      label: 'Canal',
      render: (inscricao) => (
        <Badge color="blue" size="sm">
          {inscricao.CANAL_INSCRICAO || 'ONLINE'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (inscricao) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedInscricao(inscricao);
              setShowModal(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          {inscricao.STATUS === 'ATIVA' && (
            <Button
              size="sm"
              variant="outline"
              color="green"
              onClick={() => handleConfirmar(inscricao)}
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          
          {inscricao.STATUS !== 'CANCELADA' && (
            <Button
              size="sm"
              variant="outline"
              color="red"
              onClick={() => handleCancelar(inscricao)}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          )}
          
          {inscricao.STATUS_PAGAMENTO === 'PENDENTE' && (
            <Button
              size="sm"
              variant="outline"
              color="green"
              onClick={() => handlePagamento(inscricao, 'PAGO')}
            >
              <CreditCard className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'ATIVA', label: 'Ativa' },
    { value: 'CONFIRMADA', label: 'Confirmada' },
    { value: 'CANCELADA', label: 'Cancelada' },
    { value: 'LISTA_ESPERA', label: 'Lista de Espera' }
  ];

  const pagamentoOptions = [
    { value: '', label: 'Todos os pagamentos' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'PAGO', label: 'Pago' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inscrições</h1>
          <p className="text-gray-600">Gerencie as inscrições nas atividades</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por cliente ou atividade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          
          <Select
            value={pagamentoFilter}
            onChange={(e) => setPagamentoFilter(e.target.value)}
            options={pagamentoOptions}
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredInscricoes}
          loading={loading}
          emptyMessage="Nenhuma inscrição encontrada"
        />
      </Card>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Detalhes da Inscrição"
        size="lg"
      >
        {selectedInscricao && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <p className="mt-1 text-sm text-gray-900">
                  {getClienteNome(selectedInscricao.ID_CLIENTE)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Atividade</label>
                <p className="mt-1 text-sm text-gray-900">
                  {getAtividadeNome(selectedInscricao.ID_ATIVIDADE)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Inscrição</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedInscricao.DATA_INSCRICAO).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge color={
                    selectedInscricao.STATUS === 'ATIVA' ? 'green' :
                    selectedInscricao.STATUS === 'CONFIRMADA' ? 'blue' :
                    selectedInscricao.STATUS === 'CANCELADA' ? 'red' : 'gray'
                  }>
                    {selectedInscricao.STATUS}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status do Pagamento</label>
                <div className="mt-1">
                  <Badge color={
                    selectedInscricao.STATUS_PAGAMENTO === 'PAGO' ? 'green' :
                    selectedInscricao.STATUS_PAGAMENTO === 'PENDENTE' ? 'yellow' : 'red'
                  }>
                    {selectedInscricao.STATUS_PAGAMENTO}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Canal de Inscrição</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedInscricao.CANAL_INSCRICAO || 'ONLINE'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor Pago</label>
                <p className="mt-1 text-sm text-gray-900">
                  R$ {(selectedInscricao.VALOR_PAGO || 0).toFixed(2)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedInscricao.FORMA_PAGAMENTO || 'Não informado'}
                </p>
              </div>
            </div>
            
            {selectedInscricao.OBSERVACOES && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Observações</label>
                <p className="mt-1 text-sm text-gray-900">{selectedInscricao.OBSERVACOES}</p>
              </div>
            )}
            
            {selectedInscricao.MOTIVO_CANCELAMENTO && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Motivo do Cancelamento</label>
                <p className="mt-1 text-sm text-red-600">{selectedInscricao.MOTIVO_CANCELAMENTO}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Inscricoes;