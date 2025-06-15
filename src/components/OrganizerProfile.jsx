import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/OrganizerProfile.css';
import OrganizerSidebar from './OrganizerSidebar';

const OrganizerProfile = () => {
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);

  const token = JSON.parse(localStorage.getItem('user'))?.token;
  console.log(token);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/organizer/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setForm(res.data);
    } catch (err) {
      console.error('Profile load error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await axios.put('http://localhost:5000/api/organizer/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Profile updated');
      fetchProfile();
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update profile');
    }
  };

  return (
     <div className="dashboard-container">
      <OrganizerSidebar />
      <main className="dashboard-content">
    <div className="ProfilePage">
      <div className="profile-container">
        
        <div className="profile-left">
          <h2>👤 My Profile</h2>
          <img
            src={
              profile.profile_picture
                ? `http://localhost:5000/uploads/${profile.profile_picture}`
                : '/default-profile.png'
            }
            alt="Organizer"
            className="profile-pic"
          />
          <h3>{profile.name}</h3>
          <p>{profile.email}</p>
          {/* <p>{profile.organization}</p> */}
        </div>

        <div className="profile-right">
          <h2>Edit Profile</h2>
          <input type="file" onChange={handleImageChange} />
          <input name="name" value={form.name || ''} onChange={handleChange} placeholder="Name" />
          <input name="email" value={form.email || ''} onChange={handleChange} placeholder="Email" />
          {/* <input name="organization" value={form.organization || ''} onChange={handleChange} placeholder="Organization" /> */}
          <input name="password" type="password" onChange={handleChange} placeholder="New Password (optional)" />
          <button onClick={handleSubmit}>Update Profile</button>
        </div>
      </div>
    </div>
    </main>
    </div>
  );
};

export default OrganizerProfile;
