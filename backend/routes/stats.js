const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const { getEventStats } = require('../controllers/statsController');

router.get('/event-insights', verifyToken, getEventStats);
// router.get('/', verifyToken, getEventStats);

module.exports = router;
