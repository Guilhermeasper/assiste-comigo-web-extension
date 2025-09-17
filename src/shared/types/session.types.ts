export interface SessionState {
  isActive: boolean;
  sessionId: string | null;
  isCreator: boolean;
  participantCount: number;
  videoInfo: VideoInfo | null;
  createdAt: number;
}

export interface VideoInfo {
  title: string;
  url: string;
  platform: string;
  duration: number;
  currentTime: number;
  paused: boolean;
}

export interface SessionSettings {
  sessionId: string;
  videoInfo: VideoInfo;
  isCreator: boolean;
}

export interface ParticipantInfo {
  id: string;
  joinedAt: number;
}

export interface SessionEvent {
  type: 'play' | 'pause' | 'seek' | 'buffering' | 'ready';
  timestamp: number;
  data?: any;
  participantId?: string;
}

export const STORAGE_KEYS = {
  SESSION_STATE: 'current-session-state',
  SESSION_ID: 'current-session-id',
  VIDEO_INFO: 'current-video-info',
  USER_ID: 'user-id'
} as const;
