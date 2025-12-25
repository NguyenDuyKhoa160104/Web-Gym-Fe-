import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  Clock,
  Loader2,
  AlertCircle,
  Eye,
  X,
  Save,
  DollarSign,
  Tag,
  FileText,
  List
} from 'lucide-react';

/**
 * Helper lấy URL API an toàn
 */
const getAdminApiUrl = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL_ADMIN) {
      return import.meta.env.VITE_API_URL_ADMIN;
    }
  } catch (e) { }
  return "http://localhost:5000/api/admin";
};

const API_ADMIN = getAdminApiUrl();

const PackageManagement = () => {
  // --- Data States ---
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // --- UI States (Modals) ---
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // --- Form Data State ---
  const [formData, setFormData] = useState({
    packageName: '',
    price: '',
    durationInDays: '',
    category: '',
    features: '',
    description: ''
  });

  // --- Helpers ---
  const showNotice = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const resetForm = () => {
    setFormData({
      packageName: '',
      price: '',
      durationInDays: '',
      category: categories.length > 0 ? categories[0]._id : '',
      features: '',
      description: ''
    });
    setSelectedPackage(null);
    setIsEditMode(false);
  };

  // --- API Functions ---

  const fetchData = async () => {
    const token = localStorage.getItem('tokenAdmin');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      const [pkgRes, catRes] = await Promise.all([
        fetch(`${API_ADMIN}/packages`, { headers }),
        fetch(`${API_ADMIN}/package-categories`, { headers })
      ]);

      const pkgData = await pkgRes.json();
      const catData = await catRes.json();

      setPackages(pkgData.data || pkgData);
      setCategories(catData.data || catData);

      if (catData.data && catData.data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: catData.data[0]._id }));
      }

    } catch (error) {
      console.error("Lỗi kết nối:", error);
      showNotice("Không thể kết nối đến máy chủ", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---

  const handleOpenAdd = () => {
    resetForm();
    if (categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0]._id }));
    }
    setIsEditMode(false);
    setShowFormModal(true);
  };

  const handleOpenEdit = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({
      packageName: pkg.packageName,
      price: pkg.price,
      durationInDays: pkg.durationInDays,
      category: pkg.category,
      features: pkg.features ? pkg.features.join(', ') : '',
      description: pkg.description || ''
    });
    setIsEditMode(true);
    setShowFormModal(true);
  };

  const handleOpenDelete = (pkg) => {
    setSelectedPackage(pkg);
    setShowDeleteModal(true);
  };

  // Xử lý Thêm / Sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const token = localStorage.getItem('tokenAdmin');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const payload = {
      ...formData,
      features: formData.features.split(',').map(f => f.trim()).filter(f => f),
      price: Number(formData.price),
      durationInDays: Number(formData.durationInDays)
    };

    try {
      let url = `${API_ADMIN}/add-package`;

      if (isEditMode && selectedPackage) {
        url = `${API_ADMIN}/update-package/${selectedPackage._id}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && (result.success || result._id)) {
        showNotice(isEditMode ? "Cập nhật thành công!" : "Thêm gói tập thành công!");
        setShowFormModal(false);
        fetchData();
      } else {
        showNotice(result.message || "Có lỗi xảy ra", "error");
      }
    } catch (err) {
      showNotice("Lỗi hệ thống: " + err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý Xóa - ĐÃ CẬP NHẬT LOGIC DÙNG ID PARAMS
  const handleDelete = async () => {
    if (!selectedPackage) return;
    setIsProcessing(true);

    const token = localStorage.getItem('tokenAdmin');
    try {
      // Thay đổi từ body sang params theo yêu cầu: /delete-package/:id
      const response = await fetch(`${API_ADMIN}/delete-package/${selectedPackage._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
        // Không cần body nữa vì id đã nằm trên URL
      });

      const result = await response.json();

      if (response.ok) {
        showNotice("Đã xóa gói tập!");
        setShowDeleteModal(false);
        setPackages(prev => prev.filter(p => p._id !== selectedPackage._id));
      } else {
        showNotice(result.message || "Xóa thất bại", "error");
      }
    } catch (err) {
      showNotice("Lỗi kết nối", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * --- LOGIC QUAN TRỌNG: ĐỔI TRẠNG THÁI ---
   * Vì Controller yêu cầu phải gửi newStatus trong body,
   * nên FE sẽ tính toán luôn giá trị này rồi gửi lên.
   */
  const handleChangeStatus = async (pkg) => {
    // 1. Xác định trạng thái hiện tại (Server trả về 1 hoặc 'Active' đều hiểu là đang bật)
    const currentStatus = pkg.status;
    const isActive = currentStatus === 1 || currentStatus === 'Active';

    // 2. Tính trạng thái mới (Đảo ngược lại): Nếu đang Active thì gửi 0, ngược lại gửi 1
    const newStatusToSend = isActive ? 0 : 1;

    // 3. Cập nhật UI ngay lập tức (Optimistic Update) cho mượt
    setPackages(prev => prev.map(p => p._id === pkg._id ? { ...p, status: newStatusToSend } : p));

    const token = localStorage.getItem('tokenAdmin');
    try {
      // Gửi request POST kèm body { newStatus } để thỏa mãn Controller
      const response = await fetch(`${API_ADMIN}/change-status-package/${pkg._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newStatus: newStatusToSend })
      });

      const result = await response.json();

      if (!response.ok) {
        // Nếu lỗi thì revert UI về trạng thái cũ
        setPackages(prev => prev.map(p => p._id === pkg._id ? { ...p, status: currentStatus } : p));
        showNotice(result.message || "Không thể đổi trạng thái", "error");
      } else {
        showNotice("Đã cập nhật trạng thái");
        // Nếu server trả về data mới nhất, cập nhật lại cho chắc chắn
        if (result.data) {
          setPackages(prev => prev.map(p => p._id === pkg._id ? result.data : p));
        }
      }
    } catch (err) {
      // Revert UI nếu lỗi mạng
      setPackages(prev => prev.map(p => p._id === pkg._id ? { ...p, status: currentStatus } : p));
      showNotice("Lỗi kết nối: " + err.message, "error");
    }
  };


  // --- UI Helpers ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getCategoryName = (catId) => {
    const category = categories.find(c => c._id === catId);
    return category ? category.name : 'Chưa phân loại';
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.packageName?.toLowerCase().includes(searchTerm.toLowerCase());
    const pkgCatId = pkg.category;
    const matchesCategory = categoryFilter === 'All' || pkgCatId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const isActive = status === 'Active' || status === 1;
    return isActive ? (
      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm cursor-pointer select-none">
        <CheckCircle size={12} /> Đang bán
      </span>
    ) : (
      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-200 cursor-pointer select-none">
        <XCircle size={12} /> Ngưng bán
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 text-left font-sans">

      {/* Toast Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 border ${notification.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <p className="font-bold text-sm">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })}><X size={16} /></button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Quản lý <span className="text-blue-600">Gói tập</span></h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Hệ thống thiết lập dịch vụ và bảng giá phòng tập.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} />
          <span>Tạo gói mới</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên gói dịch vụ..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all shrink-0">
            <Filter size={18} className="text-blue-600" />
            <select
              className="bg-transparent text-xs font-black uppercase text-slate-600 outline-none cursor-pointer tracking-wider"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em]">
                <th className="px-8 py-5">Thông tin dịch vụ</th>
                <th className="px-8 py-5">Đơn giá</th>
                <th className="px-8 py-5">Thời hạn</th>
                <th className="px-8 py-5">Phân loại</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <tr key={pkg._id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-base tracking-tight">{pkg.packageName}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {pkg.features?.slice(0, 3).map((feature, idx) => (
                              <span key={idx} className="text-[9px] font-bold bg-white text-slate-400 border border-slate-100 px-2 py-0.5 rounded-lg shadow-sm">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-blue-600 text-lg tabular-nums tracking-tighter">
                        {formatCurrency(pkg.price)}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <Clock size={16} className="text-slate-300" />
                        {pkg.durationInDays} ngày
                      </div>
                    </td>
                    <td className="px-8 py-6 text-left">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                        {getCategoryName(pkg.category)}
                      </span>
                    </td>
                    {/* Bấm vào đây để gọi hàm đổi status */}
                    <td className="px-8 py-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleChangeStatus(pkg)} title="Bấm để đổi trạng thái">
                      {getStatusBadge(pkg.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <button
                          className="p-2.5 bg-white text-slate-400 hover:text-blue-600 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(pkg)}
                          className="p-2.5 bg-white text-slate-400 hover:text-orange-600 rounded-xl shadow-sm border border-slate-100 hover:border-orange-200 transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(pkg)}
                          className="p-2.5 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-sm border border-slate-100 hover:border-rose-200 transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                        <Search size={40} className="text-slate-400" />
                      </div>
                      <p className="font-black uppercase tracking-[0.2em] text-xs">Dữ liệu trống</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50/50 px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Hiển thị <span className="text-slate-800 font-black">{filteredPackages.length}</span> trên tổng số <span className="text-slate-800 font-black">{packages.length}</span> gói dịch vụ
          </span>
          <div className="flex gap-2">
            <button className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm disabled:opacity-50" disabled>Trước</button>
            <button className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">Tiếp theo</button>
          </div>
        </div>
      </div>

      {/* --- ADD / EDIT MODAL (SPLIT LAYOUT & WIDER) --- */}
      {showFormModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowFormModal(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 h-auto max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                {isEditMode ? 'Cập nhật thông tin' : 'Tạo gói dịch vụ mới'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                {/* LEFT COLUMN: BASIC INFO (5/12) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Tag size={16} />
                    <h4 className="text-xs font-black uppercase tracking-widest">Thông tin cơ bản</h4>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên gói tập</label>
                    <input
                      required
                      type="text"
                      className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ví dụ: Gói VIP 3 Tháng"
                      value={formData.packageName}
                      onChange={e => setFormData({ ...formData, packageName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</label>
                      <select
                        className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thời hạn (Ngày)</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          required
                          type="number"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="30"
                          value={formData.durationInDays}
                          onChange={e => setFormData({ ...formData, durationInDays: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá tiền (VND)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        required
                        type="number"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-black text-blue-600 text-lg border-none focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="500000"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: DETAILS (7/12) */}
                <div className="lg:col-span-7 space-y-6 lg:border-l lg:border-slate-100 lg:pl-8">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <List size={16} />
                    <h4 className="text-xs font-black uppercase tracking-widest">Chi tiết dịch vụ</h4>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đặc điểm nổi bật (Phân cách bằng dấu phẩy)</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 text-slate-400" size={16} />
                      <textarea
                        rows="3"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-medium text-slate-700 border-none focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Full time, Khăn miễn phí, PT 1 kèm 1..."
                        value={formData.features}
                        onChange={e => setFormData({ ...formData, features: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả chi tiết</label>
                    <textarea
                      rows="5"
                      className="w-full p-4 bg-slate-50 rounded-2xl font-medium text-slate-700 border-none focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Thông tin bổ sung về gói tập, quyền lợi đi kèm..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex-shrink-0 flex justify-end gap-3">
              <button type="button" onClick={() => setShowFormModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-white hover:shadow-sm transition-all">Hủy bỏ</button>
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2 min-w-[140px]"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isEditMode ? 'Lưu thay đổi' : 'Tạo gói mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRM MODAL --- */}
      {showDeleteModal && selectedPackage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Xác nhận xóa?</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">
                Bạn có chắc chắn muốn xóa gói <span className="text-slate-900 font-bold">"{selectedPackage.packageName}"</span>?
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Xóa ngay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PackageManagement;