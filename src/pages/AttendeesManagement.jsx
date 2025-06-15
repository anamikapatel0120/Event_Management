// // File: frontend/src/pages/AttendeesManagement.js
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import '../styles/AttendeesManagement.css';
// import { useParams } from 'react-router-dom'; 

// const AttendeesManagement = () => {
//   const { eventId } = useParams();
//   const [list, setList] = useState([]);
//   const [search, setSearch] = useState('');

// //   const fetchList = () => {
// //     axios.get(`/api/admin/attendees/${eventId}`)
// //       .then(res => setList(res.data))
// //       .catch(err => console.error(err));
// //   };

// //   const cancelBooking = (id) => {
// //     axios.post(`/api/admin/cancel-booking/${id}`)
// //       .then(() => fetchList())
// //       .catch(err => console.error(err));
// //   };

// const fetchList = () => {
//   const userData = JSON.parse(localStorage.getItem('user'));
//   const token = userData?.token;

//   console.log('Fetched token:', token); // ✅ Should now show a real token
//   console.log('Using eventId:', `${eventId}`);

//   axios
//     .get(`/api/admin/attendees/${eventId}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//     .then(res => setList(res.data))
//     .catch(err => console.error(err));
// };


// const cancelBooking = (id) => {
//   if (window.confirm('Are you sure you want to cancel and refund this booking?')) {
//     const userData = JSON.parse(localStorage.getItem('user'));
//   const token = userData?.token;

//     // const token = localStorage.getItem('token');
//     axios
//       .post(`/api/admin/cancel-booking/${id}`, null, {
//         headers: { Authorization: `Bearer ${token}` }
//       })
//       .then(() => fetchList())
//       .catch(err => console.error(err));
//   }
// };

//   useEffect(fetchList, [eventId]);

//   const filtered = list.filter(a =>
//     a.name.toLowerCase().includes(search.toLowerCase()) ||
//     a.email.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="attendees-container">
//       <h2>Attendees Management</h2>

//       <input
//         type="text"
//         placeholder="Search by name or email..."
//         value={search}
//         onChange={e => setSearch(e.target.value)}
//       />

//       <table className="attendees-table">
//         <thead>
//           <tr>
//             <th>Name</th><th>Email</th><th>Seats</th>
//             <th>Booked At</th><th>Status</th><th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filtered.map(a => (
//             <tr key={a.id}>
//               <td>{a.name}</td>
//               <td>{a.email}</td>
//               <td>{a.seats}</td>
//               <td>{new Date(a.booking_time).toLocaleString()}</td>
//               <td className={a.status === 'cancelled' ? 'cancelled' : 'active'}>
//                 {a.status}
//               </td>
//               <td>
//                 {a.status === 'active' && (
//                   <button onClick={() => cancelBooking(a.id)}>Cancel & Refund</button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default AttendeesManagement;






// File: frontend/src/pages/AttendeesManagement.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AttendeesManagement.css';
import OrganizerSidebar from '../components/OrganizerSidebar';

const AttendeesManagement = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');

  const fetchList = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = userData?.token;

    console.log('Fetched token:', token);

    axios
      .get('/api/admin/attendees', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setList(res.data))
      .catch(err => console.error(err));
  };

  const cancelBooking = (id) => {
    if (window.confirm('Are you sure you want to cancel and refund this booking?')) {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?.token;

      axios
        .post(`/api/admin/cancel-booking/${id}`, null, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => fetchList())
        .catch(err => console.error(err));
    }
  };

  useEffect(fetchList, []);

  const filtered = list.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
     <div className="dashboard-container">
      <OrganizerSidebar />
      <main className="dashboard-content">
    <div className="attendees-container">
      <h2>Attendees Management</h2>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <table className="attendees-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Seats</th><th>Event</th>
            <th>Booked At</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(a => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.email}</td>
              <td>{a.seats}</td>
              <td>{a.event_title}</td>
              <td>{new Date(a.booking_time).toLocaleString()}</td>
              <td className={a.status === 'cancelled' ? 'cancelled' : 'active'}>
                {a.status}
              </td>
              <td>
                {a.status === 'active' && (
                  <button onClick={() => cancelBooking(a.id)}>Cancel & Refund</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </main>
    </div>
  );
};

export default AttendeesManagement;
