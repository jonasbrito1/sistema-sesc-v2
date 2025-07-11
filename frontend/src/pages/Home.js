import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Simulação simples de verificação de autenticação
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Erro ao verificar usuário');
      }
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)'
    }}>
      {/* Hero Section */}
      <section style={{ 
        padding: '80px 16px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '24px',
            lineHeight: '1.1'
          }}>
            Transforme sua vida com o
            <span style={{ color: '#2563eb' }}> SESC</span>
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            marginBottom: '32px',
            maxWidth: '800px',
            margin: '0 auto 32px auto',
            lineHeight: '1.6'
          }}>
            Descubra atividades incríveis que vão revolucionar seu bem-estar físico, 
            mental e social. Sua jornada de transformação começa aqui!
          </p>
          
          {isAuthenticated ? (
            <div>
              <p style={{ 
                fontSize: '18px', 
                color: '#374151',
                marginBottom: '24px'
              }}>
                Bem-vindo de volta, <strong>{user?.nome || 'Usuário'}</strong>! 
              </p>
              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Link
                  to="/atividades"
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                   Ver Atividades
                </Link>
                <Link
                  to="/inscricoes"
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
                >
                   Minhas Inscrições
                </Link>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link
                to="/register"
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                 Começar Agora
              </Link>
              <Link
                to="/atividades"
                style={{
                  backgroundColor: 'white',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#eff6ff';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                 Explorar Atividades
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Estatísticas */}
      <section style={{
        padding: '64px 16px',
        backgroundColor: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#111827',
            marginBottom: '48px'
          }}>
             Nossos Números
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '24px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#2563eb'
              }}>156</div>
              <p style={{
                color: '#6b7280',
                marginTop: '8px',
                margin: '8px 0 0 0'
              }}> Clientes Ativos</p>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '24px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#16a34a'
              }}>28</div>
              <p style={{
                color: '#6b7280',
                marginTop: '8px',
                margin: '8px 0 0 0'
              }}> Atividades Disponíveis</p>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '24px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#7c2d12'
              }}>94</div>
              <p style={{
                color: '#6b7280',
                marginTop: '8px',
                margin: '8px 0 0 0'
              }}> Inscrições Realizadas</p>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '24px',
              backgroundColor: '#fefce8',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#ca8a04'
              }}>4.3</div>
              <p style={{
                color: '#6b7280',
                marginTop: '8px',
                margin: '8px 0 0 0'
              }}> Avaliação Média</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ 
        padding: '64px 16px',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#111827',
            marginBottom: '48px'
          }}>
             Por que escolher o SESC?
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '32px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#111827'
              }}>
                Atividades Diversas
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Esportes, cultura, educação e lazer. Temos opções para todos os gostos e idades.
              </p>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '32px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#111827'
              }}>
                Professores Qualificados
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Nossa equipe é formada por profissionais experientes e dedicados ao seu desenvolvimento.
              </p>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '32px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#111827'
              }}>
                Qualidade Garantida
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Estrutura moderna, equipamentos de qualidade e metodologias comprovadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      {!isAuthenticated && (
        <section style={{
          padding: '64px 16px',
          backgroundColor: '#2563eb',
          color: 'white'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '24px'
            }}>
               Pronto para transformar sua vida?
            </h2>
            <p style={{
              fontSize: '20px',
              marginBottom: '32px',
              opacity: '0.9'
            }}>
              Junte-se a milhares de pessoas que já descobriram o poder das atividades do SESC.
            </p>
            <Link
              to="/register"
              style={{
                backgroundColor: 'white',
                color: '#2563eb',
                padding: '16px 32px',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.transform = 'translateY(0)';
              }}
            >
               Cadastre-se Gratuitamente
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
