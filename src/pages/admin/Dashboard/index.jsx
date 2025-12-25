import React from 'react';
import {
    Users,
    Dumbbell,
    Wallet,
    Activity,
    TrendingUp,
    Search
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// --- MOCK DATA (Dữ liệu giả lập) ---
// Trong thực tế, bạn có thể fetch dữ liệu này từ API trong useEffect
const statsData = [
    { title: "Tổng Hội Viên", value: "1,250", icon: Users, color: "bg-blue-600", trend: "+12% tháng này" },
    { title: "Huấn Luyện Viên", value: "35", icon: Dumbbell, color: "bg-purple-600", trend: "+2 nhân sự mới" },
    { title: "Doanh Thu (T12)", value: "450tr", icon: Wallet, color: "bg-emerald-500", trend: "+8.5% so với T11" },
    { title: "Đang Tập (Active)", value: "128", icon: Activity, color: "bg-orange-500", trend: "Giờ cao điểm" },
];

const revenueData = [
    { name: 'T7', revenue: 320, visitors: 800 },
    { name: 'T8', revenue: 450, visitors: 1100 },
    { name: 'T9', revenue: 400, visitors: 950 },
    { name: 'T10', revenue: 520, visitors: 1200 },
    { name: 'T11', revenue: 480, visitors: 1150 },
    { name: 'T12', revenue: 600, visitors: 1400 },
];

const recentMembers = [
    { id: 1, name: "Nguyễn Văn A", package: "Gói 12 Tháng", amount: "5.000.000đ", status: "Active" },
    { id: 2, name: "Trần Thị B", package: "Gói 3 Tháng", amount: "1.500.000đ", status: "Pending" },
    { id: 3, name: "Lê Văn C", package: "Gói 1 Tháng", amount: "600.000đ", status: "Active" },
    { id: 4, name: "Phạm Thu D", package: "PT 1-1", amount: "3.500.000đ", status: "Active" },
    { id: 5, name: "Hoàng Tuấn E", package: "Gói 6 Tháng", amount: "2.800.000đ", status: "Expired" },
];

const Dashboard = () => {
    return (
        <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-full">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tổng Quan Hệ Thống</h1>
                    <p className="text-slate-500 text-sm mt-1">Chào mừng trở lại, đây là tình hình phòng tập hôm nay.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition shadow-sm">
                        Xuất Báo Cáo
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-md flex items-center">
                        <Users size={16} className="mr-2" /> Thêm Hội Viên
                    </button>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${stat.trend.includes('+') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h3>
                        <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts & Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Chart: Revenue Analysis */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center">
                            <TrendingUp size={20} className="mr-2 text-blue-500" />
                            Phân Tích Doanh Thu
                        </h2>
                        <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1 focus:outline-none cursor-pointer">
                            <option>6 Tháng qua</option>
                            <option>Năm nay</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData} barSize={32}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Members */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Giao Dịch Mới</h2>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Tất cả</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-4">
                            {recentMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default">
                                    <div className="flex items-center min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold mr-3 flex-shrink-0">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{member.package}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <p className="text-sm font-bold text-slate-800">{member.amount}</p>
                                        <p className={`text-[10px] uppercase font-bold mt-1 ${member.status === 'Active' ? 'text-green-500' :
                                                member.status === 'Pending' ? 'text-orange-500' : 'text-red-500'
                                            }`}>
                                            {member.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="w-full mt-4 py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center">
                        <Search size={16} className="mr-2" /> Tra cứu giao dịch
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;