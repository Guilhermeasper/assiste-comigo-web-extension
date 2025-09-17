import SocketManager from '@background/socket-manager';
import { Handler } from '@shared/types';

export const joinSession: Handler = {
  event: 'join-session',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    try {
      const { sessionId } = message;

      // if (!sessionId) {
      //   sendResponse({ success: false, error: 'Session ID is required' });
      //   return;
      // }

      const socketManager = SocketManager.getInstance();

      // if (!socketManager.isConnected()) {
      //   sendResponse({ success: false, error: 'Not connected to server' });
      //   return;
      // }

      const response = await socketManager.joinSession(sessionId);

      console.log('Session joined successfully:', response);
      // sendResponse({
      //   success: true,
      //   ...response
      // });
    } catch (error) {
      console.error('Background: Failed to join session:', error);
      // sendResponse({
      //   success: false,
      //   error: error instanceof Error ? error.message : 'Unknown error',
      // });
    }
  },
  bidirectional: true,
};
