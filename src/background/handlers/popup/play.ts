import { Dispatcher } from '@shared/dispatcher';
import { Handler } from '@shared/types';

const dispatcher = Dispatcher.getInstance();

export const play: Handler = {
  event: 'play',
  origin: 'popup',
  bidirectional: false,
  handler: (payload: unknown) => {
    dispatcher.sendMessageToActiveTab({
      type: 'play',
      payload,
      source: 'background',
    });
    return true;
  },
};
