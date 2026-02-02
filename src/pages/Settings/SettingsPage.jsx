import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { roiAPI, userAPI } from '../../Apis/api';
import toast from 'react-hot-toast';
import {
  User,
  Lock,
  Bell,
  Shield,
  Moon,
  Sun,
  Save,
  Eye,
  EyeOff,
  Percent,
  TrendingUp,
} from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [roiLoading, setRoiLoading] = useState(false);
  const [currentRoi, setCurrentRoi] = useState(null);
  const [roiData, setRoiData] = useState({
    rate: '',
    isActive: true,
  });
  
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    transactionAlerts: true,
    userSignups: true,
    securityAlerts: true,
  });

  // Fetch current ROI on mount
  useEffect(() => {
    fetchCurrentRoi();
  }, []);

  const fetchCurrentRoi = async () => {
    try {
      const response = await roiAPI.getRoi();
      setCurrentRoi(response.data);
      setRoiData({
        rate: response.data.rate || '',
        isActive: response.data.isActive !== false,
      });
    } catch (error) {
      console.log('No active ROI found');
    }
  };

  const handleRoiUpdate = async (e) => {
    e.preventDefault();
    if (!roiData.rate || isNaN(roiData.rate)) {
      toast.error('Please enter a valid ROI rate');
      return;
    }

    setRoiLoading(true);
    try {
      await roiAPI.setRoi({
        rate: parseFloat(roiData.rate),
        isActive: roiData.isActive,
      });
      toast.success('ROI updated successfully');
      fetchCurrentRoi();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update ROI');
    } finally {
      setRoiLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateUser(user?._id, profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await userAPI.updatePassword(user?._id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'roi', label: 'ROI Settings', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64 bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-800/50 h-fit">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-red-500/10 text-white border border-red-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/50">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                {/* Avatar */}
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-red-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                    {user?.fullName?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{user?.fullName || 'Admin'}</h3>
                    <p className="text-gray-400 text-sm">{user?.role || 'Administrator'}</p>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200"
                >
                  <Lock className="w-5 h-5" />
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
              <div className="space-y-4 max-w-lg">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates about your account' },
                  { key: 'transactionAlerts', label: 'Transaction Alerts', description: 'Get notified when new transactions are submitted' },
                  { key: 'userSignups', label: 'New User Signups', description: 'Get notified when new users register' },
                  { key: 'securityAlerts', label: 'Security Alerts', description: 'Receive alerts about security events' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-[#141414] rounded-xl"
                  >
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notifications[item.key] ? 'bg-red-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notifications[item.key] ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROI Settings Tab */}
          {activeTab === 'roi' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">ROI Settings</h2>
              
              {/* Current ROI Display */}
              {currentRoi && (
                <div className="mb-8 p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Current Active ROI Rate</p>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-bold text-white">{currentRoi.rate}</span>
                        <span className="text-2xl text-red-400">%</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-2">
                        Last updated: {new Date(currentRoi.updatedAt || currentRoi.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-4 bg-red-500/20 rounded-2xl">
                      <TrendingUp className="w-10 h-10 text-red-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Update ROI Form */}
              <form onSubmit={handleRoiUpdate} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ROI Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={roiData.rate}
                      onChange={(e) => setRoiData({ ...roiData, rate: e.target.value })}
                      className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="Enter ROI percentage (e.g., 5)"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Percent className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    This rate will be applied to users&apos; Apex Coins when they claim ROI
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl">
                  <div>
                    <p className="text-white font-medium">Active Status</p>
                    <p className="text-gray-400 text-sm">Enable or disable ROI claims</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRoiData({ ...roiData, isActive: !roiData.isActive })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      roiData.isActive ? 'bg-red-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        roiData.isActive ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={roiLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {roiLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Update ROI</span>
                    </>
                  )}
                </button>
              </form>

              {/* Info Box */}
              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h4 className="text-blue-400 font-medium mb-2">How ROI Works</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Users with more than 50 Apex Coins can claim ROI</li>
                  <li>• ROI is calculated as: (Apex Coins × Rate) / 100</li>
                  <li>• The ROI amount is added to the user&apos;s Apex Coins balance</li>
                  <li>• Setting a new ROI creates a new record; previous rates are preserved</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
