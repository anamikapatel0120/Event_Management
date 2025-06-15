import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarPlus,
  Users,
  BarChart2,
  FileDown,
  User,
  LogOut,
} from "lucide-react";
import "../styles/OrganizerDashboard.css";

const navItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", path: "/organizer-dashboard" },
  { icon: <CalendarPlus />, label: "My Events", path: "/events" },
  { icon: <Users />, label: "Bookings", path: "/admin/attendees" },
  { icon: <BarChart2 />, label: "Stats & Analytics", path: "/analytics" },
  { icon: <FileDown />, label: "Export", path: "/export" },
  { icon: <User />, label: "Profile", path: "/organizer-profile" },
  { icon: <LogOut />, label: "Logout", path: "/logout" },
];

const OrganizerSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamically find active index based on current URL
  useEffect(() => {
    const currentIndex = navItems.findIndex(item =>
      location.pathname.startsWith(item.path)
    );
    setActiveIndex(currentIndex);
  }, [location]);

  const handleNavClick = (index, path) => {
    if (path === "/logout") {
      const confirmLogout = window.confirm("Are you sure you want to log out?");
      if (confirmLogout) {
        localStorage.removeItem("user");
        navigate("/");
      }
      return;
    }
    navigate(path);
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle Sidebar"
      >
        ☰
      </button>
      <h2>🔶 Organizer</h2>
      <nav>
        <ul className="nav-list2">
          {navItems.map((item, index) => (
            <li
              key={index}
              className={`nav-link ${activeIndex === index ? "active" : ""}`}
              onClick={() => handleNavClick(index, item.path)}
              style={{ cursor: "pointer" }}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default OrganizerSidebar;
