import React, { useState } from 'react';
import { VideoElement } from '@content/types/video-element.types';

interface SessionCreatorProps {
  videoElement: VideoElement;
  onCreateSession: (videoElement: VideoElement) => void;
  onJoinSession: (sessionId: string) => void;
}

export const SessionCreator: React.FC<SessionCreatorProps> = ({
  videoElement,
  onCreateSession,
  onJoinSession
}) => {
  const [mode, setMode] = useState<'main' | 'join'>('main');
  const [sessionId, setSessionId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      await onCreateSession(videoElement);
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = () => {
    if (sessionId.trim() && sessionId.length === 8) {
      onJoinSession(sessionId.trim().toUpperCase());
    }
  };

  const handleSessionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 8) {
      setSessionId(value);
    }
  };

  if (mode === 'join') {
    return (
      <div className="ac-session-creator">
        <h3>Entrar na Sessão</h3>
        <div className="ac-input-group">
          <input
            type="text"
            value={sessionId}
            onChange={handleSessionIdChange}
            placeholder="ID DA SESSÃO"
            maxLength={8}
            className="ac-session-input"
          />
          <button
            onClick={handleJoinSession}
            disabled={sessionId.length !== 8}
            className="ac-button ac-button-primary"
          >
            Entrar
          </button>
        </div>
        <button
          onClick={() => setMode('main')}
          className="ac-button ac-button-secondary"
        >
          Voltar
        </button>
        <div className="ac-video-info">
          <span className="ac-platform">{videoElement.platform}</span>
          <span className="ac-title">{videoElement.metadata.title}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ac-session-creator">
      <h3>Assiste Comigo</h3>
      <div className="ac-actions">
        <button
          onClick={handleCreateSession}
          disabled={isCreating}
          className="ac-button ac-button-primary"
        >
          {isCreating ? 'Criando...' : 'Criar Sessão'}
        </button>
        <button
          onClick={() => setMode('join')}
          className="ac-button ac-button-secondary"
        >
          Entrar na Sessão
        </button>
      </div>
      <div className="ac-video-info">
        <span className="ac-platform">{videoElement.platform}</span>
        <span className="ac-title">{videoElement.metadata.title}</span>
      </div>
    </div>
  );
};
