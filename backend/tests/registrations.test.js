const request = require('supertest');
const { app, registerAndLogin } = require('./helpers');
const Registration = require('../src/models/Registration');

function futureDate(days = 7) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

async function createEvent(token, capacity) {
  const res = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Workshop',
      description: 'Hands-on workshop',
      dateTime: futureDate(),
      location: 'Room 101',
      capacity,
    });
  return res.body.event;
}

describe('registrations', () => {
  test('registers successfully and increments count', async () => {
    const owner = await registerAndLogin(request);
    const attendee = await registerAndLogin(request);
    const event = await createEvent(owner.token, 5);

    const res = await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${attendee.token}`);
    expect(res.status).toBe(201);

    const detail = await request(app).get(`/api/events/${event._id}`);
    expect(detail.body.event.registrationCount).toBe(1);
  });

  test('rejects duplicate registration', async () => {
    const owner = await registerAndLogin(request);
    const attendee = await registerAndLogin(request);
    const event = await createEvent(owner.token, 5);

    await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${attendee.token}`);
    const second = await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${attendee.token}`);
    expect(second.status).toBe(409);
  });

  test('rejects registration once event is full', async () => {
    const owner = await registerAndLogin(request);
    const a1 = await registerAndLogin(request);
    const a2 = await registerAndLogin(request);
    const event = await createEvent(owner.token, 1);

    const first = await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${a1.token}`);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${a2.token}`);
    expect(second.status).toBe(409);
  });

  test('cancellation reopens capacity and allows re-registration', async () => {
    const owner = await registerAndLogin(request);
    const attendee = await registerAndLogin(request);
    const event = await createEvent(owner.token, 1);

    await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${attendee.token}`);

    const cancel = await request(app)
      .delete(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${attendee.token}`);
    expect(cancel.status).toBe(204);

    const detail = await request(app).get(`/api/events/${event._id}`);
    expect(detail.body.event.registrationCount).toBe(0);

    const reRegister = await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${attendee.token}`);
    expect(reRegister.status).toBe(201);
  });

  test('cancelling a non-existent registration returns 404', async () => {
    const owner = await registerAndLogin(request);
    const attendee = await registerAndLogin(request);
    const event = await createEvent(owner.token, 1);

    const res = await request(app)
      .delete(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${attendee.token}`);
    expect(res.status).toBe(404);
  });

  test('registering for a non-existent event returns 404', async () => {
    const attendee = await registerAndLogin(request);
    const res = await request(app)
      .post('/api/events/64b7f0f0f0f0f0f0f0f0f0f0/register')
      .set('Authorization', `Bearer ${attendee.token}`);
    expect(res.status).toBe(404);
  });

  test('rejects registration without authentication', async () => {
    const owner = await registerAndLogin(request);
    const event = await createEvent(owner.token, 5);
    const res = await request(app).post(`/api/events/${event._id}/register`);
    expect(res.status).toBe(401);
  });

  test('CRITICAL: concurrent registrations at capacity 1 allow exactly one success', async () => {
    const owner = await registerAndLogin(request);
    const event = await createEvent(owner.token, 1);

    const attendees = await Promise.all(
      Array.from({ length: 8 }, () => registerAndLogin(request))
    );

    const results = await Promise.all(
      attendees.map((a) =>
        request(app)
          .post(`/api/events/${event._id}/register`)
          .set('Authorization', `Bearer ${a.token}`)
      )
    );

    const successes = results.filter((r) => r.status === 201);
    const conflicts = results.filter((r) => r.status === 409);

    expect(successes.length).toBe(1);
    expect(conflicts.length).toBe(7);

    const detail = await request(app).get(`/api/events/${event._id}`);
    expect(detail.body.event.registrationCount).toBe(1);

    const docCount = await Registration.countDocuments({ event: event._id });
    expect(docCount).toBe(1);
  });
});
