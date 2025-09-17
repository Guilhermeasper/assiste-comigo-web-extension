import { Handler } from '@shared/types';
import { SessionStorageManager } from '@shared/session-storage-manager';
import SocketManager from '@background/socket-manager';

export const getSessionState: Handler = {
  event: 'get-session-state',
  origin: 'popup',
  handler: async (message, sender, sendResponse) => {
    try {
      const sessionStorage = SessionStorageManager.getInstance();
      const socketManager = SocketManager.getInstance();
      
      const sessionState = await sessionStorage.getSessionState();
      const connectionState = socketManager.getConnectionState();
      
      sendResponse({
        success: true,
        sessionState,
        connectionState,
        isConnected: socketManager.isConnected()
      });
    } catch (error) {
      console.error('Background: Failed to get session state:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
  bidirectional: true
};
