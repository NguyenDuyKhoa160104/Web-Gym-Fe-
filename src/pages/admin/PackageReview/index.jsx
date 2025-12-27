import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Star,
    CheckCircle,
    XCircle,
    Clock,
    Trash2,
    Eye,
    MessageSquare,
    Loader2,
    AlertCircle,
    User,
    Package,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Check,
    X
} from 'lucide-react';

// --- API Helper ---
const getAdminApiUrl = () => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            return import.meta.env.VITE_API_URL_ADMIN || "http://localhost:5000/api/admin";
        }
    } catch (e) { }
    return "http://localhost:5000/api/admin";
};

const API_ADMIN = getAdminApiUrl();

// --- Constants ---
const REVIEW_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

const STATUS_MAP = {
    'pending': { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={14} /> },
    'approved': { label: 'Đã duyệt', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle size={14} /> },
    'rejected': { label: 'Đã ẩn', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: <XCircle size={14} /> }
};

// --- Toast Component ---
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 border ${type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
            {type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
            <p className="font-bold text-sm">{message}</p>
            <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={16} /></button>
        </div>
    );
};

// --- Confirm Modal Component ---
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel, type = 'danger' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
            <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận</h3>
                    <p className="text-sm text-slate-500 mb-6">{message}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg transition-transform active:scale-95 ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReviewManagement = () => {
    // --- States ---
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalResults: 0 });

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // '' for all
    const [sortOrder, setSortOrder] = useState('desc');

    // UI States
    const [notification, setNotification] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null); // For detail modal

    // Confirmation State
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        message: '',
        action: null,
        type: 'danger'
    });

    // --- Helpers ---
    const showNotice = (message, type = 'success') => setNotification({ message, type });
    const closeNotice = () => setNotification(null);

    // --- Fetch Data ---
    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const queryParams = new URLSearchParams({
                page: pagination.currentPage,
                limit: 10,
                sortOrder: sortOrder,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { status: statusFilter })
            });

            const response = await fetch(`${API_ADMIN}/all-package-reviews?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setReviews(result.data);
                setPagination(result.pagination);
            } else {
                showNotice(result.message || "Lỗi tải danh sách đánh giá", "error");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            showNotice("Không thể kết nối máy chủ", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReviews();
        }, 500);
        return () => clearTimeout(timer);
    }, [pagination.currentPage, statusFilter, searchTerm, sortOrder]);

    // --- Actions Execution ---
    const executeUpdateStatus = async (reviewId, newStatus) => {
        try {
            const token = localStorage.getItem('tokenAdmin');
            let endpoint = '';

            // Chọn endpoint dựa trên hành động
            if (newStatus === REVIEW_STATUS.APPROVED) {
                endpoint = `${API_ADMIN}/approved/package-review/${reviewId}`;
            } else if (newStatus === REVIEW_STATUS.REJECTED) {
                endpoint = `${API_ADMIN}/approved/reject-review/${reviewId}`;
            } else {
                return;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const actionLabel = newStatus === REVIEW_STATUS.APPROVED ? "DUYỆT" : "TỪ CHỐI/ẨN";
                showNotice(`Đã ${actionLabel.toLowerCase()} đánh giá thành công!`, "success");

                // Cập nhật state local ngay lập tức để UI phản hồi nhanh
                setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, status: newStatus } : r));

                // Nếu đang mở modal chi tiết, cập nhật luôn trạng thái trong modal
                if (selectedReview?._id === reviewId) {
                    setSelectedReview(prev => ({ ...prev, status: newStatus }));
                }
            } else {
                showNotice(result.message || "Cập nhật thất bại", "error");
            }

        } catch (err) {
            console.error("Update status error:", err);
            showNotice("Lỗi kết nối đến máy chủ", "error");
        }
    };

    const executeDelete = async (reviewId) => {
        // Placeholder for delete logic if implemented later
        showNotice("Chức năng xóa đang được phát triển", "error");
    };

    // --- Handlers: Trigger Confirmation ---
    const handleUpdateStatus = (reviewId, newStatus) => {
        const actionLabel = newStatus === REVIEW_STATUS.APPROVED ? "DUYỆT" : "TỪ CHỐI/ẨN";
        const type = newStatus === REVIEW_STATUS.APPROVED ? 'primary' : 'danger';

        setConfirmation({
            isOpen: true,
            message: `Bạn có chắc muốn ${actionLabel} đánh giá này?`,
            type: type,
            action: () => executeUpdateStatus(reviewId, newStatus)
        });
    };

    const handleDelete = (reviewId) => {
        setConfirmation({
            isOpen: true,
            message: "Bạn có chắc chắn muốn XÓA vĩnh viễn đánh giá này?",
            type: 'danger',
            action: () => executeDelete(reviewId)
        });
    };

    const onConfirmAction = async () => {
        if (confirmation.action) {
            await confirmation.action();
        }
        setConfirmation({ ...confirmation, isOpen: false });
    };

    // --- Render Helpers ---
    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        className={`${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 font-sans text-slate-900">
            {notification && <Toast message={notification.message} type={notification.type} onClose={closeNotice} />}

            <ConfirmModal
                isOpen={confirmation.isOpen}
                message={confirmation.message}
                type={confirmation.type}
                onConfirm={onConfirmAction}
                onCancel={() => setConfirmation({ ...confirmation, isOpen: false })}
            />

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
                        Quản lý <span className="text-blue-600">Đánh giá</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1 italic uppercase tracking-widest text-[10px]">
                        Feedback từ hội viên về các gói tập
                    </p>
                </div>

                <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                        <Star size={20} className="fill-yellow-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng đánh giá</p>
                        <p className="text-xl font-black leading-none">{pagination.totalResults}</p>
                    </div>
                </div>
            </div>

            {/* --- TOOLBAR --- */}
            <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm mb-8 flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên khách hàng hoặc gói tập..."
                        className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all w-full lg:w-auto">
                    <Filter className="text-blue-600" size={18} />
                    <select
                        className="bg-transparent text-xs font-black uppercase text-slate-600 outline-none cursor-pointer tracking-wider w-full lg:w-auto"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Đã ẩn</option>
                    </select>
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
                        <p className="text-xs font-bold uppercase tracking-widest">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em]">
                                        <th className="px-8 py-6">Khách hàng</th>
                                        <th className="px-8 py-6">Gói tập & Đánh giá</th>
                                        <th className="px-8 py-6 w-1/3">Nội dung</th>
                                        <th className="px-8 py-6 text-center">Ngày tạo</th>
                                        <th className="px-8 py-6 text-center">Trạng thái</th>
                                        <th className="px-8 py-6 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {reviews.length > 0 ? reviews.map((review) => (
                                        <tr key={review._id} className="hover:bg-blue-50/20 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={review.client?.avatar_url || "https://ui-avatars.com/api/?name=" + review.client?.fullname}
                                                        alt="Avatar"
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{review.client?.fullname}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{review.client?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                                                        <Package size={14} className="text-blue-500" />
                                                        {review.package?.packageName || 'Unknown Package'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(review.rating)}
                                                        <span className="text-[10px] font-bold text-slate-400">({review.rating}/5)</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-start gap-2">
                                                    <MessageSquare size={14} className="text-slate-300 mt-1 shrink-0" />
                                                    <p className="text-sm text-slate-600 line-clamp-2 italic">
                                                        "{review.comment || 'Không có nội dung bình luận'}"
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-bold text-slate-700">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    <span className="text-[9px] font-black text-slate-300 uppercase">{new Date(review.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${STATUS_MAP[review.status]?.color || 'bg-slate-100'}`}>
                                                    {STATUS_MAP[review.status]?.icon}
                                                    {STATUS_MAP[review.status]?.label}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => setSelectedReview(review)}
                                                    className="p-2 bg-white text-slate-400 hover:text-blue-600 rounded-lg border border-slate-100 hover:border-blue-200 transition-all shadow-sm active:scale-95"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="py-20 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Search size={40} className="opacity-20" />
                                                    <p className="text-xs font-bold uppercase tracking-widest">Không tìm thấy đánh giá nào</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="bg-slate-50/50 px-8 py-5 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Trang {pagination.currentPage} / {pagination.totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                                    disabled={pagination.currentPage === 1}
                                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* --- DETAIL MODAL --- */}
            {selectedReview && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-slate-100">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Chi tiết đánh giá</h3>
                            <button onClick={() => setSelectedReview(null)}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <img
                                    src={selectedReview.client?.avatar_url || "https://ui-avatars.com/api/?name=" + selectedReview.client?.fullname}
                                    className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                                />
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800">{selectedReview.client?.fullname}</h4>
                                    <p className="text-sm text-slate-500">{selectedReview.client?.email}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Gói tập</span>
                                    <span className="font-bold text-blue-600 text-sm">{selectedReview.package?.packageName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Đánh giá</span>
                                    <div className="flex items-center gap-2">
                                        {renderStars(selectedReview.rating)}
                                        <span className="font-bold text-slate-700">{selectedReview.rating}/5</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-200">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Nội dung</span>
                                    <p className="text-sm text-slate-600 italic leading-relaxed">"{selectedReview.comment}"</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setSelectedReview(null)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 text-xs uppercase tracking-widest transition-all">Đóng</button>

                            {selectedReview.status === REVIEW_STATUS.PENDING && (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedReview._id, REVIEW_STATUS.REJECTED)}
                                        className="px-6 py-3 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm flex items-center gap-2 transition-all"
                                    >
                                        <XCircle size={16} /> Ẩn
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedReview._id, REVIEW_STATUS.APPROVED)}
                                        className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all"
                                    >
                                        <CheckCircle size={16} /> Duyệt
                                    </button>
                                </>
                            )}

                            {selectedReview.status === REVIEW_STATUS.APPROVED && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedReview._id, REVIEW_STATUS.REJECTED)}
                                    className="px-6 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 transition-all"
                                >
                                    <XCircle size={16} /> Ẩn đánh giá này
                                </button>
                            )}

                            {selectedReview.status === REVIEW_STATUS.REJECTED && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedReview._id, REVIEW_STATUS.APPROVED)}
                                    className="px-6 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 transition-all"
                                >
                                    <CheckCircle size={16} /> Hiển thị lại
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewManagement;