// See the docs at https://docs.convex.dev/agents/debugging
import type { RawRequestResponseHandler } from '@convex-dev/agent';

// biome-ignore lint/suspicious/useAwait: Interface requires async
export const rawRequestResponseHandler: RawRequestResponseHandler = async (
  _ctx,
  { request, response, agentName, threadId, userId }
) => {
  // Logging it here, to look up in the logs.
  // Note: really long requests & responses may end up truncated.
  console.log({
    name: 'rawRequestResponseHandler event',
    agentName,
    threadId,
    userId,
    request,
    response,
  });
};
