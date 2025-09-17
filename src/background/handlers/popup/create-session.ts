import SocketManager from '@background/socket-manager';
import { Dispatcher } from '@shared/dispatcher';
import { SessionStorage } from '@shared/storage';
import { Handler } from '@shared/types';

const dispatcher = Dispatcher.getInstance();

export const createSession: Handler = {
  event: 'create-session',
  origin: 'popup',
  bidirectional: true,
  handler: (payload: unknown) => {
    SessionStorage.set('activeSession', 'true');
    SocketManager.getInstance().onMessage('play', () => {
      dispatcher.sendMessage(
        {
          type: 'play',
          payload: null,
          source: 'background',
        },
        true,
      );
    });

    SocketManager.getInstance().onMessage('pause', () => {
      dispatcher.sendMessage(
        {
          type: 'pause',
          payload: null,
          source: 'background',
        },
        true,
      );
    });

    const createSessionResponse = dispatcher.sendMessage(
      {
        type: 'create-session',
        payload: { platform: (payload as any)?.platform },
        source: 'background',
      },
      true,
    );

    return createSessionResponse;
  },
};
