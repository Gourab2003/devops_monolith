import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Missing or invalid Authorization header' }, 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
        const decoded = await verify(token, jwtSecret, 'HS256');
        // Attach the userId to the request context so our routes can use it
        c.set('userId', decoded.userId);
        await next();
    }
    catch (err) {
        return c.json({ error: 'Invalid or expired token' }, 401);
    }
});
