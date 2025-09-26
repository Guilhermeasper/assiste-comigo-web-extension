import { SessionStorageManager } from '@shared/session-storage-manager';
import { VideoInfo } from '@shared/types/session.types';
import { io, Socket } from 'socket.io-client';

export interface SocketEventData {
  sessionId?: string;
  videoInfo?: VideoInfo;
  timestamp?: number;
  participantId?: string;
  [key: string]: any;
}

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private sessionStorage: SessionStorageManager;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: number | null = null;
  private connectionState: 'disconnected' | 'connecting' | 'connected' =
    'disconnected';
  private messageQueue: Array<{ event: string; data: any; timeout: number }> =
    [];

  private constructor() {
    this.sessionStorage = SessionStorageManager.getInstance();
    this.connect();
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private connect(): void {
    if (
      this.connectionState === 'connecting' ||
      this.connectionState === 'connected'
    ) {
      return;
    }

    this.connectionState = 'connecting';

    try {
      this.socket = io('http://localhost:3000', {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 5000,
      });

      this.initializeHandlers();
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      this.connectionState = 'disconnected';
      this.scheduleReconnect();
    }
  }

  private initializeHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('SocketManager: Connected to server');
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.clearReconnectTimer();
      this.processMessageQueue();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('SocketManager: Disconnected from server:', reason);
      this.connectionState = 'disconnected';

      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('SocketManager: Connection error:', error);
      this.connectionState = 'disconnected';
      this.scheduleReconnect();
    });

    this.socket.on('error', (error: any) => {
      console.error('SocketManager: Socket error:', error);
    });

    // Session management events
    this.socket.on('session-created', this.handleSessionCreated.bind(this));
    this.socket.on('session-joined', this.handleSessionJoined.bind(this));
    this.socket.on('user-joined', this.handleUserJoined.bind(this));
    this.socket.on('user-left', this.handleUserLeft.bind(this));
    this.socket.on('session-ended', this.handleSessionEnded.bind(this));

    // Video sync events
    this.socket.on('sync-play', this.handleSyncPlay.bind(this));
    this.socket.on('sync-pause', this.handleSyncPause.bind(this));
    this.socket.on('sync-seek', this.handleSyncSeek.bind(this));
    this.socket.on('sync-buffering', this.handleSyncBuffering.bind(this));
  }

  private scheduleReconnect(): void {
    if (
      this.reconnectTimer ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;

    console.log(
      `SocketManager: Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`,
    );

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private processMessageQueue(): void {
    const now = Date.now();
    const validMessages = this.messageQueue.filter((msg) => msg.timeout > now);

    validMessages.forEach(({ event, data }) => {
      this.sendMessageNow(event, data);
    });

    this.messageQueue = [];
  }

  public sendMessage(
    event: string,
    data: SocketEventData = {},
    timeout: number = 10000,
  ): void {
    const messageData = {
      ...data,
      timestamp: Date.now(),
    };

    this.sendMessageNow(event, messageData);
  }

  private sendMessageNow(event: string, data: any): void {
    this.socket?.emit(event, data);
  }

  public onMessage(event: string, handler: (data: any) => void): void {
    this.socket?.on(event, handler);
  }

  public offMessage(event: string, handler?: (data: any) => void): void {
    if (handler) {
      this.socket?.off(event, handler);
    } else {
      this.socket?.off(event);
    }
  }

  // Session management methods
  public async createSession(videoInfo: VideoInfo): Promise<string> {
    this.sendMessage('create-session', { videoInfo });
    return 'TEMP-SESSION-ID'; // Temporário para teste
  }

  public async joinSession(sessionId: string): Promise<any> {
    this.sendMessage('join-session', { sessionId });
    return { success: true }; // Temporário para teste
  }

  public leaveSession(sessionId: string): void {
    this.sendMessage('leave-session', { sessionId });
  }

  // Video control methods
  public sendVideoPlay(sessionId: string, currentTime: number): void {
    this.sendMessage('video-play', { sessionId, currentTime });
  }

  public sendVideoPause(sessionId: string, currentTime: number): void {
    this.sendMessage('video-pause', { sessionId, currentTime });
  }

  public sendVideoSeek(
    sessionId: string,
    currentTime: number,
    targetTime: number,
  ): void {
    this.sendMessage('video-seek', { sessionId, currentTime, targetTime });
  }

  public sendVideoBuffering(sessionId: string, currentTime: number): void {
    this.sendMessage('video-buffering', { sessionId, currentTime });
  }

  public sendVideoReady(sessionId: string, currentTime: number): void {
    this.sendMessage('video-ready', { sessionId, currentTime });
  }

  // Event handlers
  private async handleSessionCreated(data: any): void {
    console.log('SocketManager: Session created:', data);
    if (data.success && data.sessionId && data.videoInfo) {
      await this.sessionStorage.setSessionActive(
        data.sessionId,
        true,
        data.videoInfo,
      );
    }
  }

  private async handleSessionJoined(data: any): void {
    console.log('SocketManager: Session joined:', data);
    if (data.success && data.sessionId && data.videoInfo) {
      await this.sessionStorage.setSessionActive(
        data.sessionId,
        false,
        data.videoInfo,
      );
      if (data.participantCount) {
        await this.sessionStorage.updateParticipantCount(data.participantCount);
      }
    }
  }

  private async handleUserJoined(data: any): void {
    console.log('SocketManager: User joined:', data);
    if (data.participantCount) {
      await this.sessionStorage.updateParticipantCount(data.participantCount);
    }

    // Notify content script
    this.notifyContentScript('user-joined', data);
  }

  private async handleUserLeft(data: any): void {
    console.log('SocketManager: User left:', data);
    if (data.participantCount) {
      await this.sessionStorage.updateParticipantCount(data.participantCount);
    }

    // Notify content script
    this.notifyContentScript('user-left', data);
  }

  private async handleSessionEnded(data: any): void {
    console.log('SocketManager: Session ended:', data);
    await this.sessionStorage.setSessionInactive();

    // Notify content script
    this.notifyContentScript('session-ended', data);
  }

  private handleSyncPlay(data: any): void {
    console.log('SocketManager: Sync play:', data);
    this.notifyContentScript('sync-play', data);
  }

  private handleSyncPause(data: any): void {
    console.log('SocketManager: Sync pause:', data);
    this.notifyContentScript('sync-pause', data);
  }

  private handleSyncSeek(data: any): void {
    console.log('SocketManager: Sync seek:', data);
    this.notifyContentScript('sync-seek', data);
  }

  private handleSyncBuffering(data: any): void {
    console.log('SocketManager: Sync buffering:', data);
    this.notifyContentScript('sync-buffering', data);
  }

  private notifyContentScript(event: string, data: any): void {
    // Notify all tabs with content scripts
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs
            .sendMessage(tab.id, {
              type: event,
              payload: data,
              source: 'background',
            })
            .catch(() => {
              // Ignore errors for tabs without content scripts
            });
        }
      });
    });
  }

  public isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  public getConnectionState(): string {
    return this.connectionState;
  }

  public cleanup(): void {
    this.clearReconnectTimer();
    this.messageQueue = [];

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.connectionState = 'disconnected';
  }
}

export default SocketManager;
