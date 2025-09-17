import React from 'react';
import { SessionState } from '@shared/types/session.types';

interface SessionStatusProps {
  sessionState: SessionState;
  connectionState: string;
  isConnected: boolean;
}

export const SessionStatus: React.FC<SessionStatusProps> = ({
  sessionState,
  connectionState,
  isConnected
}) => {
  const getConnectionStatusColor = () => {
    if (isConnected) return '#28a745';
    if (connectionState === 'connecting') return '#ffc107';
    return '#dc3545';
  };

  const getConnectionStatusText = () => {
    if (isConnected) return 'Conectado';
    if (connectionState === 'connecting') return 'Conectando...';
    return 'Desconectado';
  };

  return (
    <div className="session-status">
      <div className="connection-status">
        <div 
          className="status-indicator"
          style={{ backgroundColor: getConnectionStatusColor() }}
        />
        <span>{getConnectionStatusText()}</span>
      </div>
      
      {sessionState.isActive && (
        <div className="session-info">
          <div className="session-id">
            <strong>Sessão: {sessionState.sessionId}</strong>
          </div>
          <div className="session-details">
            <span>{sessionState.participantCount} participante(s)</span>
            {sessionState.isCreator && (
              <span className="creator-badge">Criador</span>
            )}
          </div>
          {sessionState.videoInfo && (
            <div className="video-info">
              <div className="platform">{sessionState.videoInfo.platform}</div>
              <div className="title">{sessionState.videoInfo.title}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
