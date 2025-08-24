import agent from '@convex-dev/agent/convex.config';
import rag from '@convex-dev/rag/convex.config';
import rateLimiter from '@convex-dev/rate-limiter/convex.config';
import workflow from '@convex-dev/workflow/convex.config';
import { defineApp } from 'convex/server';

const app = defineApp();
app.use(agent);
app.use(workflow);
app.use(rateLimiter);
app.use(rag);

export default app;
