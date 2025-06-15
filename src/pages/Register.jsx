import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
// import defaultProfile from '../assets/default-profile.png';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    password: '',
    confirmPassword: '',
    profilePicture: null,
    showPassword: false
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, profilePicture: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const togglePasswordVisibility = () => {
    setFormData({ ...formData, showPassword: !formData.showPassword });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'confirmPassword' && key !== 'showPassword') {
        data.append(key, value || '');
      }
    });

    if (!formData.profilePicture) {
      data.append('useDefault', 'true');
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      if (result.success) {

        localStorage.setItem(
          'user',
          JSON.stringify({
            id: result.user.id,
            role: result.user.role,
            email: result.user.email,
            token: result.token,
          })
        );


        console.log("Logged in user:", {
          id: result.user.id,
          role: result.user.role,
          email: result.user.email,
          token: result.token,
        });

        navigate(`/${formData.role}-dashboard`);
      } else {
        alert(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        alert('This email is already registered. Please use another one.');
      } else if (err.response?.status === 400) {
        alert('Please fill all fields correctly.');
      } else {
        alert('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="register-container">

      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="user">Attendee</option>
          <option value="organizer">Organizer</option>
        </select>

        <div className="password-container">
          <label htmlFor="password">Password</label>
          <input
            type={formData.showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type={formData.showPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <span
            className="toggle-visibility"
            onClick={togglePasswordVisibility}
            role="button"
            aria-label="Toggle password visibility"
            tabIndex={0}
          >
            {formData.showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <label htmlFor="profilePicture" className="upload-label">
          Upload Profile Picture:
        </label>
        <input
          type="file"
          id="profilePicture"
          name="profilePicture"
          accept="image/*"
          onChange={handleChange}
        />

        <button type="submit">Register</button>
        <p>
          Already have an account?{' '}
          <span className="link" onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </form>

    </div>
  );
};

export default Register;
