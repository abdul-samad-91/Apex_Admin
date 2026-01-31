import { useState, useEffect } from 'react';
import { transactionAPI } from '../../Apis/api';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  ExternalLink,
  Calendar,
  User,
  DollarSign,
  Hash,
} from 'lucide-react';

const TransactionModal = ({ transaction, onClose, onUpdateStatus }) => {
  if (!transaction) return null;

  const statusConfig = {
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  };

  const config = statusConfig[transaction.status] || statusConfig.pending;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-2xl border border-gray-800/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50 sticky top-0 bg-[#1a1a1a] z-10">
          <h3 className="text-xl font-semibold text-white">Transaction Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl ${config.bg} ${config.border} border`}>
            {transaction.status === 'pending' && <Clock className={`w-5 h-5 ${config.text}`} />}
            {transaction.status === 'approved' && <CheckCircle className={`w-5 h-5 ${config.text}`} />}
            {transaction.status === 'rejected' && <XCircle className={`w-5 h-5 ${config.text}`} />}
            <span className={`font-semibold ${config.text} capitalize`}>{transaction.status}</span>
          </div>

          {/* Transaction Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <Hash className="w-4 h-4" />
                <span className="text-sm">Transaction ID</span>
              </div>
              <p className="text-white font-medium break-all">{transaction.transactionId}</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Amount</span>
              </div>
              <p className="text-2xl font-bold text-red-400">${transaction.amount}</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <User className="w-4 h-4" />
                <span className="text-sm">Account Name</span>
              </div>
              <p className="text-white font-medium">{transaction.accountName}</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Date</span>
              </div>
              <p className="text-white font-medium">
                {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Screenshot */}
          {transaction.screenshotUrl && (
            <div className="space-y-3">
              <h4 className="text-white font-medium">Payment Screenshot</h4>
              <div className="relative rounded-xl overflow-hidden border border-gray-800/50">
                <img
                  src={transaction.screenshotUrl}
                  alt="Transaction Screenshot"
                  className="w-full h-auto max-h-96 object-contain bg-[#141414]"
                />
                <a
                  href={transaction.screenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 flex items-center space-x-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm hover:bg-black/70 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Full Size</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {transaction.status === 'pending' && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-800/50">
            <button
              onClick={() => onUpdateStatus(transaction._id, 'rejected')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
            >
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Reject</span>
            </button>
            <button
              onClick={() => onUpdateStatus(transaction._id, 'approved')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Approve</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getAllTransactions();
      setTransactions(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch transactions');
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (transactionId, status) => {
    try {
      await transactionAPI.updateTransactionStatus(transactionId, status);
      toast.success(`Transaction ${status} successfully`);
      setTransactions(transactions.map((t) =>
        t._id === transactionId ? { ...t, status } : t
      ));
      setSelectedTransaction(null);
    } catch (error) {
      toast.error('Failed to update transaction status');
      console.error('Failed to update status:', error);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.accountName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.amount?.toString().includes(searchQuery);

    const matchesFilter =
      filterStatus === 'all' || transaction.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'rejected':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-white">Transactions</h1>
        <p className="text-gray-400 mt-1">Review and manage payment transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-xl p-4 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-xl font-bold text-white">
                {transactions.filter((t) => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-xl p-4 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Approved</p>
              <p className="text-xl font-bold text-white">
                {transactions.filter((t) => t.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-xl p-4 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Rejected</p>
              <p className="text-xl font-bold text-white">
                {transactions.filter((t) => t.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by transaction ID, account name, or amount..."
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
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Transaction ID</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Account Name</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Amount</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Date</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Status</th>
                <th className="text-right text-gray-400 font-medium px-6 py-4 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="border-b border-gray-800/30 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-mono text-sm">{transaction.transactionId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{transaction.accountName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-red-400 font-semibold">${transaction.amount}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyles(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="capitalize">{transaction.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(transaction._id, 'approved')}
                              className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(transaction._id, 'rejected')}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      {selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default TransactionsPage;
