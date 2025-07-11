import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { toast } from 'react-hot-toast';

const InscricoesCliente = () => {
  const [inscricoes, setInscricoes] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInscricao, setSelectedInscricao] = useState(null);
  const [filter, setFilter] = useState('todas');

  useEffect(() => {
    fetchInscricoes();
    fetchAtividades();
  }, []);

  const fetchInscricoes = async () => {
    try {
      // Simular ID do cliente logado
      const clienteId = localStorage.getItem('sesc_cliente_id') || 'cliente_exemplo';
      
      const response = await fetch(`http://localhost:3001/api/inscricoes/cliente/${clienteId}`);
      const data = await response.json();
      
      if (data.success) {
        setInscricoes(data.data || []);
      } else {
        toast.error('Erro ao carregar inscrições');
      }
    } catch (error) {
      toast.error('Erro de conexão');
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

  const handleCancelar = async (inscricao) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta inscrição?')) {
      return;
    }

    const motivo = prompt('Motivo do cancelamento (opcional):') || 'Cancelado pelo cliente';

    try {
      const response = await fetch(`http://localhost:3001/api/inscricoes/${inscricao.ID_INSCRICAO}/cancelar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Inscrição cancelada com sucesso');
        fetchInscricoes();
        setShowModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao cancelar inscrição');
    }
  };

  const getAtividade = (idAtividade) => {
    return atividades.find(a => a.ID_ATIVIDADE === idAtividade) || {};
  };

  const filteredInscricoes = inscricoes.filter(inscricao => {
    switch (filter) {
      case 'ativas':
        return inscricao.STATUS === 'ATIVA' || inscricao.STATUS === 'CONFIRMADA';
      case 'canceladas':
        return inscricao.STATUS === 'CANCELADA';
      case 'pendentes':
        return inscricao.STATUS_PAGAMENTO === 'PENDENTE';
      default:
        return true;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ATIVA':
        return 'green';
      case 'CONFIRMADA':
        return 'blue';
      case 'CANCELADA':
        return 'red';
      case 'LISTA_ESPERA':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getPagamentoColor = (status) => {
    switch (status) {
      case 'PAGO':
        return 'green';
      case 'PENDENTE':
        return 'yellow';
      case 'CANCELADO':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Inscrições</h1>
        <p className="text-gray-600 mt-2">Acompanhe suas inscrições e atividades</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'todas', label: 'Todas', count: inscricoes.length },
              { key: 'ativas', label: 'Ativas', count: inscricoes.filter(i => i.STATUS === 'ATIVA' || i.STATUS === 'CONFIRMADA').length },
              { key: 'canceladas', label: 'Canceladas', count: inscricoes.filter(i => i.STATUS === 'CANCELADA').length },
              { key: 'pendentes', label: 'Pagamento Pendente', count: inscricoes.filter(i => i.STATUS_PAGAMENTO === 'PENDENTE').length }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Inscriptions List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredInscricoes.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'todas' ? 'Nenhuma inscrição encontrada' : `Nenhuma inscrição ${filter}`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'todas' 
                ? 'Você ainda não se inscreveu em nenhuma atividade.'
                : `Não há inscrições com status ${filter}.`
              }
            </p>
            {filter === 'todas' && (
              <Button>
                Explorar Atividades
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInscricoes.map((inscricao) => {
            const atividade = getAtividade(inscricao.ID_ATIVIDADE);
            
            return (
              <Card key={inscricao.ID_INSCRICAO} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {atividade.NOME_ATIVIDADE || 'Atividade não encontrada'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge color={getStatusColor(inscricao.STATUS)}>
                          {inscricao.STATUS}
                        </Badge>
                        <Badge color={getPagamentoColor(inscricao.STATUS_PAGAMENTO)}>
                          {inscricao.STATUS_PAGAMENTO}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Inscrito em: {new Date(inscricao.DATA_INSCRICAO).toLocaleDateString('pt-BR')}
                    </div>
                    
                    {atividade.UNIDADE_SESC && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {atividade.UNIDADE_SESC}
                      </div>
                    )}
                    
                    {atividade.HORARIO && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {atividade.HORARIO}
                      </div>
                    )}
                    
                    {inscricao.VALOR_PAGO > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Valor:</span>{' '}
                        <span className="font-medium text-green-600">
                          R$ {inscricao.VALOR_PAGO.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status específicos */}
                  {inscricao.STATUS === 'LISTA_ESPERA' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-800">
                          Você está na lista de espera. Entraremos em contato quando houver vagas.
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {inscricao.STATUS === 'CANCELADA' && inscricao.MOTIVO_CANCELAMENTO && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <div className="text-sm text-red-800">
                        <strong>Motivo:</strong> {inscricao.MOTIVO_CANCELAMENTO}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedInscricao(inscricao);
                        setShowModal(true);
                      }}
                      className="flex-1"
                    >
                      Ver Detalhes
                    </Button>
                    
                    {(inscricao.STATUS === 'ATIVA' || inscricao.STATUS === 'CONFIRMADA') && (
                      <Button
                        variant="outline"
                        size="sm"
                        color="red"
                        onClick={() => handleCancelar(inscricao)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Detalhes da Inscrição"
        size="lg"
      >
        {selectedInscricao && (
          <div className="space-y-6">
            {(() => {
              const atividade = getAtividade(selectedInscricao.ID_ATIVIDADE);
              
              return (
                <>
                  {/* Atividade Info */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {atividade.NOME_ATIVIDADE}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Informações da Atividade</h4>
                        <div className="space-y-1 text-sm">
                          <div><span className="text-gray-600">Categoria:</span> {atividade.CATEGORIA}</div>
                          <div><span className="text-gray-600">Modalidade:</span> {atividade.MODALIDADE}</div>
                          <div><span className="text-gray-600">Unidade:</span> {atividade.UNIDADE_SESC}</div>
                          {atividade.HORARIO && (
                            <div><span className="text-gray-600">Horário:</span> {atividade.HORARIO}</div>
                          )}
                          {atividade.LOCAL && (
                            <div><span className="text-gray-600">Local:</span> {atividade.LOCAL}</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Status da Inscrição</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Status:</span>
                            <Badge color={getStatusColor(selectedInscricao.STATUS)}>
                              {selectedInscricao.STATUS}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Pagamento:</span>
                            <Badge color={getPagamentoColor(selectedInscricao.STATUS_PAGAMENTO)}>
                              {selectedInscricao.STATUS_PAGAMENTO}
                            </Badge>
                          </div>
                          
                          <div className="text-sm">
                            <span className="text-gray-600">Data da inscrição:</span>{' '}
                            {new Date(selectedInscricao.DATA_INSCRICAO).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pagamento */}
                  {selectedInscricao.VALOR_PAGO > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Informações de Pagamento</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Valor:</span>{' '}
                          <span className="font-medium">R$ {selectedInscricao.VALOR_PAGO.toFixed(2)}</span>
                        </div>
                        {selectedInscricao.FORMA_PAGAMENTO && (
                          <div>
                            <span className="text-gray-600">Forma:</span>{' '}
                            <span>{selectedInscricao.FORMA_PAGAMENTO}</span>
                          </div>
                        )}
                        {selectedInscricao.DATA_PAGAMENTO && (
                          <div>
                            <span className="text-gray-600">Data do pagamento:</span>{' '}
                            <span>{new Date(selectedInscricao.DATA_PAGAMENTO).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {selectedInscricao.OBSERVACOES && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                      <p className="text-gray-700 text-sm">{selectedInscricao.OBSERVACOES}</p>
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
                    
                    {(selectedInscricao.STATUS === 'ATIVA' || selectedInscricao.STATUS === 'CONFIRMADA') && (
                      <Button
                        color="red"
                        onClick={() => handleCancelar(selectedInscricao)}
                      >
                        Cancelar Inscrição
                      </Button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InscricoesCliente;