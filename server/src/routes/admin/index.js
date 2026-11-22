const express = require('express');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, private');
  next();
});

// Lets route handlers be async without try/catch in each (errors go to the app's error handler).
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
for (const m of ['get', 'post', 'put', 'patch', 'delete']) {
  const original = router[m].bind(router);
  router[m] = (path, ...handlers) => original(path, ...handlers.map(wrap));
}

require('./stats')(router);
require('./users')(router);
require('./content')(router);
require('./queries')(router);
require('./activity')(router);
require('./notifications')(router);

module.exports = router;
