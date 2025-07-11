import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, Input, Textarea, Select } from '../common/Form';
import Button from '../common/Button';
import { atividadeService } from '../../services/atividades';
import { responsavelService } from '../../services/responsaveis';
import { useApi } from '../../hooks/useApi';

export default function AtividadeForm({ atividade, onSuccess, onCancel }) {
  const isEditing = !!atividade;
  const [responsaveis, setResponsaveis] = useState([]);
  const { loading, request } = useApi();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: atividade || {
      nomeAtividade: '',
      descricao: '',
      unidadeSesc: '',
      idResponsavel: '',
      dataInicio: '',
      dataFim: '',
      vagas: '',
      preco: '',
    },
  });

  useEffect(() => {
    loadResponsaveis();
  }, []);

  const loadResponsaveis = async () => {
    const result = await request(() => responsavelService.listar({ status: 'ativo' }));
    if (result.success) {
      setResponsaveis(result.data.data || []);
    }
  };

  const onSubmit = async (data) => {
    // Converter strings para números onde necessário
    const formData = {
      ...data,
      vagas: parseInt(data.vagas),
      preco: parseFloat(data.preco),
      dataInicio: new Date(data.dataInicio),
      dataFim: new Date(data.dataFim),
    };

    const apiCall = isEditing
      ? () => atividadeService.atualizar(atividade.id, formData)
      : () => atividadeService.criar(formData);

    const result = await request(apiCall, {
      showSuccess: true,
      successMessage: isEditing ? 'Atividade atualizada com sucesso!' : 'Atividade criada com sucesso!',
    });

    if (result.success) {
      onSuccess?.(result.data);
      if (!isEditing) {
        reset();
      }
    }
  };

  const unidadesSesc = [
    { value: 'SESC Centro', label: 'SESC Centro' },
    { value: 'SESC Balneário', label: 'SESC Balneário' },
    { value: 'SESC Amazonas', label: 'SESC Amazonas' },
    { value: 'SESC Tijuca', label: 'SESC Tijuca' },
  ];

  const responsaveisOptions = responsaveis.map(resp => ({
    value: resp.id,
    label: `${resp.nomeResponsavel} - ${resp.unidadeSesc}`,
  }));

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>
        
        <FormField
          label="Nome da Atividade"
          required
          error={errors.nomeAtividade?.message}
        >
          <Input
            {...register('nomeAtividade', {
              required: 'Nome da atividade é obrigatório',
              minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
            })}
            placeholder="Ex: Natação Infantil"
            error={errors.nomeAtividade}
          />
        </FormField>

        <FormField
          label="Descrição"
          required
          error={errors.descricao?.message}
        >
          <Textarea
            {...register('descricao', {
              required: 'Descrição é obrigatória',
              minLength: { value: 10, message: 'Descrição deve ter pelo menos 10 caracteres' },
            })}
            placeholder="Descreva a atividade, objetivos, público-alvo..."
            rows={4}
            error={errors.descricao}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Unidade SESC"
            required
            error={errors.unidadeSesc?.message}
          >
            <Select
              {...register('unidadeSesc', {
                required: 'Unidade SESC é obrigatória',
              })}
              options={unidadesSesc}
              placeholder="Selecione a unidade"
              error={errors.unidadeSesc}
            />
          </FormField>

          <FormField
            label="Responsável"
            required
            error={errors.idResponsavel?.message}
          >
            <Select
              {...register('idResponsavel', {
                required: 'Responsável é obrigatório',
              })}
              options={responsaveisOptions}
              placeholder="Selecione o responsável"
              error={errors.idResponsavel}
            />
          </FormField>
        </div>
      </div>

      {/* Configurações */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Configurações</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Data de Início"
            required
            error={errors.dataInicio?.message}
          >
            <Input
              type="datetime-local"
              {...register('dataInicio', {
                required: 'Data de início é obrigatória',
              })}
              error={errors.dataInicio}
            />
          </FormField>

          <FormField
            label="Data de Término"
            required
            error={errors.dataFim?.message}
          >
            <Input
              type="datetime-local"
              {...register('dataFim', {
                required: 'Data de término é obrigatória',
              })}
              error={errors.dataFim}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Número de Vagas"
            required
            error={errors.vagas?.message}
          >
            <Input
              type="number"
              min="1"
              {...register('vagas', {
                required: 'Número de vagas é obrigatório',
                min: { value: 1, message: 'Deve ter pelo menos 1 vaga' },
              })}
              placeholder="Ex: 20"
              error={errors.vagas}
            />
          </FormField>

          <FormField
            label="Preço (R$)"
            required
            error={errors.preco?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('preco', {
                required: 'Preço é obrigatório',
                min: { value: 0, message: 'Preço não pode ser negativo' },
              })}
              placeholder="Ex: 50.00"
              error={errors.preco}
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
          {isEditing ? 'Atualizar' : 'Criar'} Atividade
        </Button>
      </div>
    </Form>
  );
}