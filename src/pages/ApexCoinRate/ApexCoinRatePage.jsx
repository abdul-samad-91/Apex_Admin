import { useState, useEffect } from 'react';
import { apexCoinRateAPI } from '../../Apis/api';
import toast from 'react-hot-toast';
import { DollarSign, Save, TrendingUp, History } from 'lucide-react';

const ApexCoinRatePage = () => {
  const [loading, setLoading] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);
  const [rateHistory, setRateHistory] = useState([]);
  const [rateData, setRateData] = useState({
    rate: '',
  });

  useEffect(() => {
    fetchCurrentRate();
    fetchRateHistory();
  }, []);

  const fetchCurrentRate = async () => {
    try {
      const response = await apexCoinRateAPI.getCurrentRate();
      setCurrentRate(response.data);
      setRateData({
        rate: response.data.rate || '',
      });
    } catch (error) {
      console.log('No active rate found', error.message);
    }
  };

  const fetchRateHistory = async () => {
    try {
      const response = await apexCoinRateAPI.getAllRates();
      setRateHistory(response.data || []);
    } catch (error) {
      console.log('Failed to fetch rate history', error.message);
    }
  };

  const handleRateUpdate = async (e) => {
    e.preventDefault();
    if (!rateData.rate || isNaN(rateData.rate)) {
      toast.error('Please enter a valid rate');
      return;
    }

    setLoading(true);
    try {
      await apexCoinRateAPI.setRate({
        rate: parseFloat(rateData.rate),
      });
      toast.success('ApexCoin rate updated successfully');
      fetchCurrentRate();
      fetchRateHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">ApexCoin Rate Settings</h1>
        <p className="text-gray-400 mt-1">Manage the ApexCoin to Dollar conversion rate</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Rate & Update Form */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          {/* Current Rate Display */}
          {currentRate && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Current ApexCoin Rate</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-white">1 ApexCoin = </span>
                    <span className="text-4xl font-bold text-green-400">${currentRate.rate}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    Last updated: {new Date(currentRate.updatedAt || currentRate.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 bg-green-500/20 rounded-2xl">
                  <DollarSign className="w-10 h-10 text-green-400" />
                </div>
              </div>
            </div>
          )}

          {/* Update Rate Form */}
          <form onSubmit={handleRateUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rate (1 ApexCoin = $ ?)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={rateData.rate}
                  onChange={(e) => setRateData({ ...rateData, rate: e.target.value })}
                  className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Enter rate in dollars (e.g., 1.00)"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                This rate will be used for all ApexCoin purchases and ROI calculations
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Updating...' : 'Update Rate'}</span>
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-white font-medium mb-1">How it works</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Users purchase ApexCoins using their account balance</li>
                  <li>• The rate determines how many dollars = 1 ApexCoin</li>
                  <li>• ROI profits are calculated in dollars using this rate</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Rate History */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <History className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Rate History</h2>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {rateHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No rate history available</p>
              </div>
            ) : (
              rateHistory.map((rate, index) => (
                <div
                  key={rate._id}
                  className="p-4 bg-[#141414] rounded-xl border border-gray-800/50 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        index === 0 ? 'bg-green-500/20' : 'bg-gray-700/50'
                      }`}>
                        <DollarSign className={`w-5 h-5 ${
                          index === 0 ? 'text-green-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">${rate.rate}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(rate.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApexCoinRatePage;
