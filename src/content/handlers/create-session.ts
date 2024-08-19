import { Handler } from '@shared/types';
import * as platforms from '@content/platforms';
import { Dispatcher } from '@shared/dispatcher';
import { AssisteComigoPlayer } from '@content/player';

const dispatcher = Dispatcher.getInstance();

export const createSession: Handler = {
  event: 'create-session',
  origin: 'background',
  bidirectional: true,
  handler: (payload: unknown) => {
    const platformName = (payload as any)?.platform;

    const platform = Array.from(Object.values(platforms)).find(
      (p) => p.name === platformName,
    );

    const player = AssisteComigoPlayer.getInstance(platform);
    player.appendListeners();

    return { created: true };
  },
};
