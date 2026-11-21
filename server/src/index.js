const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');

const app = express();
app.set('trust proxy', 1); // needed for correct rate limiting behind Nginx/Render/Railway
app.use(helmet());
app.use(cors()); // the mobile app does not send an Origin; tighten this if you add a web admin panel
app.use(express.json({ limit: '1mb' }));

// Health check: is the API up and can it reach MongoDB? Safe to call without logging in.
const { version } = require('../package.json');
const started = Date.now();
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

app.get('/', (req, res) => res.json({ name: 'E-book API', version, health: '/health' }));

app.get('/health', async (req, res) => {
  const t0 = Date.now();
  let db = DB_STATES[mongoose.connection.readyState] || 'unknown';
  let dbPingMs = null;
  try {
    await mongoose.connection.db.admin().ping();
    dbPingMs = Date.now() - t0;
  } catch {
    db = db === 'connected' ? 'not responding' : db;
  }
  const ok = dbPingMs != null;
  res.status(ok ? 200 : 503).json({
    ok,
    version,
    uptimeSeconds: Math.round((Date.now() - started) / 1000),
    time: new Date().toISOString(),
    database: { status: ok ? 'connected' : db, pingMs: dbPingMs },
    offlineDays: config.offlineDays,
  });
});
app.use('/auth', require('./routes/auth'));
app.use('/books', require('./routes/books'));
app.use('/admin', require('./routes/admin'));
app.use('/progress', require('./routes/progress'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' });
});

mongoose
  .connect(config.mongoUri)
  .then(() => {
    app.listen(config.port, () => console.log(`E-book API listening on port ${config.port}`));
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
