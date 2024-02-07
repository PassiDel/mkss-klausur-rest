import { PrismaClient } from '@prisma/client';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
  getParcelRoute,
  updateParcelRoute,
  updateParcelSchemaAsDriver,
  updateParcelSchemaAsUser
} from './schema/parcel';
import { swaggerUI } from '@hono/swagger-ui';
import { logger } from 'hono/logger';
import { auth, requireAuth, Role } from './auth';
import { ZodError } from 'zod';

export const prisma = new PrismaClient();
const app = new OpenAPIHono();
if (process.env.NODE_ENV !== 'test') {
  app.use('*', logger());
}
app.use('*', auth());
app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
  description: 'User id'
});

// Require authentication for /parcels/:id routes
app.use(updateParcelRoute.getRoutingPath(), requireAuth());
app.openapi(updateParcelRoute, async (c) => {
  const { role } = c.get('user')!!;

  // Combination of all possible attributes
  const data = c.req.valid('json');

  // Parse the payload with the user's role as context
  try {
    switch (role) {
      case Role.USER:
        updateParcelSchemaAsUser.parse(data);
        break;
      case Role.DRIVER:
        updateParcelSchemaAsDriver.parse(data);
        break;
      case Role.ADMIN:
        break;
      default:
        return c.json({ success: false, name: 'Bad request!' }, 400);
    }
  } catch (e) {
    // Payload was conformed with the API specification, but the authorized user is not allowed to set a specific value
    return c.json({ success: false, error: e as ZodError }, 400);
  }

  const { id } = c.req.valid('param');

  // Try to update the parcel, it will throw if the id is not found
  try {
    const parcel = await prisma.parcel.update({
      where: { id },
      data
    });

    return c.json(parcel as any);
  } catch (e) {
    return c.json(
      { success: false, name: `Parcel with id ${id} not found!` },
      404
    );
  }
});

app.openapi(getParcelRoute, async (c) => {
  const { id } = c.req.valid('param');
  const parcel = await prisma.parcel.findUnique({
    where: { id }
  });
  if (!parcel) {
    return c.json(
      { success: false, name: `Parcel with id ${id} not found!` },
      404
    );
  }
  return c.json(parcel as any);
});

app.doc('/doc', (c) => ({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'MKSS 1 Exam Ws23/24',
    description: [
      'Please first migrate the db using `bun run migrate` and then seed for initial values using `bun run seed`.',
      'User-IDs: 1: User, 2: Driver, 3: Admin',
      'Parcel-IDs: 1-4'
    ].join('\n\n')
  },
  servers: [
    {
      url: new URL(c.req.url).origin,
      description: 'Current environment'
    }
  ]
}));
app.get('/ui', swaggerUI({ url: '/doc' }));

// noinspection JSUnusedGlobalSymbols
export default app;
