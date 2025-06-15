
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/BrowseEvents.css';
import Sidebar from '../components/Sidebar';

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ category: '', location: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/events/browse', { params: filters })
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <div className="browse-events">
          <h2>🎉 Browse Events</h2>

          <div className="filters">
            <select name="category" onChange={handleFilterChange}>
              <option value="">All Categories</option>
              <option value="music">Music</option>
              <option value="tech">Tech</option>
              <option value="sports">Sports</option>
            </select>

            <select name="location" onChange={handleFilterChange}>
              <option value="">All Locations</option>
              <option value="new york">New York</option>
              <option value="delhi">Delhi</option>
            </select>

            <select name="type" onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="event-grid">
            {events.map(event => (
              <div className="event-card" key={event.id}>
                {event.banner_url && (
                  <img src={event.banner_url} alt="Event Banner" className="event-img" />
                )}
                <h3>{event.name}</h3>
                <p>
                  <strong>Created On:</strong>{' '}
                  {event.date
                    ? new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                    : 'N/A'}{' '}
                  at {event.time ? event.time.slice(0, 5) : 'N/A'}
                </p>

                <p>
                  <strong>Event Scheduled:</strong>{' '}
                  {event.event_date
                    ? new Date(event.event_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                    : 'N/A'}{' '}
                  at {event.start_time ? event.start_time.slice(0, 5) : 'N/A'}
                </p>
                <p>{event.description}</p>
                <p><strong>Location:</strong> {event.venue} ({event.mode})</p>
                <p><strong>Price:</strong> ₹{event.price}</p>
                <button onClick={() => navigate(`/book-ticket/${event.id}`)}>🎫 Book Tickets</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrowseEvents;
