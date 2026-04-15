import { useEffect, useState } from 'react';
import { walletHistoryAPI } from '../../Apis/api';
import toast from 'react-hot-toast';
import { Loader2, Wallet, Search, RefreshCw } from 'lucide-react';

const WalletHistoryPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    userId: '',
    walletType: '',
    entryType: '',
    sourceType: '',
    status: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const loadHistory = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.userId ? { userId: filters.userId.trim() } : {}),
        ...(filters.walletType ? { walletType: filters.walletType } : {}),
        ...(filters.entryType ? { entryType: filters.entryType } : {}),
        ...(filters.sourceType ? { sourceType: filters.sourceType.trim() } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      };

      const response = await walletHistoryAPI.getAllWalletHistory(params);
      setEntries(response.data?.data?.entries || []);
      setPagination(
        response.data?.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: filters.limit,
        }
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch wallet history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory(true);
  }, [filters.page, filters.limit]);

  const handleApplyFilters = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadHistory(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const amountColor = (entryType) => {
    if (entryType === 'credit') return 'text-emerald-400';
    if (entryType === 'debit') return 'text-red-400';
    return 'text-gray-300';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Wallet History</h1>
          <p className="text-gray-400 mt-1">Audit all wallet ledger entries across users</p>
        </div>
        <button
          onClick={() => loadHistory(false)}
          disabled={refreshing || loading}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="text"
            value={filters.userId}
            onChange={(e) => handleFilterChange('userId', e.target.value)}
            placeholder="User ID"
            className="bg-[#121212] border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
          />
          <select
            value={filters.walletType}
            onChange={(e) => handleFilterChange('walletType', e.target.value)}
            className="bg-[#121212] border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
          >
            <option value="">All Wallets</option>
            <option value="account_balance">Account Balance</option>
            <option value="p2p_wallet">P2P Wallet</option>
          </select>
          <select
            value={filters.entryType}
            onChange={(e) => handleFilterChange('entryType', e.target.value)}
            className="bg-[#121212] border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
          >
            <option value="">All Entry Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <input
            type="text"
            value={filters.sourceType}
            onChange={(e) => handleFilterChange('sourceType', e.target.value)}
            placeholder="Source Type"
            className="bg-[#121212] border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
          />
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="bg-[#121212] border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
          </select>
          <button
            onClick={handleApplyFilters}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Apply</span>
          </button>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-2xl p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-300">No wallet ledger entries found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800">
                    <th className="py-3 pr-3">Date</th>
                    <th className="py-3 pr-3">User</th>
                    <th className="py-3 pr-3">Wallet</th>
                    <th className="py-3 pr-3">Type</th>
                    <th className="py-3 pr-3">Amount</th>
                    <th className="py-3 pr-3">Source</th>
                    <th className="py-3 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-900/80 text-gray-200">
                      <td className="py-3 pr-3 whitespace-nowrap">{formatDate(entry.happenedAt || entry.createdAt)}</td>
                      <td className="py-3 pr-3">
                        <div className="max-w-60">
                          <p className="text-white truncate">{entry.user?.fullName || '-'}</p>
                          <p className="text-xs text-gray-400 truncate">{entry.user?.email || entry.userId}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-3">{entry.walletType}</td>
                      <td className="py-3 pr-3 uppercase text-xs">{entry.entryType}</td>
                      <td className={`py-3 pr-3 font-semibold ${amountColor(entry.entryType)}`}>
                        ${Number(entry.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="max-w-50">
                          <p className="truncate">{entry.sourceType || '-'}</p>
                          {entry.sourceId ? <p className="text-xs text-gray-500 truncate">{entry.sourceId}</p> : null}
                        </div>
                      </td>
                      <td className="py-3 pr-3 capitalize">{entry.status || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">
              <p className="text-xs text-gray-400">
                Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} items)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                  disabled={pagination.currentPage <= 1}
                  className="px-3 py-1.5 rounded-lg bg-[#121212] border border-gray-700 text-gray-200 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.min(prev.page + 1, Math.max(1, pagination.totalPages)),
                    }))
                  }
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg bg-[#121212] border border-gray-700 text-gray-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletHistoryPage;
