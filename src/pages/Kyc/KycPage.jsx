import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { kycAPI } from '../../Apis/api';
import {
  CheckCircle,
  Clock,
  Filter,
  IdCard,
  Loader2,
  Search,
  ShieldAlert,
  User,
  XCircle,
} from 'lucide-react';

const STATUS_META = {
  under_review: {
    label: 'Under Review',
    badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    icon: Clock,
  },
  verified: {
    label: 'Verified',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
    icon: XCircle,
  },
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const KycPage = () => {
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    underReview: 0,
    verified: 0,
    rejected: 0,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchKycRequests = async () => {
    try {
      setLoading(true);
      const response = await kycAPI.getAllKycRequests({ limit: 100 });
      const payload = response.data?.data || {};
      setRequests(payload.requests || []);
      setStats(
        payload.stats || {
          underReview: 0,
          verified: 0,
          rejected: 0,
          total: 0,
        }
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch KYC requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      if (!matchesStatus) return false;

      if (!normalizedSearch) return true;

      const fields = [
        request.fullName,
        request.idPassportNumber,
        request.user?.fullName,
        request.user?.email,
        request.user?.phoneNumber,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return fields.some((value) => value.includes(normalizedSearch));
    });
  }, [requests, statusFilter, searchTerm]);

  const handleReview = async (requestId, status) => {
    try {
      setProcessingId(requestId);

      const payload = { status };
      if (status === 'rejected') {
        const reason = window.prompt('Please provide a rejection reason:');
        if (!reason || !reason.trim()) {
          toast.error('Rejection reason is required');
          setProcessingId(null);
          return;
        }
        payload.rejectionReason = reason.trim();
      }

      const response = await kycAPI.reviewKycRequest(requestId, payload);
      toast.success(response.data?.message || `KYC ${status} successfully`);
      await fetchKycRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status} KYC request`);
    } finally {
      setProcessingId(null);
    }
  };

  const renderStatusBadge = (status) => {
    const meta = STATUS_META[status] || STATUS_META.under_review;
    const Icon = meta.icon;

    return (
      <span
        className={`inline-flex items-center space-x-2 border px-3 py-1 rounded-lg text-xs font-semibold ${meta.badgeClass}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{meta.label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">KYC Verification</h1>
          <p className="text-gray-400 mt-1">Review identity submissions and approve or reject requests.</p>
        </div>
        <button
          onClick={fetchKycRequests}
          className="px-4 py-2 rounded-xl bg-gray-800/70 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-white text-2xl font-bold mt-1">{stats.total || 0}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Under Review</p>
          <p className="text-yellow-300 text-2xl font-bold mt-1">{stats.underReview || 0}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Verified</p>
          <p className="text-emerald-300 text-2xl font-bold mt-1">{stats.verified || 0}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Rejected</p>
          <p className="text-red-300 text-2xl font-bold mt-1">{stats.rejected || 0}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute top-1/2 -translate-y-1/2 left-3" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, or ID number"
            className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#1a1a1a] text-white border border-gray-800/50 focus:outline-none focus:border-red-500/40"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-800/50 rounded-xl px-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-white py-3 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="under_review">Under Review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-2xl p-10 text-center">
          <ShieldAlert className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-white font-semibold">No KYC requests found</p>
          <p className="text-gray-400 text-sm mt-1">Try changing the status filter or search text.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-[#1a1a1a] border border-gray-800/50 rounded-2xl p-5 space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">{request.user?.fullName || request.fullName}</span>
                  </div>
                  <p className="text-sm text-gray-400">{request.user?.email || 'No email found'}</p>
                  <p className="text-sm text-gray-400">{request.user?.phoneNumber || 'No phone found'}</p>
                  <p className="text-sm text-gray-300">Submitted: {formatDate(request.submittedAt)}</p>
                </div>

                <div className="space-y-2">
                  {renderStatusBadge(request.status)}
                  <p className="text-xs text-gray-500">KYC ID: {request.id}</p>
                  <p className="text-xs text-gray-500">
                    User KYC Flag: {request.user?.isKycVerified ? 'true' : 'false'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/70">
                  <div className="flex items-center gap-2 mb-2">
                    <IdCard className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-200 font-medium">Identity Details</p>
                  </div>
                  <p className="text-sm text-gray-400">Full Legal Name</p>
                  <p className="text-white mb-3">{request.fullName}</p>
                  <p className="text-sm text-gray-400">ID / Passport Number</p>
                  <p className="text-white break-all">{request.idPassportNumber}</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/70">
                  <p className="text-gray-200 font-medium mb-3">ID Documents</p>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={request.idFrontImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block border border-gray-700 rounded-lg overflow-hidden bg-black/30 hover:border-red-500/50 transition-colors"
                    >
                      <img src={request.idFrontImageUrl} alt="Front ID" className="w-full h-28 object-cover" />
                      <p className="text-xs text-gray-300 px-2 py-1">Front of ID</p>
                    </a>
                    <a
                      href={request.idBackImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block border border-gray-700 rounded-lg overflow-hidden bg-black/30 hover:border-red-500/50 transition-colors"
                    >
                      <img src={request.idBackImageUrl} alt="Back ID" className="w-full h-28 object-cover" />
                      <p className="text-xs text-gray-300 px-2 py-1">Back of ID</p>
                    </a>
                  </div>
                </div>
              </div>

              {request.status === 'rejected' && request.rejectionReason ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-300 text-sm font-medium">Rejection reason</p>
                  <p className="text-gray-200 text-sm mt-1">{request.rejectionReason}</p>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-xs text-gray-500">
                  Reviewed at: {formatDate(request.reviewedAt)}
                  {request.reviewedByUser?.fullName ? ` by ${request.reviewedByUser.fullName}` : ''}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReview(request.id, 'verified')}
                    disabled={processingId === request.id || request.status === 'verified'}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === request.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReview(request.id, 'rejected')}
                    disabled={processingId === request.id}
                    className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KycPage;
