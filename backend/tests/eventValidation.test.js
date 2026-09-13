const request = require('supertest');
const { app, registerAndLogin } = require('./helpers');

function futureDate(days = 7) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function validPayload(overrides = {}) {
  return {
    title: 'Career Fair',
    description: 'Annual career fair',
    dateTime: futureDate(),
    location: 'Main Hall',
    capacity: 2,
    ...overrides,
  };
}

describe('event validation', () => {
  test('rejects missing title', async () => {
    const { token } = await registerAndLogin(request);
    const payload = validPayload();
    delete payload.title;
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(400);
  });

  test('rejects missing description', async () => {
    const { token } = await registerAndLogin(request);
    const payload = validPayload();
    delete payload.description;
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(400);
  });

  test('rejects missing location', async () => {
    const { token } = await registerAndLogin(request);
    const payload = validPayload();
    delete payload.location;
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(400);
  });

  test('rejects non-positive capacity', async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(validPayload({ capacity: 0 }));
    expect(res.status).toBe(400);
  });

  test('rejects negative capacity', async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(validPayload({ capacity: -5 }));
    expect(res.status).toBe(400);
  });

  test('rejects non-integer capacity', async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(validPayload({ capacity: 2.5 }));
    expect(res.status).toBe(400);
  });

  test('rejects malformed dateTime', async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(validPayload({ dateTime: 'not-a-date' }));
    expect(res.status).toBe(400);
  });

  test('rejects empty title string', async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(validPayload({ title: '' }));
    expect(res.status).toBe(400);
  });

  test('rejects unknown fields on update', async () => {
    const { token } = await registerAndLogin(request);
    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(validPayload());
    const res = await request(app)
      .patch(`/api/events/${created.body.event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ registrationCount: 999 });
    expect(res.status).toBe(400);
  });

  test('rejects moving an event into the past on update', async () => {
    const { token } = await registerAndLogin(request);
    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(validPayload());
    const res = await request(app)
      .patch(`/api/events/${created.body.event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ dateTime: new Date(Date.now() - 60000).toISOString() });
    expect(res.status).toBe(400);
  });

  test('allows updating other fields with a valid future dateTime', async () => {
    const { token } = await registerAndLogin(request);
    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(validPayload());
    const res = await request(app)
      .patch(`/api/events/${created.body.event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ dateTime: futureDate(14) });
    expect(res.status).toBe(200);
  });

  test('rejects reducing capacity below the current registration count', async () => {
    const owner = await registerAndLogin(request);
    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(validPayload({ capacity: 3 }));
    const eventId = created.body.event._id;

    const firstAttendee = await registerAndLogin(request);
    await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${firstAttendee.token}`)
      .send();
    const secondAttendee = await registerAndLogin(request);
    await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${secondAttendee.token}`)
      .send();

    const res = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ capacity: 1 });
    expect(res.status).toBe(400);
  });

  test('allows reducing capacity to a value still at or above the registration count', async () => {
    const owner = await registerAndLogin(request);
    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(validPayload({ capacity: 5 }));
    const eventId = created.body.event._id;

    const attendee = await registerAndLogin(request);
    await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${attendee.token}`)
      .send();

    const res = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ capacity: 1 });
    expect(res.status).toBe(200);
    expect(res.body.event.capacity).toBe(1);
  });
});
