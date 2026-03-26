import { useState, useEffect } from 'react';
import { bannerAPI } from '../../Apis/api';
import toast from 'react-hot-toast';
import {
  Plus,
  X,
  Trash2,
  Eye,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

const BannerModal = ({ banner, onClose, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    title: banner.title,
    description: banner.description,
    actionLink: banner.actionLink || '',
    actionType: banner.actionType || 'none',
    startDate: banner.startDate.split('T')[0],
    endDate: banner.endDate.split('T')[0],
    isActive: banner.isActive,
    priority: banner.priority,
    durationSeconds: banner.durationSeconds,
  });

  if (!banner) return null;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      onDelete(banner.id);
      onClose();
    }
  };

  const handleSave = async () => {
    if (!editData.title || !editData.startDate || !editData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const start = new Date(editData.startDate);
    const end = new Date(editData.endDate);
    if (start >= end) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      await bannerAPI.updateBanner(banner.id, editData);
      toast.success('Banner updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update banner');
    } finally {
      setLoading(false);
    }
  };

  const startDate = new Date(banner.startDate).toLocaleDateString();
  const endDate = new Date(banner.endDate).toLocaleDateString();
  const ctr =
    banner.impressionCount > 0
      ? ((banner.clickCount / banner.impressionCount) * 100).toFixed(2)
      : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-lg border border-gray-800/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <h3 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Banner' : 'Banner Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {!isEditing ? (
            <>
              {/* View Mode */}
              {banner.imageUrl && (
                <div className="flex justify-center">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-40 object-cover rounded-xl border border-gray-800/50"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#141414] rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Title</p>
                  <p className="text-white font-medium">{banner.title}</p>
                </div>

                {banner.description && (
                  <div className="bg-[#141414] rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Description</p>
                    <p className="text-white text-sm">{banner.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#141414] rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Start Date</p>
                    <p className="text-white font-medium text-sm">{startDate}</p>
                  </div>
                  <div className="bg-[#141414] rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">End Date</p>
                    <p className="text-white font-medium text-sm">{endDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#141414] rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Priority</p>
                    <p className="text-white font-medium">{banner.priority}</p>
                  </div>
                  <div className="bg-[#141414] rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Impressions</p>
                    <p className="text-white font-medium">{banner.impressionCount}</p>
                  </div>
                  <div className="bg-[#141414] rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">CTR</p>
                    <p className="text-white font-medium">{ctr}%</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Banner title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Banner description"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={editData.startDate}
                    onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                    className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={editData.endDate}
                    onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                    className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: parseInt(e.target.value) })}
                    className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (sec)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editData.durationSeconds}
                    onChange={(e) => setEditData({ ...editData, durationSeconds: parseInt(e.target.value) })}
                    className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Active
                  </label>
                  <select
                    value={editData.isActive ? 'yes' : 'no'}
                    onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'yes' })}
                    className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Action Type
                  </label>
                  <select
                    value={editData.actionType}
                    onChange={(e) => setEditData({ ...editData, actionType: e.target.value })}
                    className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="none">None</option>
                    <option value="external_url">External URL</option>
                  </select>
                </div>
                {editData.actionType !== 'none' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Action Link
                    </label>
                    <input
                      type="text"
                      value={editData.actionLink}
                      onChange={(e) => setEditData({ ...editData, actionLink: e.target.value })}
                      className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="Enter URL"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-800/50">
          {isEditing ? (
            <div className="flex items-center space-x-2 w-full">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl transition-all duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateBannerModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    actionLink: '',
    actionType: 'none',
    startDate: '',
    endDate: '',
    isActive: true,
    priority: 1,
    durationSeconds: 3,
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

    if (!formData.title || !formData.startDate || !formData.endDate || !formData.image) {
      toast.error('Please fill in all required fields');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (start >= end) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('actionLink', formData.actionLink);
      data.append('actionType', formData.actionType);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('isActive', formData.isActive);
      data.append('priority', formData.priority);
      data.append('durationSeconds', formData.durationSeconds);
      data.append('image', formData.image);

      await bannerAPI.createBanner(data);
      toast.success('Banner created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-2xl border border-gray-800/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50 sticky top-0 bg-[#1a1a1a] z-10">
          <h3 className="text-xl font-semibold text-white">Create New Banner</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Banner Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Banner Image *
            </label>
            <div className="flex items-center space-x-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-xl border border-gray-800/50"
                />
              ) : (
                <div className="w-24 h-24 bg-[#141414] rounded-xl border border-dashed border-gray-700 flex items-center justify-center">
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

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Banner title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Banner description"
              rows="3"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <input
                type="number"
                min="1"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (sec)
              </label>
              <input
                type="number"
                min="1"
                value={formData.durationSeconds}
                onChange={(e) => setFormData({ ...formData, durationSeconds: parseInt(e.target.value) })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Active
              </label>
              <select
                value={formData.isActive ? 'yes' : 'no'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'yes' })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Action Type
            </label>
            <select
              value={formData.actionType}
              onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
              className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="none">None</option>
              <option value="external_url">External URL</option>
            </select>
          </div>

          {/* Action Link */}
          {formData.actionType !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Action Link / Page
              </label>
              <input
                type="text"
                value={formData.actionLink}
                onChange={(e) => setFormData({ ...formData, actionLink: e.target.value })}
                className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Enter link or page name"
              />
            </div>
          )}

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
                  <span>Create Banner</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchBanners = async () => {
    try {
      const response = await bannerAPI.getAllBanners();
      const bannersData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);
      setBanners(bannersData);
    } catch (error) {
      toast.error('Failed to fetch banners');
      console.error('Failed to fetch banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    try {
      await bannerAPI.deleteBanner(id);
      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete banner');
      console.error('Failed to delete banner:', error);
    }
  };

  useEffect(() => {
    fetchBanners();
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
          <h1 className="text-2xl font-bold text-white">Promotional Banners</h1>
          <p className="text-gray-400 mt-1">Manage promotional banners and campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Banners</p>
              <p className="text-2xl font-bold text-white mt-1">{banners.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10">
              <ImageIcon className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Banners</h3>
          <p className="text-gray-400 mb-6">Get started by creating your first promotional banner</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Banner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6 hover:border-red-500/30 transition-all duration-300 overflow-hidden"
            >
              {/* Banner Image */}
              {banner.imageUrl && (
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-32 object-cover rounded-xl mb-4 border border-gray-800/50"
                />
              )}

              {/* Banner Info */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold truncate">{banner.title}</h3>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      banner.isActive
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}
                  >
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#141414] rounded-lg p-2">
                    <p className="text-gray-400">Impressions</p>
                    <p className="text-white font-semibold">{banner.impressionCount}</p>
                  </div>
                  <div className="bg-[#141414] rounded-lg p-2">
                    <p className="text-gray-400">Clicks</p>
                    <p className="text-white font-semibold">{banner.clickCount}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 mt-4">
                <button
                  onClick={() => setSelectedBanner(banner)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#141414] hover:bg-[#1f1f1f] text-gray-300 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        'Are you sure you want to delete this banner?'
                      )
                    ) {
                      handleDeleteBanner(banner.id);
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
      {selectedBanner && (
        <BannerModal
          banner={selectedBanner}
          onClose={() => setSelectedBanner(null)}
          onDelete={handleDeleteBanner}
          onUpdate={fetchBanners}
        />
      )}

      {showCreateModal && (
        <CreateBannerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchBanners}
        />
      )}
    </div>
  );
};

export default BannersPage;
