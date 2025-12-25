import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Filter, Edit, Trash2, X,
    Dumbbell, Activity, Flower, UploadCloud,
    MapPin, Users, PenTool, CheckCircle, AlertTriangle,
    Loader2, Info, Save, Lock, Unlock, Wrench, AlertCircle, Image as ImageIcon
} from 'lucide-react';

/**
 * Helper lấy URL API Admin an toàn
 */
const getAdminApiUrl = () => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL_ADMIN) {
            return import.meta.env.VITE_API_URL_ADMIN;
        }
        if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL_ADMIN) {
            return process.env.REACT_APP_API_URL_ADMIN;
        }
    } catch (e) { }
    return "http://localhost:5000/api/admin";
};

const API_ADMIN = getAdminApiUrl();

/**
 * CONSTANTS: ROOM STATUS (Khớp hoàn toàn với Backend)
 */
const ROOM_STATUS = {
    AVAILABLE: 'available',
    UNAVAILABLE: 'unavailable',
    MAINTENANCE: 'maintenance'
};

// ============================================================================
// COMPONENT: TOAST NOTIFICATION (Thay thế Alert)
// ============================================================================
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 border ${type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
            {type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <p className="font-bold text-sm">{message}</p>
            <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={16} /></button>
        </div>
    );
};

const RoomManagement = () => {
    // --- Data States ---
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    // --- UI States ---
    const [notification, setNotification] = useState(null);

    // --- Modal States ---
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    // --- Form State ---
    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
        description: '',
        image: '', // Thêm trường image
        status: ROOM_STATUS.AVAILABLE // Default value
    });

    // --- Helpers ---
    const showNotice = (message, type = 'success') => {
        setNotification({ message, type });
    };
    const closeNotice = () => setNotification(null);

    // --- Fetch Data ---
    const fetchRooms = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(`${API_ADMIN}/all-rooms`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (result.success) {
                setRooms(result.data);
            } else {
                setError(result.message || "Không thể tải danh sách phòng.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Lỗi kết nối máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    // --- 1. LOGIC THÊM PHÒNG ---
    const handleAddRoom = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(`${API_ADMIN}/add-room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                await fetchRooms();
                setShowAddModal(false);
                showNotice("Thêm phòng thành công!", "success");
            } else {
                showNotice(result.message || "Thêm phòng thất bại", "error");
            }
        } catch (err) {
            showNotice("Lỗi hệ thống: " + err.message, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- 2. LOGIC CẬP NHẬT PHÒNG ---
    const handleUpdateRoom = async (e) => {
        e.preventDefault();
        if (!selectedRoom) return;
        setIsProcessing(true);

        const token = localStorage.getItem('tokenAdmin');

        try {
            // Bước 1: Cập nhật thông tin cơ bản
            const updateResponse = await fetch(`${API_ADMIN}/update-room/${selectedRoom._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    capacity: formData.capacity,
                    description: formData.description,
                    image: formData.image // Thêm cập nhật ảnh
                })
            });

            const updateResult = await updateResponse.json();

            if (!updateResponse.ok) {
                throw new Error(updateResult.message || "Cập nhật thông tin thất bại");
            }

            // Bước 2: Xử lý đổi trạng thái nếu có thay đổi
            if (formData.status !== selectedRoom.status) {
                let statusEndpoint = '';
                let statusBody = undefined;

                if (formData.status === ROOM_STATUS.MAINTENANCE) {
                    // Chuyển sang bảo trì -> maintain-room
                    statusEndpoint = `${API_ADMIN}/maintain-room/${selectedRoom._id}`;
                } else if (selectedRoom.status === ROOM_STATUS.MAINTENANCE && formData.status === ROOM_STATUS.AVAILABLE) {
                    // Từ bảo trì sang sẵn sàng -> unmaintain-room
                    statusEndpoint = `${API_ADMIN}/unmaintain-room/${selectedRoom._id}`;
                } else {
                    // Các trường hợp khóa/mở khác -> lock-room
                    statusEndpoint = `${API_ADMIN}/lock-room/${selectedRoom._id}`;
                    statusBody = JSON.stringify({ status: formData.status });
                }

                const statusResponse = await fetch(statusEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: statusBody
                });

                const statusResult = await statusResponse.json();

                if (!statusResponse.ok) {
                    throw new Error(statusResult.message || "Cập nhật trạng thái thất bại");
                }
            }

            await fetchRooms();
            setShowEditModal(false);
            showNotice("Cập nhật phòng tập thành công!", "success");

        } catch (err) {
            showNotice(err.message, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- 3. LOGIC XÓA PHÒNG ---
    const handleDeleteRoom = async () => {
        if (!selectedRoom) return;
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(`${API_ADMIN}/delete-room/${selectedRoom._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();

            if (response.ok && result.success) {
                setRooms(prev => prev.filter(r => r._id !== selectedRoom._id));
                setShowDeleteModal(false);
                showNotice(result.message || "Xóa phòng thành công!", "success");
            } else {
                showNotice(result.message || "Xóa thất bại", "error");
            }
        } catch (err) {
            showNotice("Lỗi hệ thống: " + err.message, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- 4. LOGIC KHÓA/MỞ NHANH (LOCK/OPEN) ---
    const handleQuickLock = async (room) => {
        const isLocking = room.status === ROOM_STATUS.AVAILABLE;
        const newStatus = isLocking ? ROOM_STATUS.UNAVAILABLE : ROOM_STATUS.AVAILABLE;

        setRooms(prev => prev.map(r => r._id === room._id ? { ...r, status: newStatus } : r));

        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(`${API_ADMIN}/lock-room/${room._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();

            if (!response.ok) {
                setRooms(prev => prev.map(r => r._id === room._id ? { ...r, status: room.status } : r));
                showNotice(result.message || "Không thể thay đổi trạng thái", "error");
            } else {
                if (result.data) {
                    setRooms(prev => prev.map(r => r._id === room._id ? result.data : r));
                }
                showNotice(result.message || "Đã cập nhật trạng thái", "success");
            }
        } catch (err) {
            setRooms(prev => prev.map(r => r._id === room._id ? { ...r, status: room.status } : r));
            showNotice("Lỗi kết nối", "error");
        }
    };

    // --- 5. LOGIC BẢO TRÌ (MAINTAIN / UNMAINTAIN) ---
    const handleMaintain = async (room) => {
        const isMaintenance = room.status === ROOM_STATUS.MAINTENANCE;
        // Nếu đang bảo trì -> Chuyển về Available (Unmaintain). Ngược lại -> Maintenance
        const newStatus = isMaintenance ? ROOM_STATUS.AVAILABLE : ROOM_STATUS.MAINTENANCE;

        setRooms(prev => prev.map(r => r._id === room._id ? { ...r, status: newStatus } : r));

        try {
            const token = localStorage.getItem('tokenAdmin');
            let response;
            let endpoint = '';

            if (newStatus === ROOM_STATUS.MAINTENANCE) {
                endpoint = `${API_ADMIN}/maintain-room/${room._id}`;
            } else {
                // Thoát bảo trì -> Gọi API unmaintain-room
                endpoint = `${API_ADMIN}/unmaintain-room/${room._id}`;
            }

            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
                // Cả 2 API này đều không cần body, chỉ cần ID trên URL
            });

            const result = await response.json();

            if (!response.ok) {
                setRooms(prev => prev.map(r => r._id === room._id ? { ...r, status: room.status } : r));
                showNotice(result.message || "Lỗi cập nhật bảo trì", "error");
            } else {
                if (result.data) {
                    setRooms(prev => prev.map(r => r._id === room._id ? result.data : r));
                }
                showNotice(result.message || "Đã cập nhật trạng thái bảo trì", "success");
            }
        } catch (err) {
            setRooms(prev => prev.map(r => r._id === room._id ? { ...r, status: room.status } : r));
            showNotice("Lỗi kết nối", "error");
        }
    };

    // --- Handlers UI ---
    const openAddModal = () => {
        setFormData({ name: '', capacity: '', description: '', image: '', status: ROOM_STATUS.AVAILABLE });
        setShowAddModal(true);
    };

    const openEditModal = (room) => {
        setSelectedRoom(room);
        setFormData({
            name: room.name,
            capacity: room.capacity,
            description: room.description || '',
            image: room.image || '', // Load ảnh hiện tại nếu có
            status: room.status
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (room) => {
        setSelectedRoom(room);
        setShowDeleteModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- UI Helpers ---
    const getRandomImage = (id) => {
        const images = [
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1534258936925-c48947b6bf02?q=80&w=1000&auto=format&fit=crop"
        ];
        const index = typeof id === 'string' ? id.charCodeAt(id.length - 1) % images.length : 0;
        return images[index] || images[0];
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case ROOM_STATUS.AVAILABLE:
                return <span className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">Sẵn sàng</span>;
            case ROOM_STATUS.MAINTENANCE:
                return <span className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">Bảo trì</span>;
            case ROOM_STATUS.UNAVAILABLE:
                return <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">Đã khóa</span>;
            default:
                return <span className="absolute top-4 left-4 bg-slate-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">{status}</span>;
        }
    };

    return (
        <div className="animate-in fade-in duration-500 font-sans">

            {/* Toast Notification */}
            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotice}
                />
            )}

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm phòng tập..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm font-medium text-slate-700"
                    />
                </div>

                <button
                    onClick={openAddModal}
                    className="bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                >
                    <Plus size={18} /> Thêm phòng mới
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-600" />
                    <p className="text-sm font-medium">Đang tải dữ liệu phòng tập...</p>
                </div>
            ) : (
                /* Rooms Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {rooms.length > 0 ? (
                        rooms.map((room) => (
                            <div key={room._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col relative">
                                {/* Image & Status Badge */}
                                <div className="h-48 bg-slate-100 relative group-hover:opacity-95 transition-opacity">
                                    <img src={room.image || getRandomImage(room._id)} alt={room.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    {getStatusBadge(room.status)}

                                    {/* Action Buttons Overlay */}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        {/* Nút Bảo trì */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleMaintain(room); }}
                                            className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-transform active:scale-90 ${room.status === ROOM_STATUS.MAINTENANCE
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-white/20 text-white hover:bg-orange-500'
                                                }`}
                                            title="Bảo trì"
                                        >
                                            <Wrench size={16} />
                                        </button>

                                        {/* Nút Khóa/Mở */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleQuickLock(room); }}
                                            className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-transform active:scale-90 ${room.status === ROOM_STATUS.AVAILABLE
                                                ? 'bg-white/20 text-white hover:bg-white hover:text-green-600'
                                                : 'bg-red-500 text-white hover:bg-red-600'
                                                }`}
                                            title={room.status === ROOM_STATUS.AVAILABLE ? 'Khóa phòng' : 'Mở khóa'}
                                        >
                                            {room.status === ROOM_STATUS.AVAILABLE ? <Unlock size={16} /> : <Lock size={16} />}
                                        </button>
                                    </div>

                                    <div className="absolute bottom-4 left-4 text-white">
                                        <h3 className="text-lg font-bold line-clamp-1 shadow-black drop-shadow-md">{room.name}</h3>
                                        <p className="text-xs font-medium opacity-90 flex items-center gap-1 mt-1">
                                            <MapPin size={12} /> Chi nhánh chính
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Sức chứa</p>
                                            <p className="font-bold text-slate-700 flex items-center gap-1.5 text-sm">
                                                <Users size={14} className="text-slate-400" /> {room.capacity}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Thiết bị</p>
                                            <p className="font-bold text-slate-700 flex items-center gap-1.5 text-sm">
                                                <Dumbbell size={14} className="text-slate-400" /> Đầy đủ
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-4 flex-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Mô tả</p>
                                        <p className="font-medium text-slate-600 text-xs line-clamp-2 leading-relaxed">
                                            {room.description || "Không có mô tả chi tiết cho phòng tập này."}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => openEditModal(room)}
                                            className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Edit size={14} /> Chỉnh sửa
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(room)}
                                            className="px-3 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-slate-400">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Info size={32} />
                                </div>
                            </div>
                            <p>Chưa có phòng tập nào được tạo.</p>
                        </div>
                    )}
                </div>
            )}

            {/* --- MODAL ADD NEW ROOM --- */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                Thêm phòng mới
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
                            <form onSubmit={handleAddRoom} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tên phòng <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 outline-none transition-all"
                                        placeholder="Ví dụ: Phòng Yoga 01"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hình ảnh (URL)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <ImageIcon size={16} className="text-slate-400" />
                                        </div>
                                        <input
                                            type="url"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleFormChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 outline-none transition-all"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                    {formData.image && (
                                        <div className="mt-3 h-32 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Invalid+Image"; }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sức chứa (Người) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleFormChange}
                                        min="1"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 outline-none transition-all"
                                        placeholder="20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mô tả / Ghi chú</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 outline-none resize-none transition-all"
                                        placeholder="Mô tả về phòng, trang thiết bị có sẵn..."
                                    ></textarea>
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Hủy bỏ</button>
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Lưu lại
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL EDIT ROOM --- */}
            {showEditModal && selectedRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                                Cập nhật thông tin
                            </h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
                            <form id="edit-room-form" onSubmit={handleUpdateRoom} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tên phòng</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hình ảnh (URL)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <ImageIcon size={16} className="text-slate-400" />
                                        </div>
                                        <input
                                            type="url"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleFormChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 outline-none transition-all"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                    {formData.image && (
                                        <div className="mt-3 h-32 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Invalid+Image"; }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sức chứa</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Trạng thái</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 outline-none cursor-pointer"
                                    >
                                        <option value={ROOM_STATUS.AVAILABLE}>Sẵn sàng (Available)</option>
                                        <option value={ROOM_STATUS.MAINTENANCE}>Bảo trì (Maintenance)</option>
                                        <option value={ROOM_STATUS.UNAVAILABLE}>Đã khóa (Unavailable)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mô tả</label>
                                    <textarea
                                        name="description"
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 outline-none resize-none"
                                    ></textarea>
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Hủy bỏ</button>
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg flex items-center gap-2"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Cập nhật
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL DELETE CONFIRM --- */}
            {showDeleteModal && selectedRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Trash2 size={28} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Xóa phòng này?</h3>
                            <p className="text-slate-500 text-sm font-medium mb-6">
                                Bạn đang xóa <strong>"{selectedRoom.name}"</strong>. Dữ liệu lịch tập liên quan có thể bị ảnh hưởng.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Hủy</button>
                                <button
                                    onClick={handleDeleteRoom}
                                    disabled={isProcessing}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : 'Xóa ngay'}
                                </button>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-red-600"></div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default RoomManagement;