import { useState, useEffect } from 'react';
import { gatewayAPI } from '../../Apis/api';
import toast from 'react-hot-toast';
import {
  Plus,
  X,
  Wallet,
  Key,
  Eye,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

const GatewayModal = ({ gateway, onClose, onDelete }) => {
  if (!gateway) return null;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this gateway? This action cannot be undone.`)) {
      onDelete(gateway._id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-lg border border-gray-800/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <h3 className="text-xl font-semibold text-white">Gateway Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Wallet Image */}
          {gateway.image && (
            <div className="flex justify-center">
              <img
                src={gateway.image}
                alt="Wallet"
                className="w-32 h-32 object-contain rounded-xl border border-gray-800/50"
              />
            </div>
          )}

          {/* Gateway Info Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <Key className="w-4 h-4" />
                <span className="text-sm">Wallet Name</span>
              </div>
              <p className="text-white font-medium">{gateway.walletName}</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Wallet Address</span>
              </div>
              <p className="text-white font-medium break-all">{gateway.walletAddress}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-800/50">
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Gateway</span>
          </button>
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

const CreateGatewayModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    walletName: '',
    walletAddress: '',
    image: null,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.walletName || !formData.walletAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.image) {
      toast.error('Please upload an image');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('walletName', formData.walletName);
      data.append('walletAddress', formData.walletAddress);
      data.append('image', formData.image);

      await gatewayAPI.createGateway(data);
      toast.success('Gateway created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create gateway');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-2xl border border-gray-800/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50 sticky top-0 bg-[#1a1a1a] z-10">
          <h3 className="text-xl font-semibold text-white">Create Payment Gateway</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Wallet Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wallet Image *
            </label>
            <div className="flex items-center space-x-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-contain rounded-xl border border-gray-800/50"
                />
              ) : (
                <div className="w-20 h-20 bg-[#141414] rounded-xl border border-dashed border-gray-700 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                </div>
              )}
              <label className="flex items-center space-x-2 px-4 py-2 bg-[#141414] hover:bg-[#1f1f1f] border border-gray-800 rounded-xl cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Wallet Details */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Wallet Name *
              </label>
              <input
                type="text"
                value={formData.walletName}
                onChange={(e) => setFormData({ ...formData, walletName: e.target.value })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Enter wallet name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Wallet Address *
              </label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Enter wallet address"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Create Gateway</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GatewaysPage = () => {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchGateways = async () => {
    try {
      const response = await gatewayAPI.getAllGateways();
      setGateways(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch gateways');
      console.error('Failed to fetch gateways:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGateway = async (id) => {
    try {
      await gatewayAPI.deleteGateway(id);
      toast.success('Gateway deleted successfully');
      fetchGateways();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete gateway');
      console.error('Failed to delete gateway:', error);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Gateways</h1>
          <p className="text-gray-400 mt-1">Manage payment gateways and bank accounts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Gateway</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Gateways</p>
              <p className="text-2xl font-bold text-white mt-1">{gateways.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10">
              <Wallet className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Gateways Grid */}
      {gateways.length === 0 ? (
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-12 text-center">
          <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Payment Gateways</h3>
          <p className="text-gray-400 mb-6">Get started by adding your first payment gateway</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Gateway</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gateways.map((gateway) => (
            <div
              key={gateway._id}
              className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6 hover:border-red-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {gateway.image ? (
                    <img
                      src={gateway.image}
                      alt="Wallet"
                      className="w-12 h-12 object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-red-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold">Wallet Gateway</h3>
                    <p className="text-gray-400 text-sm">{gateway.walletName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Wallet Name</span>
                  <span className="text-white font-mono">{gateway.walletName}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400 block mb-1">Address</span>
                  <span className="text-white break-all text-xs">{gateway.walletAddress}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedGateway(gateway)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#141414] hover:bg-[#1f1f1f] text-gray-300 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete this gateway? This action cannot be undone.`)) {
                      handleDeleteGateway(gateway._id);
                    }
                  }}
                  className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedGateway && (
        <GatewayModal
          gateway={selectedGateway}
          onClose={() => setSelectedGateway(null)}
          onDelete={handleDeleteGateway}
        />
      )}

      {showCreateModal && (
        <CreateGatewayModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchGateways}
        />
      )}
    </div>
  );
};

export default GatewaysPage;
