import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, Star, ArrowRight, Check } from 'lucide-react';
import Button from '../components/common/Button';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Atividades Variadas',
      description: 'Natação, dança, yoga, musculação e muito mais',
    },
    {
      icon: Users,
      title: 'Para Toda Família',
      description: 'Programas para crianças, jovens, adultos e idosos',
    },
    {
      icon: Star,
      title: 'Qualidade Garantida',
      description: 'Profissionais qualificados e estrutura moderna',
    },
  ];

  const benefits = [
    'Acesso a todas as atividades',
    'Horários flexíveis',
    'Acompanhamento profissional',
    'Ambiente seguro e acolhedor',
    'Múltiplas unidades',
    'Preços acessíveis',
  ];

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Welcome Section */}
        <div className="gradient-bg text-white">
          <div className="container-custom section-padding">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Bem-vindo de volta, {user?.nome}!
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                Continue explorando nossas atividades
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  as={Link}
                  to={user?.tipo === 'admin' ? '/admin' : '/cliente'}
                  variant="secondary"
                  size="lg"
                >
                  Ir para Dashboard
                </Button>
                <Button
                  as={Link}
                  to={user?.tipo === 'admin' ? '/admin/atividades' : '/cliente/atividades'}
                  variant="outline"
                  size="lg"
                >
                  Ver Atividades
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="container-custom -mt-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="card-body">
                <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                <div className="text-gray-600">Atividades Disponíveis</div>
              </div>
            </div>
            <div className="card text-center">
              <div className="card-body">
                <div className="text-3xl font-bold text-success-600 mb-2">1000+</div>
                <div className="text-gray-600">Clientes Ativos</div>
              </div>
            </div>
            <div className="card text-center">
              <div className="card-body">
                <div className="text-3xl font-bold text-warning-600 mb-2">5</div>
                <div className="text-gray-600">Unidades</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="gradient-bg text-white relative overflow-hidden">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Transforme sua vida com o{' '}
                <span className="text-gradient">SESC</span>
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                Descubra atividades incríveis, faça novos amigos e cuide da sua saúde e bem-estar em nossas unidades.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  as={Link}
                  to="/login"
                  size="lg"
                  variant="secondary"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Começar Agora
                </Button>
                <Button
                  as={Link}
                  to="/atividades"
                  size="lg"
                  variant="outline"
                >
                  Ver Atividades
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white bg-opacity-10 rounded-3xl backdrop-blur-sm p-8">
                <div className="h-full bg-gradient-to-br from-white to-primary-100 rounded-2xl flex items-center justify-center">
                  <Calendar size={120} className="text-primary-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Features Section */}
      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o SESC?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos uma experiência completa para toda a família, com atividades diversificadas e qualidade excepcional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card text-center group hover:shadow-medium transition-all duration-300">
                  <div className="card-body">
                    <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-600 transition-colors duration-300">
                      <Icon className="text-primary-600 group-hover:text-white transition-colors duration-300" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Benefícios exclusivos para você
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Como membro do SESC, você terá acesso a uma série de vantagens e facilidades pensadas especialmente para o seu bem-estar.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="text-success-600" size={16} />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl p-8">
                <div className="h-full bg-white rounded-2xl shadow-soft flex items-center justify-center">
                  <Users size={120} className="text-primary-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="gradient-bg text-white section-padding">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já transformaram suas vidas com o SESC. Cadastre-se hoje mesmo!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              to="/login"
              size="lg"
              variant="secondary"
              icon={ArrowRight}
              iconPosition="right"
            >
              Criar Conta Grátis
            </Button>
            <Button
              as={Link}
              to="/contato"
              size="lg"
              variant="outline"
            >
              Fale Conosco
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}