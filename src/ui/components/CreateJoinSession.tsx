import React, { useState } from 'react';

interface CreateJoinSessionProps {
  onCreateSession: () => void;
  onJoinSession: (sessionId: string) => void;
  isConnected: boolean;
  isLoading: boolean;
}

export const CreateJoinSession: React.FC<CreateJoinSessionProps> = ({
  onCreateSession,
  onJoinSession,
  isConnected,
  isLoading
}) => {
  const [mode, setMode] = useState<'main' | 'join'>('main');
  const [sessionId, setSessionId] = useState('');

  const handleSessionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 8) {
      setSessionId(value);
    }
  };

  const handleJoinSubmit = () => {
    if (sessionId.length === 8) {
      onJoinSession(sessionId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && sessionId.length === 8) {
      handleJoinSubmit();
    }
  };

  if (mode === 'join') {
    return (
      <div className="create-join-session">
        <h3>Entrar na Sessão</h3>
        
        <div className="join-form">
          <input
            type="text"
            value={sessionId}
            onChange={handleSessionIdChange}
            onKeyPress={handleKeyPress}
            placeholder="ID DA SESSÃO"
            maxLength={8}
            className="session-input"
            disabled={isLoading}
          />
          
          <div className="form-buttons">
            <button
              onClick={handleJoinSubmit}
              disabled={sessionId.length !== 8 || !isConnected || isLoading}
              className="primary-button"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
            
            <button
              onClick={() => {
                setMode('main');
                setSessionId('');
              }}
              className="secondary-button"
              disabled={isLoading}
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-join-session">
      <h3>Assiste Comigo</h3>
      
      <div className="main-actions">
        <button
          onClick={onCreateSession}
          disabled={!isConnected || isLoading}
          className="primary-button"
        >
          {isLoading ? 'Criando...' : 'Criar Sessão'}
        </button>
        
        <button
          onClick={() => setMode('join')}
          disabled={!isConnected || isLoading}
          className="secondary-button"
        >
          Entrar na Sessão
        </button>
      </div>

      {!isConnected && (
        <div className="connection-warning">
          Conectando ao servidor...
        </div>
      )}
    </div>
  );
};
