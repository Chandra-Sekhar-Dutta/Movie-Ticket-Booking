import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Loading } from '../components/UIElements';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Update formData when user changes
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [isAuthenticated, user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-light dark:bg-gray-900 flex items-center justify-center">
        <Loading text="Loading profile..." />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    // TODO: Implement profile update
    try {
      // await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light dark:bg-gray-900">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="container">
          <h1 className="text-4xl font-bold">My Profile</h1>
          <p className="text-gray-300 mt-2">Manage your account information</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Alerts */}
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

          {/* Profile Card */}
          <div className="card p-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-secondary text-white flex items-center justify-center text-3xl font-bold">
                {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">{user?.name || 'User'}</h2>
                <p className="text-gray-600">{user?.email || ''}</p>
                {user?.isAdmin && (
                  <span className="inline-block mt-2 px-3 py-1 bg-secondary text-white rounded-full text-xs font-bold">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-base pl-10 ${!isEditing ? 'bg-white' : ''}`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={true}
                    className="input-base pl-10 bg-white cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                    className={`input-base pl-10 ${!isEditing ? 'bg-white' : ''}`}
                  />
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">Account Information</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Account Type: {user.isAdmin ? 'Admin' : 'User'}</li>
                  <li>• Member since: {new Date(user.id).toLocaleDateString()}</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="loading-spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name,
                        email: user.email,
                        phone: user.phone || '',
                      });
                    }}
                    className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 card p-8 border-2 border-red-200 bg-red-50">
            <h3 className="text-xl font-bold text-red-900 mb-4">Danger Zone</h3>
            <p className="text-red-800 mb-4">
              Deleting your account is permanent and cannot be undone.
            </p>
            <button className="btn bg-red-600 text-white hover:bg-red-700">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
