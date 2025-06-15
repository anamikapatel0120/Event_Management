import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/ResetPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      setStatus(data.message || 'Check your email for reset link');
    } catch (err) {
      console.error(err);
      setStatus('Something went wrong.');
    }
  };

  return (
    <div className="forgot-container">
      <form className="forgot-form" onSubmit={handleForgotPassword}>
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
        {status && <p style={{ textAlign: 'center', marginTop: '10px', color: '#4a5568' }}>{status}</p>}
        <div className="link" onClick={() => navigate('/login')}>← Back to Login</div>
      </form>
    </div>
  );
}
