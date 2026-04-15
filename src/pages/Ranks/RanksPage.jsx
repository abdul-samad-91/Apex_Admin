import { useEffect, useState } from 'react';
import { rankAPI } from '../../Apis/api';
import toast from 'react-hot-toast';
import { Loader2, Trophy, PlayCircle, RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react';

const RanksPage = () => {
  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState('');
  const [jobSummary, setJobSummary] = useState(null);

  const fetchRanks = async () => {
    try {
      setLoading(true);
      const response = await rankAPI.getAllRanks();
      setRanks(response.data?.ranks || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch ranks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanks();
  }, []);

  const handleInitializeRanks = async () => {
    try {
      setProcessing('initialize');
      const response = await rankAPI.initializeRanks();
      toast.success(response.data?.message || 'Ranks initialized successfully');
      fetchRanks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initialize ranks');
    } finally {
      setProcessing('');
    }
  };

  const handleWeeklyRecalculate = async () => {
    try {
      setProcessing('weekly');
      const response = await rankAPI.processWeeklyRecalculation();
      setJobSummary(response.data?.results || null);
      toast.success(response.data?.message || 'Weekly recalculation completed');
      fetchRanks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process weekly recalculation');
    } finally {
      setProcessing('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Rank Management</h1>
          <p className="text-gray-400 mt-1">Manage rank settings and run rank processing jobs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleInitializeRanks}
            disabled={processing !== ''}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {processing === 'initialize' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Initialize Ranks</span>
              </>
            )}
          </button>
          <button
            onClick={handleWeeklyRecalculate}
            disabled={processing !== ''}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {processing === 'weekly' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4" />
                <span>Run Weekly Recalculation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {jobSummary && (
        <div className="bg-[#1a1a1a] border border-emerald-500/30 rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-semibold">Latest Weekly Recalculation Result</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
            <div className="bg-[#121212] rounded-xl p-3">
              <p className="text-gray-400">Processed</p>
              <p className="text-white font-semibold">{jobSummary.processed ?? 0}</p>
            </div>
            <div className="bg-[#121212] rounded-xl p-3">
              <p className="text-gray-400">Upgraded</p>
              <p className="text-emerald-400 font-semibold">{jobSummary.upgraded ?? 0}</p>
            </div>
            <div className="bg-[#121212] rounded-xl p-3">
              <p className="text-gray-400">Downgraded</p>
              <p className="text-yellow-400 font-semibold">{jobSummary.downgraded ?? 0}</p>
            </div>
            <div className="bg-[#121212] rounded-xl p-3">
              <p className="text-gray-400">Warnings</p>
              <p className="text-amber-400 font-semibold">{jobSummary.warned ?? 0}</p>
            </div>
            <div className="bg-[#121212] rounded-xl p-3">
              <p className="text-gray-400">Rewards Created</p>
              <p className="text-cyan-400 font-semibold">{jobSummary.rewardsCreated ?? 0}</p>
            </div>
            <div className="bg-[#121212] rounded-xl p-3">
              <p className="text-gray-400">Errors</p>
              <p className="text-red-400 font-semibold">{jobSummary.errors ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="text-white text-xl font-semibold">Configured Ranks</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
          </div>
        ) : ranks.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
            <p className="text-gray-300">No ranks found in system.</p>
            <p className="text-gray-500 text-sm mt-1">Use Initialize Ranks to create default rank configuration.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="py-3 pr-3">Level</th>
                  <th className="py-3 pr-3">Rank Name</th>
                  <th className="py-3 pr-3">Required Sales</th>
                  <th className="py-3 pr-3">Monthly Reward</th>
                  <th className="py-3 pr-3">Min Directs</th>
                  <th className="py-3 pr-3">Min Stake/Direct</th>
                </tr>
              </thead>
              <tbody>
                {ranks.map((rank) => (
                  <tr key={rank.id} className="border-b border-gray-900/80 text-gray-200">
                    <td className="py-3 pr-3 font-semibold">{rank.level}</td>
                    <td className="py-3 pr-3">{rank.name}</td>
                    <td className="py-3 pr-3">${Number(rank.requiredSales || 0).toLocaleString()}</td>
                    <td className="py-3 pr-3 text-emerald-400">${Number(rank.monthlyReward || 0).toLocaleString()}</td>
                    <td className="py-3 pr-3">{rank.minDirectRequirement}</td>
                    <td className="py-3 pr-3">${Number(rank.minStakePerDirect || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RanksPage;
