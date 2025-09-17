import { BackgroundBaseMessage } from '@background/base-response';
import {
  ASSISTE_COMIGO_PLATFORMS,
  ASSISTE_COMIGO_PLATFORMS_SELECTOR,
} from '@background/platforms';
import reloadContentScript from '@background/reload-content-script';
import { Dispatcher } from '@shared/dispatcher';
import { SessionStorage } from '@shared/storage';
import { Handler } from '@shared/types';
import { AssisteComigoMessage } from '@shared/types/message.type';

const dispatcher = Dispatcher.getInstance();

export const getState: Handler = {
  event: 'get-state',
  origin: 'popup',
  bidirectional: true,
  handler: async (payload: unknown): Promise<any> => {
    await reloadContentScript();
    try {
      const platform = await checkPlatformCompatibility();
      if (!platform) return new BackgroundBaseMessage('unsupported-platform');

      const activeSession = await SessionStorage.get<string>('activeSession');
      if (activeSession)
        return new BackgroundBaseMessage('session-active', { platform });

      const activeTabState = await dispatcher.sendMessage(
        new BackgroundBaseMessage('watching', { platform }),
        true,
      );

      const watching = activeTabState?.watching;
      if (!watching) return new BackgroundBaseMessage('not-ready');

      return new BackgroundBaseMessage('ready', { platform });
    } catch (error) {
      console.error(error);
      return new BackgroundBaseMessage('unknown-error', error);
    }
  },
};

async function checkPlatformCompatibility(): Promise<string | null> {
  try {
    const activeTabResponse = await dispatcher.sendMessage({
      type: 'get-hostname',
      source: 'background',
    });

    const hostname = activeTabResponse?.hostname;

    if (!hostname) return null;

    const platform = ASSISTE_COMIGO_PLATFORMS.find((platform) =>
      hostname.includes(platform),
    );

    if (!platform) return null;

    return platform;
  } catch (error) {
    // let errorMessage: string;
    // if (error instanceof Error) {
    //   errorMessage = error.message;
    // } else {
    //   errorMessage = String(error);
    // }
    // console.log(errorMessage);
    // if (
    //   errorMessage ===
    //   'Could not establish connection. Receiving end does not exist.'
    // ) {
    //   return null;
    // }
    return null;
  }
}
