import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AtividadeDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [atividade, setAtividade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAtividade = async () => {
      try {
        const response = await apiService.getAtividadeById(id);
        if (response.success) {
          setAtividade(response.data);
        } else {
          // Mock data para demonstração
          setAtividade({
            id: parseInt(id),
            nomeAtividade: 'Natação para Iniciantes',
            descricao: 'Curso completo de natação para pessoas que nunca tiveram contato com a água ou têm pouca experiência. Aprenda técnicas básicas de respiração, flutuação e movimentos fundamentais em ambiente seguro e com instrutor qualificado.',
            categoria: 'Esporte',
            unidadeSesc: 'SESC Centro',
            vagas: 20,
            inscricoes: 15,
            preco: 50,
            status: 'ativa',
            instrutor: 'João Silva',
            horarios: 'Terças e Quintas, 19h às 20h',
            duracao: '2 meses',
            requisitos: 'Nenhum conhecimento prévio necessário',
            materiais: 'Touca, óculos e sunga/maiô (fornecidos pelo SESC)'
          });
        }
      } catch (err) {
        setError('Erro ao carregar detalhes da atividade');
      } finally {
        setLoading(false);
      }
    };

    loadAtividade();
  }, [id]);

  const handleInscricao = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Simular inscrição
    alert('Funcionalidade de inscrição em desenvolvimento!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Carregando atividade..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!atividade) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Atividade não encontrada</h2>
          <button 
            onClick={() => navigate('/atividades')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ← Voltar para Atividades
          </button>
        </div>
      </div>
    );
  }

  const vagasDisponiveis = atividade.vagas - atividade.inscricoes;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate('/atividades')}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Voltar para Atividades
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{atividade.nomeAtividade}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                atividade.status === 'ativa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {atividade.status === 'ativa' ? '✅ Ativa' : '❌ Inativa'}
              </span>
            </div>

            <p className="text-lg text-gray-600 mb-8">{atividade.descricao}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">📋 Informações Gerais</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">📂 Categoria:</span>
                    <span className="font-medium">{atividade.categoria}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">📍 Unidade:</span>
                    <span className="font-medium">{atividade.unidadeSesc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">👨‍🏫 Instrutor:</span>
                    <span className="font-medium">{atividade.instrutor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">🕒 Horários:</span>
                    <span className="font-medium">{atividade.horarios}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">⏱️ Duração:</span>
                    <span className="font-medium">{atividade.duracao}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">💰 Valor:</span>
                    <span className="font-medium text-green-600">
                      {atividade.preco ? `R$ ${atividade.preco}` : 'Gratuito'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">👥 Vagas</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Vagas Totais:</span>
                    <span className="font-bold">{atividade.vagas}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Inscritos:</span>
                    <span className="font-bold">{atividade.inscricoes}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span>Disponíveis:</span>
                    <span className={`font-bold ${vagasDisponiveis > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {vagasDisponiveis}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(atividade.inscricoes / atividade.vagas) * 100}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={handleInscricao}
                    disabled={vagasDisponiveis <= 0 || atividade.status !== 'ativa'}
                    className={`w-full py-3 px-4 rounded-lg font-semibold ${
                      vagasDisponiveis > 0 && atividade.status === 'ativa'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {!isAuthenticated 
                      ? '🔐 Faça login para se inscrever'
                      : vagasDisponiveis <= 0 
                      ? '❌ Sem vagas disponíveis'
                      : atividade.status !== 'ativa'
                      ? '⏸️ Atividade inativa'
                      : '📝 Inscrever-se'
                    }
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">ℹ️ Informações Adicionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">📋 Requisitos:</h4>
                  <p className="text-gray-600">{atividade.requisitos}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🎒 Materiais:</h4>
                  <p className="text-gray-600">{atividade.materiais}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtividadeDetalhes;
