import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    MoreVertical,
    Plus,
    ChevronLeft,
    ChevronRight,
    Users,
    CheckCircle,
    AlertCircle,
    DollarSign,
    Coffee,
    Loader2,
    X,
    Save,
    Trash2,
    StickyNote,
    User
} from 'lucide-react';

/**
 * Helper lấy URL API
 */
const getApiUrl = () => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL_COACH) {
            return import.meta.env.VITE_API_URL_COACH;
        }
    } catch (e) { }
    return "http://localhost:5000/api/coach";
};

const API_COACH = getApiUrl();

// Helper lấy Base URL để hiển thị ảnh
const getSERVER_BASE_URL = () => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            if (import.meta.env.VITE_SERVER_BASE_URL) {
                return import.meta.env.VITE_SERVER_BASE_URL;
            }
            // Fallback lấy host từ API URL
            const url = new URL(API_COACH);
            return `${url.protocol}//${url.host}`;
        }
    } catch (e) { }
    return "http://localhost:5000";
};

const SERVER_URL = getSERVER_BASE_URL();

// ============================================================================
// HELPERS (Xử lý Ngày & Thứ tự động - Không cần thư viện)
// ============================================================================

// 1. Ánh xạ Date -> Thứ Việt Nam (T2, T3... CN)
const getVietnameseDay = (dateObj) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[dateObj.getDay()];
};

// 2. Lấy tên thứ đầy đủ (Thứ Hai, Thứ Ba...)
const getFullDayName = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    // Format chuẩn tiếng Việt
    return date.toLocaleDateString('vi-VN', { weekday: 'long' });
};

// 3. Lấy index thứ để gửi Backend lọc (0=CN, 1=T2, ... 6=T7)
const getDayOfWeekIndex = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDay();
};

// 4. Hàm chuẩn hóa ngày về YYYY-MM-DD để so sánh
const normalizeDate = (dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
};

// ============================================================================
// COMPONENT: TOAST NOTIFICATION
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

// ============================================================================
// COMPONENT: CONFIRM MODAL
// ============================================================================
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isProcessing }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={!isProcessing ? onCancel : undefined}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Xóa ngay'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// COMPONENT: DATE SELECTOR
// ============================================================================

const DateSelector = ({ selectedDate, onSelectDate, minDate }) => {
    const [startViewDate, setStartViewDate] = useState(new Date(selectedDate));
    const [days, setDays] = useState([]);

    useEffect(() => {
        const base = new Date(startViewDate);
        if (isNaN(base.getTime())) return;

        const next7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(base);
            d.setDate(base.getDate() + i);
            return {
                dayLabel: getVietnameseDay(d),
                dateNum: d.getDate(),
                fullDate: d.toISOString().split('T')[0]
            };
        });
        setDays(next7Days);
    }, [startViewDate]);

    useEffect(() => {
        if (selectedDate) {
            const selDate = new Date(selectedDate);
            if (minDate && selDate < new Date(minDate)) {
                setStartViewDate(new Date(minDate));
            } else {
                setStartViewDate(selDate);
            }
        }
    }, [selectedDate, minDate]);

    const handlePrevWeek = () => {
        const newDate = new Date(startViewDate);
        newDate.setDate(newDate.getDate() - 7);
        if (minDate && newDate < new Date(minDate)) {
            setStartViewDate(new Date(minDate));
        } else {
            setStartViewDate(newDate);
        }
    };

    const handleNextWeek = () => {
        const newDate = new Date(startViewDate);
        newDate.setDate(newDate.getDate() + 7);
        setStartViewDate(newDate);
    };

    const handleDatePickerChange = (e) => {
        const dateStr = e.target.value;
        if (!dateStr) return;
        onSelectDate(dateStr);
        setStartViewDate(new Date(dateStr));
    };

    const isPrevDisabled = minDate && startViewDate <= new Date(minDate);

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 capitalize">
                    Tháng {startViewDate.getMonth() + 1}, {startViewDate.getFullYear()}
                </h3>

                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        <button
                            onClick={handlePrevWeek}
                            disabled={isPrevDisabled}
                            className={`p-1.5 rounded-full transition-colors ${isPrevDisabled ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={handleNextWeek} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type="date"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            value={selectedDate}
                            min={minDate}
                            onChange={handleDatePickerChange}
                        />
                        <button className="px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase text-slate-600 bg-slate-50 border border-slate-200">
                            <CalendarIcon size={14} />
                            <span>Chọn ngày</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {days.map((item) => {
                    const isSelected = selectedDate === item.fullDate;
                    const isPast = minDate && item.fullDate < minDate;

                    return (
                        <button
                            key={item.fullDate}
                            onClick={() => !isPast && onSelectDate(item.fullDate)}
                            disabled={isPast}
                            className={`flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-xl transition-all ${isSelected
                                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                : isPast
                                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-60'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-blue-100' : 'text-inherit'}`}>
                                {item.dayLabel}
                            </span>
                            <span className="text-lg font-bold">{item.dateNum}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================================================
// COMPONENT: SESSION CARD
// ============================================================================

const SessionCard = ({ session, onDelete }) => {
    const getSessionStyle = (status) => {
        switch (status) {
            case 'scheduled': return { border: 'border-l-4 border-l-blue-500', badge: 'bg-blue-100 text-blue-700', label: 'Sắp tới' };
            case 'completed': return { border: 'border-l-4 border-l-green-500', badge: 'bg-green-100 text-green-700', label: 'Hoàn thành' };
            case 'canceled': return { border: 'border-l-4 border-l-red-500', badge: 'bg-red-100 text-red-700', label: 'Đã hủy' };
            default: return { border: 'border-l-4 border-l-slate-400', badge: 'bg-slate-100 text-slate-700', label: status || 'Sắp tới' };
        }
    };

    const style = getSessionStyle(session.status);

    // --- MAPPING DỮ LIỆU TỪ JSON ---
    // Structure: session -> student -> client -> {fullname, email, avatar_url}
    const clientInfo = session.student?.client || {};
    const studentName = clientInfo.fullname || session.studentName || 'Học viên';
    const studentEmail = clientInfo.email || '';
    const avatarUrl = clientInfo.avatar_url;

    // Xử lý URL ảnh
    const displayAvatar = avatarUrl
        ? (avatarUrl.startsWith('http') ? avatarUrl : `${SERVER_URL}${avatarUrl}`)
        : null;

    return (
        <div className="flex gap-4 group mb-4">
            <div className="flex flex-col items-center w-16 pt-2">
                <span className="text-sm font-bold text-slate-800">{session.startTime}</span>
                <div className="flex-1 w-0.5 bg-slate-200 my-2 group-last:hidden"></div>
                <span className="text-xs text-slate-400 group-last:hidden">{session.endTime}</span>
            </div>

            <div className={`flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden ${style.border}`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${style.badge}`}>
                            {style.label}
                        </span>
                    </div>
                    <button
                        onClick={() => onDelete(session._id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                        title="Xóa lịch này"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                        {displayAvatar ? (
                            <img
                                src={displayAvatar}
                                alt={studentName}
                                className="w-6 h-6 rounded-full object-cover border border-slate-100"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                        ) : (
                            <User size={18} className="text-slate-400" />
                        )}
                        {studentName}
                    </h3>

                    {/* Hiển thị Email */}
                    {studentEmail && (
                        <p className="text-xs text-slate-400 ml-8 mb-2 truncate max-w-[200px]">{studentEmail}</p>
                    )}

                    {session.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100 flex gap-2 items-start">
                            <StickyNote size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-600 italic line-clamp-2">{session.notes}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            <span>Phòng tập</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>{session.startTime} - {session.endTime}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN CONTENT: COACH SCHEDULE
// ============================================================================

const CoachSchedule = () => {
    const today = new Date();
    const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    const [selectedDate, setSelectedDate] = useState(todayStr);

    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    const [formData, setFormData] = useState({
        studentId: '',
        date: todayStr,
        startTime: '',
        endTime: '',
        notes: ''
    });

    const showNotice = (message, type = 'success') => setNotification({ message, type });
    const closeNotice = () => setNotification(null);

    // --- 1. LẤY DANH SÁCH HỌC VIÊN ---
    const fetchMyStudents = async () => {
        try {
            const token = localStorage.getItem('tokenCoach');
            const coachData = JSON.parse(localStorage.getItem('dataCoach') || '{}');
            const coachId = coachData._id || coachData.id;

            if (!token || !coachId) return;

            const response = await fetch(`${API_COACH}/my-students/${coachId}?limit=100`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (result.success) {
                setStudents(result.data);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách học viên:", error);
        }
    };

    // --- 2. LẤY DANH SÁCH LỊCH TRÌNH ---
    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('tokenCoach');
            const coachData = JSON.parse(localStorage.getItem('dataCoach') || '{}');
            const coachId = coachData._id || coachData.id;

            if (!token || !coachId) return;

            const response = await fetch(`${API_COACH}/my-schedules/${coachId}?date=${selectedDate}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();

            if (result.success) {
                const filteredData = result.data.filter(s => {
                    const sessionDate = normalizeDate(s.date);
                    return sessionDate === selectedDate;
                });

                const sortedData = filteredData.sort((a, b) => a.startTime.localeCompare(b.startTime));
                setSessions(sortedData);
            }
        } catch (error) {
            console.error("Lỗi lấy lịch trình:", error);
            showNotice("Không thể tải lịch tập", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 3. THÊM LỊCH TRÌNH ---
    const handleAddSchedule = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        const token = localStorage.getItem('tokenCoach');
        const coachData = JSON.parse(localStorage.getItem('dataCoach') || '{}');
        const coachId = coachData._id || coachData.id;

        try {
            const payload = {
                studentId: formData.studentId,
                date: formData.date,
                dayOfWeek: getDayOfWeekIndex(formData.date), // Sử dụng hàm mới getDayOfWeekIndex
                startTime: formData.startTime,
                endTime: formData.endTime,
                notes: formData.notes
            };

            const response = await fetch(`${API_COACH}/add-schedule/${coachId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok || response.status === 201) {
                showNotice("Thêm lịch thành công!", "success");
                setShowAddModal(false);
                setFormData({ ...formData, studentId: '', startTime: '', endTime: '', notes: '' });

                if (formData.date === selectedDate) {
                    fetchSchedules();
                } else {
                    setSelectedDate(formData.date);
                }
            } else {
                showNotice(result.message || "Lỗi khi thêm lịch", "error");
            }
        } catch (error) {
            showNotice("Lỗi kết nối server", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- 4. XÓA LỊCH TRÌNH ---
    const confirmDelete = (id) => {
        setDeleteModal({ isOpen: true, id });
    };

    const handleDeleteSchedule = async () => {
        const { id } = deleteModal;
        if (!id) return;

        setIsProcessing(true);
        const token = localStorage.getItem('tokenCoach');

        try {
            const response = await fetch(`${API_COACH}/delete-schedule/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showNotice("Đã xóa lịch trình", "success");
                setSessions(prev => prev.filter(s => s._id !== id));
            } else {
                showNotice("Không thể xóa lịch trình này", "error");
            }
        } catch (error) {
            showNotice("Lỗi kết nối", "error");
        } finally {
            setIsProcessing(false);
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    const openAddModal = () => {
        setFormData(prev => ({ ...prev, date: selectedDate }));
        setShowAddModal(true);
    };

    useEffect(() => {
        fetchMyStudents();
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [selectedDate]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in p-4 lg:p-8">
            {notification && <Toast message={notification.message} type={notification.type} onClose={closeNotice} />}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Xác nhận xóa lịch"
                message="Bạn có chắc chắn muốn xóa lịch tập này không? Hành động này không thể hoàn tác."
                onConfirm={handleDeleteSchedule}
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
                isProcessing={isProcessing}
            />

            {/* Cột chính */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Lịch làm việc</h2>
                        <p className="text-slate-500">Quản lý các ca dạy trong tuần</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Thêm lịch dạy</span>
                        </button>
                    </div>
                </div>

                <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} minDate={todayStr} />

                <div className="bg-slate-50/50 rounded-2xl p-4 min-h-[300px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p className="text-sm">Đang tải lịch trình...</p>
                        </div>
                    ) : sessions.length > 0 ? (
                        sessions.map(session => (
                            <SessionCard key={session._id} session={session} onDelete={confirmDelete} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                            <CalendarIcon size={48} className="mb-2 opacity-20" />
                            <p>Không có lịch trong ngày này</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Cột phụ */}
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-md p-6 text-white">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign size={20} className="text-emerald-400" />
                        <h3 className="font-bold text-lg">Tổng quan hôm nay</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                            <p className="text-xs text-slate-300 mb-1">Số ca dạy</p>
                            <p className="text-2xl font-bold">{sessions.length}</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                            <p className="text-xs text-slate-300 mb-1">Giờ dạy</p>
                            <p className="text-2xl font-bold">{sessions.length}h</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL THÊM LỊCH */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <h3 className="text-xl font-bold text-slate-800">Đặt lịch mới</h3>
                            <button onClick={() => setShowAddModal(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                        </div>

                        <form onSubmit={handleAddSchedule} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Ngày tập</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        required
                                        min={todayStr}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-600 pointer-events-none capitalize">
                                        {getFullDayName(formData.date)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Chọn học viên</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    >
                                        <option value="">-- Danh sách học viên --</option>
                                        {students.map(st => (
                                            <option key={st._id} value={st._id}>
                                                {st.client?.fullname || 'Học viên'} - {st.client?.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Bắt đầu</label>
                                    <input
                                        type="time" required
                                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Kết thúc</label>
                                    <input
                                        type="time" required
                                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Ghi chú (Tùy chọn)</label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Nội dung buổi tập, lưu ý..."
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Lưu lịch tập</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachSchedule;