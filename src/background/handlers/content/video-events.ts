import { Handler } from '@shared/types';
import SocketManager from '@background/socket-manager';
import { SessionStorageManager } from '@shared/session-storage-manager';

// Video Play Handler
export const videoPlay: Handler = {
  event: 'video-play',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    try {
      const { currentTime } = message.payload;
      const sessionStorage = SessionStorageManager.getInstance();
      const sessionState = await sessionStorage.getSessionState();
      
      if (!sessionState.isActive || !sessionState.sessionId) {
        sendResponse({ success: false, error: 'No active session' });
        return;
      }

      const socketManager = SocketManager.getInstance();
      socketManager.sendVideoPlay(sessionState.sessionId, currentTime || 0);
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Background: Failed to send video play:', error);
      sendResponse({ success: false, error: 'Failed to send video play event' });
    }
  },
  bidirectional: true
};

// Video Pause Handler
export const videoPause: Handler = {
  event: 'video-pause',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    try {
      const { currentTime } = message.payload;
      const sessionStorage = SessionStorageManager.getInstance();
      const sessionState = await sessionStorage.getSessionState();
      
      if (!sessionState.isActive || !sessionState.sessionId) {
        sendResponse({ success: false, error: 'No active session' });
        return;
      }

      const socketManager = SocketManager.getInstance();
      socketManager.sendVideoPause(sessionState.sessionId, currentTime || 0);
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Background: Failed to send video pause:', error);
      sendResponse({ success: false, error: 'Failed to send video pause event' });
    }
  },
  bidirectional: true
};

// Video Seek Handler
export const videoSeek: Handler = {
  event: 'video-seek',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    try {
      const { currentTime, targetTime } = message.payload;
      const sessionStorage = SessionStorageManager.getInstance();
      const sessionState = await sessionStorage.getSessionState();
      
      if (!sessionState.isActive || !sessionState.sessionId) {
        sendResponse({ success: false, error: 'No active session' });
        return;
      }

      const socketManager = SocketManager.getInstance();
      socketManager.sendVideoSeek(sessionState.sessionId, currentTime || 0, targetTime || 0);
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Background: Failed to send video seek:', error);
      sendResponse({ success: false, error: 'Failed to send video seek event' });
    }
  },
  bidirectional: true
};

// Video Buffering Handler
export const videoBuffering: Handler = {
  event: 'video-buffering',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    try {
      const { currentTime } = message.payload;
      const sessionStorage = SessionStorageManager.getInstance();
      const sessionState = await sessionStorage.getSessionState();
      
      if (!sessionState.isActive || !sessionState.sessionId) {
        sendResponse({ success: false, error: 'No active session' });
        return;
      }

      const socketManager = SocketManager.getInstance();
      socketManager.sendVideoBuffering(sessionState.sessionId, currentTime || 0);
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Background: Failed to send video buffering:', error);
      sendResponse({ success: false, error: 'Failed to send video buffering event' });
    }
  },
  bidirectional: true
};

// Video Ready Handler
export const videoReady: Handler = {
  event: 'video-ready',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    try {
      const { currentTime } = message.payload;
      const sessionStorage = SessionStorageManager.getInstance();
      const sessionState = await sessionStorage.getSessionState();
      
      if (!sessionState.isActive || !sessionState.sessionId) {
        sendResponse({ success: false, error: 'No active session' });
        return;
      }

      const socketManager = SocketManager.getInstance();
      socketManager.sendVideoReady(sessionState.sessionId, currentTime || 0);
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Background: Failed to send video ready:', error);
      sendResponse({ success: false, error: 'Failed to send video ready event' });
    }
  },
  bidirectional: true
};
