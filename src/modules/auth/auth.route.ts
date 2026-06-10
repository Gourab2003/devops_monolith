import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { sign } from 'hono/jwt';
import { AuthService } from './auth.service.js';
import bcrypt from 'bcryptjs';

const authRoutes = new Hono();
const authService = new AuthService();

const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

// Define the validation schema for input payloads
const authSchema = z.object({
    email: z.email('Invalid email address format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// 1. REGISTRATION ROUTE
authRoutes.post('/register', zValidator('json', authSchema), async (c) => {
    const { email, password } = c.req.valid('json');
    console.log(email, password)

    try {
        const existingUser = await authService.findUserByEmail(email);
        if (existingUser) {
            return c.json({ error: 'User with this email already exists' }, 400);
        }

        const newUser = await authService.createUser(email, password);
        return c.json({ message: 'User registered successfully', user: newUser }, 201);
    } catch (error) {
        console.error(error)
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// 2. LOGIN ROUTE
authRoutes.post('/login', zValidator('json', authSchema), async (c) => {
    const { email, password } = c.req.valid('json');

    try {
        const user = await authService.findUserByEmail(email);
        if (!user) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        // Compare incoming password with the hash stored in the DB
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        // Generate a JWT token containing the user's ID
        const token = await sign({ userId: user.id, email: user.email }, jwtSecret);

        return c.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export { authRoutes };