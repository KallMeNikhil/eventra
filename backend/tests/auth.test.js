const request = require('supertest');
const { app } = require('./helpers');

describe('auth', () => {
  test('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'dup@example.com',
      password: 'password123',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice2',
      email: 'dup@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(409);
  });

  test('rejects weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'short',
    });
    expect(res.status).toBe(400);
  });

  test('logs in with valid credentials and rejects invalid', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Carl',
      email: 'carl@example.com',
      password: 'password123',
    });
    const good = await request(app)
      .post('/api/auth/login')
      .send({ email: 'carl@example.com', password: 'password123' });
    expect(good.status).toBe(200);
    expect(good.body.token).toBeDefined();

    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: 'carl@example.com', password: 'wrongpass' });
    expect(bad.status).toBe(401);
  });

  test('protected route rejects missing token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});
