import {createApp} from '@genkit-ai/next';
import {config} from 'dotenv';
config();
import '@/ai/dev';

export const {GET, POST} = createApp({
  auth: async (auth) => {
    // Return a non-empty object to authorize requests to this endpoint.
    // Production applications should implement their own authorization logic.
    return {};
  },
  allowCors: true,
});
