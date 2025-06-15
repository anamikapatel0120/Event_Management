import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import UserDashboard from "./pages/UserDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import BrowseEvents from './pages/BrowseEvents';
import BookTicket from './pages/BookTicket';
// import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import EventManagement from './pages/EventManagement';
import AttendeesManagement from './pages/AttendeesManagement';
import Stats from './pages/Stats';
import ExportPage from './components/ExportPage';
import OrganizerProfile from './components/OrganizerProfile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/organizer-dashboard/*" element={<OrganizerDashboard />} />
        <Route path="/browse-events" element={<BrowseEvents />} />
        <Route path="/book-ticket/:eventId" element={<BookTicket />} />
        {/* <Route path="/user-dashboard" element={<MyBookings />} /> */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/events" element={<EventManagement />} />
        <Route path="/admin/attendees" element={<AttendeesManagement />} />
        <Route path="/analytics" element={<Stats />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/organizer-profile" element={<OrganizerProfile />} />

      </Routes>
    </Router>
  );
}

export default App;
