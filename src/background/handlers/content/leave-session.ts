import { Handler } from '@shared/types';
import SocketManager from '@background/socket-manager';

export const leaveSession: Handler = {
  event: 'leave-session',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    try {
      const { sessionId } = message.payload;
      
      if (!sessionId) {
        sendResponse({ success: false, error: 'Session ID is required' });
        return;
      }

      const socketManager = SocketManager.getInstance();
      
      socketManager.leaveSession(sessionId);
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Background: Failed to leave session:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
  bidirectional: true
};
