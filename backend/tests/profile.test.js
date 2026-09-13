const request = require('supertest');
const { app, registerAndLogin } = require('./helpers');

describe('profile update', () => {
  test('authenticated user can update their name', async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated Name');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('rejects unauthenticated access', async () => {
    const res = await request(app).patch('/api/users/me').send({ name: 'No Auth' });
    expect(res.status).toBe(401);
  });

  test('rejects invalid input', async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' });
    expect(res.status).toBe(400);
  });

  test('cannot mass-assign protected fields', async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Still Fine', role: 'organizer', passwordHash: 'hacked' });
    expect(res.status).toBe(400);
  });

  test('getMe does not expose passwordHash', async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.passwordHash).toBeUndefined();
  });
});
