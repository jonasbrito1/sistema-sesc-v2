import { useState } from 'react';
import { cepService } from '../services/cep';
import { toast } from 'react-toastify';

export function useCep() {
  const [loading, setLoading] = useState(false);
  const [endereco, setEndereco] = useState(null);

  const buscarCep = async (cep) => {
    if (!cep || cep.length < 8) return;

    try {
      setLoading(true);
      const response = await cepService.buscarCep(cep);
      
      if (response.success) {
        setEndereco(response.data);
        return response.data;
      } else {
        toast.error(response.message || 'CEP não encontrado');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const limparEndereco = () => {
    setEndereco(null);
  };

  return {
    loading,
    endereco,
    buscarCep,
    limparEndereco,
  };
}