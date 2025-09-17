import { Handler } from '@shared/types';
import { SessionStorageManager } from '@shared/session-storage-manager';
import SocketManager from '@background/socket-manager';

// Create Session Handler for Popup
export const createSessionFromPopup: Handler = {
  event: 'create-session-popup',
  origin: 'popup',
  handler: async (message, sender, sendResponse) => {
    try {
      const { videoInfo } = message.payload;
      
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
      
      sendResponse({ 
        success: true, 
        sessionId,
        videoInfo
      });
    } catch (error) {
      console.error('Background: Failed to create session from popup:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
  bidirectional: true
};

// Join Session Handler for Popup
export const joinSessionFromPopup: Handler = {
  event: 'join-session-popup',
  origin: 'popup',
  handler: async (message, sender, sendResponse) => {
    try {
      const { sessionId } = message.payload;
      
      if (!sessionId) {
        sendResponse({ success: false, error: 'Session ID is required' });
        return;
      }

      const socketManager = SocketManager.getInstance();
      
      if (!socketManager.isConnected()) {
        sendResponse({ success: false, error: 'Not connected to server' });
        return;
      }

      const response = await socketManager.joinSession(sessionId);
      
      sendResponse({ 
        success: true, 
        ...response
      });
    } catch (error) {
      console.error('Background: Failed to join session from popup:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
  bidirectional: true
};

// Leave Session Handler for Popup
export const leaveSessionFromPopup: Handler = {
  event: 'leave-session-popup',
  origin: 'popup',
  handler: async (message, sender, sendResponse) => {
    try {
      const sessionStorage = SessionStorageManager.getInstance();
      const sessionState = await sessionStorage.getSessionState();
      
      if (!sessionState.isActive || !sessionState.sessionId) {
        sendResponse({ success: false, error: 'No active session' });
        return;
      }

      const socketManager = SocketManager.getInstance();
      socketManager.leaveSession(sessionState.sessionId);
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Background: Failed to leave session from popup:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
  bidirectional: true
};

// Video Controls for Popup
export const videoControlFromPopup: Handler = {
  event: 'video-control-popup',
  origin: 'popup',
  handler: async (message, sender, sendResponse) => {
    try {
      const { action, currentTime, targetTime } = message.payload;
      const sessionStorage = SessionStorageManager.getInstance();
      const sessionState = await sessionStorage.getSessionState();
      
      if (!sessionState.isActive || !sessionState.sessionId) {
        sendResponse({ success: false, error: 'No active session' });
        return;
      }

      const socketManager = SocketManager.getInstance();
      
      switch (action) {
        case 'play':
          socketManager.sendVideoPlay(sessionState.sessionId, currentTime || 0);
          break;
        case 'pause':
          socketManager.sendVideoPause(sessionState.sessionId, currentTime || 0);
          break;
        case 'seek':
          socketManager.sendVideoSeek(sessionState.sessionId, currentTime || 0, targetTime || 0);
          break;
        default:
          sendResponse({ success: false, error: 'Invalid action' });
          return;
      }
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Background: Failed to control video from popup:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
  bidirectional: true
};
