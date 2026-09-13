const request = require('supertest');
const { app, registerAndLogin } = require('./helpers');

function futureDate(days = 7) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

async function createEvent(token, overrides = {}) {
  return request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Event',
      description: 'Description',
      dateTime: futureDate(),
      location: 'Hall',
      capacity: 5,
      ...overrides,
    });
}

describe('event pagination', () => {
  test('returns default pagination metadata', async () => {
    const { token } = await registerAndLogin(request);
    await createEvent(token);
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 20 });
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination.pages).toBe(Math.ceil(res.body.pagination.total / res.body.pagination.limit));
  });

  test('respects page and limit query params', async () => {
    const { token } = await registerAndLogin(request);
    for (let i = 0; i < 5; i += 1) {
      await createEvent(token, { title: `Event ${i}` });
    }
    const res = await request(app).get('/api/events?page=2&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.events.length).toBe(2);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(2);
  });

  test('clamps limit above the allowed maximum', async () => {
    const { token } = await registerAndLogin(request);
    await createEvent(token);
    const res = await request(app).get('/api/events?limit=1000');
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(100);
  });

  test('falls back to page 1 for a non-positive page value', async () => {
    const { token } = await registerAndLogin(request);
    await createEvent(token);
    const res = await request(app).get('/api/events?page=0');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  test('returns an empty collection past the last page', async () => {
    const { token } = await registerAndLogin(request);
    await createEvent(token);
    const res = await request(app).get('/api/events?page=999&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.events).toEqual([]);
  });
});
