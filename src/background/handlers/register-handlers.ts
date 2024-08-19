import { Dispatcher } from '@shared/dispatcher';
import { Handler } from '@shared/types';
import * as contentHandlers from '@background/handlers/content';
import * as popupHandlers from '@background/handlers/popup';

const dispatcher = Dispatcher.getInstance();

export function registerHandlers() {
  [
    ...Array.from(Object.values(contentHandlers)),
    ...Array.from(Object.values(popupHandlers)),
  ].forEach((handler: Handler) => {
    dispatcher.register(
      handler.event,
      handler.origin,
      handler.handler,
      handler.bidirectional,
    );
  });
}
