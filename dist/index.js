import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import 'dotenv/config';
import { authRoutes } from './modules/auth/auth.route.js';
import { tasksRoutes } from './modules/tasks/tasks.routes.js';
const app = new Hono();
app.use('*', logger());
app.use('*', cors());
app.get('/', (c) => {
    return c.json({
        message: "Task monolith api running",
    });
});
app.get('/health', (c) => {
    return c.json({
        status: "ok",
        service: "Task monolith"
    });
});
app.route('/api/auth', authRoutes);
app.route('/api/tasks', tasksRoutes); // 👈 Mount tasks routes
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`surver is running on port ${port}`);
serve({
    fetch: app.fetch,
    port
});
