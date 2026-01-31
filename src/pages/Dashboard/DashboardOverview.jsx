import { useState, useEffect } from 'react';
import { userAPI, transactionAPI } from '../../Apis/api';
import {
  Users,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, change, changeType, icon: Icon, iconBg, iconColor }) => (
  <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 hover:border-red-500/30 transition-all duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {change !== undefined && change !== 0 && (
          <div className={`flex items-center mt-2 text-sm ${changeType === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {changeType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="ml-1">{change}% from last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${iconBg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  </div>
);

const RecentTransactionRow = ({ transaction }) => {
  const statusConfig = {
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: Clock },
    approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-400', icon: XCircle },
  };

  const config = statusConfig[transaction.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-800/30 last:border-0">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p className="text-white font-medium">{transaction.transactionId}</p>
          <p className="text-gray-400 text-sm">{transaction.accountName}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-white font-semibold">${transaction.amount}</p>
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg ${config.bg}`}>
          <StatusIcon className={`w-3 h-3 ${config.text}`} />
          <span className={`text-xs font-medium ${config.text} capitalize`}>{transaction.status}</span>
        </div>
      </div>
    </div>
  );
};

const RecentUserRow = ({ user }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-800/30 last:border-0">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white font-semibold">
        {user.fullName?.charAt(0) || 'U'}
      </div>
      <div>
        <p className="text-white font-medium">{user.fullName}</p>
        <p className="text-gray-400 text-sm">{user.email}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-red-400 font-semibold">{user.apexCoins || 0} Coins</p>
      <span className={`text-xs px-2 py-1 rounded-lg ${user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
        {user.isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  </div>
);

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    totalCoins: 0,
  });
  const [changes, setChanges] = useState({
    usersChange: 0,
    transactionsChange: 0,
    pendingChange: 0,
    coinsChange: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper function to calculate percentage change
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Helper function to filter data by date range
  const filterByDateRange = (items, dateField, daysAgo) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    return items.filter(item => new Date(item[dateField]) >= cutoffDate);
  };

  const fetchDashboardData = async () => {
    try {
      const [usersRes, transactionsRes] = await Promise.all([
        userAPI.getAllUsers(),
        transactionAPI.getAllTransactions(),
      ]);

      const users = usersRes.data.users || [];
      const transactions = transactionsRes.data || [];

      // Current month data (last 30 days)
      const usersThisMonth = filterByDateRange(users, 'createdAt', 30);
      const transactionsThisMonth = filterByDateRange(transactions, 'createdAt', 30);
      
      // Previous month data (31-60 days ago)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const usersLastMonth = users.filter(user => {
        const date = new Date(user.createdAt);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      });
      
      const transactionsLastMonth = transactions.filter(t => {
        const date = new Date(t.createdAt);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      });

      // Calculate current stats
      const totalCoins = users.reduce((sum, user) => sum + (user.apexCoins || 0), 0);
      const pendingCount = transactions.filter(t => t.status === 'pending').length;
      
      // Calculate previous month stats for comparison
      const pendingLastMonth = transactionsLastMonth.filter(t => t.status === 'pending').length;
      const coinsLastMonth = usersLastMonth.reduce((sum, user) => sum + (user.apexCoins || 0), 0);

      // Calculate percentage changes
      const usersChange = calculateChange(usersThisMonth.length, usersLastMonth.length);
      const transactionsChange = calculateChange(transactionsThisMonth.length, transactionsLastMonth.length);
      const pendingChange = calculateChange(pendingCount, pendingLastMonth);
      const coinsChange = calculateChange(totalCoins, coinsLastMonth);

      setStats({
        totalUsers: users.length,
        totalTransactions: transactions.length,
        pendingTransactions: pendingCount,
        totalCoins,
      });

      setChanges({
        usersChange: Math.abs(usersChange),
        usersChangeType: usersChange >= 0 ? 'up' : 'down',
        transactionsChange: Math.abs(transactionsChange),
        transactionsChangeType: transactionsChange >= 0 ? 'up' : 'down',
        pendingChange: Math.abs(pendingChange),
        pendingChangeType: pendingChange <= 0 ? 'up' : 'down', // Less pending is good
        coinsChange: Math.abs(coinsChange),
        coinsChangeType: coinsChange >= 0 ? 'up' : 'down',
      });

      setRecentTransactions(transactions.slice(0, 5));
      setRecentUsers(users.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={changes.usersChange}
          changeType={changes.usersChangeType}
          icon={Users}
          iconBg="bg-red-500/10"
          iconColor="text-red-400"
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions}
          change={changes.transactionsChange}
          changeType={changes.transactionsChangeType}
          icon={CreditCard}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingTransactions}
          change={changes.pendingChange}
          changeType={changes.pendingChangeType}
          icon={Clock}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-400"
        />
        <StatCard
          title="Total Apex Coins"
          value={stats.totalCoins.toLocaleString()}
          change={changes.coinsChange}
          changeType={changes.coinsChangeType}
          icon={DollarSign}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-400"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <a href="/dashboard/transactions" className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
              View All
            </a>
          </div>
          <div className="space-y-2">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <RecentTransactionRow key={transaction._id} transaction={transaction} />
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No transactions yet</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Users</h3>
            <a href="/dashboard/users" className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
              View All
            </a>
          </div>
          <div className="space-y-2">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <RecentUserRow key={user._id} user={user} />
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No users yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
