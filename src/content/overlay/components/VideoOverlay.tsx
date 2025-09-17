import React from 'react';
import { OverlayProps } from '@content/overlay/types/overlay.types';
import { SessionCreator } from './SessionCreator';
import { SessionInfo } from './SessionInfo';

export const VideoOverlay: React.FC<OverlayProps> = ({
  videoElement,
  onCreateSession,
  onJoinSession,
  isSessionActive,
  sessionInfo
}) => {
  const handleLeaveSession = () => {
    // This will be implemented when we add the session manager
    console.log('Leave session requested');
  };

  return (
    <div className="ac-video-overlay">
      {isSessionActive && sessionInfo ? (
        <SessionInfo 
          sessionInfo={sessionInfo}
          onLeaveSession={handleLeaveSession}
        />
      ) : (
        <SessionCreator
          videoElement={videoElement}
          onCreateSession={onCreateSession}
          onJoinSession={onJoinSession}
        />
      )}
    </div>
  );
};
