import { useState, useEffect } from 'react';
import { gatewayAPI } from '../../Apis/api';
import toast from 'react-hot-toast';
import {
  Plus,
  X,
  Building2,
  CreditCard,
  DollarSign,
  Percent,
  Eye,
  Upload,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';

const GatewayModal = ({ gateway, onClose, onDelete }) => {
  if (!gateway) return null;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${gateway.bankName}? This action cannot be undone.`)) {
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
          {/* Bank Image */}
          {gateway.bankImageUrl && (
            <div className="flex justify-center">
              <img
                src={gateway.bankImageUrl}
                alt={gateway.bankName}
                className="w-32 h-32 object-contain rounded-xl border border-gray-800/50"
              />
            </div>
          )}

          {/* Gateway Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">Bank Name</span>
              </div>
              <p className="text-white font-medium">{gateway.bankName}</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Account Number</span>
              </div>
              <p className="text-white font-medium">{gateway.bankAccountNumber}</p>
            </div>

            {gateway.bankRoutingNumber && (
              <div className="bg-[#141414] rounded-xl p-4">
                <div className="flex items-center space-x-3 text-gray-400 mb-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">Routing Number</span>
                </div>
                <p className="text-white font-medium">{gateway.bankRoutingNumber}</p>
              </div>
            )}

            {gateway.bankBranchName && (
              <div className="bg-[#141414] rounded-xl p-4">
                <div className="flex items-center space-x-3 text-gray-400 mb-2">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">Branch Name</span>
                </div>
                <p className="text-white font-medium">{gateway.bankBranchName}</p>
              </div>
            )}

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Currency</span>
              </div>
              <p className="text-white font-medium">{gateway.gatewayCurrency}</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <Percent className="w-4 h-4" />
                <span className="text-sm">Conversion Rate</span>
              </div>
              <p className="text-white font-medium">{gateway.conversionRate}</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Charge</span>
              </div>
              <p className="text-white font-medium">{gateway.charge}%</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-4">
              <div className="flex items-center space-x-3 text-gray-400 mb-2">
                {gateway.allowAsPaymentMethod ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm">Payment Method</span>
              </div>
              <p className={`font-medium ${gateway.allowAsPaymentMethod ? 'text-emerald-400' : 'text-red-400'}`}>
                {gateway.allowAsPaymentMethod ? 'Enabled' : 'Disabled'}
              </p>
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
    bankName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bankBranchName: '',
    gatewayCurrency: 'PKR',
    conversionRate: 1,
    charge: 0,
    allowAsPaymentMethod: true,
    accountImage: null,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, accountImage: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bankName || !formData.bankAccountNumber || !formData.gatewayCurrency) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.accountImage) {
      toast.error('Please upload a bank image');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('bankName', formData.bankName);
      data.append('bankAccountNumber', formData.bankAccountNumber);
      data.append('bankRoutingNumber', formData.bankRoutingNumber);
      data.append('bankBranchName', formData.bankBranchName);
      data.append('gatewayCurrency', formData.gatewayCurrency);
      data.append('conversionRate', formData.conversionRate);
      data.append('charge', formData.charge);
      data.append('allowAsPaymentMethod', formData.allowAsPaymentMethod);
      data.append('accountImage', formData.accountImage);

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
          {/* Bank Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bank Image *
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
                  <Building2 className="w-8 h-8 text-gray-600" />
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

          {/* Bank Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Enter bank name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Enter account number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Routing Number
              </label>
              <input
                type="text"
                value={formData.bankRoutingNumber}
                onChange={(e) => setFormData({ ...formData, bankRoutingNumber: e.target.value })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Enter routing number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Branch Name
              </label>
              <input
                type="text"
                value={formData.bankBranchName}
                onChange={(e) => setFormData({ ...formData, bankBranchName: e.target.value })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Enter branch name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Currency *
              </label>
              <select
                value={formData.gatewayCurrency}
                onChange={(e) => setFormData({ ...formData, gatewayCurrency: e.target.value })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="PKR">PKR - Pakistani Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Conversion Rate
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.conversionRate}
                onChange={(e) => setFormData({ ...formData, conversionRate: parseFloat(e.target.value) })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="1.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Charge (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.charge}
                onChange={(e) => setFormData({ ...formData, charge: parseFloat(e.target.value) })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="0"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowAsPaymentMethod}
                  onChange={(e) => setFormData({ ...formData, allowAsPaymentMethod: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-700 bg-[#141414] text-red-500 focus:ring-red-500"
                />
                <span className="text-gray-300">Allow as Payment Method</span>
              </label>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Gateways</p>
              <p className="text-2xl font-bold text-white mt-1">{gateways.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10">
              <Building2 className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Gateways</p>
              <p className="text-2xl font-bold text-white mt-1">
                {gateways.filter(g => g.allowAsPaymentMethod).length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Disabled Gateways</p>
              <p className="text-2xl font-bold text-white mt-1">
                {gateways.filter(g => !g.allowAsPaymentMethod).length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-500/10">
              <XCircle className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Gateways Grid */}
      {gateways.length === 0 ? (
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
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
                  {gateway.bankImageUrl ? (
                    <img
                      src={gateway.bankImageUrl}
                      alt={gateway.bankName}
                      className="w-12 h-12 object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-red-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold">{gateway.bankName}</h3>
                    <p className="text-gray-400 text-sm">{gateway.gatewayCurrency}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  gateway.allowAsPaymentMethod
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {gateway.allowAsPaymentMethod ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Account</span>
                  <span className="text-white font-mono">{gateway.bankAccountNumber}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Charge</span>
                  <span className="text-white">{gateway.charge}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Rate</span>
                  <span className="text-white">{gateway.conversionRate}</span>
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
                    if (window.confirm(`Are you sure you want to delete ${gateway.bankName}? This action cannot be undone.`)) {
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
