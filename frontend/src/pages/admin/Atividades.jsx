import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Users, Calendar } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import { toast } from 'react-hot-toast';

const Atividades = () => {
  const [atividades, setAtividades] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedAtividade, setSelectedAtividade] = useState(null);
  const [formData, setFormData] = useState({
    NOME_ATIVIDADE: '',
    DESCRICAO: '',
    UNIDADE_SESC: '',
    ID_RESPONSAVEL: '',
    CATEGORIA: '',
    VAGAS_TOTAL: '',
    DATA_INICIO: '',
    DATA_FIM: '',
    HORARIO: '',
    LOCAL: '',
    IDADE_MINIMA: '',
    IDADE_MAXIMA: '',
    VALOR: '',
    MODALIDADE: 'PRESENCIAL',
    MATERIAIS_NECESSARIOS: '',
    OBSERVACOES: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [atividadesRes, responsaveisRes] = await Promise.all([
        fetch('http://localhost:3001/api/atividades'),
        fetch('http://localhost:3001/api/responsaveis')
      ]);

      const [atividadesData, responsaveisData] = await Promise.all([
        atividadesRes.json(),
        responsaveisRes.json()
      ]);

      if (atividadesData.success) {
        setAtividades(atividadesData.data || []);
      }

      if (responsaveisData.success) {
        setResponsaveis(responsaveisData.data || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = modalMode === 'create' 
        ? 'http://localhost:3001/api/atividades'
        : `http://localhost:3001/api/atividades/${selectedAtividade.ID_ATIVIDADE}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      const payload = {
        ...formData,
        VAGAS_TOTAL: parseInt(formData.VAGAS_TOTAL) || 0,
        IDADE_MINIMA: formData.IDADE_MINIMA ? parseInt(formData.IDADE_MINIMA) : undefined,
        IDADE_MAXIMA: formData.IDADE_MAXIMA ? parseInt(formData.IDADE_MAXIMA) : undefined,
        VALOR: parseFloat(formData.VALOR) || 0
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(modalMode === 'create' ? 'Atividade criada!' : 'Atividade atualizada!');
        setShowModal(false);
        fetchData();
        resetForm();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao salvar atividade');
    }
  };

  const handleDelete = async (atividade) => {
    if (window.confirm(`Deseja excluir ${atividade.NOME_ATIVIDADE}?`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/atividades/${atividade.ID_ATIVIDADE}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Atividade excluída!');
          fetchData();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error('Erro ao excluir atividade');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      NOME_ATIVIDADE: '',
      DESCRICAO: '',
      UNIDADE_SESC: '',
      ID_RESPONSAVEL: '',
      CATEGORIA: '',
      VAGAS_TOTAL: '',
      DATA_INICIO: '',
      DATA_FIM: '',
      HORARIO: '',
      LOCAL: '',
      IDADE_MINIMA: '',
      IDADE_MAXIMA: '',
      VALOR: '',
      MODALIDADE: 'PRESENCIAL',
      MATERIAIS_NECESSARIOS: '',
      OBSERVACOES: ''
    });
    setSelectedAtividade(null);
  };

  const openModal = (mode, atividade = null) => {
    setModalMode(mode);
    setSelectedAtividade(atividade);
    
    if (atividade) {
      setFormData({
        NOME_ATIVIDADE: atividade.NOME_ATIVIDADE || '',
        DESCRICAO: atividade.DESCRICAO || '',
        UNIDADE_SESC: atividade.UNIDADE_SESC || '',
        ID_RESPONSAVEL: atividade.ID_RESPONSAVEL || '',
        CATEGORIA: atividade.CATEGORIA || '',
        VAGAS_TOTAL: atividade.VAGAS_TOTAL?.toString() || '',
        DATA_INICIO: atividade.DATA_INICIO?.split('T')[0] || '',
        DATA_FIM: atividade.DATA_FIM?.split('T')[0] || '',
        HORARIO: atividade.HORARIO || '',
        LOCAL: atividade.LOCAL || '',
        IDADE_MINIMA: atividade.IDADE_MINIMA?.toString() || '',
        IDADE_MAXIMA: atividade.IDADE_MAXIMA?.toString() || '',
        VALOR: atividade.VALOR?.toString() || '',
        MODALIDADE: atividade.MODALIDADE || 'PRESENCIAL',
        MATERIAIS_NECESSARIOS: atividade.MATERIAIS_NECESSARIOS || '',
        OBSERVACOES: atividade.OBSERVACOES || ''
      });
    } else {
      resetForm();
    }
    
    setShowModal(true);
  };

  const filteredAtividades = atividades.filter(atividade =>
    atividade.NOME_ATIVIDADE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    atividade.UNIDADE_SESC?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    atividade.CATEGORIA?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getResponsavelNome = (idResponsavel) => {
    const responsavel = responsaveis.find(r => r.ID_RESPONSAVEL === idResponsavel);
    return responsavel?.NOME_RESPONSAVEL || 'Não encontrado';
  };

  const columns = [
    {
      key: 'NOME_ATIVIDADE',
      label: 'Atividade',
      render: (atividade) => (
        <div>
          <div className="font-medium">{atividade.NOME_ATIVIDADE}</div>
          <div className="text-sm text-gray-500">{atividade.CATEGORIA}</div>
        </div>
      )
    },
    {
      key: 'UNIDADE_SESC',
      label: 'Unidade',
    },
    {
      key: 'RESPONSAVEL',
      label: 'Responsável',
      render: (atividade) => getResponsavelNome(atividade.ID_RESPONSAVEL)
    },
    {
      key: 'VAGAS',
      label: 'Vagas',
      render: (atividade) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{atividade.VAGAS_OCUPADAS || 0}/{atividade.VAGAS_TOTAL}</span>
        </div>
      )
    },
    {
      key: 'MODALIDADE',
      label: 'Modalidade',
      render: (atividade) => (
        <Badge color={
          atividade.MODALIDADE === 'PRESENCIAL' ? 'blue' :
          atividade.MODALIDADE === 'ONLINE' ? 'green' : 'yellow'
        }>
          {atividade.MODALIDADE}
        </Badge>
      )
    },
    {
      key: 'STATUS',
      label: 'Status',
      render: (atividade) => (
        <Badge color={atividade.STATUS === 'ATIVA' ? 'green' : 'red'}>
          {atividade.STATUS || 'ATIVA'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (atividade) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openModal('view', atividade)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openModal('edit', atividade)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="red"
            onClick={() => handleDelete(atividade)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const categoriaOptions = [
    { value: 'ESPORTE', label: 'Esporte' },
    { value: 'CULTURA', label: 'Cultura' },
    { value: 'EDUCACAO', label: 'Educação' },
    { value: 'LAZER', label: 'Lazer' },
    { value: 'SAUDE', label: 'Saúde' },
    { value: 'GERAL', label: 'Geral' }
  ];

  const modalidadeOptions = [
    { value: 'PRESENCIAL', label: 'Presencial' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'HIBRIDA', label: 'Híbrida' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>
          <p className="text-gray-600">Gerencie as atividades do SESC</p>
        </div>
        <Button onClick={() => openModal('create')}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Atividade
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome, unidade ou categoria..."
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
          data={filteredAtividades}
          loading={loading}
          emptyMessage="Nenhuma atividade encontrada"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalMode === 'create' ? 'Nova Atividade' :
          modalMode === 'edit' ? 'Editar Atividade' :
          'Detalhes da Atividade'
        }
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome da Atividade"
              value={formData.NOME_ATIVIDADE}
              onChange={(e) => setFormData(prev => ({ ...prev, NOME_ATIVIDADE: e.target.value }))}
              required
              disabled={modalMode === 'view'}
            />
            
            <Select
              label="Categoria"
              value={formData.CATEGORIA}
              onChange={(e) => setFormData(prev => ({ ...prev, CATEGORIA: e.target.value }))}
              options={categoriaOptions}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Unidade SESC"
              value={formData.UNIDADE_SESC}
              onChange={(e) => setFormData(prev => ({ ...prev, UNIDADE_SESC: e.target.value }))}
              required
              disabled={modalMode === 'view'}
            />
            
            <Select
              label="Responsável"
              value={formData.ID_RESPONSAVEL}
              onChange={(e) => setFormData(prev => ({ ...prev, ID_RESPONSAVEL: e.target.value }))}
              options={responsaveis.map(r => ({ value: r.ID_RESPONSAVEL, label: r.NOME_RESPONSAVEL }))}
              required
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Total de Vagas"
              type="number"
              value={formData.VAGAS_TOTAL}
              onChange={(e) => setFormData(prev => ({ ...prev, VAGAS_TOTAL: e.target.value }))}
              required
              disabled={modalMode === 'view'}
            />
            
            <Select
              label="Modalidade"
              value={formData.MODALIDADE}
              onChange={(e) => setFormData(prev => ({ ...prev, MODALIDADE: e.target.value }))}
              options={modalidadeOptions}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Data de Início"
              type="date"
              value={formData.DATA_INICIO}
              onChange={(e) => setFormData(prev => ({ ...prev, DATA_INICIO: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Data de Fim"
              type="date"
              value={formData.DATA_FIM}
              onChange={(e) => setFormData(prev => ({ ...prev, DATA_FIM: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Horário"
              value={formData.HORARIO}
              onChange={(e) => setFormData(prev => ({ ...prev, HORARIO: e.target.value }))}
              placeholder="Ex: 08:00 às 10:00"
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Local"
              value={formData.LOCAL}
              onChange={(e) => setFormData(prev => ({ ...prev, LOCAL: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Idade Mínima"
              type="number"
              value={formData.IDADE_MINIMA}
              onChange={(e) => setFormData(prev => ({ ...prev, IDADE_MINIMA: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Idade Máxima"
              type="number"
              value={formData.IDADE_MAXIMA}
              onChange={(e) => setFormData(prev => ({ ...prev, IDADE_MAXIMA: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              value={formData.VALOR}
              onChange={(e) => setFormData(prev => ({ ...prev, VALOR: e.target.value }))}
              disabled={modalMode === 'view'}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.DESCRICAO}
                onChange={(e) => setFormData(prev => ({ ...prev, DESCRICAO: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={modalMode === 'view'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materiais Necessários
              </label>
              <textarea
                value={formData.MATERIAIS_NECESSARIOS}
                onChange={(e) => setFormData(prev => ({ ...prev, MATERIAIS_NECESSARIOS: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={modalMode === 'view'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={formData.OBSERVACOES}
                onChange={(e) => setFormData(prev => ({ ...prev, OBSERVACOES: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={modalMode === 'view'}
              />
            </div>
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
                {modalMode === 'create' ? 'Criar Atividade' : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Atividades;