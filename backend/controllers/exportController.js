const db = require('../db');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.exportAttendeesCSV = async (req, res) => {
  const organizerId = req.user.id;
  try {
    const result = await db.query(`
      SELECT u.name, u.email, b.seats, b.status, b.attended, e.name AS event
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN events e ON b.event_id = e.id
      WHERE e.organizer_id = $1
    `, [organizerId]);

    const attendees = result.rows;

    if (!attendees || attendees.length === 0) {
      return res.status(404).json({ message: 'No attendees found to export.' });
    }

    const fields = ['name', 'email', 'seats', 'status', 'attended', 'event'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(attendees);

    res.header('Content-Type', 'text/csv');
    res.attachment('attendees.csv');
    return res.send(csv);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ message: 'Failed to export CSV' });
  }
};


exports.exportAttendeesPDF = async (req, res) => {
  const organizerId = req.user.id;

  try {
    const result = await db.query(`
      SELECT u.name, u.email, b.seats, b.status, b.attended, e.name AS event
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN events e ON b.event_id = e.id
      WHERE e.organizer_id = $1
    `, [organizerId]);

    const attendees = result.rows;

    if (!attendees || attendees.length === 0) {
      return res.status(404).json({ message: 'No attendees to export.' });
    }

    // ✅ Ensure export directory exists
    const exportDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    const filePath = path.join(exportDir, 'attendees.pdf');
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);
    doc.fontSize(16).text('Attendees List\n\n');

    attendees.forEach((a, i) => {
      doc.fontSize(12).text(`${i + 1}. ${a.name} (${a.email}) - Event: ${a.event}, Seats: ${a.seats}, Status: ${a.status}, Attended: ${a.attended}`);
    });

    doc.end();

    writeStream.on('finish', () => {
      res.download(filePath);
    });

    writeStream.on('error', (err) => {
      console.error('PDF write error:', err);
      res.status(500).json({ message: 'Failed to generate PDF' });
    });
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};

exports.exportEventSummary = async (req, res) => {
  try {
    const organizerId = req.user.id;

    const result = await db.query(`
      SELECT 
        e.name AS event, 
        COUNT(b.id) AS total_bookings,
        SUM(b.seats) AS total_seats_booked,
        SUM(CASE WHEN b.attended THEN b.seats ELSE 0 END) AS total_attended,
        SUM(b.seats * e.price) AS revenue
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id
      WHERE e.organizer_id = $1
      GROUP BY e.name
    `, [organizerId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Summary export failed' });
  }
};
