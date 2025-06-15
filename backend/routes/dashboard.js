const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dashboardController = require('../controllers/dashboardController');
const verifyToken = require('../middlewares/auth');

// GET /api/dashboard/organizer/:id
// router.get('/organizer/:id', async (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Missing token' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     const requestedId = req.params.id;
//     const loggedInId = decoded.id;
//     const role = decoded.role;

//     // 💥 Security check
//     if (role !== 'organizer' || requestedId !== String(loggedInId)) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     // 👇 Pass only if validated
//     const data = await dashboardController.getOrganizerDashboardData(requestedId);
//     res.json(data);
//   } catch (err) {
//     console.error('Authorization error:', err);
//     res.status(401).json({ message: 'Invalid or expired token' });
//   }
// });

// Route
router.get('/organizer', verifyToken, dashboardController.getOrganizerDashboard);


module.exports = router;
