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
      title: 'Career Fair',
      description: 'Annual career fair',
      dateTime: futureDate(),
      location: 'Main Hall',
      capacity: 2,
      ...overrides,
    });
}

describe('events', () => {
  test('creates an event when authenticated', async () => {
    const { token } = await registerAndLogin(request);
    const res = await createEvent(token);
    expect(res.status).toBe(201);
    expect(res.body.event.registrationCount).toBe(0);
  });

  test('rejects event creation without auth', async () => {
    const res = await request(app).post('/api/events').send({
      title: 'X',
      description: 'Y',
      dateTime: futureDate(),
      location: 'Z',
      capacity: 1,
    });
    expect(res.status).toBe(401);
  });

  test('rejects past dateTime on create', async () => {
    const { token } = await registerAndLogin(request);
    const res = await createEvent(token, { dateTime: new Date(Date.now() - 1000).toISOString() });
    expect(res.status).toBe(400);
  });

  test('lists and retrieves events', async () => {
    const { token } = await registerAndLogin(request);
    const created = await createEvent(token);
    const list = await request(app).get('/api/events');
    expect(list.status).toBe(200);
    expect(list.body.events.length).toBeGreaterThan(0);

    const detail = await request(app).get(`/api/events/${created.body.event._id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.event.title).toBe('Career Fair');
  });

  test('returns 400 for malformed event id', async () => {
    const res = await request(app).get('/api/events/not-a-valid-id');
    expect(res.status).toBe(400);
  });

  test('returns 404 for missing event', async () => {
    const res = await request(app).get('/api/events/64b7f0f0f0f0f0f0f0f0f0f0');
    expect(res.status).toBe(404);
  });

  test('only owner can update or delete', async () => {
    const owner = await registerAndLogin(request);
    const other = await registerAndLogin(request);
    const created = await createEvent(owner.token);
    const id = created.body.event._id;

    const forbiddenUpdate = await request(app)
      .patch(`/api/events/${id}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ title: 'Hacked' });
    expect(forbiddenUpdate.status).toBe(403);

    const forbiddenDelete = await request(app)
      .delete(`/api/events/${id}`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(forbiddenDelete.status).toBe(403);

    const ownerUpdate = await request(app)
      .patch(`/api/events/${id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Updated Title' });
    expect(ownerUpdate.status).toBe(200);
    expect(ownerUpdate.body.event.title).toBe('Updated Title');

    const ownerDelete = await request(app)
      .delete(`/api/events/${id}`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(ownerDelete.status).toBe(204);
  });

  test('deleting an event cascades registrations', async () => {
    const owner = await registerAndLogin(request);
    const attendee = await registerAndLogin(request);
    const created = await createEvent(owner.token);
    const id = created.body.event._id;

    await request(app)
      .post(`/api/events/${id}/register`)
      .set('Authorization', `Bearer ${attendee.token}`);

    const del = await request(app)
      .delete(`/api/events/${id}`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(del.status).toBe(204);

    const myRegs = await request(app)
      .get('/api/users/me/registrations')
      .set('Authorization', `Bearer ${attendee.token}`);
    expect(myRegs.body.registrations.length).toBe(0);
  });
});
