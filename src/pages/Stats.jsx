import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import '../styles/Stats.css';
import OrganizerSidebar from '../components/OrganizerSidebar';

const Stats = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const token = storedUser?.token;

      if (!token) return;

      try {
        const res = await axios.get('http://localhost:5000/api/stats/event-insights', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
     <div className="dashboard-container">
      <OrganizerSidebar />
      <main className="dashboard-content">
    <div className="stats-container">
      <h2>📊 Event Insights</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="tickets_booked" fill="#8884d8" name="Tickets Booked" />
          <Bar dataKey={(entry) => entry.seats_total - entry.tickets_booked} fill="#82ca9d" name="Tickets Available" />
          <Bar dataKey="attendance" fill="#ffc658" name="Attendance" />
          <Bar dataKey="revenue" fill="#ff7f50" name="Revenue (₹)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    </main>
    </div>
  );
};

export default Stats;
