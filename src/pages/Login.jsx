import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

export default function Login() {
  const [emailOrName, setEmailOrName] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await fetch('http://localhost:5000/api/login', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ emailOrName, role, password })
  //     });

  //     const contentType = res.headers.get('content-type');
  //     if (!res.ok || !contentType.includes('application/json')) {
  //       throw new Error('Invalid response from server');
  //     }

  //     const data = await res.json();
  //       if (data.success) {
  //         localStorage.setItem('user', JSON.stringify({ id: data.id, role: data.role, email: data.email }));
  //         console.log("Logged in user:", { id: data.id, role: data.role, email: data.email });

  //         navigate(role === 'user' ? '/user-dashboard' : '/organizer-dashboard');
  //       }else {
  //       alert(data.message || 'Login failed');
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert('Something went wrong. Please try again.');
  //   }
  // };


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrName, role, password })
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
      }

      const data = await res.json();

      if (data.success) {
        // Store user info and JWT token in localStorage
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: data.id,
            role: data.role,
            email: data.email,
            token: data.token, // ✅ IMPORTANT
          })
        );

        console.log("Logged in user:", {
          id: data.id,
          role: data.role,
          email: data.email,
          token: data.token,
        });

        // Navigate based on role
        navigate(role === 'user' ? '/user-dashboard' : '/organizer-dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Please use valid credentials.');
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>

        <label htmlFor="emailOrName">Name or Email</label>
        <input
          type="text"
          id="emailOrName"
          name="emailOrName"
          placeholder="Name or Email"
          autoComplete="username"
          value={emailOrName}
          onChange={(e) => setEmailOrName(e.target.value)}
          required
        />

        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="user">Attendee</option>
          <option value="organizer">Organizer</option>
        </select>

        <label htmlFor="password">Password</label>
        <div className="password-container">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="toggle-visibility"
            role="button"
            tabIndex={0}
            onClick={togglePasswordVisibility}
            onKeyDown={(e) => e.key === 'Enter' && togglePasswordVisibility()}
            aria-label="Toggle password visibility"
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>
        <p className="forgot-password">
          <span className="link" onClick={() => navigate('/forgot-password')}>
            Forgot Password?
          </span>
        </p>
        <button type="submit">Login</button>
        <p>
          Don’t have an account?{' '}
          <span className="link" onClick={() => navigate('/register')}>
            Register
          </span>
        </p>
      </form>
    </div>
  );
}

