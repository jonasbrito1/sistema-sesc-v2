import api from './api';

export const uploadService = {
  // Upload de arquivo
  uploadFile: async (file, tipo = 'geral') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);

    return await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload de imagem
  uploadImage: async (file, tipo = 'avatar') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('tipo', tipo);

    return await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Deletar arquivo
  deleteFile: async (fileId) => {
    return await api.delete(`/upload/${fileId}`);
  },
};