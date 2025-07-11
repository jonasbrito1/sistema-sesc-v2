import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Inscricoes = () => {
  const { user } = useAuth();
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de inscrições
    setTimeout(() => {
      setInscricoes([
        {
          id: 1,
          atividade: 'Natação para Iniciantes',
          status: 'confirmada',
          dataInscricao: '2024-01-15',
          unidade: 'SESC Centro'
        },
        {
          id: 2,
          atividade: 'Yoga e Meditação',
          status: 'pendente',
          dataInscricao: '2024-01-10',
          unidade: 'SESC Norte'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Carregando suas inscrições..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          📋 Minhas Inscrições
        </h1>

        {inscricoes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Você ainda não tem inscrições
            </h3>
            <p className="text-gray-600 mb-4">
              Explore nossas atividades e encontre algo que você goste!
            </p>
            <a href="/atividades" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              🏃 Ver Atividades
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inscricoes.map(inscricao => (
              <div key={inscricao.id} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2">{inscricao.atividade}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${
                      inscricao.status === 'confirmada' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {inscricao.status === 'confirmada' ? '✅ Confirmada' : '⏳ Pendente'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data:</span>
                    <span className="font-medium">{inscricao.dataInscricao}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Unidade:</span>
                    <span className="font-medium">{inscricao.unidade}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inscricoes;
