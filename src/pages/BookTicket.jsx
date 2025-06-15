import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import QRCode from 'qrcode';
import '../styles/BookTicket.css';
import Sidebar from '../components/Sidebar';
import { jwtDecode } from 'jwt-decode';

const socket = io('http://localhost:5000');

const BookTicket = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({ name: '', age: '', email: '', seats: 1 });
  const [error, setError] = useState('');
  const [liveSeats, setLiveSeats] = useState(0);

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const token = storedUser?.token;
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.user_id || decoded.id || decoded.sub;
    } catch (err) {
      console.error('Invalid token', err);
    }
  }

  useEffect(() => {
    if (!token) {
      setError('Login required.');
      return;
    }

    axios.get('/api/events/get-one', {
      params: { id: eventId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        console.log('Event response:', res.data);
        const evt = res.data[0];
        setEvent(evt);
        setLiveSeats(evt.seats_booked || 0);
      })
      .catch(() => setError('Event not found or unauthorized.'));
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    socket.on(`seat-update-${eventId}`, data => setLiveSeats(data.seats_booked));
    return () => socket.off(`seat-update-${eventId}`);
  }, [eventId]);

  const availableSeats = event?.seats_total ? event.seats_total - liveSeats : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token || !userId) {
      setError('You must be logged in to book tickets.');
      return;
    }

    if (form.seats > availableSeats) {
      alert(`Only ${availableSeats} seat(s) left!`);
      return;
    }

    const totalAmount = Number(event?.price || 0) * Number(form.seats || 1);

    try {
      const { data } = await axios.post('/api/payments/create-order', {
        amount: totalAmount,
        receipt: `receipt_${Date.now()}`,
        notes: {
          eventId,
          ...form,
        }
      });

      const { order } = data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: event.name,
        description: 'Ticket Booking',
        order_id: order.id,
        handler: async (response) => {
          const verifyRes = await axios.post('/api/payments/verify', {
            ...response,
            ...form,
            eventId,
            user_id: userId
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (verifyRes.data.success) {
            alert('Booking Confirmed!');
            setForm({ name: '', age: '', email: '', seats: 1 });
          } else {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: form.name,
          email: form.email
        },
        theme: { color: '#3399cc' }
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error(err);
      setError('Failed to initiate Razorpay payment.');
    }
  };

  const handleDemoBook = async () => {
    try {
      if (!token) {
        alert('Login required to book a demo.');
        return;
      }

      if (form.seats > availableSeats) {
        alert(`Only ${availableSeats} seat(s) left!`);
        return;
      }

      const qrText = `Event: ${event.name}\nName: ${form.name}\nEmail: ${form.email}\nSeats: ${form.seats}\nDate: ${new Date().toLocaleString()}`;
      const qrCode = await QRCode.toDataURL(qrText);

      const response = await axios.post(
        '/api/bookings/demo',
        {
          event_id: eventId,
          name: form.name,
          age: form.age,
          email: form.email,
          seats: form.seats,
          booking_time: new Date().toISOString(),
          qr_code: qrCode,
          status: 'active',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert('Demo booking successful!');
        setForm({ name: '', age: '', email: '', seats: 1 });
      } else {
        alert('Demo booking failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Demo booking failed.');
    }
  };

  if (!event) return <p>Loading event...</p>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <div className="TicketPage">
          <main>
            <h2>{event.name}</h2>
            <p>Price per ticket: ₹{event.price}</p>

            <div className="seat-info">
              <div className="seat-graph">
                <div
                  style={{
                    width: `${(liveSeats / event.seats_total) * 100}%`,
                    background: '#ef4444',
                    height: '20px',
                  }}
                />
                <div
                  style={{
                    width: `${(availableSeats / event.seats_total) * 100}%`,
                    background: '#22c55e',
                    height: '20px',
                  }}
                />
              </div>
              <p>{liveSeats}/{event.seats_total} booked</p>
            </div>

            {availableSeats === 0 && <p style={{ color: 'red' }}>This event is fully booked.</p>}

            <form onSubmit={handleSubmit} className="booking-form">
              <input name="name" placeholder="Name" required value={form.name} onChange={handleChange} />
              <input name="age" type="number" placeholder="Age" required value={form.age} onChange={handleChange} />
              <input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} />
              <input
                name="seats"
                type="number"
                min="1"
                max={availableSeats || 1}
                required
                value={form.seats}
                onChange={handleChange}
              />
              {/* <button type="submit" disabled={availableSeats === 0}>Pay & Book</button> */}
              <button type="button" onClick={handleDemoBook} style={{ marginLeft: '10px' }} disabled={availableSeats === 0}>Demo Book</button>
            </form>

            {error && <p className="error">{error}</p>}
          </main>
        </div>
      </main>
    </div>
  );
};

export default BookTicket;
