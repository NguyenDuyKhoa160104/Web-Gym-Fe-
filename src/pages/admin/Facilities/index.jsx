import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
  Dumbbell,
  Eye,
  Calendar,
  MoreVertical
} from 'lucide-react';

const FacilityManagement = () => {
  // Mock Data - Dữ liệu giả lập thiết bị
  const [facilities, setFacilities] = useState([
    { 
      id: 1, 
      name: "Máy chạy bộ Technogym", 
      category: "Cardio", 
      quantity: 10, 
      status: "Operational",
      condition: "Good",
      lastMaintenance: "2023-10-15",
      nextMaintenance: "2024-01-15",
      image: null
    },
    { 
      id: 2, 
      name: "Giàn tạ đa năng", 
      category: "Strength", 
      quantity: 5, 
      status: "Maintenance",
      condition: "Fair",
      lastMaintenance: "2023-09-01",
      nextMaintenance: "2023-12-01",
      image: null
    },
    { 
      id: 3, 
      name: "Thảm Yoga cao su", 
      category: "Accessories", 
      quantity: 50, 
      status: "Operational",
      condition: "New",
      lastMaintenance: "2023-11-01",
      nextMaintenance: "2024-05-01",
      image: null
    },
    { 
      id: 4, 
      name: "Máy ép ngực (Chest Press)", 
      category: "Strength", 
      quantity: 3, 
      status: "Broken",
      condition: "Poor",
      lastMaintenance: "2023-08-20",
      nextMaintenance: "2023-11-20",
      image: null
    },
    { 
      id: 5, 
      name: "Xe đạp tập (Spin Bike)", 
      category: "Cardio", 
      quantity: 15, 
      status: "Operational",
      condition: "Good",
      lastMaintenance: "2023-10-01",
      nextMaintenance: "2024-01-01",
      image: null
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Xử lý tìm kiếm và lọc
  const filteredFacilities = facilities.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Render Badge cho Status (Trạng thái hoạt động)
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Operational': 
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle size={12} /> Hoạt động tốt
          </span>
        );
      case 'Maintenance': 
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Wrench size={12} /> Đang bảo trì
          </span>
        );
      case 'Broken': 
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle size={12} /> Hỏng/Cần sửa
          </span>
        );
      default: 
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Unknown</span>;
    }
  };

  // Render Badge cho Category
  const getCategoryBadge = (category) => {
    const styles = {
      Cardio: "bg-blue-50 text-blue-700",
      Strength: "bg-purple-50 text-purple-700",
      Accessories: "bg-orange-50 text-orange-700",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border border-opacity-20 ${styles[category] || "bg-gray-50 text-gray-700"}`}>
        {category}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Cơ sở vật chất</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi tình trạng thiết bị và lịch bảo trì.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={18} />
          <span>Thêm thiết bị</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm thiết bị..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
              <Filter size={18} className="text-gray-500" />
              <select 
                className="bg-transparent text-sm text-gray-700 focus:outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="Operational">Hoạt động tốt</option>
                <option value="Maintenance">Đang bảo trì</option>
                <option value="Broken">Hỏng hóc</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Thiết bị</th>
                <th className="px-6 py-4">Số lượng</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Bảo trì gần nhất</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFacilities.length > 0 ? (
                filteredFacilities.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shadow-sm">
                          <Dumbbell size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <span className="text-xs text-gray-500">Tình trạng: {item.condition}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-700">{item.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getCategoryBadge(item.category)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="font-medium text-gray-700">{item.lastMaintenance}</span>
                         </div>
                         {item.status !== 'Broken' && (
                             <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <span>Tiếp theo: {item.nextMaintenance}</span>
                             </div>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Xem chi tiết">
                          <Eye size={18} />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors" title="Báo cáo hỏng/Sửa chữa">
                          <Wrench size={18} />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                             <Search size={24} className="text-gray-400"/>
                        </div>
                        <p>Không tìm thấy thiết bị nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">Hiển thị <span className="font-medium text-gray-900">1-{filteredFacilities.length}</span> trên tổng số <span className="font-medium text-gray-900">{facilities.length}</span> thiết bị</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-white disabled:opacity-50" disabled>Trước</button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-white">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityManagement;