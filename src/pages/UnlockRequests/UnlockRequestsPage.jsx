import { useState, useEffect } from 'react';
import { userAPI } from '../../Apis/api';
import toast from 'react-hot-toast';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Coins,
  Calendar,
  TrendingDown,
  Loader2,
} from 'lucide-react';

const UnlockRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchPendingUnlocks();
  }, []);

  const fetchPendingUnlocks = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getPendingUnlocks();
      setRequests(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch unlock requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, entryId) => {
    try {
      setProcessing(entryId);
      const response = await userAPI.approveUnlock({ userId, entryId });
      toast.success(response.data.message || 'Unlock approved successfully');
      fetchPendingUnlocks(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve unlock');
    } finally {
      setProcessing(null);
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
          <h1 className="text-3xl font-bold text-white">Unlock Requests</h1>
          <p className="text-gray-400 mt-1">Manage pending unlock requests from users</p>
        </div>
        <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl font-semibold">
          {requests.length} Pending
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-2xl p-12 text-center border border-gray-800/50">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Pending Requests</h3>
          <p className="text-gray-400">All unlock requests have been processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.entryId}
              className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800/50 hover:border-red-500/30 transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* User Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <User className="w-4 h-4" />
                    <span>User Information</span>
                  </div>
                  <p className="text-white font-semibold">{request.userName}</p>
                  <p className="text-gray-400 text-sm">{request.userEmail}</p>
                </div>

                {/* Lock Details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Coins className="w-4 h-4" />
                    <span>Lock Details</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Original:</span>
                      <span className="text-white font-semibold">{request.originalAmount.toLocaleString()} AC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Days Locked:</span>
                      <span className="text-emerald-400 font-semibold">{request.daysElapsedAtRequest}</span>
                    </div>
                  </div>
                </div>

                {/* Penalty Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <TrendingDown className="w-4 h-4" />
                    <span>Penalty Details</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Penalty:</span>
                      <span className="text-red-400 font-semibold">{request.penaltyPercentage}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Deducted:</span>
                      <span className="text-red-400 font-semibold">-{request.penaltyAmount.toLocaleString()} AC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">User Gets:</span>
                      <span className="text-emerald-400 font-semibold">{request.amountAfterPenalty.toLocaleString()} AC</span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Processing</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">
                      Requested: {formatDate(request.requestedAt)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Process After: {formatDate(request.processAfter)}
                    </div>
                    {request.canApprove ? (
                      <button
                        onClick={() => handleApprove(request.userId, request.entryId)}
                        disabled={processing === request.entryId}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {processing === request.entryId ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Processing Period</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnlockRequestsPage;
