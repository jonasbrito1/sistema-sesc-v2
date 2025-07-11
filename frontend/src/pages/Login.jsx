import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Form, FormField, Input } from '../components/common/Form';
import Button from '../components/common/Button';
import { Eye, EyeOff, Building, Users, Calendar } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    if (isRegistering) {
      const result = await registerUser(data);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } else {
      const result = await login(data.email, data.password);
      if (result.success) {
        navigate(from, { replace: true });
      }
    }
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-medium mb-4">
            <Building className="text-primary-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">SESC</h1>
          <p className="text-primary-100">Sistema de Inscrições</p>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-body">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isRegistering ? 'Criar Conta' : 'Entrar'}
              </h2>
              <p className="text-gray-600 mt-2">
                {isRegistering 
                  ? 'Crie sua conta para acessar as atividades'
                  : 'Acesse sua conta para continuar'
                }
              </p>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)}>
              {isRegistering && (
                <FormField
                  label="Nome Completo"
                  required
                  error={errors.nomeCliente?.message}
                >
                  <Input
                    {...register('nomeCliente', {
                      required: 'Nome é obrigatório',
                      minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
                    })}
                    placeholder="Digite seu nome completo"
                    error={errors.nomeCliente}
                  />
                </FormField>
              )}

              <FormField
                label="Email"
                required
                error={errors.email?.message}
              >
                <Input
                  type="email"
                  {...register('email', {
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                  placeholder="Digite seu email"
                  error={errors.email}
                />
              </FormField>

              <FormField
                label="Senha"
                required
                error={errors.password?.message}
              >
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Senha é obrigatória',
                      minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
                    })}
                    placeholder="Digite sua senha"
                    error={errors.password}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </FormField>

              {isRegistering && (
                <>
                  <FormField
                    label="Data de Nascimento"
                    required
                    error={errors.dataNascimento?.message}
                  >
                    <Input
                      type="date"
                      {...register('dataNascimento', {
                        required: 'Data de nascimento é obrigatória',
                      })}
                      error={errors.dataNascimento}
                    />
                  </FormField>

                  <FormField
                    label="Telefone"
                    required
                    error={errors.telefone?.message}
                  >
                    <Input
                      {...register('telefone', {
                        required: 'Telefone é obrigatório',
                      })}
                      placeholder="(11) 99999-9999"
                      error={errors.telefone}
                    />
                  </FormField>

                  <FormField
                    label="CEP"
                    required
                    error={errors.cep?.message}
                  >
                    <Input
                      {...register('cep', {
                        required: 'CEP é obrigatório',
                      })}
                      placeholder="12345-678"
                      error={errors.cep}
                    />
                  </FormField>
                </>
              )}

              {!isRegistering && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="form-checkbox"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Lembrar de mim
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-primary-600 hover:text-primary-500"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
              >
                {isRegistering ? 'Criar Conta' : 'Entrar'}
              </Button>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                {' '}
                <button
                  onClick={switchMode}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  {isRegistering ? 'Fazer login' : 'Cadastre-se'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-primary-100 text-sm mb-4">Descubra o que oferecemos</p>
          <div className="grid grid-cols-3 gap-4 text-white">
            <div className="text-center">
              <Users className="mx-auto mb-2" size={24} />
              <p className="text-xs">Atividades em Grupo</p>
            </div>
            <div className="text-center">
              <Calendar className="mx-auto mb-2" size={24} />
              <p className="text-xs">Horários Flexíveis</p>
            </div>
            <div className="text-center">
              <Building className="mx-auto mb-2" size={24} />
              <p className="text-xs">Múltiplas Unidades</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
