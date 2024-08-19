import { Origin } from './types';
import { AssisteComigoMessage } from './types/message.type';

type MessageHandler = (payload: unknown) => unknown | Promise<unknown>;

interface Registration {
  handler: MessageHandler;
  bidirectional: boolean;
}

export class Dispatcher {
  public registry: Map<string, Map<string, Registration>> = new Map();

  constructor() {
    chrome.runtime.onMessage.addListener(this._messageHandler.bind(this));
  }

  static instance: Dispatcher;
  static getInstance(): Dispatcher {
    if (!Dispatcher.instance) {
      Dispatcher.instance = new Dispatcher();
    }
    return Dispatcher.instance;
  }

  register(
    type: string,
    source: Origin,
    handler: MessageHandler,
    bidirectional: boolean = false,
  ) {
    console.log(`Registering handler for ${type} from ${source}`);
    if (!this.registry.has(type)) {
      this.registry.set(type, new Map());
    }

    const typeRegistry = this.registry.get(type)!;
    typeRegistry.set(source, { handler, bidirectional });
  }

  sendMessage<T>(
    message: AssisteComigoMessage<T>,
    callback: (response: AssisteComigoMessage<T>) => void,
  ) {
    try {
      chrome.runtime.sendMessage(message, callback);
    } catch (error) {
      console.error('Error occurred while sending message:', error);
    }
  }

  private _messageHandler(
    message: AssisteComigoMessage<unknown>,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ): void | true {
    console.log('Received from:', sender);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Receiving ${message.type} message from ${message.source}`);
      console.debug('Message payload:', message.payload);
    }
    const { type, payload, source } = message;
    const typeRegistry = this.registry.get(type);

    if (typeRegistry) {
      const registration = typeRegistry.get(source);
      if (registration) {
        const result = registration.handler(payload);

        if (registration.bidirectional) {
          if (result instanceof Promise) {
            result
              .then((response) => sendResponse(response))
              .catch((error) => sendResponse({ error }));
            return true; // Keeps the message channel open for async responses
          } else {
            sendResponse(result);
            return;
          }
        } else {
          sendResponse(result);
          return;
        }
      } else {
        sendResponse({
          error: `No handler registered for ${type} from ${source}`,
        });
        return;
      }
    } else {
      sendResponse({
        error: `No ${type} type registered for ${source}`,
      });
      return;
    }
  }

  async sendMessageToActiveTab<T>(message: AssisteComigoMessage<T>) {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    const response = await chrome.tabs.sendMessage(tab?.id as number, message);
    return response;
  }
}
