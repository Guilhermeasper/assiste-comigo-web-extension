import { VideoSyncManager } from '@content/sync/video-sync-manager';
import { VideoElement } from '@content/types/video-element.types';
import { Dispatcher } from '@shared/dispatcher';
import { SessionStorageManager } from '@shared/session-storage-manager';
import { SessionState, VideoInfo } from '@shared/types/session.types';
import { SessionIdGenerator } from '@shared/utils/session-id-generator';

export class SessionManager {
  private static instance: SessionManager;
  private sessionStorage: SessionStorageManager;
  private videoSyncManager: VideoSyncManager;
  private dispatcher: Dispatcher;
  private currentSessionId: string | null = null;
  private isCreator = false;

  private constructor() {
    this.sessionStorage = SessionStorageManager.getInstance();
    this.videoSyncManager = VideoSyncManager.getInstance();
    this.dispatcher = Dispatcher.getInstance();

    this.setupEventListeners();
    this.loadCurrentSession();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async createSession(videoElement: VideoElement): Promise<string> {
    try {
      console.log(
        'SessionManager: Creating session for video:',
        videoElement.metadata.title,
      );

      // Generate unique session ID
      const sessionId = await SessionIdGenerator.generateUniqueId(
        this.checkSessionExists.bind(this),
      );

      // Prepare video info
      const videoInfo: VideoInfo = {
        title: videoElement.metadata.title,
        url: videoElement.metadata.url,
        platform: videoElement.platform,
        duration: videoElement.metadata.duration,
      };

      // Send create session request to background
      const response = await this.sendToBackground('create-session', {
        sessionId,
        videoInfo,
      });

      this.currentSessionId = sessionId;
      this.isCreator = true;

      // Set up video synchronization
      this.videoSyncManager.setCurrentVideo(videoElement);
      this.videoSyncManager.setSessionActive(true);

      console.log('SessionManager: Session created successfully:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('SessionManager: Failed to create session:', error);
      throw error;
    }
  }

  async joinSession(
    sessionId: string,
    videoElement?: VideoElement,
  ): Promise<void> {
    try {
      console.log('SessionManager: Joining session:', sessionId);

      // Validate session ID
      // if (!SessionIdGenerator.validateId(sessionId)) {
      //   throw new Error('Invalid session ID format');
      // }

      // Send join session request to background
      const response = await this.sendToBackground('join-session', {
        sessionId,
      });

      // if (response.success) {
      this.currentSessionId = sessionId;
      this.isCreator = false;

      // Set up video synchronization if we have a video element
      if (videoElement) {
        this.videoSyncManager.setCurrentVideo(videoElement);
      }

      this.videoSyncManager.setSessionActive(true);

      console.log('SessionManager: Session joined successfully:', sessionId);
      // } else {
      //   throw new Error(response.error || 'Failed to join session');
      // }
    } catch (error) {
      console.error('SessionManager: Failed to join session:', error);
      throw error;
    }
  }

  async leaveSession(): Promise<void> {
    try {
      if (!this.currentSessionId) {
        return;
      }

      console.log('SessionManager: Leaving session:', this.currentSessionId);

      // Send leave session request to background
      await this.sendToBackground('leave-session', {
        sessionId: this.currentSessionId,
      });

      await this.cleanup();

      console.log('SessionManager: Left session successfully');
    } catch (error) {
      console.error('SessionManager: Failed to leave session:', error);
    }
  }

  async getCurrentSession(): Promise<SessionState> {
    return await this.sessionStorage.getSessionState();
  }

  isSessionActive(): boolean {
    return this.currentSessionId !== null;
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  isSessionCreator(): boolean {
    return this.isCreator;
  }

  private async checkSessionExists(sessionId: string): Promise<boolean> {
    return false;
    // try {
    //   const response = await this.sendToBackground('check-session', {
    //     sessionId
    //   });
    //   return response.exists || false;
    // } catch (error) {
    //   console.warn('SessionManager: Failed to check session existence:', error);
    //   return false; // Assume it doesn't exist if we can't check
    // }
  }

  private async sendToBackground(event: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.dispatcher.sendMessage(
          {
            type: event,
            payload: data,
            source: 'content',
          },
          false,
        );
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupEventListeners(): void {
    // Listen for session state changes
    this.sessionStorage.addStateListener(
      this.handleSessionStateChange.bind(this),
    );

    // Listen for events from background script
    this.dispatcher.register(
      'session-ended',
      'background',
      this.handleSessionEnded.bind(this),
    );
    this.dispatcher.register(
      'user-joined',
      'background',
      this.handleUserJoined.bind(this),
    );
    this.dispatcher.register(
      'user-left',
      'background',
      this.handleUserLeft.bind(this),
    );
    this.dispatcher.register(
      'creator-promoted',
      'background',
      this.handleCreatorPromoted.bind(this),
    );
  }

  private async loadCurrentSession(): Promise<void> {
    try {
      const sessionState = await this.sessionStorage.getSessionState();

      if (sessionState.isActive && sessionState.sessionId) {
        this.currentSessionId = sessionState.sessionId;
        this.isCreator = sessionState.isCreator;
        this.videoSyncManager.setSessionActive(true);

        console.log(
          'SessionManager: Loaded existing session:',
          this.currentSessionId,
        );
      }
    } catch (error) {
      console.error('SessionManager: Failed to load current session:', error);
    }
  }

  private handleSessionStateChange(state: SessionState): void {
    console.log('SessionManager: Session state changed:', state);

    if (!state.isActive) {
      this.currentSessionId = null;
      this.isCreator = false;
      this.videoSyncManager.setSessionActive(false);
    } else if (state.sessionId) {
      this.currentSessionId = state.sessionId;
      this.isCreator = state.isCreator;
      this.videoSyncManager.setSessionActive(true);
    }
  }

  private handleSessionEnded(data: any): void {
    console.log('SessionManager: Session ended by server:', data);
    this.cleanup();
  }

  private handleUserJoined(data: any): void {
    console.log('SessionManager: User joined session:', data);
    // Could show notification to user
  }

  private handleUserLeft(data: any): void {
    console.log('SessionManager: User left session:', data);
    // Could show notification to user
  }

  private handleCreatorPromoted(data: any): void {
    console.log('SessionManager: Promoted to session creator');
    this.isCreator = true;
  }

  private async cleanup(): Promise<void> {
    this.currentSessionId = null;
    this.isCreator = false;
    this.videoSyncManager.setSessionActive(false);
    this.videoSyncManager.cleanup();

    // Clear session storage
    await this.sessionStorage.setSessionInactive();
  }

  destroy(): void {
    this.cleanup();
    this.videoSyncManager.cleanup();
  }
}
