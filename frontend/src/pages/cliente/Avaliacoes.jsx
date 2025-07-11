import React, { useState, useEffect } from 'react';
import { Star, Send, MessageSquare, Plus, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { toast } from 'react-hot-toast';

const AvaliacoesCliente = () => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [formData, setFormData] = useState({
    TIPO: 'ELOGIO',
    CATEGORIA: 'ATIVIDADE',
    TITULO: '',
    MENSAGEM: '',
    NOTA: 5,
    ID_ATIVIDADE: '',
    NOME_AVALIADOR: '',
    EMAIL_AVALIADOR: '',
    ANONIMA: false
  });

  useEffect(() => {
    fetchAvaliacoes();
    fetchAtividades();
    loadUserData();
  }, []);

  const fetchAvaliacoes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/avaliacoes/publicas');
      const data = await response.json();
      
      if (data.success) {
        setAvaliacoes(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações');
    }
  };

  const fetchAtividades = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/atividades');
      const data = await response.json();
      
      if (data.success) {
        setAtividades(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = () => {
    const nome = localStorage.getItem('sesc_cliente_nome') || '';
    const email = localStorage.getItem('sesc_cliente_email') || '';
    
    setFormData(prev => ({
      ...prev,
      NOME_AVALIADOR: nome,
      EMAIL_AVALIADOR: email
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3001/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Avaliação enviada com sucesso!');
        setShowModal(false);
        resetForm();
        // Não recarregar avaliações porque pode não estar pública ainda
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao enviar avaliação');
    }
  };

  const resetForm = () => {
    const nome = localStorage.getItem('sesc_cliente_nome') || '';
    const email = localStorage.getItem('sesc_cliente_email') || '';
    
    setFormData({
      TIPO: 'ELOGIO',
      CATEGORIA: 'ATIVIDADE',
      TITULO: '',
      MENSAGEM: '',
      NOTA: 5,
      ID_ATIVIDADE: '',
      NOME_AVALIADOR: nome,
      EMAIL_AVALIADOR: email,
      ANONIMA: false
    });
  };

  const renderStars = (nota, interactive = false, onChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange?.(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= nota 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getAtividadeNome = (idAtividade) => {
    const atividade = atividades.find(a => a.ID_ATIVIDADE === idAtividade);
    return atividade?.NOME_ATIVIDADE || 'Atividade não encontrada';
  };

  const filteredAvaliacoes = avaliacoes.filter(avaliacao => {
    const matchesSearch = avaliacao.TITULO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         avaliacao.MENSAGEM?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         avaliacao.NOME_AVALIADOR?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = !tipoFilter || avaliacao.TIPO === tipoFilter;
    
    return matchesSearch && matchesTipo;
  });

  const tipoOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'ELOGIO', label: 'Elogios' },
    { value: 'CRITICA', label: 'Críticas' },
    { value: 'SUGESTAO', label: 'Sugestões' }
  ];

  const categoriaOptions = [
    { value: 'ATIVIDADE', label: 'Atividade' },
    { value: 'PORTAL', label: 'Portal/Sistema' },
    { value: 'ATENDIMENTO', label: 'Atendimento' },
    { value: 'INSTALACOES', label: 'Instalações' },
    { value: 'GERAL', label: 'Geral' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Avaliações</h1>
        <p className="text-gray-600 mt-2">Compartilhe sua experiência e veja o que outros pensam</p>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Avaliação
        </Button>
        
        <Button variant="outline" onClick={() => setShowPublicModal(true)}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Ver Avaliações Públicas
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {avaliacoes.filter(a => a.TIPO === 'ELOGIO').length}
            </div>
            <div className="text-gray-600">Elogios</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {avaliacoes.filter(a => a.TIPO === 'SUGESTAO').length}
            </div>
            <div className="text-gray-600">Sugestões</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {avaliacoes.filter(a => a.NOTA).length > 0 ? 
                (avaliacoes.filter(a => a.NOTA).reduce((acc, a) => acc + a.NOTA, 0) / 
                 avaliacoes.filter(a => a.NOTA).length).toFixed(1) : '0'
              }/5
            </div>
            <div className="text-gray-600">Nota Média</div>
          </div>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Avaliações Recentes</h2>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded mb-3"></div>
                </div>
              ))}
            </div>
          ) : avaliacoes.slice(0, 5).length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Ainda não há avaliações públicas.</p>
              <p className="text-gray-500 text-sm">Seja o primeiro a avaliar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {avaliacoes.slice(0, 5).map((avaliacao) => (
                <div key={avaliacao.ID_AVALIACAO} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <Badge color={
                        avaliacao.TIPO === 'ELOGIO' ? 'green' :
                        avaliacao.TIPO === 'CRITICA' ? 'red' : 'yellow'
                      }>
                        {avaliacao.TIPO}
                      </Badge>
                      
                      {avaliacao.NOTA && renderStars(avaliacao.NOTA)}
                    </div>
                    
                    <span className="text-sm text-gray-500">
                      {new Date(avaliacao.DATA_CRIACAO).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-1">{avaliacao.TITULO}</h3>
                  
                  <p className="text-gray-700 text-sm mb-2">{avaliacao.MENSAGEM}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Por: {avaliacao.ANONIMA ? 'Anônimo' : (avaliacao.NOME_AVALIADOR || 'Usuário')}
                    </span>
                    
                    {avaliacao.ID_ATIVIDADE && (
                      <span>Atividade: {getAtividadeNome(avaliacao.ID_ATIVIDADE)}</span>
                    )}
                  </div>
                  
                  {avaliacao.RESPOSTA && (
                    <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-900">
                        <strong>Resposta do SESC:</strong>
                      </div>
                      <div className="text-sm text-blue-800 mt-1">
                        {avaliacao.RESPOSTA}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal Nova Avaliação */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Avaliação"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Avaliação"
              value={formData.TIPO}
              onChange={(e) => setFormData(prev => ({ ...prev, TIPO: e.target.value }))}
              options={[
                { value: 'ELOGIO', label: 'Elogio' },
                { value: 'CRITICA', label: 'Crítica' },
                { value: 'SUGESTAO', label: 'Sugestão' }
              ]}
              required
            />
            
            <Select
              label="Categoria"
              value={formData.CATEGORIA}
              onChange={(e) => setFormData(prev => ({ ...prev, CATEGORIA: e.target.value }))}
              options={categoriaOptions}
              required
            />
          </div>

          <Input
            label="Título"
            value={formData.TITULO}
            onChange={(e) => setFormData(prev => ({ ...prev, TITULO: e.target.value }))}
            placeholder="Resumo da sua avaliação"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem
            </label>
            <textarea
              value={formData.MENSAGEM}
              onChange={(e) => setFormData(prev => ({ ...prev, MENSAGEM: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Conte-nos sobre sua experiência..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota (opcional)
            </label>
            {renderStars(formData.NOTA, true, (nota) => 
              setFormData(prev => ({ ...prev, NOTA: nota }))
            )}
          </div>

          <Select
            label="Atividade (opcional)"
            value={formData.ID_ATIVIDADE}
            onChange={(e) => setFormData(prev => ({ ...prev, ID_ATIVIDADE: e.target.value }))}
            options={[
              { value: '', label: 'Selecione uma atividade' },
              ...atividades.map(a => ({ value: a.ID_ATIVIDADE, label: a.NOME_ATIVIDADE }))
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Seu Nome"
              value={formData.NOME_AVALIADOR}
              onChange={(e) => setFormData(prev => ({ ...prev, NOME_AVALIADOR: e.target.value }))}
              placeholder="Como você gostaria de ser identificado"
            />
            
            <Input
              label="Seu Email"
              type="email"
              value={formData.EMAIL_AVALIADOR}
              onChange={(e) => setFormData(prev => ({ ...prev, EMAIL_AVALIADOR: e.target.value }))}
              placeholder="Para contato (opcional)"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonima"
              checked={formData.ANONIMA}
              onChange={(e) => setFormData(prev => ({ ...prev, ANONIMA: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="anonima" className="ml-2 text-sm text-gray-700">
              Avaliação anônima (não mostrar meu nome)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <Send className="w-4 h-4 mr-2" />
              Enviar Avaliação
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Avaliações Públicas */}
      <Modal
        isOpen={showPublicModal}
        onClose={() => setShowPublicModal(false)}
        title="Avaliações Públicas"
        size="xl"
      >
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Buscar avaliações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
            
            <Select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              options={tipoOptions}
            />
          </div>

          {/* Lista de Avaliações */}
          <div className="max-h-96 overflow-y-auto space-y-4">
            {filteredAvaliacoes.map((avaliacao) => (
              <div key={avaliacao.ID_AVALIACAO} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <Badge color={
                      avaliacao.TIPO === 'ELOGIO' ? 'green' :
                      avaliacao.TIPO === 'CRITICA' ? 'red' : 'yellow'
                    }>
                      {avaliacao.TIPO}
                    </Badge>
                    
                    {avaliacao.NOTA && renderStars(avaliacao.NOTA)}
                  </div>
                  
                  <span className="text-sm text-gray-500">
                    {new Date(avaliacao.DATA_CRIACAO).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1">{avaliacao.TITULO}</h3>
                <p className="text-gray-700 text-sm mb-2">{avaliacao.MENSAGEM}</p>
                
                <div className="text-xs text-gray-500 mb-2">
                  Por: {avaliacao.ANONIMA ? 'Anônimo' : (avaliacao.NOME_AVALIADOR || 'Usuário')}
                  {avaliacao.ID_ATIVIDADE && (
                    <span> • Atividade: {getAtividadeNome(avaliacao.ID_ATIVIDADE)}</span>
                  )}
                </div>
                
                {avaliacao.RESPOSTA && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-900 font-medium">Resposta do SESC:</div>
                    <div className="text-sm text-blue-800 mt-1">{avaliacao.RESPOSTA}</div>
                    {avaliacao.DATA_RESPOSTA && (
                      <div className="text-xs text-blue-600 mt-1">
                        {new Date(avaliacao.DATA_RESPOSTA).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {filteredAvaliacoes.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma avaliação encontrada.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AvaliacoesCliente;