import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    message: "Task monolith api running",
  });
});

app.get('/health', (c)=> {
  return c.json({
    status: "ok",
    service: "Task monolith"
  });
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
