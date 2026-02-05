import { useState, useEffect } from 'react';
import { userAPI } from '../../Apis/api';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  X,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Coins,
} from 'lucide-react';

const UserModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-lg border border-gray-800/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <h3 className="text-xl font-semibold text-white">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* User Avatar and Name */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h4 className="text-xl font-semibold text-white">{user.fullName}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  user.role === 'admin' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role}
                </span>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  user.isActive 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                {user.isVerified && (
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </div>
              <p className="text-white font-medium truncate">{user.email}</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">Phone</span>
              </div>
              <p className="text-white font-medium">{user.phoneNumber}</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">CNIC</span>
              </div>
              <p className="text-white font-medium">{user.cnic}</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <Coins className="w-4 h-4" />
                <span className="text-sm">Apex Coins</span>
              </div>
              <p className="text-white font-medium">{user.apexCoins || 0}</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <Coins className="w-4 h-4" />
                <span className="text-sm">Locked Coins</span>
              </div>
              <p className="text-emerald-400 font-medium">{user.lockedApexCoins || 0}</p>
            </div>

            {user.referralCode && (
              <div className="bg-[#141414] rounded-xl p-4">
                <div className="flex items-center space-x-3 text-gray-400 mb-2">
                  <span className="text-sm">Referral Code</span>
                </div>
                <p className="text-white font-medium font-mono">{user.referralCode}</p>
              </div>
            )}

            <div className="bg-[#141414] rounded-xl p-4 sm:col-span-2">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Member Since</span>
              </div>
              <p className="text-white font-medium">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Locked Entries Section */}
          {user.roiData?.lockedEntries && user.roiData.lockedEntries.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-4">Locked Coins Entries</h4>
              <div className="space-y-3">
                {user.roiData.lockedEntries.map((entry, index) => (
                  <div key={entry.entryId} className="bg-[#141414] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-400">Lock #{index + 1}</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        entry.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : entry.status === 'unlock-pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white ml-2 font-medium">{entry.amount.toLocaleString()} AC</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Days Elapsed:</span>
                        <span className="text-white ml-2 font-medium">{entry.daysElapsed}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Monthly Profit:</span>
                        <span className="text-emerald-400 ml-2 font-medium">${entry.monthlyProfit}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Total Profit:</span>
                        <span className="text-emerald-400 ml-2 font-medium">${entry.totalProfit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-red-500/10 rounded-xl p-4">
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Locked Amount:</span>
                    <span className="text-white font-semibold">{user.roiData.totalLockedAmount.toLocaleString()} AC</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Current ROI Rate:</span>
                    <span className="text-red-400 font-semibold">{user.currentRoiRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await userAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      setUsers(users.filter((u) => u._id !== userId));
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Failed to delete user:', error);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await userAPI.updateUser(userId, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      setUsers(users.map((u) => 
        u._id === userId ? { ...u, isActive: !currentStatus } : u
      ));
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Failed to update user:', error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber?.includes(searchQuery);

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive) ||
      (filterStatus === 'admin' && user.role === 'admin');

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Users Management</h1>
          <p className="text-gray-400 mt-1">Manage and monitor all platform users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#1a1a1a] border border-gray-800 rounded-xl pl-12 pr-8 py-3 text-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer transition-colors"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">User</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Contact</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Coins</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Status</th>
                <th className="text-right text-gray-400 font-medium px-6 py-4 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-800/30 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white font-semibold">
                          {user.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.fullName}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-lg ${
                            user.role === 'admin' 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm">{user.email}</p>
                      <p className="text-gray-400 text-sm">{user.phoneNumber}</p>
                    </td>
                    {/* <td className="px-6 py-4 text-gray-300 text-sm">{user.apexCoins || 0}</td> */}
                    <td className="px-6 py-4">
                      <span className="text-red-400 font-semibold">{user.apexCoins || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        user.isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive
                              ? 'text-yellow-400 hover:bg-yellow-500/10'
                              : 'text-green-400 hover:bg-green-500/10'
                          }`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default UsersPage;
