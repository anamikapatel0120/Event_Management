import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const HomeBox = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-box">
        <h1 className="home-title">Event Management & Ticketing Platform</h1>
        <div className="home-buttons">
          <button className="home-btn login-btn" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="home-btn register-btn" onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeBox;
