import React from 'react';
import { useSessionState } from '@ui/hooks/useSessionState';
import { SessionStatus } from './SessionStatus';
import { SessionControls } from './SessionControls';
import { CreateJoinSession } from './CreateJoinSession';
import { NotificationList } from './NotificationList';

export const MainPopup: React.FC = () => {
  const {
    sessionState,
    connectionState,
    isConnected,
    isLoading,
    notifications,
    createSession,
    joinSession,
    leaveSession,
    videoControl,
    removeNotification
  } = useSessionState();

  if (!sessionState) {
    return (
      <div className="main-popup loading">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="main-popup">
      <header className="popup-header">
        <h1>Assiste Comigo</h1>
      </header>

      <main className="popup-content">
        <SessionStatus
          sessionState={sessionState}
          connectionState={connectionState}
          isConnected={isConnected}
        />

        {sessionState.isActive ? (
          <SessionControls
            sessionState={sessionState}
            onLeaveSession={leaveSession}
            onVideoControl={videoControl}
          />
        ) : (
          <CreateJoinSession
            onCreateSession={createSession}
            onJoinSession={joinSession}
            isConnected={isConnected}
            isLoading={isLoading}
          />
        )}
      </main>

      <NotificationList
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />
    </div>
  );
};
