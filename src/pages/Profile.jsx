import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Profile.css';
import Sidebar from '../components/Sidebar';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({});
  const [updateData, setUpdateData] = useState({ name: '', password: '', email: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserInfo(res.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    if (token) fetchUserData();
  }, [token]);

  const handleChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append('name', updateData.name);
    formData.append('password', updateData.password);
    formData.append('email', updateData.email);
    if (selectedImage) formData.append('image', selectedImage);

    try {
      await axios.put('http://localhost:5000/api/users/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Profile updated successfully!');
      setUpdateData({ name: '', password: '' });
      setSelectedImage(null);

      const updated = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserInfo(updated.data);
    } catch (err) {
      console.error('Update error:', err);
      alert('Update failed!');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <div className="ProfilePage">
        <div className="profile2-container">
          <div className="profile-left">
          <h2>👤 My Profile</h2>

            {/* <img
              src={
                selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : userInfo.profile_picture
                  ? `http://localhost:5000/${userInfo.profile_picture}`
                  : '/default-profile.png'
              }
              alt="Profile"
              className="profile-pic"
            /> */}
             <img
            src={
             userInfo.profile_picture
                ? `http://localhost:5000/uploads/${userInfo.profile_picture}`
                : '/default-profile.png'
            }
            alt="User"
            className="profile-pic"
          />
            <p><strong>Name:</strong> {userInfo.name || 'N/A'}</p>
            <p><strong>Email:</strong> {userInfo.email || 'N/A'}</p>
            <p><strong>Role:</strong> {userInfo.role || 'N/A'}</p>
          </div>

          <div className="profile-right">
            <h2>Edit Profile</h2>
            <input type="text" name="name" value={updateData.name} onChange={handleChange} placeholder="Enter new name" />
            <input type="text" name="email" value={updateData.email} onChange={handleChange} placeholder="Enter new email" />
            <input type="password" name="password" value={updateData.password} onChange={handleChange} placeholder="Enter new password" />
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button onClick={handleUpdate}>💾 Update</button>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

