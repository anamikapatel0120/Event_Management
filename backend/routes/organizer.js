const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProfile, updateProfile, getActivityLogs } = require('../controllers/organizerController');
const verifyToken = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `organizer-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, upload.single('image'), updateProfile);
router.get('/logs', verifyToken, getActivityLogs);

module.exports = router;
