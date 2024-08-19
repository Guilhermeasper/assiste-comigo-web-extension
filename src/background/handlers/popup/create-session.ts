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
      dispatcher.sendMessageToActiveTab({
        type: 'play',
        payload: null,
        source: 'background',
      });
    });

    SocketManager.getInstance().onMessage('pause', () => {
      dispatcher.sendMessageToActiveTab({
        type: 'pause',
        payload: null,
        source: 'background',
      });
    });

    const createSessionResponse = dispatcher.sendMessageToActiveTab({
      type: 'create-session',
      payload: { platform: (payload as any)?.platform },
      source: 'background',
    });

    return createSessionResponse;
  },
};
