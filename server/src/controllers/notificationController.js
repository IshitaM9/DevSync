const { store } = require('../data/store');

function listNotifications(req, res) {
  const notifications = store.notifications
    .filter((item) => item.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 12);

  res.json({ success: true, notifications });
}

module.exports = { listNotifications };
