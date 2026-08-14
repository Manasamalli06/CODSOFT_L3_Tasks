import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiMapPin, FiLock, FiCalendar } from 'react-icons/fi';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Address states
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  const [createdAt, setCreatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authAPI.getProfile();
        const profile = data.data;
        
        setName(profile.name || '');
        setEmail(profile.email || '');
        setCreatedAt(profile.createdAt);
        
        if (profile.address) {
          setStreet(profile.address.street || '');
          setCity(profile.address.city || '');
          setState(profile.address.state || '');
          setZipCode(profile.address.zipCode || '');
          setCountry(profile.address.country || '');
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        name,
        email,
        address: {
          street,
          city,
          state,
          zipCode,
          country,
        }
      };

      if (password) {
        updateData.password = password;
      }

      const { data } = await authAPI.updateProfile(updateData);
      
      // Update context and localStorage so UI updates immediately (no page reload needed)
      updateUser(data.data);
      toast.success('Profile updated successfully! 🎉');
      setPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="container page-wrapper" id="profile-page">
      <div className="section-header">
        <span className="section-tag">Account Settings</span>
        <h1 className="section-title">My Profile</h1>
      </div>

      <div className="profile-layout">
        {/* Sidebar Info Card */}
        <aside className="profile-sidebar card">
          <div className="profile-avatar-placeholder">
            <FiUser />
          </div>
          <h2 className="profile-name-display">{name}</h2>
          <p className="profile-role-display">{user?.role?.toUpperCase()}</p>
          
          <div className="profile-meta-list">
            <div className="profile-meta-item">
              <FiMail className="meta-icon" />
              <span>{email}</span>
            </div>
            {createdAt && (
              <div className="profile-meta-item">
                <FiCalendar className="meta-icon" />
                <span>Joined {new Date(createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Main Update Form */}
        <div className="profile-main card">
          <h3 className="profile-section-title">Update Information</h3>
          
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-fields-grid">
              
              {/* Basic Info */}
              <div className="form-group col-span-full">
                <h4 className="sub-section-title"><FiUser /> Personal Details</h4>
              </div>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Security */}
              <div className="form-group col-span-full" style={{ marginTop: '16px' }}>
                <h4 className="sub-section-title"><FiLock /> Security (Optional)</h4>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Leave blank to keep current"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="form-group col-span-full" style={{ marginTop: '16px' }}>
                <h4 className="sub-section-title"><FiMapPin /> Default Shipping Address</h4>
              </div>

              <div className="form-group col-span-full">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State / Province</label>
                <input
                  type="text"
                  className="form-input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal / ZIP Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

            </div>

            <div className="profile-actions">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg save-profile-btn"
                disabled={updating}
              >
                {updating ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
