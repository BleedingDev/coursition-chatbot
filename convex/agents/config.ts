import type { Config } from '@convex-dev/agent';
import { rawRequestResponseHandler } from '../debugging/rawRequestResponseHandler';
import { languageModel, textEmbeddingModel } from '../modelsForDemo';
import { usageHandler } from '../usage_tracking/usageHandler';

export const defaultConfig = {
  languageModel,
  rawRequestResponseHandler,
  usageHandler,
  callSettings: {
    temperature: 1.0,
  },
  // If you want to use vector search, you need to set this.
  textEmbeddingModel,
} satisfies Config;
