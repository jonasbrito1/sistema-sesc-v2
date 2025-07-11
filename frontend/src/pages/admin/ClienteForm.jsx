import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, Input, Select } from '../common/Form';
import Button from '../common/Button';
import { useCep } from '../../hooks/useCep';
import { clienteService } from '../../services/clientes';
import { useApi } from '../../hooks/useApi';
import { toast } from 'react-toastify';
import InputMask from 'react-input-mask';

export default function ClienteForm({ cliente, onSuccess, onCancel }) {
  const isEditing = !!cliente;
  const { loading, request } = useApi();
  const { buscarCep, endereco } = useCep();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: cliente || {
      nomeCliente: '',
      dataNascimento: '',
      email: '',
      telefone: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
  });

  const watchCep = watch('cep');

  useEffect(() => {
    if (watchCep && watchCep.length === 9) {
      handleCepChange(watchCep);
    }
  }, [watchCep]);

  useEffect(() => {
    if (endereco) {
      setValue('logradouro', endereco.logradouro || '');
      setValue('bairro', endereco.bairro || '');
      setValue('cidade', endereco.cidade || '');
      setValue('estado', endereco.estado || '');
    }
  }, [endereco, setValue]);

  const handleCepChange = async (cep) => {
    if (cep && cep.length === 9) {
      await buscarCep(cep);
    }
  };

  const onSubmit = async (data) => {
    const apiCall = isEditing
      ? () => clienteService.atualizar(cliente.id, data)
      : () => clienteService.criar(data);

    const result = await request(apiCall, {
      showSuccess: true,
      successMessage: isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!',
    });

    if (result.success) {
      onSuccess?.(result.data);
      if (!isEditing) {
        reset();
      }
    }
  };

  const estadosBrasil = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
  ];

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dados Pessoais */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Digite o nome completo"
              error={errors.nomeCliente}
            />
          </FormField>

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Digite o email"
              error={errors.email}
            />
          </FormField>

          <FormField
            label="Telefone"
            required
            error={errors.telefone?.message}
          >
            <InputMask
              mask="(99) 99999-9999"
              {...register('telefone', {
                required: 'Telefone é obrigatório',
              })}
            >
              {(inputProps) => (
                <Input
                  {...inputProps}
                  placeholder="(11) 99999-9999"
                  error={errors.telefone}
                />
              )}
            </InputMask>
          </FormField>
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="CEP"
            required
            error={errors.cep?.message}
            helpText="O endereço será preenchido automaticamente"
          >
            <InputMask
              mask="99999-999"
              {...register('cep', {
                required: 'CEP é obrigatório',
              })}
            >
              {(inputProps) => (
                <Input
                  {...inputProps}
                  placeholder="12345-678"
                  error={errors.cep}
                />
              )}
            </InputMask>
          </FormField>

          <FormField
            label="Logradouro"
            required
            error={errors.logradouro?.message}
          >
            <Input
              {...register('logradouro', {
                required: 'Logradouro é obrigatório',
              })}
              placeholder="Rua, Avenida..."
              error={errors.logradouro}
            />
          </FormField>

          <FormField
            label="Número"
            required
            error={errors.numero?.message}
          >
            <Input
              {...register('numero', {
                required: 'Número é obrigatório',
              })}
              placeholder="123"
              error={errors.numero}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Bairro"
            required
            error={errors.bairro?.message}
          >
            <Input
              {...register('bairro', {
                required: 'Bairro é obrigatório',
              })}
              placeholder="Nome do bairro"
              error={errors.bairro}
            />
          </FormField>

          <FormField
            label="Cidade"
            required
            error={errors.cidade?.message}
          >
            <Input
              {...register('cidade', {
                required: 'Cidade é obrigatória',
              })}
              placeholder="Nome da cidade"
              error={errors.cidade}
            />
          </FormField>

          <FormField
            label="Estado"
            required
            error={errors.estado?.message}
          >
            <Select
              {...register('estado', {
                required: 'Estado é obrigatório',
              })}
              options={estadosBrasil}
              placeholder="Selecione o estado"
              error={errors.estado}
            />
          </FormField>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? 'Atualizar' : 'Criar'} Cliente
        </Button>
      </div>
    </Form>
  );
}
