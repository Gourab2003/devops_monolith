import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { TasksService } from './tasks.service.js';
import { authMiddleware } from '../../middlewares/auth.js';

// We define a custom environment type so TypeScript knows `userId` exists on the context
type Variables = {
    userId: string;
};

const tasksRoutes = new Hono<{ Variables: Variables }>();
const tasksService = new TasksService();

// Protect ALL routes in this file with the auth middleware
tasksRoutes.use('*', authMiddleware);

// Validation Schemas
const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
});

const updateTaskSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    isCompleted: z.boolean().optional(),
});

// 1. CREATE a task
tasksRoutes.post('/', zValidator('json', createTaskSchema), async (c) => {
    const userId = c.get('userId');
    const { title, description } = c.req.valid('json');

    const newTask = await tasksService.createTask(userId, title, description);
    return c.json(newTask, 201);
});

// 2. READ all tasks for the logged-in user
tasksRoutes.get('/', async (c) => {
    const userId = c.get('userId');
    const userTasks = await tasksService.getUserTasks(userId);
    return c.json(userTasks);
});

// 3. UPDATE a task
tasksRoutes.put('/:id', zValidator('json', updateTaskSchema), async (c) => {
    const userId = c.get('userId');
    const taskId = c.req.param('id');
    const updateData = c.req.valid('json');

    const updatedTask = await tasksService.updateTask(userId, taskId, updateData);

    if (!updatedTask) return c.json({ error: 'Task not found or unauthorized' }, 404);
    return c.json(updatedTask);
});

// 4. DELETE a task
tasksRoutes.delete('/:id', async (c) => {
    const userId = c.get('userId');
    const taskId = c.req.param('id');

    const deletedTask = await tasksService.deleteTask(userId, taskId);

    if (!deletedTask) return c.json({ error: 'Task not found or unauthorized' }, 404);
    return c.json({ message: 'Task deleted successfully', task: deletedTask });
});

export { tasksRoutes };