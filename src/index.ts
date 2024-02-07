import { PrismaClient } from '@prisma/client';
import { Hono } from 'hono';

const prisma = new PrismaClient();
const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

export default app;
