import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut, 
  X 
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, to, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors rounded-lg mb-1 ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Sidebar = ({ isOpen, setIsOpen, activeTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, to: '/coach/dashboard' },
    { id: 'students', label: 'Học viên', icon: Users, to: '/coach/students' },
    { id: 'schedule', label: 'Lịch trình', icon: Calendar, to: '/coach/schedule' },
    { id: 'messages', label: 'Tin nhắn', icon: MessageSquare, to: '/coach/messages' },
    { id: 'settings', label: 'Cài đặt', icon: Settings, to: '/coach/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 bottom-0 z-30 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xl">
            <Activity className="h-6 w-6" />
            <span className="text-blue-400">HD</span>FITNESS
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
              />
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
