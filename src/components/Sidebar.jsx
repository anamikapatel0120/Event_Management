import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  PartyPopper,
  User,
  LogOut
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = (e) => {
    e.preventDefault(); // Prevent default NavLink behavior
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <button
        className="sidebar-toggle"
        aria-label="Toggle Sidebar"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        ☰
      </button>

      <div className="sidebar-header">
        <h1 className="logo">🎟️ AttendeeDash</h1>
      </div>

      <nav className="nav-links">
        <ul>
          <li>
            <NavLink to="/user-dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              <CalendarCheck size={18} className="icon" />
              <span className="label">My Bookings</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/browse-events" className={({ isActive }) => isActive ? 'active' : ''}>
              <PartyPopper size={18} className="icon" />
              <span className="label">Browse Events</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
              <User size={18} className="icon" />
              <span className="label">Profile</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login"
              onClick={handleLogoutClick}
              className="logout"
            >
              <LogOut size={18} className="icon" />
              <span className="label">Logout</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
