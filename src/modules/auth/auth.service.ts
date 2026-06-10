import { db } from '../../db/index.js';
import { users } from './auth.schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export class AuthService {
    // Find a user by their unique email address
    async findUserByEmail(email: string) {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0] || null;
    }

    // Create a new user with a securely hashed password
    async createUser(email: string, passwordPlain: string) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordPlain, salt);

        const [newUser] = await db.insert(users).values({
            email,
            password: hashedPassword,
        }).returning({
            id: users.id,
            email: users.email,
            createdAt: users.createdAt
        });

        return newUser;
    }
}