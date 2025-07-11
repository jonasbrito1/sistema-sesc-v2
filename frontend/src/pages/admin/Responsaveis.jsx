import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, UserCheck, Award } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { toast } from 'react-hot-toast';

const Responsaveis = () => {
  const [responsaveis, setResponsaveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedResponsavel, setSelectedResponsavel] = useState(null);
  const [formData, setFormData] = useState({
    NOME_RESPONSAVEL: '',
    MATRICULA: '',
    EMAIL: '',
    TELEFONE: '',
    CARGO: '',
    DEPARTAMENTO: '',
    UNIDADE_SESC: '',
    ESPECIALIDADES: [],
    BIOGRAFIA: '',
    DATA_ADMISSAO: ''
  });

  useEffect(() => {
    fetchResponsaveis();
  }, []);

  const fetchResponsaveis = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/responsaveis');
      const data = await response.json();
      
      if (data.success) {
        setResponsaveis(data.data || []);
      } else {
        toast.error('Erro ao carregar responsáveis');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = modalMode === 'create' 
        ? 'http://localhost:3001/api/responsaveis'
        : `http://localhost:3001/api/responsaveis/${selectedResponsavel.ID_RESPONSAVEL}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(modalMode === 'create' ? 'Responsável criado!' : 'Responsável atualizado!');
        setShowModal(false);
        fetchResponsaveis();
        resetForm();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao salvar responsável');
    }
  };

  const handleDelete = async (responsavel) => {
    if (window.confirm(`Deseja excluir ${responsavel.NOME_RESPONSAVEL}?`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/responsaveis/${responsavel.ID_RESPONSAVEL}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Responsável excluído!');
          fetchResponsaveis();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error('Erro ao excluir responsável');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      NOME_RESPONSAVEL: '',
      MATRICULA: '',
      EMAIL: '',
      TELEFONE: '',
      CARGO: '',
      DEPARTAMENTO: '',
      UNIDADE_SESC: '',
      ESPECIALIDADES: [],
      BIOGRAFIA: '',
      DATA_ADMISSAO: ''
    });
    setSelectedResponsavel(null);
  };

  const openModal = (mode, responsavel = null) => {
    setModalMode(mode);
    setSelectedResponsavel(responsavel);
    
    if (responsavel) {
      setFormData({
        NOME_RESPONSAVEL: responsavel.NOME_RESPONSAVEL || '',
        MATRICULA: responsavel.MATRICULA || '',
        EMAIL: responsavel.EMAIL || '',
        TELEFONE: responsavel.TELEFONE || '',
        CARGO: responsavel.CARGO || '',
        DEPARTAMENTO: responsavel.DEPARTAMENTO || '',
        UNIDADE_SESC: responsavel.UNIDADE_SESC || '',
        ESPECIALIDADES: responsavel.ESPECIALIDADES || [],
        BIOGRAFIA: responsavel.BIOGRAFIA || '',
        DATA_ADMISSAO: responsavel.DATA_ADMISSAO?.split('T')[0] || ''
      });
    } else {
      resetForm();
    }
    
    setShowModal(true);
  };

  const addEspecialidade = () => {
    const especialidade = prompt('Digite a especialidade:');
    if (especialidade && !formData.ESPECIALIDADES.includes(especialidade)) {
      setFormData(prev => ({
        ...prev,
        ESPECIALIDADES: [...prev.ESPECIALIDADES, especialidade]
      }));
    }
  };

  const removeEspecialidade = (index) => {
    setFormData(prev => ({
      ...prev,
      ESPECIALIDADES: prev.ESPECIALIDADES.filter((_, i) => i !== index)
    }));
  };

  const filteredResponsaveis = responsaveis.filter(responsavel =>
    responsavel.NOME_RESPONSAVEL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    responsavel.MATRICULA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    responsavel.CARGO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    responsavel.UNIDADE_SESC?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'NOME_RESPONSAVEL',
      label: 'Nome',
      render: (responsavel) => (
        <div>
          <div className="font-medium">{responsavel.NOME_RESPONSAVEL}</div>
          <div className="text-sm text-gray-500">Matrícula: {responsavel.MATRICULA}</div>
        </div>
      )
    },
    {
      key: 'CARGO',
      label: 'Cargo',
      render: (responsavel) => (
        <div>
          <div className="font-medium">{responsavel.CARGO}</div>
          <div className="text-sm text-gray-500">{responsavel.DEPARTAMENTO}</div>
        </div>
      )
    },
    {
      key: 'UNIDADE_SESC',
      label: 'Unidade',
    },
    {
      key: 'ESPECIALIDADES',
      label: 'Especialidades',
      render: (responsavel) => (
        <div className="flex flex-wrap gap-1">
          {(responsavel.ESPECIALIDADES || []).slice(0, 2).map((esp, index) => (
            <Badge key={index} color="blue" size="sm">
              {esp}
            </Badge>
          ))}
          {(responsavel.ESPECIALIDADES || []).length > 2 && (
            <Badge color="gray" size="sm">
              +{(responsavel.ESPECIALIDADES || []).length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'STATUS',
      label: 'Status',
      render: (responsavel) => (
        <Badge color={responsavel.STATUS === 'ATIVO' ? 'green' : 'red'}>
          {responsavel.STATUS || 'ATIVO'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (responsavel) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openModal('view', responsavel)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openModal('edit', responsavel)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="red"
            onClick={() => handleDelete(responsavel)}
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
          <h1 className="text-2xl font-bold text-gray-900">Responsáveis</h1>
          <p className="text-gray-600">Gerencie os responsáveis pelas atividades</p>
        </div>
        <Button onClick={() => openModal('create')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Responsável
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome, matrícula, cargo ou unidade..."
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
          data={filteredResponsaveis}
          loading={loading}
          emptyMessage="Nenhum responsável encontrado"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalMode === 'create' ? 'Novo Responsável' :
          modalMode === 'edit' ? 'Editar Responsável' :
          'Detalhes do Responsável'
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              value={formData.NOME_RESPONSAVEL}
              onChange={(e) => setFormData(prev => ({ ...prev, NOME_RESPONSAVEL: e.target.value }))}
              required
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Matrícula"
              value={formData.MATRICULA}
              onChange={(e) => setFormData(prev => ({ ...prev, MATRICULA: e.target.value }))}
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
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Cargo"
              value={formData.CARGO}
              onChange={(e) => setFormData(prev => ({ ...prev, CARGO: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Departamento"
              value={formData.DEPARTAMENTO}
              onChange={(e) => setFormData(prev => ({ ...prev, DEPARTAMENTO: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Unidade SESC"
              value={formData.UNIDADE_SESC}
              onChange={(e) => setFormData(prev => ({ ...prev, UNIDADE_SESC: e.target.value }))}
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Data de Admissão"
              type="date"
              value={formData.DATA_ADMISSAO}
              onChange={(e) => setFormData(prev => ({ ...prev, DATA_ADMISSAO: e.target.value }))}
              disabled={modalMode === 'view'}
            />
          </div>

          {/* Especialidades */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Especialidades
              </label>
              {modalMode !== 'view' && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addEspecialidade}
                >
                  <Award className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.ESPECIALIDADES.map((esp, index) => (
                <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <span>{esp}</span>
                  {modalMode !== 'view' && (
                    <button
                      type="button"
                      onClick={() => removeEspecialidade(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {formData.ESPECIALIDADES.length === 0 && (
                <span className="text-gray-500 text-sm">Nenhuma especialidade adicionada</span>
              )}
            </div>
          </div>

          {/* Biografia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biografia
            </label>
            <textarea
              value={formData.BIOGRAFIA}
              onChange={(e) => setFormData(prev => ({ ...prev, BIOGRAFIA: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={modalMode === 'view'}
              placeholder="Breve descrição sobre o responsável..."
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
                {modalMode === 'create' ? 'Criar Responsável' : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Responsaveis;