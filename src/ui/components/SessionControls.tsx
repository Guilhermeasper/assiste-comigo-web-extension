import React, { useState, useEffect } from 'react';
import { SessionState } from '@shared/types/session.types';

interface SessionControlsProps {
  sessionState: SessionState;
  onLeaveSession: () => void;
  onVideoControl: (action: string, data?: any) => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  sessionState,
  onLeaveSession,
  onVideoControl
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (sessionState.videoInfo) {
      setDuration(sessionState.videoInfo.duration);
      setCurrentTime(sessionState.videoInfo.currentTime);
      setIsPlaying(!sessionState.videoInfo.paused);
    }
  }, [sessionState.videoInfo]);

  useEffect(() => {
    let interval: number;
    
    if (isPlaying && sessionState.isActive) {
      interval = window.setInterval(() => {
        setCurrentTime(prev => Math.min(prev + 1, duration));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, sessionState.isActive, duration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    const action = isPlaying ? 'pause' : 'play';
    onVideoControl(action, { currentTime });
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const targetTime = percentage * duration;
    
    setCurrentTime(targetTime);
    onVideoControl('seek', { currentTime, targetTime });
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="session-controls">
      <div className="video-progress">
        <div className="time-info">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="progress-bar" onClick={handleSeek}>
          <div 
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="control-buttons">
        <button
          onClick={handlePlayPause}
          className="control-button play-pause"
          disabled={!sessionState.isActive}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <button
          onClick={onLeaveSession}
          className="control-button leave-session"
        >
          {sessionState.isCreator ? 'Encerrar Sessão' : 'Sair da Sessão'}
        </button>
      </div>
    </div>
  );
};
