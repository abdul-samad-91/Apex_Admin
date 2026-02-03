import { useState, useEffect } from 'react';
import { roiAPI } from '../../Apis/api';
import toast from 'react-hot-toast';
import { Percent, Save, TrendingUp } from 'lucide-react';

const RoiPage = () => {
  const [roiLoading, setRoiLoading] = useState(false);
  const [currentRoi, setCurrentRoi] = useState(null);
  const [roiData, setRoiData] = useState({
    rate: '',
    isActive: true,
  });

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
      console.log('No active ROI found', error.message);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">ROI Settings</h1>
        <p className="text-gray-400 mt-1">Manage the ROI rate applied to Apex Coins</p>
      </div>

      <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
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
    </div>
  );
};

export default RoiPage;
