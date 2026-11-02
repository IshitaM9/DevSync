const express = require('express');
const { listNotifications } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', listNotifications);

module.exports = router;
