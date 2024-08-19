import { useEffect, useState } from 'react';
import './app.scss';
import { Dispatcher } from '@shared/dispatcher';
import { useNavigate } from 'react-router-dom';
import { AssisteComigoMessage } from '@shared/types/message.type';

function Start() {
  const navigate = useNavigate();

  const dispatcher = Dispatcher.getInstance();

  function getStateHandler(
    response: AssisteComigoMessage<{ platform?: string; player?: boolean }>,
  ) {
    console.log('Response:', response);
    const type = response?.type;
    if (type === 'ready') {
      navigate('/create', {
        state: { platform: response.payload?.platform },
      });
    } else if (type == 'not-ready') {
      navigate('/error', {
        state: { reason: 'Abra um vídeo para começar uma sessão' },
      });
    } else if (type === 'session-active') {
      navigate('/in-session', {
        state: { platform: response.payload?.platform },
      });
    } else if (type == 'unsupported-platform') {
      navigate('/error', {
        state: { reason: 'Plataforma não suportada' },
      });
    } else {
      navigate('/error', {
        state: { reason: 'Erro desconhecido' },
      });
    }
  }

  function sendMessage() {
    try {
      dispatcher.sendMessage(
        { type: 'get-state', source: 'popup' },
        getStateHandler,
      );
    } catch (error) {
      navigate('/error', {
        state: { reason: 'Não foi possível se conectar com o service Worker' },
      });
    }
  }

  useEffect(() => {
    sendMessage();
  }, []);

  return (
    <div className="ac-home">
      <h1>Assiste Comigo</h1>
    </div>
  );
}

export default Start;
