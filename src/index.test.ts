import { beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import app, { prisma } from '.';
import { parcelSchema } from './schema/parcel';
import { main } from '../prisma/seed';

describe('OpenAPI', () => {
  it('should return the OpenAPI json', async () => {
    const res = await app.request('/doc');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
    const body = await res.json();
    expect(body).toBeObject();
  });
  it('should return the Swagger UI', async () => {
    const res = await app.request('/ui');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toStartWith('text/html');
  });
});
const userHeader = {
  Authorization: 'Bearer 1'
};
const driverHeader = {
  Authorization: 'Bearer 2'
};
const adminHeader = {
  Authorization: 'Bearer 3'
};

describe('GET /parcels/:id', () => {
  // only required once, since GET is idempotent
  beforeAll(async () => main(prisma));

  it('should not return a parcel, no auth', async () => {
    const res = await app.request('/parcels/1');
    expect(res.status).toBe(401);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
  });
  it('should not return a parcel, bad auth', async () => {
    const res = await app.request('/parcels/1', {
      headers: {
        Authorization: 'Bearer aaaa'
      }
    });
    expect(res.status).toBe(400);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
  });
  it('should not return a parcel, not found', async () => {
    const res = await app.request('/parcels/123', {
      headers: userHeader
    });
    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
  });
  it('should return a parcel', async () => {
    const res = await app.request('/parcels/1', {
      headers: userHeader
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
    const body = await res.json();
    expect(body).toBeObject();
    expect(parcelSchema.safeParse(body).success).toBe(true);
  });
});

describe('PUT /parcels/:id', () => {
  beforeEach(async () => main(prisma));
  it('should not work, no auth', async () => {
    const res = await app.request('/parcels/1', {
      method: 'PUT'
    });
    expect(res.status).toBe(401);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
  });
  it('should not work, bad auth', async () => {
    const res = await app.request('/parcels/1', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer aaaa'
      }
    });
    expect(res.status).toBe(400);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
  });
  it('should not work, not found', async () => {
    const res = await app.request('/parcels/123', {
      method: 'PUT',
      headers: { ...userHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dropoffPerm: 'neighbour'
      })
    });
    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
  });
  it('should not work, bad attributes, customer', async () => {
    const res = await app.request('/parcels/1', {
      method: 'PUT',
      headers: { ...userHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schedule: new Date()
      })
    });
    expect(res.status).not.toBe(200);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
  });
  it('should not work, bad attributes, driver', async () => {
    const res = await app.request('/parcels/1', {
      method: 'PUT',
      headers: { ...driverHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dropoffPerms: 'neighbour' + Math.random()
      })
    });
    expect(res.status).not.toBe(200);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
  });
  it('should work, customer', async () => {
    const newDropoff = 'neighbour' + Math.random();
    const res = await app.request('/parcels/1', {
      method: 'PUT',
      headers: { ...userHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dropoffPerms: newDropoff
      })
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
    const body = await res.json();
    expect(body).toBeObject();
    const parse = parcelSchema.safeParse(body);
    expect(parse.success).toBe(true);
    expect(parse.success ? parse.data.dropoffPerms : '').toBe(newDropoff);
  });
  it('should work, unknown attributes, customer', async () => {
    const newDropoff = 'neighbour' + Math.random();
    const res = await app.request('/parcels/1', {
      method: 'PUT',
      headers: { ...userHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dropoffPerms: newDropoff,
        unknown: 123
      })
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
    const body = await res.json();
    expect(body).toBeObject();
    const parse = parcelSchema.safeParse(body);
    expect(parse.success).toBe(true);
    expect(parse.success ? parse.data.dropoffPerms : '').toBe(newDropoff);
    expect(body.unknown).toBeUndefined();
  });
  it('should work, driver', async () => {
    const schedule = new Date();
    const res = await app.request('/parcels/1', {
      method: 'PUT',
      headers: { ...driverHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schedule
      })
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
    const body = await res.json();
    expect(body).toBeObject();
    const parse = parcelSchema.safeParse(body);
    expect(parse.success).toBe(true);
    expect(parse.success ? parse.data.schedule : '').toBe(
      schedule.toISOString()
    );
  });
  it('should work, unknown attributes, driver', async () => {
    const schedule = new Date();
    const res = await app.request('/parcels/1', {
      method: 'PUT',
      headers: { ...driverHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schedule,
        unknown: 123
      })
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toStartWith('application/json');
    const body = await res.json();
    expect(body).toBeObject();
    const parse = parcelSchema.safeParse(body);
    expect(parse.success).toBe(true);
    expect(parse.success ? parse.data.schedule : '').toBe(
      schedule.toISOString()
    );
    expect(body.unknown).toBeUndefined();
  });
});
