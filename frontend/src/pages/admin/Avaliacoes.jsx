import React, { useState, useEffect } from 'react';
import { Search, Eye, MessageSquare, Archive, Star, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import { toast } from 'react-hot-toast';

const Avaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [prioridadeFilter, setPrioridadeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedAvaliacao, setSelectedAvaliacao] = useState(null);
  const [resposta, setResposta] = useState('');

  useEffect(() => {
    fetchAvaliacoes();
  }, []);

  const fetchAvaliacoes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/avaliacoes');
      const data = await response.json();
      
      if (data.success) {
        setAvaliacoes(data.data || []);
      } else {
        toast.error('Erro ao carregar avaliações');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async (e) => {
    e.preventDefault();
    
    if (!resposta.trim()) {
      toast.error('Digite uma resposta');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/avaliacoes/${selectedAvaliacao.ID_AVALIACAO}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resposta,
          respondidoPor: 'Administrador',
          respostaAutomatica: false
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Resposta enviada!');
        setShowModal(false);
        setResposta('');
        fetchAvaliacoes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao enviar resposta');
    }
  };

  const handleArquivar = async (avaliacao) => {
    const motivo = prompt('Motivo do arquivamento (opcional):');
    
    try {
      const response = await fetch(`http://localhost:3001/api/avaliacoes/${avaliacao.ID_AVALIACAO}/arquivar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: motivo || '' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Avaliação arquivada!');
        fetchAvaliacoes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao arquivar avaliação');
    }
  };

  const handleAlterarPrioridade = async (avaliacao, novaPrioridade) => {
    try {
      const response = await fetch(`http://localhost:3001/api/avaliacoes/${avaliacao.ID_AVALIACAO}/prioridade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prioridade: novaPrioridade })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Prioridade alterada para ${novaPrioridade}`);
        fetchAvaliacoes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao alterar prioridade');
    }
  };

  const handleAlterarVisibilidade = async (avaliacao, publico) => {
    try {
      const response = await fetch(`http://localhost:3001/api/avaliacoes/${avaliacao.ID_AVALIACAO}/visibilidade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publico })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Avaliação marcada como ${publico ? 'pública' : 'privada'}`);
        fetchAvaliacoes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao alterar visibilidade');
    }
  };

  const openModal = (mode, avaliacao) => {
    setModalMode(mode);
    setSelectedAvaliacao(avaliacao);
    setResposta(avaliacao.RESPOSTA || '');
    setShowModal(true);
  };

  const filteredAvaliacoes = avaliacoes.filter(avaliacao => {
    const matchesSearch = avaliacao.TITULO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         avaliacao.MENSAGEM?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         avaliacao.NOME_AVALIADOR?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = !tipoFilter || avaliacao.TIPO === tipoFilter;
    const matchesStatus = !statusFilter || avaliacao.STATUS === statusFilter;
    const matchesPrioridade = !prioridadeFilter || avaliacao.PRIORIDADE === prioridadeFilter;
    
    return matchesSearch && matchesTipo && matchesStatus && matchesPrioridade;
  });

  const renderNota = (nota) => {
    if (!nota) return <span className="text-gray-400">-</span>;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < nota ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({nota})</span>
      </div>
    );
  };

  const columns = [
    {
      key: 'tipo',
      label: 'Tipo',
      render: (avaliacao) => (
        <div className="flex items-center space-x-2">
          <Badge color={
            avaliacao.TIPO === 'ELOGIO' ? 'green' :
            avaliacao.TIPO === 'CRITICA' ? 'red' : 'yellow'
          }>
            {avaliacao.TIPO}
          </Badge>
          {avaliacao.PRIORIDADE === 'URGENTE' && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </div>
      )
    },
    {
      key: 'titulo',
      label: 'Avaliação',
      render: (avaliacao) => (
        <div>
          <div className="font-medium">{avaliacao.TITULO}</div>
          <div className="text-sm text-gray-500">
            {avaliacao.NOME_AVALIADOR || 'Anônimo'} • {avaliacao.CATEGORIA}
          </div>
        </div>
      )
    },
    {
      key: 'nota',
      label: 'Nota',
      render: (avaliacao) => renderNota(avaliacao.NOTA)
    },
    {
      key: 'data',
      label: 'Data',
      render: (avaliacao) => new Date(avaliacao.DATA_CRIACAO).toLocaleDateString('pt-BR')
    },
    {
      key: 'prioridade',
      label: 'Prioridade',
      render: (avaliacao) => (
        <Badge color={
          avaliacao.PRIORIDADE === 'URGENTE' ? 'red' :
          avaliacao.PRIORIDADE === 'ALTA' ? 'orange' :
          avaliacao.PRIORIDADE === 'NORMAL' ? 'blue' : 'gray'
        } size="sm">
          {avaliacao.PRIORIDADE || 'NORMAL'}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (avaliacao) => (
        <Badge color={
          avaliacao.STATUS === 'RESPONDIDA' ? 'green' :
          avaliacao.STATUS === 'PENDENTE' ? 'yellow' : 'gray'
        }>
          {avaliacao.STATUS}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (avaliacao) => (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openModal('view', avaliacao)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          {avaliacao.STATUS === 'PENDENTE' && (
            <Button
              size="sm"
              variant="outline"
              color="blue"
              onClick={() => openModal('respond', avaliacao)}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            color="gray"
            onClick={() => handleArquivar(avaliacao)}
          >
            <Archive className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const tipoOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'ELOGIO', label: 'Elogio' },
    { value: 'CRITICA', label: 'Crítica' },
    { value: 'SUGESTAO', label: 'Sugestão' }
  ];

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'RESPONDIDA', label: 'Respondida' },
    { value: 'ARQUIVADA', label: 'Arquivada' }
  ];

  const prioridadeOptions = [
    { value: '', label: 'Todas as prioridades' },
    { value: 'BAIXA', label: 'Baixa' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'URGENTE', label: 'Urgente' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avaliações</h1>
          <p className="text-gray-600">Gerencie o feedback dos usuários</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por título, mensagem ou avaliador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
          
          <Select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            options={tipoOptions}
          />
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          
          <Select
            value={prioridadeFilter}
            onChange={(e) => setPrioridadeFilter(e.target.value)}
            options={prioridadeOptions}
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredAvaliacoes}
          loading={loading}
          emptyMessage="Nenhuma avaliação encontrada"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalMode === 'respond' ? 'Responder Avaliação' : 'Detalhes da Avaliação'
        }
        size="lg"
      >
        {selectedAvaliacao && (
          <div className="space-y-4">
            {/* Informações da Avaliação */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-lg">{selectedAvaliacao.TITULO}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedAvaliacao.NOME_AVALIADOR || 'Anônimo'} • 
                    {new Date(selectedAvaliacao.DATA_CRIACAO).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Badge color={
                    selectedAvaliacao.TIPO === 'ELOGIO' ? 'green' :
                    selectedAvaliacao.TIPO === 'CRITICA' ? 'red' : 'yellow'
                  }>
                    {selectedAvaliacao.TIPO}
                  </Badge>
                  {selectedAvaliacao.NOTA && renderNota(selectedAvaliacao.NOTA)}
                </div>
              </div>
              
              <p className="text-gray-700">{selectedAvaliacao.MENSAGEM}</p>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge size="sm" color="blue">
                  {selectedAvaliacao.CATEGORIA}
                </Badge>
                <Badge size="sm" color={
                  selectedAvaliacao.PRIORIDADE === 'URGENTE' ? 'red' :
                  selectedAvaliacao.PRIORIDADE === 'ALTA' ? 'orange' : 'gray'
                }>
                  {selectedAvaliacao.PRIORIDADE || 'NORMAL'}
                </Badge>
                {selectedAvaliacao.PUBLICO && (
                  <Badge size="sm" color="green">Pública</Badge>
                )}
              </div>
            </div>

            {/* Ações Rápidas */}
            {modalMode === 'view' && selectedAvaliacao.STATUS === 'PENDENTE' && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  color="blue"
                  onClick={() => setModalMode('respond')}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Responder
                </Button>
                
                <select
                  onChange={(e) => handleAlterarPrioridade(selectedAvaliacao, e.target.value)}
                  value={selectedAvaliacao.PRIORIDADE || 'NORMAL'}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="NORMAL">Normal</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAlterarVisibilidade(selectedAvaliacao, !selectedAvaliacao.PUBLICO)}
                >
                  {selectedAvaliacao.PUBLICO ? 'Tornar Privada' : 'Tornar Pública'}
                </Button>
              </div>
            )}

            {/* Resposta Existente */}
            {selectedAvaliacao.RESPOSTA && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Resposta:</h4>
                <p className="text-blue-800">{selectedAvaliacao.RESPOSTA}</p>
                <p className="text-sm text-blue-600 mt-2">
                  Por: {selectedAvaliacao.RESPONDIDO_POR} • 
                  {new Date(selectedAvaliacao.DATA_RESPOSTA).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {/* Formulário de Resposta */}
            {modalMode === 'respond' && (
              <form onSubmit={handleResponder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sua Resposta
                  </label>
                  <textarea
                    value={resposta}
                    onChange={(e) => setResposta(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite sua resposta..."
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalMode('view')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Enviar Resposta
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Avaliacoes;