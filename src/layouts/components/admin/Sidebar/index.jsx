import React from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Dumbbell,
    Wallet,
    TrendingUp,
    LogOut,
    Calendar,
    Settings,
    Package,
    Wrench,
    BarChart2,
    ShoppingCart,
    Building
} from 'lucide-react';

// Component con để hiển thị từng mục trong menu
const SidebarItem = ({ icon: Icon, label, active = false, to }) => (
    <Link
        to={to}
        className={`flex items-center px-4 py-3 mb-1 rounded-lg cursor-pointer transition-all duration-200 group ${active
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
    >
        <Icon size={20} className={`mr-3 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
        <span className="font-medium text-sm">{label}</span>
    </Link>
);

const Sidebar = ({ isOpen, activeTab }) => {
    return (
        <aside
            className={`${isOpen ? 'w-64' : 'w-20'
                } bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out shadow-xl z-20 flex-shrink-0`}
        >
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-center border-b border-slate-800">
                <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Dumbbell size={24} className="text-white" />
                    </div>
                    {isOpen && (
                        <span className="text-xl font-bold tracking-wider">
                            <span className="text-blue-500">HD</span>FITNESS
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 py-6 overflow-y-auto">
                <SidebarItem
                    icon={TrendingUp}
                    label={isOpen ? "Dashboard" : ""}
                    active={activeTab === 'dashboard'}
                    to="/admin/dashboard"
                />
                <SidebarItem
                    icon={Users}
                    label={isOpen ? "Hội Viên" : ""}
                    active={activeTab === 'members'}
                    to="/admin/members"
                />
                <SidebarItem
                    icon={Dumbbell}
                    label={isOpen ? "Huấn Luyện Viên" : ""}
                    active={activeTab === 'coaches'}
                    to="/admin/coaches"
                />
                {/* <SidebarItem
                    icon={Calendar}
                    label={isOpen ? "Lịch Tập" : ""}
                    active={activeTab === 'schedule'}
                    to="/admin/schedule"
                /> */}

                <SidebarItem
                    icon={Package}
                    label={isOpen ? "Quản lý Gói tập" : ""}
                    active={activeTab === 'packages'}
                    to="/admin/packages"
                />
                <SidebarItem
                    icon={Wrench}
                    label={isOpen ? "Quản lý CSVC" : ""}
                    active={activeTab === 'facilities'}
                    to="/admin/facilities"
                />
                <SidebarItem
                    icon={Building}
                    label={isOpen ? "Quản lý Phòng tập" : ""}
                    active={activeTab === 'rooms'}
                    to="/admin/rooms"
                />
                <SidebarItem
                    icon={ShoppingCart}
                    label={isOpen ? "Đơn Hàng" : ""}
                    active={activeTab === 'orders'}
                    to="/admin/orders"
                />
                <SidebarItem
                    icon={BarChart2}
                    label={isOpen ? "Thống Kê" : ""}
                    active={activeTab === 'statistics'}
                    to="/admin/statistics"
                />

                <div className="my-4 border-t border-slate-800"></div>

                <SidebarItem
                    icon={Settings}
                    label={isOpen ? "Cài Đặt" : ""}
                    active={activeTab === 'settings'}
                    to="/admin/settings"
                />
            </nav>

            {/* Sidebar Footer (User Profile) */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <div className={`flex items-center ${!isOpen && 'justify-center'}`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg border-2 border-slate-700">
                        AD
                    </div>
                    {isOpen && (
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-semibold truncate">Admin User</p>
                            <p className="text-xs text-slate-400 truncate">Quản Trị Viên</p>
                        </div>
                    )}
                    {isOpen && (
                        <button className="ml-auto text-slate-400 hover:text-red-400 transition-colors" title="Đăng xuất">
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;