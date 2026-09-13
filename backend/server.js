const createApp = require('./src/app');
const { connectDB } = require('./src/config/db');
const { port } = require('./src/config/env');

async function start() {
  await connectDB();
  const app = createApp();
  app.listen(port, () => {
    console.log(`Eventra API listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
