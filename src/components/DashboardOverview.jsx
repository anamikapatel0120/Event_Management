import React, { useEffect, useState } from 'react';
import './DashboardOverview.css';

function DashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = storedUser?.token;

    if (!storedUser || storedUser.role !== 'organizer' || !token) {
      setError('Access denied. Organizer login required.');
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/dashboard/organizer`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch organizer data');
        }
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        setError('Error loading dashboard data.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading organizer dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-overview">
      <h2>Organizer Dashboard Overview</h2>

      <h3>Total Events Created: {data.totalEvents}</h3>

      <h3>Event Stats</h3>
      <ul>
        {data.events?.map((event) => (
          <li key={event.id}>
            <strong>{event.name}</strong> |{' '}
            Seats Booked: {event.seats_booked} / {event.seats_total} |{' '}
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
            {event.mode === 'online' && event.link && (
              <p><strong>Link:</strong> <a href={event.link} target="_blank" rel="noreferrer">{event.link}</a></p>
            )}
          </li>
        ))}
      </ul>

      <h3>Total Bookings: {data.totalBookings}</h3>
      <h3>Total Revenue: ₹{data.totalRevenue}</h3>
      <h3>Total Tickets Issued: {data.totalTickets}</h3>
    </div>
  );
}

export default DashboardOverview;
