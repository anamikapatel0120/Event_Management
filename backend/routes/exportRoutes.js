const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const verifyToken = require('../middlewares/auth');

router.get('/attendees/csv', verifyToken, exportController.exportAttendeesCSV);
router.get('/attendees/pdf', verifyToken, exportController.exportAttendeesPDF);
router.get('/summary', verifyToken, exportController.exportEventSummary);

module.exports = router;
