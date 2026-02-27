import { useState, useEffect } from 'react';
import { withdrawalAPI } from '../../Apis/api';
import toast from 'react-hot-toast';
import {
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  User,
  DollarSign,
  Calendar,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  ArrowUpRight,
} from 'lucide-react';

const WithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await withdrawalAPI.getAllWithdrawals();
      setWithdrawals(response.data.data?.withdrawals || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (withdrawalId, status, rejectionReason = null, transactionID = null) => {
    try {
      setProcessing(withdrawalId);
      const payload = { status };
      if (rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }
      if (transactionID) {
        payload.transactionId = transactionID;
      }
      const response = await withdrawalAPI.updateWithdrawalStatus(withdrawalId, payload);
      toast.success(response.data.message || `Withdrawal ${status} successfully`);
      fetchWithdrawals(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status} withdrawal`);
    } finally {
      setProcessing(null);
    }
  };

  const handleMarkAsProcessing = (withdrawalId) => {
    if (window.confirm('Mark this withdrawal as processing?')) {
      handleUpdateStatus(withdrawalId, 'processing');
    }
  };

  const handleApprove = (withdrawalId) => {
    const transactionID = window.prompt('Enter the Transaction ID for this withdrawal approval:');
    if (transactionID === null) return; // cancelled
    if (!transactionID.trim()) {
      toast.error('Transaction ID is required to approve a withdrawal');
      return;
    }
    handleUpdateStatus(withdrawalId, 'completed', null, transactionID.trim());
  };

  const handleReject = (withdrawalId) => {
    const reason = window.prompt('Please enter rejection reason:');
    if (reason && reason.trim()) {
      handleUpdateStatus(withdrawalId, 'rejected', reason.trim());
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        icon: Clock,
        label: 'Pending'
      },
      processing: {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        icon: Loader2,
        label: 'Processing'
      },
      completed: {
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-400',
        icon: CheckCircle,
        label: 'Completed'
      },
      rejected: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        icon: XCircle,
        label: 'Rejected'
      }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <div className={`${badge.bg} ${badge.text} px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1`}>
        <Icon className="w-4 h-4" />
        <span>{badge.label}</span>
      </div>
    );
  };

  const getNetworkBadge = (network) => {
    const colors = {
      BEP20: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      TRC20: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${colors[network] || colors.BEP20}`}>
        {network}
      </span>
    );
  };

  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;
    const matchesSearch = 
      withdrawal.withdrawalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    completed: withdrawals.filter(w => w.status === 'completed').length,
    rejected: withdrawals.filter(w => w.status === 'rejected').length,
    totalAmount: withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0),
    pendingAmount: withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + (w.amount || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Withdrawal Requests</h1>
          <p className="text-gray-400 mt-1">Manage user withdrawal requests</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl font-semibold">
            {stats.pending} Pending
          </div>
          <div className="bg-gray-800/50 text-gray-300 px-4 py-2 rounded-xl font-semibold">
            ${typeof stats.pendingAmount === 'number' ? stats.pendingAmount.toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-white mt-1">${typeof stats.totalAmount === 'number' ? stats.totalAmount.toFixed(2) : '0.00'}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, user, email, or wallet address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-800/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-[#1a1a1a] border border-gray-800/50 rounded-xl text-white focus:outline-none focus:border-red-500/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Withdrawals List */}
      {filteredWithdrawals.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-2xl p-12 text-center border border-gray-800/50">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Withdrawals Found</h3>
          <p className="text-gray-400">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'No withdrawal requests yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWithdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800/50 hover:border-red-500/30 transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* User Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                    <User className="w-4 h-4" />
                    <span>User Information</span>
                  </div>
                  <p className="text-white font-semibold">{withdrawal.user?.fullName || 'N/A'}</p>
                  <p className="text-gray-400 text-sm">
                    {withdrawal.user?.email && withdrawal.user.email.length > 25
                      ? `${withdrawal.user.email.slice(0, 4)}...${withdrawal.user.email.slice(-6)}`
                      : withdrawal.user?.email || 'N/A'}
                  </p>
                  <p className="text-gray-500 text-xs font-mono">{withdrawal.withdrawalId}</p>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Amount</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-400">${withdrawal.amountAfterFee?.toFixed(2)}</p>
                  <div>{getStatusBadge(withdrawal.status)}</div>
                </div>

                {/* Wallet Details */}
                <div className="space-y-2 lg:col-span-2">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                    <Wallet className="w-4 h-4" />
                    <span>Wallet Details</span>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-left space-x-2">
                      <span className="text-gray-400 text-sm">Network:</span>
                      {getNetworkBadge(withdrawal.network)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">Address:</span>
                      <code className="text-xs text-gray-300 font-mono bg-gray-800 px-2 py-1 rounded break-all">
                        {withdrawal.walletAddress}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(withdrawal.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 ">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Actions</span>
                  </div>
                  {withdrawal.status === 'pending' ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleMarkAsProcessing(withdrawal.id)}
                        disabled={processing === withdrawal.id}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {processing === withdrawal.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            <span>Start Processing</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleApprove(withdrawal.id)}
                        disabled={processing === withdrawal.id}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {processing === withdrawal.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(withdrawal.id)}
                        disabled={processing === withdrawal.id}
                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : withdrawal.status === 'rejected' && withdrawal.rejectionReason ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                      <p className="text-xs text-red-400 font-medium mb-1">Rejection Reason:</p>
                      <p className="text-xs text-gray-300">{withdrawal.rejectionReason}</p>
                    </div>
                  ) : withdrawal.status === 'completed' ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                      <p className="text-xs text-emerald-400 font-medium">Completed</p>
                      {withdrawal.transactionId && (
                        <div className="mt-2 bg-gray-900/50 rounded-lg p-2 text-left">
                          <p className="text-xs text-gray-400 mb-1">Transaction ID:</p>
                          <p className="text-xs text-gray-200 font-mono break-all">{withdrawal.transactionId}</p>
                        </div>
                      )}
                      {withdrawal.processedAt && (
                        <p className="text-xs text-gray-400 mt-1">{formatDate(withdrawal.processedAt)}</p>
                      )}
                    </div>
                  ) : withdrawal.status === 'processing' ? (
                    <div className="space-y-2">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center mb-2">
                        <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-1 animate-spin" />
                        <p className="text-xs text-blue-400 font-medium">Processing</p>
                      </div>
                      <button
                        onClick={() => handleApprove(withdrawal.id)}
                        disabled={processing === withdrawal.id}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {processing === withdrawal.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Completing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Mark Complete</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 font-medium">Unknown Status</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WithdrawalsPage;
