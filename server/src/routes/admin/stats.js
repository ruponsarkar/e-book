const User = require('../../models/User');
const Query = require('../../models/Query');
const TestAttempt = require('../../models/TestAttempt');
const { Activity } = require('../../models/Activity');
const config = require('../../config');
const { startOfToday, daysAgo } = require('../../lib/time');
const { describeEvents } = require('./activity');

module.exports = (router) => {
  // Dashboard numbers.
  router.get('/stats', async (req, res) => {
    const today = startOfToday();
    const weekAgo = daysAgo(6);
    const from = daysAgo(13);
    const students = { role: 'student' };

    const [total, disabled, activeToday, activeWeek, openQueries, testsToday, timeToday, daily, recent] = await Promise.all([
      User.countDocuments(students),
      User.countDocuments({ ...students, disabled: true }),
      User.countDocuments({ ...students, lastSeenAt: { $gte: today } }),
      User.countDocuments({ ...students, lastSeenAt: { $gte: weekAgo } }),
      Query.countDocuments({ status: 'open' }),
      TestAttempt.countDocuments({ status: 'submitted', submittedAt: { $gte: today } }),
      Activity.aggregate([
        { $match: { type: 'session', at: { $gte: today } } },
        { $group: { _id: null, sec: { $sum: '$durationSec' } } },
      ]),
      Activity.aggregate([
        { $match: { type: { $in: ['session', 'login'] }, at: { $gte: from } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$at', timezone: config.adminTz } },
            users: { $addToSet: '$userId' },
            sec: { $sum: '$durationSec' },
          },
        },
        { $project: { day: '$_id', _id: 0, users: { $size: '$users' }, minutes: { $round: [{ $divide: ['$sec', 60] }, 0] } } },
        { $sort: { day: 1 } },
      ]),
      Activity.find().sort({ at: -1 }).limit(12).lean(),
    ]);

    res.json({
      students: { total, disabled, activeToday, activeWeek },
      openQueries,
      testsToday,
      minutesToday: Math.round((timeToday[0]?.sec || 0) / 60),
      daily: fillDays(daily, 14),
      recent: await describeEvents(recent),
      timeZone: config.adminTz,
    });
  });
};

// One row per day, including days with no activity.
function fillDays(rows, n) {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out = [];
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: config.adminTz, year: 'numeric', month: '2-digit', day: '2-digit' });
  for (let i = n - 1; i >= 0; i--) {
    const day = fmt.format(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    out.push(byDay.get(day) || { day, users: 0, minutes: 0 });
  }
  return out;
}
