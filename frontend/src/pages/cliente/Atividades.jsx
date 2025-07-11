import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, Clock, Star, Heart } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import { toast } from 'react-hot-toast';

const AtividadesCliente = () => {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAtividade, setSelectedAtividade] = useState(null);
  const [favoritas, setFavoritas] = useState(new Set());

  useEffect(() => {
    fetchAtividades();
    loadFavoritas();
  }, []);

  const fetchAtividades = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/atividades/vagas');
      const data = await response.json();
      
      if (data.success) {
        setAtividades(data.data || []);
      } else {
        toast.error('Erro ao carregar atividades');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const loadFavoritas = () => {
    const stored = localStorage.getItem('sesc_atividades_favoritas');
    if (stored) {
      setFavoritas(new Set(JSON.parse(stored)));
    }
  };

  const toggleFavorita = (idAtividade) => {
    const newFavoritas = new Set(favoritas);
    
    if (newFavoritas.has(idAtividade)) {
      newFavoritas.delete(idAtividade);
      toast.success('Removido dos favoritos');
    } else {
      newFavoritas.add(idAtividade);
      toast.success('Adicionado aos favoritos');
    }
    
    setFavoritas(newFavoritas);
    localStorage.setItem('sesc_atividades_favoritas', JSON.stringify([...newFavoritas]));
  };

  const handleInscrever = async (atividade) => {
    // Simular ID do cliente logado
    const clienteId = localStorage.getItem('sesc_cliente_id') || 'cliente_exemplo';
    
    try {
      const response = await fetch('http://localhost:3001/api/inscricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ID_CLIENTE: clienteId,
          ID_ATIVIDADE: atividade.ID_ATIVIDADE,
          OBSERVACOES: 'Inscrição via portal do cliente'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Inscrição realizada com sucesso!');
        setShowModal(false);
        fetchAtividades(); // Recarregar para atualizar vagas
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao realizar inscrição');
    }
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return 25; // Idade padrão para demonstração
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const diferenciaMes = hoje.getMonth() - nascimento.getMonth();
    
    if (diferenciaMes < 0 || (diferenciaMes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  const podeSeInscrever = (atividade) => {
    const idadeCliente = calcularIdade(localStorage.getItem('sesc_cliente_nascimento'));
    const vagasDisponiveis = atividade.VAGAS_TOTAL - (atividade.VAGAS_OCUPADAS || 0);
    
    if (vagasDisponiveis <= 0) return { pode: false, motivo: 'Vagas esgotadas' };
    
    if (atividade.IDADE_MINIMA && idadeCliente < atividade.IDADE_MINIMA) {
      return { pode: false, motivo: `Idade mínima: ${atividade.IDADE_MINIMA} anos` };
    }
    
    if (atividade.IDADE_MAXIMA && idadeCliente > atividade.IDADE_MAXIMA) {
      return { pode: false, motivo: `Idade máxima: ${atividade.IDADE_MAXIMA} anos` };
    }
    
    return { pode: true, motivo: '' };
  };

  const filteredAtividades = atividades.filter(atividade => {
    const matchesSearch = atividade.NOME_ATIVIDADE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         atividade.DESCRICAO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         atividade.UNIDADE_SESC?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = !categoriaFilter || atividade.CATEGORIA === categoriaFilter;
    const matchesModalidade = !modalidadeFilter || atividade.MODALIDADE === modalidadeFilter;
    
    return matchesSearch && matchesCategoria && matchesModalidade;
  });

  const categoriaOptions = [
    { value: '', label: 'Todas as categorias' },
    { value: 'ESPORTE', label: 'Esporte' },
    { value: 'CULTURA', label: 'Cultura' },
    { value: 'EDUCACAO', label: 'Educação' },
    { value: 'LAZER', label: 'Lazer' },
    { value: 'SAUDE', label: 'Saúde' }
  ];

  const modalidadeOptions = [
    { value: '', label: 'Todas as modalidades' },
    { value: 'PRESENCIAL', label: 'Presencial' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'HIBRIDA', label: 'Híbrida' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Atividades Disponíveis</h1>
        <p className="text-gray-600 mt-2">Descubra e se inscreva nas atividades do SESC</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar atividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
            
            <Select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              options={categoriaOptions}
            />
            
            <Select
              value={modalidadeFilter}
              onChange={(e) => setModalidadeFilter(e.target.value)}
              options={modalidadeOptions}
            />
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Mostrar:</label>
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="todas">Todas</option>
                <option value="favoritas">Favoritas</option>
                <option value="disponiveis">Com vagas</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Activities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAtividades.map((atividade) => {
            const vagasDisponiveis = atividade.VAGAS_TOTAL - (atividade.VAGAS_OCUPADAS || 0);
            const podeInscrever = podeSeInscrever(atividade);
            const isFavorita = favoritas.has(atividade.ID_ATIVIDADE);
            
            return (
              <Card key={atividade.ID_ATIVIDADE} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {atividade.NOME_ATIVIDADE}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge color={
                          atividade.CATEGORIA === 'ESPORTE' ? 'blue' :
                          atividade.CATEGORIA === 'CULTURA' ? 'purple' :
                          atividade.CATEGORIA === 'EDUCACAO' ? 'green' : 'gray'
                        } size="sm">
                          {atividade.CATEGORIA}
                        </Badge>
                        <Badge color={
                          atividade.MODALIDADE === 'PRESENCIAL' ? 'blue' :
                          atividade.MODALIDADE === 'ONLINE' ? 'green' : 'yellow'
                        } size="sm">
                          {atividade.MODALIDADE}
                        </Badge>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleFavorita(atividade.ID_ATIVIDADE)}
                      className={`p-2 rounded-full transition-colors ${
                        isFavorita ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorita ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {atividade.UNIDADE_SESC}
                    </div>
                    
                    {atividade.HORARIO && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {atividade.HORARIO}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {vagasDisponiveis} vagas disponíveis
                    </div>
                    
                    {atividade.VALOR > 0 && (
                      <div className="text-lg font-semibold text-green-600">
                        R$ {atividade.VALOR.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {atividade.DESCRICAO && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {atividade.DESCRICAO}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAtividade(atividade);
                        setShowModal(true);
                      }}
                      className="flex-1"
                    >
                      Ver Detalhes
                    </Button>
                    
                    {podeInscrever.pode ? (
                      <Button
                        size="sm"
                        onClick={() => handleInscrever(atividade)}
                        className="flex-1"
                      >
                        Inscrever-se
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled
                        className="flex-1"
                        title={podeInscrever.motivo}
                      >
                        {podeInscrever.motivo}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAtividades.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou volte mais tarde para ver novas atividades.
            </p>
          </div>
        </Card>
      )}

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Detalhes da Atividade"
        size="lg"
      >
        {selectedAtividade && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedAtividade.NOME_ATIVIDADE}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge color="blue">{selectedAtividade.CATEGORIA}</Badge>
                <Badge color="green">{selectedAtividade.MODALIDADE}</Badge>
                {selectedAtividade.VALOR > 0 && (
                  <Badge color="yellow">R$ {selectedAtividade.VALOR.toFixed(2)}</Badge>
                )}
              </div>
            </div>

            {/* Informações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Informações Gerais</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{selectedAtividade.UNIDADE_SESC}</span>
                  </div>
                  
                  {selectedAtividade.HORARIO && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedAtividade.HORARIO}</span>
                    </div>
                  )}
                  
                  {selectedAtividade.LOCAL && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedAtividade.LOCAL}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      {selectedAtividade.VAGAS_TOTAL - (selectedAtividade.VAGAS_OCUPADAS || 0)} vagas disponíveis
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Requisitos</h3>
                <div className="space-y-2 text-sm">
                  {selectedAtividade.IDADE_MINIMA && (
                    <div>Idade mínima: {selectedAtividade.IDADE_MINIMA} anos</div>
                  )}
                  {selectedAtividade.IDADE_MAXIMA && (
                    <div>Idade máxima: {selectedAtividade.IDADE_MAXIMA} anos</div>
                  )}
                  {selectedAtividade.MATERIAIS_NECESSARIOS && (
                    <div>
                      <strong>Materiais:</strong> {selectedAtividade.MATERIAIS_NECESSARIOS}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Descrição */}
            {selectedAtividade.DESCRICAO && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-700">{selectedAtividade.DESCRICAO}</p>
              </div>
            )}

            {/* Observações */}
            {selectedAtividade.OBSERVACOES && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Observações</h3>
                <p className="text-gray-700">{selectedAtividade.OBSERVACOES}</p>
              </div>
            )}

            {/* Datas */}
            {(selectedAtividade.DATA_INICIO || selectedAtividade.DATA_FIM) && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Período</h3>
                <div className="flex space-x-4 text-sm">
                  {selectedAtividade.DATA_INICIO && (
                    <div>
                      <span className="text-gray-600">Início:</span>{' '}
                      <span>{new Date(selectedAtividade.DATA_INICIO).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {selectedAtividade.DATA_FIM && (
                    <div>
                      <span className="text-gray-600">Fim:</span>{' '}
                      <span>{new Date(selectedAtividade.DATA_FIM).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Fechar
              </Button>
              
              {podeSeInscrever(selectedAtividade).pode ? (
                <Button
                  onClick={() => handleInscrever(selectedAtividade)}
                >
                  Inscrever-se
                </Button>
              ) : (
                <Button disabled>
                  {podeSeInscrever(selectedAtividade).motivo}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AtividadesCliente;