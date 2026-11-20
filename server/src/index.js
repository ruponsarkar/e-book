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

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/auth', require('./routes/auth'));
app.use('/books', require('./routes/books'));
app.use('/admin', require('./routes/admin'));

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
