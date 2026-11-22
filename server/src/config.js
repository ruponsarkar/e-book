require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Copy .env.example to .env and set it.`);
  }
  return value;
}

module.exports = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  allowSignup: process.env.ALLOW_SIGNUP === 'true',
  // How many days the app may open downloaded (encrypted) books without reaching the server.
  // After that the student must go online once so the account is re-checked.
  // Time zone the admin panel uses for "today" and daily charts.
  adminTz: process.env.ADMIN_TZ || 'Asia/Kolkata',
  offlineDays: Math.max(0, Number(process.env.OFFLINE_DAYS ?? 7)),
};
