import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import '../styles/ExportPage.css';
import OrganizerSidebar from './OrganizerSidebar';

const ExportPage = () => {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    axios.get('http://localhost:5000/api/export/summary', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setSummary(res.data))
      .catch(err => console.error('Error fetching summary:', err));
  };

  const handleDownload = (type) => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    const endpoint = `http://localhost:5000/api/export/attendees/${type}`;

    axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    }).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendees.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }).catch(err => {
      console.error('Download failed:', err);
    });
  };

  return (
    <div className="dashboard-container">
      <OrganizerSidebar />
      <main className="dashboard-content">
    <div className="export-page">
      <h2>📦 Export Tools</h2>

      <div className="buttons">
        <button onClick={() => handleDownload('csv')}>Download Attendees CSV</button>
        <button onClick={() => handleDownload('pdf')}>Download Attendees PDF</button>
      </div>

      <h3>📊 Event Summary Table</h3>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Bookings</th>
            <th>Seats Booked</th>
            <th>Attended</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((s, idx) => (
            <tr key={idx}>
              <td>{s.event}</td>
              <td>{s.total_bookings}</td>
              <td>{s.total_seats_booked}</td>
              <td>{s.total_attended}</td>
              <td>₹{s.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>📈 Visual Insights</h3>
      <div className="chart-section">
        <h4>Seats Booked</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="event" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_seats_booked" fill="#8884d8" name="Seats Booked" />
          </BarChart>
        </ResponsiveContainer>

        <h4>Attendance</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="event" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_attended" fill="#82ca9d" name="Attended" />
          </BarChart>
        </ResponsiveContainer>

        <h4>Revenue</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="event" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#ffc658" name="Revenue (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    </main>
    </div>
  );
};

export default ExportPage;
