import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
import '../styles/MyBookings.css';
import Sidebar from '../components/Sidebar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

autoTable(jsPDF);

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const userEmail = localStorage.getItem('userEmail');

 useEffect(() => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  axios.get('/api/bookings/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => setBookings(res.data))
    .catch(err => console.error('Error fetching bookings:', err));
}, []);


  const downloadTicket = (booking) => {
    const doc = new jsPDF();

    doc.text("🎟️ Ticket Confirmation", 20, 20);
    doc.autoTable({
      startY: 30,
      head: [['Event', 'Date', 'Time', 'Location', 'Seats', 'Status']],
      body: [[
        booking.event_name,
        booking.date,
        booking.time,
        booking.location,
        booking.seats,
        booking.status
      ]],
    });

    if (booking.type === 'offline' && booking.qr_code) {
      try {
        doc.addImage(booking.qr_code, 'JPEG', 70, 80, 70, 70);
      } catch (e) {
        console.warn('Invalid QR code image');
      }
    } else if (booking.type === 'online' && booking.link) {
      doc.text(`Join Link: ${booking.link}`, 20, 110);
    }

    doc.save(`ticket_${booking.id}.pdf`);
  };

  // const cancelBooking = async (id) => {
  //   if (window.confirm('Cancel this booking?')) {
  //     await axios.post(`/api/bookings/cancel/${id}`);
  //     setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
  //   }
  // };
  const cancelBooking = async (id) => {
  if (window.confirm('Cancel this booking?')) {
    try {
      await axios.delete(`/api/bookings/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id)); // remove it from UI
    } catch (err) {
      console.error('Error deleting booking:', err);
    }
  }
};


  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
    <div className="MyBookingsPage">
      <main>
        <h2>📅 My Bookings</h2>
        <div className="bookings-list">
          {bookings.map(booking => (
            <div className={`booking-card ${booking.status}`} key={booking.id}>
              <h3>{booking.event_name}</h3>
              <p><strong>Date:</strong> {booking.date}</p>
              <p><strong>Time:</strong> {booking.time}</p>
              <p><strong>Location:</strong> {booking.location}</p>
              <p><strong>Seats:</strong> {booking.seats}</p>
              <p><strong>Status:</strong> {booking.status}</p>

              {booking.type === 'online' && booking.link && (
                <p><strong>Event Link:</strong> <a href={booking.link} target="_blank" rel="noreferrer">{booking.link}</a></p>
              )}

              {booking.type === 'offline' && booking.qr_code && (
                <img src={booking.qr_code} alt="QR Code" style={{ width: '150px', marginTop: '10px' }} />
              )}

              <div className="actions">
                <button onClick={() => downloadTicket(booking)}>📄 Download Ticket</button>
                {booking.status === 'active' && (
                  <button className="cancel" onClick={() => cancelBooking(booking.id)}>❌ Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
    </main>
    </div>
  );
};

export default MyBookings;
