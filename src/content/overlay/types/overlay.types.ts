import { VideoElement } from '@content/types/video-element.types';

export interface OverlayProps {
  videoElement: VideoElement;
  onCreateSession: (videoElement: VideoElement) => void;
  onJoinSession: (sessionId: string) => void;
  isSessionActive: boolean;
  sessionInfo?: SessionInfo;
}

export interface SessionInfo {
  id: string;
  participantCount: number;
  isCreator: boolean;
  videoTitle: string;
  platform: string;
}

export interface OverlayPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}
