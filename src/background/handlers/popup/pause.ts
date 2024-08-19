import { Dispatcher } from '@shared/dispatcher';
import { Handler } from '@shared/types';

const dispatcher = Dispatcher.getInstance();

export const pause: Handler = {
  event: 'pause',
  origin: 'popup',
  bidirectional: false,
  handler: (payload: unknown) => {
    dispatcher.sendMessageToActiveTab({
      type: 'pause',
      payload,
      source: 'background',
    });
    return true;
  },
};
