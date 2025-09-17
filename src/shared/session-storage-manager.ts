import { SessionState, VideoInfo, STORAGE_KEYS } from '@shared/types/session.types';
import { SessionStorage } from '@shared/storage';

export class SessionStorageManager {
  private static instance: SessionStorageManager;
  private listeners: Set<(state: SessionState) => void> = new Set();

  private constructor() {
    this.setupStorageListener();
  }

  static getInstance(): SessionStorageManager {
    if (!SessionStorageManager.instance) {
      SessionStorageManager.instance = new SessionStorageManager();
    }
    return SessionStorageManager.instance;
  }

  async getSessionState(): Promise<SessionState> {
    const state = await SessionStorage.get<SessionState>(STORAGE_KEYS.SESSION_STATE);
    return state || this.getDefaultSessionState();
  }

  async updateSessionState(updates: Partial<SessionState>): Promise<void> {
    const currentState = await this.getSessionState();
    const newState = { ...currentState, ...updates };
    
    await SessionStorage.set(STORAGE_KEYS.SESSION_STATE, newState);
    this.notifyListeners(newState);
  }

  async setSessionActive(sessionId: string, isCreator: boolean, videoInfo: VideoInfo): Promise<void> {
    const state: SessionState = {
      isActive: true,
      sessionId,
      isCreator,
      participantCount: 1,
      videoInfo,
      createdAt: Date.now()
    };
    
    await SessionStorage.set(STORAGE_KEYS.SESSION_STATE, state);
    await SessionStorage.set(STORAGE_KEYS.SESSION_ID, sessionId);
    await SessionStorage.set(STORAGE_KEYS.VIDEO_INFO, videoInfo);
    
    this.notifyListeners(state);
  }

  async setSessionInactive(): Promise<void> {
    const state = this.getDefaultSessionState();
    
    await SessionStorage.set(STORAGE_KEYS.SESSION_STATE, state);
    await SessionStorage.remove(STORAGE_KEYS.SESSION_ID);
    await SessionStorage.remove(STORAGE_KEYS.VIDEO_INFO);
    
    this.notifyListeners(state);
  }

  async updateParticipantCount(count: number): Promise<void> {
    await this.updateSessionState({ participantCount: count });
  }

  async updateVideoInfo(videoInfo: VideoInfo): Promise<void> {
    await this.updateSessionState({ videoInfo });
    await SessionStorage.set(STORAGE_KEYS.VIDEO_INFO, videoInfo);
  }

  async getCurrentSessionId(): Promise<string | null> {
    return await SessionStorage.get<string>(STORAGE_KEYS.SESSION_ID);
  }

  async getCurrentVideoInfo(): Promise<VideoInfo | null> {
    return await SessionStorage.get<VideoInfo>(STORAGE_KEYS.VIDEO_INFO);
  }

  async generateUserId(): Promise<string> {
    let userId = await SessionStorage.get<string>(STORAGE_KEYS.USER_ID);
    
    if (!userId) {
      userId = this.generateRandomId(16);
      await SessionStorage.set(STORAGE_KEYS.USER_ID, userId);
    }
    
    return userId;
  }

  addStateListener(listener: (state: SessionState) => void): void {
    this.listeners.add(listener);
  }

  removeStateListener(listener: (state: SessionState) => void): void {
    this.listeners.delete(listener);
  }

  private getDefaultSessionState(): SessionState {
    return {
      isActive: false,
      sessionId: null,
      isCreator: false,
      participantCount: 0,
      videoInfo: null,
      createdAt: 0
    };
  }

  private notifyListeners(state: SessionState): void {
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error notifying session state listener:', error);
      }
    });
  }

  private setupStorageListener(): void {
    // Listen for storage changes from other scripts
    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'session' && changes[STORAGE_KEYS.SESSION_STATE]) {
          const newState = changes[STORAGE_KEYS.SESSION_STATE].newValue;
          if (newState) {
            try {
              const parsedState = typeof newState === 'string' ? JSON.parse(newState) : newState;
              this.notifyListeners(parsedState);
            } catch (error) {
              console.error('Error parsing session state from storage:', error);
            }
          }
        }
      });
    }
  }

  private generateRandomId(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    
    return result;
  }

  async cleanup(): Promise<void> {
    await this.setSessionInactive();
    this.listeners.clear();
  }
}
