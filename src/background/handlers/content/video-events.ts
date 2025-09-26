import SocketManager from '@background/socket-manager';
import { SessionStorageManager } from '@shared/session-storage-manager';
import { Handler } from '@shared/types';

// Video Play Handler
export const videoPlay: Handler = {
  event: 'video-play',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    const { currentTime } = message.payload || message;
    const sessionStorage = SessionStorageManager.getInstance();
    const sessionState = await sessionStorage.getSessionState();
    const socketManager = SocketManager.getInstance();

    socketManager.sendVideoPlay(sessionState.sessionId, currentTime || 0);
    console.log('Background: Sent video play event to server');
  },
  bidirectional: false,
};

// Video Pause Handler
export const videoPause: Handler = {
  event: 'video-pause',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    const { currentTime } = message.payload || message;
    const sessionStorage = SessionStorageManager.getInstance();
    const sessionState = await sessionStorage.getSessionState();
    const socketManager = SocketManager.getInstance();

    socketManager.sendVideoPause(sessionState.sessionId, currentTime || 0);
    console.log('Background: Sent video pause event to server');
  },
  bidirectional: false,
};

// Video Seek Handler
export const videoSeek: Handler = {
  event: 'video-seek',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    const { currentTime, targetTime } = message.payload || message;
    const sessionStorage = SessionStorageManager.getInstance();
    const sessionState = await sessionStorage.getSessionState();
    const socketManager = SocketManager.getInstance();

    socketManager.sendVideoSeek(
      sessionState.sessionId,
      currentTime || 0,
      targetTime || 0,
    );
    console.log('Background: Sent video seek event to server');
  },
  bidirectional: false,
};

// Video Buffering Handler
export const videoBuffering: Handler = {
  event: 'video-buffering',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    const { currentTime } = message.payload || message;
    const sessionStorage = SessionStorageManager.getInstance();
    const sessionState = await sessionStorage.getSessionState();
    const socketManager = SocketManager.getInstance();

    socketManager.sendVideoBuffering(sessionState.sessionId, currentTime || 0);
    console.log('Background: Sent video buffering event to server');
  },
  bidirectional: false,
};

// Video Ready Handler
export const videoReady: Handler = {
  event: 'video-ready',
  origin: 'content',
  handler: async (message, sender, sendResponse) => {
    const { currentTime } = message.payload || message;
    const sessionStorage = SessionStorageManager.getInstance();
    const sessionState = await sessionStorage.getSessionState();
    const socketManager = SocketManager.getInstance();

    socketManager.sendVideoReady(sessionState.sessionId, currentTime || 0);
    console.log('Background: Sent video ready event to server');
  },
  bidirectional: false,
};
