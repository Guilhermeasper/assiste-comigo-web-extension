import React from 'react';
import { SessionInfo as SessionInfoType } from '@content/overlay/types/overlay.types';

interface SessionInfoProps {
  sessionInfo: SessionInfoType;
  onLeaveSession: () => void;
}

export const SessionInfo: React.FC<SessionInfoProps> = ({
  sessionInfo,
  onLeaveSession
}) => {
  const copySessionId = () => {
    navigator.clipboard.writeText(sessionInfo.id);
    // Could add a toast notification here
  };

  return (
    <div className="ac-session-info">
      <h3>Sessão Ativa</h3>
      
      <div className="ac-session-details">
        <div className="ac-session-id">
          <span>ID: {sessionInfo.id}</span>
          <button 
            onClick={copySessionId}
            className="ac-button-icon"
            title="Copiar ID"
          >
            📋
          </button>
        </div>
        
        <div className="ac-participants">
          <span>{sessionInfo.participantCount} participante(s)</span>
          {sessionInfo.isCreator && <span className="ac-creator-badge">Criador</span>}
        </div>
      </div>

      <div className="ac-video-info">
        <span className="ac-platform">{sessionInfo.platform}</span>
        <span className="ac-title">{sessionInfo.videoTitle}</span>
      </div>

      <div className="ac-actions">
        <button
          onClick={onLeaveSession}
          className="ac-button ac-button-danger"
        >
          {sessionInfo.isCreator ? 'Encerrar Sessão' : 'Sair da Sessão'}
        </button>
      </div>
    </div>
  );
};
