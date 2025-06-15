import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Success.css';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { qr, bookingId } = location.state || {};

  return (
    <div className="success-container">
      <div className="success-card">
        <h2>🎉 Booking Confirmed!</h2>
        <p>Your ticket has been successfully booked.</p>
        <p><strong>Booking ID:</strong> #{bookingId}</p>

        {qr && (
          <div className="qr-container">
            <img src={qr} alt="QR Code" />
            <p>Show this QR at the event entrance</p>
          </div>
        )}

        <button onClick={() => navigate('/user-dashboard')}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Success;
