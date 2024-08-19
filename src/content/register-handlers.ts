import { Dispatcher } from '@shared/dispatcher';
import { Handler } from '@shared/types';
import * as handlers from '@content/handlers';

const dispatcher = Dispatcher.getInstance();

export function registerHandlers() {
  Array.from(Object.values(handlers)).forEach((handler: Handler) => {
    dispatcher.register(
      handler.event,
      handler.origin,
      handler.handler,
      handler.bidirectional,
    );
  });
}
