import { Handler } from '@shared/types';

export const seek: Handler = {
  event: 'seek',
  origin: 'content',
  bidirectional: false,
  handler: (payload: unknown) => {
    console.log('seek', payload);
    return true;
  },
};
