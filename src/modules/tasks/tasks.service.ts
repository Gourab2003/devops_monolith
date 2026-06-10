import { db } from '../../db/index.js';
import { tasks } from './tasks.schema.js';
import { eq, and } from 'drizzle-orm';

export class TasksService {
    async createTask(userId: string, title: string, description?: string) {
        const [newTask] = await db.insert(tasks).values({
            userId,
            title,
            description,
        }).returning();
        return newTask;
    }

    async getUserTasks(userId: string) {
        return await db.select().from(tasks).where(eq(tasks.userId, userId));
    }

    async updateTask(userId: string, taskId: string, data: { title?: string; description?: string; isCompleted?: boolean }) {
        const [updatedTask] = await db.update(tasks)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId))) // Enforces ownership
            .returning();
        return updatedTask;
    }

    async deleteTask(userId: string, taskId: string) {
        const [deletedTask] = await db.delete(tasks)
            .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId))) // Enforces ownership
            .returning();
        return deletedTask;
    }
}