import { useState, useEffect, useCallback } from 'react';
import { SessionState } from '@shared/types/session.types';
import { Notification } from '@ui/components/NotificationList';

interface SessionStateHook {
  sessionState: SessionState | null;
  connectionState: string;
  isConnected: boolean;
  isLoading: boolean;
  notifications: Notification[];
  refreshState: () => Promise<void>;
  createSession: () => Promise<void>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  videoControl: (action: string, data?: any) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

export const useSessionState = (): SessionStateHook => {
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const sendMessage = useCallback(async (type: string, payload: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type, payload, source: 'popup' },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response?.success === false) {
            reject(new Error(response.error || 'Unknown error'));
          } else {
            resolve(response);
          }
        }
      );
    });
  }, []);

  const refreshState = useCallback(async () => {
    try {
      const response = await sendMessage('get-session-state');
      setSessionState(response.sessionState);
      setConnectionState(response.connectionState);
      setIsConnected(response.isConnected);
    } catch (error) {
      console.error('Failed to refresh state:', error);
      addNotification({
        type: 'error',
        message: 'Falha ao conectar com a extensão'
      });
    }
  }, [sendMessage, addNotification]);

  const createSession = useCallback(async () => {
    if (!isConnected) {
      addNotification({
        type: 'error',
        message: 'Não conectado ao servidor'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get current video info from content script
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]?.id) {
        throw new Error('Nenhuma aba ativa encontrada');
      }

      // Send message to content script to get video info
      const videoInfo = await chrome.tabs.sendMessage(tabs[0].id, {
        type: 'get-current-video',
        source: 'popup'
      });

      if (!videoInfo) {
        throw new Error('Nenhum vídeo encontrado na página');
      }

      await sendMessage('create-session-popup', { videoInfo });
      
      addNotification({
        type: 'success',
        message: 'Sessão criada com sucesso!'
      });
      
      await refreshState();
    } catch (error) {
      console.error('Failed to create session:', error);
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Falha ao criar sessão'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, sendMessage, addNotification, refreshState]);

  const joinSession = useCallback(async (sessionId: string) => {
    if (!isConnected) {
      addNotification({
        type: 'error',
        message: 'Não conectado ao servidor'
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendMessage('join-session-popup', { sessionId });
      
      addNotification({
        type: 'success',
        message: `Entrou na sessão ${sessionId}!`
      });
      
      await refreshState();
    } catch (error) {
      console.error('Failed to join session:', error);
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Falha ao entrar na sessão'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, sendMessage, addNotification, refreshState]);

  const leaveSession = useCallback(async () => {
    setIsLoading(true);
    try {
      await sendMessage('leave-session-popup');
      
      addNotification({
        type: 'info',
        message: 'Saiu da sessão'
      });
      
      await refreshState();
    } catch (error) {
      console.error('Failed to leave session:', error);
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Falha ao sair da sessão'
      });
    } finally {
      setIsLoading(false);
    }
  }, [sendMessage, addNotification, refreshState]);

  const videoControl = useCallback(async (action: string, data: any = {}) => {
    try {
      await sendMessage('video-control-popup', { action, ...data });
      
      // Don't show notification for every video control action
      // addNotification({
      //   type: 'info',
      //   message: `Vídeo ${action === 'play' ? 'reproduzindo' : action === 'pause' ? 'pausado' : 'ajustado'}`
      // });
    } catch (error) {
      console.error('Failed to control video:', error);
      addNotification({
        type: 'error',
        message: `Falha ao controlar vídeo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  }, [sendMessage, addNotification]);

  // Initial state load
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Listen for background script events
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.source === 'background') {
        switch (message.type) {
          case 'user-joined':
            addNotification({
              type: 'info',
              message: 'Um usuário entrou na sessão'
            });
            refreshState();
            break;
          case 'user-left':
            addNotification({
              type: 'info',
              message: 'Um usuário saiu da sessão'
            });
            refreshState();
            break;
          case 'session-ended':
            addNotification({
              type: 'warning',
              message: 'A sessão foi encerrada'
            });
            refreshState();
            break;
          case 'creator-promoted':
            addNotification({
              type: 'info',
              message: 'Você agora é o criador da sessão'
            });
            refreshState();
            break;
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [addNotification, refreshState]);

  // Auto-refresh state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionState?.isActive) {
        refreshState();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionState?.isActive, refreshState]);

  return {
    sessionState,
    connectionState,
    isConnected,
    isLoading,
    notifications,
    refreshState,
    createSession,
    joinSession,
    leaveSession,
    videoControl,
    addNotification,
    removeNotification
  };
};
