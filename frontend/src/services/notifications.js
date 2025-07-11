export const notificationService = {
  // Solicitar permissão para notificações
  requestPermission: async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  // Mostrar notificação
  showNotification: (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  },

  // Verificar suporte a notificações
  isSupported: () => {
    return 'Notification' in window;
  },

  // Verificar permissão
  hasPermission: () => {
    return 'Notification' in window && Notification.permission === 'granted';
  },
};