import React, { useState, useEffect } from 'react';
import {
    Activity,
    MessageSquare,
    MoreVertical,
    Filter,
    Plus,
    Search,
    Loader2,
    Calendar,
    User,
    Mail,
    Phone,
    Target
} from 'lucide-react';

/**
 * Helper lấy URL API an toàn
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

// ============================================================================
// COMPONENT: STUDENT CARD (Thẻ thông tin học viên)
// ============================================================================

const StudentCard = ({ studentData }) => {
    // studentData là object Student từ DB, chứa populate client
    const { client, status, enrollmentDate, createdAt } = studentData;

    // Fallback nếu client bị null (trường hợp data lỗi)
    if (!client) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Mapping trạng thái sang màu sắc UI
    const getStatusColor = (st) => {
        switch (st?.toLowerCase()) {
            case 'active': return 'bg-green-50 text-green-700 border-green-100';
            case 'inactive': return 'bg-gray-50 text-gray-700 border-gray-100';
            case 'completed': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        }
    };

    const getStatusLabel = (st) => {
        switch (st?.toLowerCase()) {
            case 'active': return 'Đang tập';
            case 'inactive': return 'Tạm ngưng';
            case 'completed': return 'Hoàn thành';
            default: return st || 'Chờ duyệt';
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 overflow-hidden border border-slate-100">
                        {client.avatar_url && client.avatar_url !== 'default-avatar.png' ? (
                            <img src={client.avatar_url} alt={client.fullname} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-lg">{client.fullname?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{client.fullname}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail size={10} /> {client.email}
                        </p>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-50 p-2 rounded flex flex-col justify-center">
                    <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                        <Target size={10} /> Mục tiêu
                    </span>
                    <span className="font-medium text-slate-700 text-xs truncate" title={client.health_info?.target}>
                        {client.health_info?.target || 'Chưa cập nhật'}
                    </span>
                </div>
                <div className="bg-slate-50 p-2 rounded flex flex-col justify-center">
                    <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                        <Calendar size={10} /> Ngày tham gia
                    </span>
                    <span className="font-medium text-slate-700 text-xs">
                        {formatDate(enrollmentDate || createdAt)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-auto">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                </span>
                <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                    <Phone size={12} /> {client.phone}
                </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                    <MessageSquare size={16} /> Nhắn tin
                </button>
                <button className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                    Hồ sơ
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN CONTENT: STUDENT MANAGEMENT
// ============================================================================

const CoachMyStudents = () => {
    // --- States ---
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    // --- Fetch Data Logic ---
    const fetchMyStudents = async (search = '') => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Lấy token và ID coach từ localStorage
            const token = localStorage.getItem('tokenCoach');
            const coachData = JSON.parse(localStorage.getItem('dataCoach') || '{}');
            const coachId = coachData._id || coachData.id; // Tùy cấu trúc lưu

            if (!token || !coachId) {
                throw new Error("Không tìm thấy thông tin xác thực. Vui lòng đăng nhập lại.");
            }

            // 2. Xây dựng URL query
            let url = `${API_COACH}/my-students/${coachId}?limit=100`; // Lấy hết hoặc phân trang sau
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }

            // 3. Gọi API
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setStudents(result.data);
            } else {
                setError(result.message || "Không thể tải danh sách học viên.");
            }

        } catch (err) {
            console.error("Lỗi fetch students:", err);
            setError(err.message || "Lỗi kết nối đến máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    // Gọi API khi component mount
    useEffect(() => {
        fetchMyStudents();
    }, []);

    // Xử lý tìm kiếm (Debounce nhẹ hoặc Enter)
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchMyStudents(searchTerm);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-4 lg:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Danh sách Học viên</h2>
                    <p className="text-slate-500 text-sm">Quản lý và theo dõi tiến độ học viên của bạn.</p>
                </div>

                {/* Toolbar Section */}
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tên, email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium shadow-sm transition-colors">
                        <Filter size={18} />
                    </button>
                    {/* <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md transition-colors">
                        <Plus size={18} />
                        <span className="hidden sm:inline">Thêm</span>
                    </button> */}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => fetchMyStudents()} className="underline font-bold hover:text-red-800">Thử lại</button>
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-600" />
                    <p className="text-sm font-medium">Đang tải dữ liệu học viên...</p>
                </div>
            ) : (
                <>
                    {/* Grid List Students */}
                    {students.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {students.map(student => (
                                <StudentCard key={student._id} studentData={student} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 border-dashed">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">Chưa có học viên nào</h3>
                            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                                Hiện tại bạn chưa có học viên đăng ký. Hãy chờ quản trị viên phân bổ hoặc học viên đăng ký mới.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CoachMyStudents;