// import React, { useState } from "react";
// import {
//   LayoutDashboard,
//   CalendarPlus,
//   Users,
//   BarChart2,
//   FileDown,
//   User,
//   LogOut,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import '../styles/OrganizerDashboard.css';
// import DashboardOverview from '../components/DashboardOverview';
// import { useParams } from "react-router-dom";

// const OrganizerDashboard = () => {
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const navigate = useNavigate();
//   const { eventId } = useParams();
  
//   const navItems = [
//   { icon: <LayoutDashboard />, label: "Dashboard", path: "/organizer-dashboard" },
//   { icon: <CalendarPlus />, label: "My Events", path: "/events" },
//   { icon: <Users />, label: "Bookings", path:  "/admin/attendees" },
//   { icon: <BarChart2 />, label: "Stats & Analytics", path: "/analytics" },
//   { icon: <FileDown />, label: "Export", path: "/export" },
//   { icon: <User />, label: "Profile", path: "/organizer-profile" },
//   { icon: <LogOut />, label: "Logout", path: "/logout" },
// ];

//   const handleNavClick = (index, path) => {
//     setActiveIndex(index);
//     if (path === '/logout') {
//       const confirmLogout = window.confirm('Are you sure you want to log out?');

//       if (confirmLogout) {
//         localStorage.removeItem('user');
//         navigate('/');
//       }

//       return; // Do nothing if user cancels
//     }
//     navigate(path);
//   };

//   return (
//     <div className="dashboard-container">
//       <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
//         <button
//           className="sidebar-toggle"
//           aria-label="Toggle Sidebar"
//           onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//         >
//           ☰
//         </button>

//         <h2>🔶 Organizer</h2>

//         <nav>
//           <ul className="nav-list2">
//             {navItems.map((item, index) => (
//               <li
//                 key={index}
//                 className={`nav-link ${activeIndex === index ? 'active' : ''}`}
//                 onClick={() => handleNavClick(index, item.path)}
//                 style={{ cursor: "pointer" }}
//               >
//                 <span className="icon">{item.icon}</span>
//                 <span className="label">{item.label}</span>
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </aside>

//       {/* <main className="dashboard-content"> */}
//         <DashboardOverview />
//       {/* </main> */}
//     </div>
//   );
// };

// export default OrganizerDashboard;





import React, { useEffect, useState } from "react";
import '../styles/OrganizerDashboard.css';
import '../styles/DashboardOverview.css';
import OrganizerSidebar from "../components/OrganizerSidebar";

const OrganizerDashboard = () => {
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

  return (
    <div className="dashboard-container">
      <OrganizerSidebar />
      <main className="dashboard-content">

      <div className="dashboard-overview">
        {loading ? (
          <div>Loading organizer dashboard...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <h2>Organizer Dashboard Overview</h2>

            <h3>Total Events Created: {data.totalEvents}</h3>

            <h3>Event Stats</h3>
            <ul>
              {data.events?.map((event) => (
                <li key={event.id}>
                  <strong>{event.name}</strong> | Seats Booked: {event.seats_booked} / {event.seats_total}
                  <p>
                    <strong>Event Scheduled:</strong>{" "}
                    {event.event_date
                      ? new Date(event.event_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}{" "}
                    at {event.start_time ? event.start_time.slice(0, 5) : "N/A"}
                  </p>
                  {event.mode === "online" && event.link && (
                    <p>
                      <strong>Link:</strong>{" "}
                      <a href={event.link} target="_blank" rel="noreferrer">
                        {event.link}
                      </a>
                    </p>
                  )}
                </li>
              ))}
            </ul>

            <h3>Total Bookings: {data.totalBookings}</h3>
            <h3>Total Revenue: ₹{data.totalRevenue}</h3>
            <h3>Total Tickets Issued: {data.totalTickets}</h3>
          </>
        )}
      </div>
      </main>
    </div>
  );
};

export default OrganizerDashboard;
