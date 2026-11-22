// Day boundaries in the admin's time zone (ADMIN_TZ, default Asia/Kolkata).
const config = require('../config');

// Milliseconds the zone is ahead of UTC at the given moment.
function offsetMs(date, tz = config.adminTz) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

// Midnight today (in the zone), as a Date.
function startOfToday(tz = config.adminTz) {
  const now = new Date();
  const off = offsetMs(now, tz);
  const local = new Date(now.getTime() + off);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - off);
}

function daysAgo(n, tz) {
  return new Date(startOfToday(tz).getTime() - n * 24 * 60 * 60 * 1000);
}

module.exports = { startOfToday, daysAgo };
