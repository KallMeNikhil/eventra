const createApp = require('../src/app');

const app = createApp();

async function registerAndLogin(request, overrides = {}) {
  const payload = {
    name: 'Test User',
    email: `user${Date.now()}${Math.random()}@example.com`,
    password: 'password123',
    ...overrides,
  };
  await request(app).post('/api/auth/register').send(payload);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: payload.email, password: payload.password });
  return { token: res.body.token, user: res.body.user };
}

module.exports = { app, registerAndLogin };
