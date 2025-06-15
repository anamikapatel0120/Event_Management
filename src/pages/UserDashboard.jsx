import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/UserDashboard.css';
import Sidebar from '../components/Sidebar';
import '../styles/MyBookings.css'
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;

    if (!token) return;

    axios
      .get('/api/bookings/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setBookings(res.data))
      .catch((err) => console.error('Error fetching bookings:', err));
  }, []);

  // const downloadTicket = (booking) => {
  //   const doc = new jsPDF();

  //   doc.text('🎟️ Ticket Confirmation', 20, 20);
  //   doc.autoTable({
  //     startY: 30,
  //     head: [['Event', 'Date', 'Time', 'Location', 'Seats', 'Status']],
  //     body: [[
  //       booking.event_name,
  //       booking.date,
  //       booking.time,
  //       booking.location,
  //       booking.seats,
  //       booking.status
  //     ]],
  //   });

  //   if (booking.type === 'offline' && booking.qr_code) {
  //     try {
  //       // const imageData = `data:image/jpeg;base64,${booking.qr_code}`;
  //       const imageData = booking.qr_code.startsWith('data:image')
  //         ? booking.qr_code
  //         : `data:image/jpeg;base64,${booking.qr_code}`;
  //       doc.addImage(imageData, 'JPEG', 70, 80, 70, 70);
  //     } catch (e) {
  //       console.warn('Invalid QR code image');
  //     }
  //   } else if (booking.type === 'online' && booking.link) {
  //     doc.text(`Join Link: ${booking.link}`, 20, 110);
  //   }

  //   doc.save(`ticket_${booking.id}.pdf`);
  // };


  const downloadTicket = (booking) => {
    const doc = new jsPDF();
    const user = JSON.parse(localStorage.getItem('user'));

    // Format dates/times
    const formattedEventDate = booking.event_date
      ? new Date(booking.event_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      : 'N/A';

    const formattedEventTime = booking.start_time ? booking.start_time.slice(0, 5) : 'N/A';

    const formattedBookingDateTime = booking.booking_time
      ? new Date(booking.booking_time).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) +
      ' at ' +
      new Date(booking.booking_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
      : 'N/A';


    // 🎟️ Ticket Title
    doc.setFontSize(18);
    doc.text('🎟️ Ticket Confirmation', 20, 20);

    // 📅 Event Info
    doc.setFontSize(12);
    doc.autoTable({
      startY: 30,
      head: [['Event Detail', 'Information']],
      body: [
        ['Event Name', booking.event_name],
        ['Event Date', formattedEventDate],
        ['Event Time', formattedEventTime],
        ['Location', booking.location],
        ['Seats Booked', booking.seats],
        ['Status', booking.status],
      ],
    });

    // 🧑‍💼 Organizer & Performer Info
    const orgSectionY = doc.lastAutoTable.finalY + 10;
    doc.autoTable({
      startY: orgSectionY,
      head: [['Organizer / Performer Detail', 'Information']],
      body: [
        ['Organizer Name', booking.organizer_name || 'N/A'],
        ['Organizer Email', booking.organizer_email || 'N/A'],
        ['Performers', booking.performer || 'N/A'],
      ],
    });

    // 👤 User Info
    const userSectionY = doc.lastAutoTable.finalY + 10;
    doc.autoTable({
      startY: userSectionY,
      head: [['User Detail', 'Information']],
      body: [
        ['Booked By', booking.user_name || 'N/A'],
        ['User Email', user?.email || 'N/A'],
        ['Booking Time', formattedBookingDateTime],
      ],
    });

    // 📎 QR or Link
    const finalY = doc.lastAutoTable.finalY + 10;
    if (booking.type === 'offline' && booking.qr_code) {
      try {
        const imageData = booking.qr_code.startsWith('data:image')
          ? booking.qr_code
          : `data:image/jpeg;base64,${booking.qr_code}`;
        doc.text('Scan QR for Entry:', 20, finalY);
        doc.addImage(imageData, 'JPEG', 20, finalY + 10, 60, 60);
      } catch (e) {
        console.warn('Invalid QR code image');
      }
    } else if (booking.type === 'online' && booking.link) {
      doc.text('Join Link:', 20, finalY);
      doc.textWithLink(booking.link, 20, finalY + 10, { url: booking.link });
    }

    doc.save(`ticket_${booking.id}.pdf`);
  };


  const cancelBooking = async (id) => {
    console.log('typeof booking.id', typeof id, id);


    if (window.confirm('Cancel this booking?')) {
      try {
        const token = JSON.parse(localStorage.getItem('user'))?.token;

        await axios.post(`/api/bookings/cancel/${id}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Option 1: Remove cancelled booking from list
        // setBookings(prev => prev.filter(b => b.id !== id));

        // Option 2 (Recommended): Update its status to 'cancelled' without removing
        setBookings(prev =>
          prev.map(b => (b.id === id ? { ...b, status: 'cancelled', seats: 0 } : b))
        );


      } catch (err) {
        console.error('Error cancelling booking:', err);
      }
    }
  };


  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <h2>📅 My Bookings</h2>
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div className={`booking-card ${booking.status}`} key={booking.id}>
              <h3>{booking.event_name}</h3>
              <p>
                <strong>Event Scheduled:</strong>{' '}
                {booking.event_date
                  ? new Date(booking.event_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                  : 'N/A'}{' '}
                at {booking.start_time ? booking.start_time.slice(0, 5) : 'N/A'}
              </p>

              <p><strong>Location:</strong> {booking.location}</p>
              <p><strong>Seats:</strong> {booking.seats}</p>
              <p><strong>Status:</strong> {booking.status}</p>

              {booking.status !== 'cancelled' && booking.type === 'online' && booking.link && (
                <p>
                  <strong>Event Link:</strong>{' '}
                  <a href={booking.link} target="_blank" rel="noreferrer">{booking.link}</a>
                </p>
              )}

              {booking.status !== 'cancelled' && booking.type === 'offline' && booking.qr_code && (
                <img src={booking.qr_code} alt="QR Code" style={{ width: '150px', marginTop: '10px' }} />
              )}

              
              <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  if (booking.status === 'cancelled') {
                    alert('This ticket has been cancelled and cannot be downloaded.');
                    return;
                  }
                  downloadTicket(booking);
                }}
                style={{
                  opacity: booking.status === 'cancelled' ? 0.5 : 1,
                  cursor: booking.status === 'cancelled' ? 'not-allowed' : 'pointer'
                }}
              >
                📄 Download Ticket
              </button>


              {booking.status === 'active' && (
                <button className="cancel" onClick={() => cancelBooking(booking.id)}>❌ Cancel</button>
              )}
            </div>
            </div>
          ))}
    </div>
      </main >
    </div >
  );
};

export default UserDashboard;
