import { createRoute, z } from '@hono/zod-openapi';
import { errorFactory } from './error';
import { idParam } from './utils';

// all possible attributes
const { id, status, schedule, dropoffPerms, sender, receipient } = {
  id: z.number().int().min(1).openapi({
    example: 1
  }),
  status: z.enum(['NEW', 'SCHEDULED', 'IN_DELIVERY', 'DELIVERED']).openapi({
    example: 'SCHEDULED'
  }),
  schedule: z.string().datetime({ offset: true }).openapi({
    example: new Date().toISOString()
  }),
  dropoffPerms: z.string().openapi({
    example: 'My neighbour'
  }),
  sender: z.string().openapi({ example: 'Flughafenallee 10, 28199 Bremen' }),
  receipient: z.string().openapi({ example: 'Neustadtswall 30, 28199 Bremen' })
} as const;

export const updateParcelSchema = z
  .object({
    status,
    schedule,
    dropoffPerms
  })
  .partial()
  .openapi('ParcelUpdate');

export const updateParcelSchemaAsUser = z
  .object({
    dropoffPerms
  })
  .partial()
  .strict();
export const updateParcelSchemaAsDriver = z
  .object({
    schedule,
    status
  })
  .partial()
  .strict();

export const parcelSchema = z
  .object({
    id,
    status,
    sender,
    receipient,
    schedule: schedule.nullable(),
    dropoffPerms: dropoffPerms.nullable()
  })
  .openapi('Parcel');

export const updateParcelRoute = createRoute({
  method: 'put',
  path: '/parcels/{id}',
  summary: 'Update a parcel',
  description:
    'Update attributes of a parcel. Depending on the authorized user, some attributes may not be allowed to edit.',
  security: [
    {
      Bearer: []
    }
  ],
  request: {
    params: idParam,
    body: {
      content: {
        'application/json': {
          schema: updateParcelSchema
        }
      }
    }
  },
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: parcelSchema
        }
      },
      description: 'Successfully updated a parcel'
    },
    '404': errorFactory(404, 'Not found'),
    '403': errorFactory(
      403,
      'Forbidden, not all users can change every attribute'
    ),
    '401': errorFactory(401, 'Unauthorized, please supply credentials'),
    '400': errorFactory(400, 'Bad request')
  }
});

export const getParcelRoute = createRoute({
  method: 'get',
  path: '/parcels/{id}',
  summary: 'Get a parcel',
  description:
    'This route tries to find a parcel with the given ID. If no parcel could be found, an error will be returned.',
  request: {
    params: idParam
  },
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: parcelSchema
        }
      },
      description: 'The requested parcel'
    },
    '404': errorFactory(404, 'Not found')
  }
});
