import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Atividades = () => {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: '',
    unidade: ''
  });

  useEffect(() => {
    const loadAtividades = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAtividades();
        
        if (response.success) {
          setAtividades(response.data || []);
        } else {
          const mockAtividades = [
            {
              id: 1,
              nomeAtividade: 'Natação para Iniciantes',
              descricao: 'Aprenda a nadar com segurança e técnica adequada',
              categoria: 'Esporte',
              unidadeSesc: 'SESC Centro',
              vagas: 20,
              inscricoes: 15,
              preco: 50,
              status: 'ativa'
            },
            {
              id: 2,
              nomeAtividade: 'Yoga e Meditação',
              descricao: 'Encontre o equilíbrio entre corpo e mente',
              categoria: 'Bem-estar',
              unidadeSesc: 'SESC Norte',
              vagas: 15,
              inscricoes: 12,
              preco: 40,
              status: 'ativa'
            },
            {
              id: 3,
              nomeAtividade: 'Teatro para Jovens',
              descricao: 'Desenvolva sua expressão artística e criatividade',
              categoria: 'Cultura',
              unidadeSesc: 'SESC Sul',
              vagas: 25,
              inscricoes: 8,
              preco: 30,
              status: 'ativa'
            },
            {
              id: 4,
              nomeAtividade: 'Futsal Masculino',
              descricao: 'Campeonato interno de futsal',
              categoria: 'Esporte',
              unidadeSesc: 'SESC Centro',
              vagas: 30,
              inscricoes: 22,
              preco: 0,
              status: 'ativa'
            },
            {
              id: 5,
              nomeAtividade: 'Culinária Saudável',
              descricao: 'Aprenda receitas nutritivas e saborosas',
              categoria: 'Educação',
              unidadeSesc: 'SESC Norte',
              vagas: 12,
              inscricoes: 10,
              preco: 60,
              status: 'ativa'
            }
          ];
          setAtividades(mockAtividades);
        }
      } catch (err) {
        console.error('Erro ao carregar atividades:', err);
        setError('Erro ao carregar atividades. Mostrando dados de exemplo.');
        
        const mockAtividades = [
          {
            id: 1,
            nomeAtividade: 'Dança de Salão',
            descricao: 'Aprenda os principais ritmos da dança de salão',
            categoria: 'Cultura',
            unidadeSesc: 'SESC Centro',
            vagas: 20,
            inscricoes: 15,
            preco: 45,
            status: 'ativa'
          },
          {
            id: 2,
            nomeAtividade: 'Musculação',
            descricao: 'Treinamento com pesos supervisionado',
            categoria: 'Esporte',
            unidadeSesc: 'SESC Norte',
            vagas: 40,
            inscricoes: 35,
            preco: 70,
            status: 'ativa'
          }
        ];
        setAtividades(mockAtividades);
      } finally {
        setLoading(false);
      }
    };

    loadAtividades();
  }, []);

  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const atividadesFiltradas = atividades.filter(atividade => {
    return (
      (!filtros.busca || atividade.nomeAtividade.toLowerCase().includes(filtros.busca.toLowerCase())) &&
      (!filtros.categoria || atividade.categoria === filtros.categoria) &&
      (!filtros.unidade || atividade.unidadeSesc === filtros.unidade)
    );
  });

  const categorias = [...new Set(atividades.map(a => a.categoria))];
  const unidades = [...new Set(atividades.map(a => a.unidadeSesc))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Carregando atividades..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
             Atividades SESC
          </h1>
          <p className="text-xl text-gray-600">
            Descubra atividades incríveis para transformar sua vida
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-lg font-semibold mb-4"> Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar atividade
              </label>
              <input
                type="text"
                name="busca"
                placeholder="Digite o nome da atividade..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filtros.busca}
                onChange={handleFiltroChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                name="categoria"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filtros.categoria}
                onChange={handleFiltroChange}
              >
                <option value="">Todas as categorias</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade
              </label>
              <select
                name="unidade"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filtros.unidade}
                onChange={handleFiltroChange}
              >
                <option value="">Todas as unidades</option>
                {unidades.map(unidade => (
                  <option key={unidade} value={unidade}>{unidade}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {atividadesFiltradas.map(atividade => (
            <div key={atividade.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {atividade.nomeAtividade}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    atividade.status === 'ativa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {atividade.status === 'ativa' ? ' Ativa' : ' Inativa'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{atividade.descricao}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500"> Unidade:</span>
                    <span className="font-medium">{atividade.unidadeSesc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500"> Categoria:</span>
                    <span className="font-medium">{atividade.categoria}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500"> Vagas:</span>
                    <span className="font-medium">
                      {atividade.inscricoes || 0}/{atividade.vagas || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500"> Preço:</span>
                    <span className="font-medium text-green-600">
                      {atividade.preco ? `R$ ${atividade.preco}` : 'Gratuito'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link
                    to={`/atividades/${atividade.id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-center block"
                  >
                     Ver Detalhes
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {atividadesFiltradas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou buscar por outros termos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Atividades;
