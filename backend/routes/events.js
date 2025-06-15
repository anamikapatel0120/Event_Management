// const express = require('express');
// const router = express.Router();
// const { getEvents } = require('../controllers/eventsController');
// const pool = require("../db");

// router.get('/', getEvents);
// router.get("/browse-events", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT * FROM events WHERE active = TRUE ORDER BY start_time ASC"
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });

// module.exports = router;





const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const verifyToken = require('../middlewares/auth'); 

// Admin & CRUD routes
// router.get('/', eventsController.getEvents); 
router.get('/', verifyToken, eventsController.getEvents);                   // All events (admin)
router.post('/', eventsController.createEvent);                // Create new
router.put('/:id', eventsController.updateEvent);              // Update existing
router.delete('/:id', eventsController.deleteEvent);           // Delete
router.patch('/:id/toggle', eventsController.toggleActive);  
router.get('/browse', eventsController.getFilteredEvents);  // Toggle active status

// Public-facing route for browsing active events (optionally with filters)
router.get('/browse-events', eventsController.getFilteredEvents);
router.get('/get-one', verifyToken, eventsController.getEventById);

module.exports = router;
