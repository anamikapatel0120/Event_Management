import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/EventManagement.css';
import OrganizerSidebar from '../components/OrganizerSidebar';

const EventManagement = () => {
  const [events, setEvents] = useState([]);

  const defaultForm = {
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'online',
    category: '',
    // organizer: '',
    seats_total: 100,
    seats_booked: 0,
    start_time: '',
    event_date: '',
    mode: 'online',
    venue: '',
    banner_url: '',
    total_seats: 100,
    price: 0,
    performer: '',
    active: true,
    link: '',
  };

  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = storedUser?.token;

    if (!token) {
      alert('Login required to fetch events.');
      return;
    }

    axios.get('http://localhost:5000/api/events', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => setEvents(res.data))
      .catch(err => console.error("Fetch error:", err));
  };


  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setForm({ ...form, [name]: newValue });
  };

  const handleSubmit = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = storedUser?.token;

    if (!token) {
      alert('You must be logged in as an organizer to perform this action.');
      return;
    }

    const url = editingId
      ? `http://localhost:5000/api/events/${editingId}`
      : 'http://localhost:5000/api/events';
    const method = editingId ? axios.put : axios.post;

    method(url, form, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        fetchEvents();
        setForm(defaultForm);
        setEditingId(null);
      })
      .catch(err => {
        console.error("Submit error:", err);
        alert("Failed to submit event. Make sure all required fields are filled.");
      });
  };


  const handleEdit = (event) => {
    setForm(event);
    setEditingId(event.id);
  };

  const handleDelete = (id) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = storedUser?.token;

    if (!token) {
      alert('You must be logged in to delete events.');
      return;
    }

    axios.delete(`http://localhost:5000/api/events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(fetchEvents)
      .catch(err => console.error("Delete error:", err));
  };

  const toggleStatus = (id) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = storedUser?.token;

    if (!token) {
      alert('You must be logged in to toggle event status.');
      return;
    }

    axios.patch(`http://localhost:5000/api/events/${id}/toggle`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(fetchEvents)
      .catch(err => console.error("Toggle error:", err));
  };


  return (
    <div className="dashboard-container">
      <OrganizerSidebar />
      <main className="dashboard-content">
        <div className="event-management">
          <h2>🛠 Event Management</h2>

          <div className="form">
            {Object.entries(form).map(([key, value]) => {
              if (key === 'id') return null;

              if (key === 'link' && form.mode !== 'online') return null;

              if (key === 'active') {
                return (
                  <label key={key}>
                    <input
                      type="checkbox"
                      name="active"
                      checked={form.active}
                      onChange={handleChange}
                    />
                    Active
                  </label>
                );
              }
              let placeholder = key.replace(/_/g, ' ').toUpperCase();

              return (
                <div key={key} className="form-group">
                  <label htmlFor={key}>
                    {{
                      date: 'Event creation date (YYYY-MM-DD)',
                      time: 'Event creation time (HH:MM)',
                      event_date: 'Event date (YYYY-MM-DD)',
                      start_time: 'Event start time (HH:MM)',
                    }[key] || key.replace(/_/g, ' ').toUpperCase()}
                  </label>
                  <input
                    id={key}
                    type={
                      ['date', 'event_date'].includes(key)
                        ? 'date'
                        : ['time', 'start_time'].includes(key)
                          ? 'time'
                          : typeof value === 'number'
                            ? 'number'
                            : 'text'
                    }
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                  />
                </div>
              );
            })}

            <button onClick={handleSubmit}>
              {editingId ? 'Update' : 'Create'} Event
            </button>
          </div>

          <div className="event-list">
            {events.map(e => (
              <div className="event-item" key={e.id}>
                <h3>{e.name} {e.active ? '✅' : '🚫'}</h3>
                <p>{e.description}</p>
                <p>
                  <strong>Created On:</strong>{' '}
                  {e.date
                    ? new Date(e.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                    : 'N/A'}{' '}
                  at {e.time ? e.time.slice(0, 5) : 'N/A'}
                </p>

                <p>
                  <strong>Event Scheduled:</strong>{' '}
                  {e.event_date
                    ? new Date(e.event_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                    : 'N/A'}{' '}
                  at {e.start_time ? e.start_time.slice(0, 5) : 'N/A'}
                </p>
                <p><strong>Location:</strong> {e.location} ({e.mode})</p>
                <p><strong>Price:</strong> ₹{e.price}</p>
                <p><strong>Seats:</strong> {e.seats_booked}/{e.seats_total}</p>
                <button onClick={() => handleEdit(e)}>Edit</button>
                <button onClick={() => handleDelete(e.id)}>Delete</button>
                <button onClick={() => toggleStatus(e.id)}>Toggle Status</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventManagement;
