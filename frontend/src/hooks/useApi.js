import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiCall, options = {}) => {
    const {
      showLoading = true,
      showSuccess = false,
      showError = true,
      successMessage = 'Operação realizada com sucesso',
      errorMessage = 'Erro ao realizar operação',
    } = options;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await apiCall();

      if (response.success) {
        if (showSuccess) {
          toast.success(response.message || successMessage);
        }
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || errorMessage;
        if (showError) {
          toast.error(errorMsg);
        }
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      const errorMsg = err.response?.data?.message || err.message || errorMessage;
      
      if (showError) {
        toast.error(errorMsg);
      }
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    request,
    setLoading,
    setError,
  };
}