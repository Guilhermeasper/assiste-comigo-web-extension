import SocketManager from '@background/socket-manager';
import { Handler } from '@shared/types';

export const createSession: Handler = {
  event: 'create-session',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    console.log('createSession', message);
    try {
      const { videoInfo } = message;

      if (!videoInfo) {
        sendResponse({ success: false, error: 'Video info is required' });
        return;
      }

      const socketManager = SocketManager.getInstance();

      if (!socketManager.isConnected()) {
        sendResponse({ success: false, error: 'Not connected to server' });
        return;
      }

      const sessionId = await socketManager.createSession(videoInfo);

      // sendResponse({
      //   success: true,
      //   sessionId,
      //   videoInfo,
      // });

      console.log('Session connected successfully:', sessionId);
    } catch (error) {
      console.error('Background: Failed to create session:', error);
      // sendResponse({
      //   success: false,
      //   error: error instanceof Error ? error.message : 'Unknown error',
      // });
    }
  },
  bidirectional: true,
};
