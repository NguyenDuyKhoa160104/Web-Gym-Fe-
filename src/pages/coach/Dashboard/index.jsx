import React from 'react';
import { 
  Users, 
  Activity, 
  MessageSquare, 
  ChevronRight,
  TrendingUp,
  Clock,
  Shield
} from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {change && (
          <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp size={14} />
            {change}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
);
  
const AthleteRow = ({ name, sport, status, lastSession }) => (
    <tr className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors group cursor-pointer">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-medium group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-900">{name}</p>
            <p className="text-xs text-slate-500">{sport}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
          status === 'Ổn định' ? 'bg-green-50 text-green-700 border-green-200' :
          status === 'Chấn thương' ? 'bg-red-50 text-red-700 border-red-200' :
          'bg-yellow-50 text-yellow-700 border-yellow-200'
        }`}>
          {status}
        </span>
      </td>
      <td className="py-4 px-4 text-sm text-slate-600">{lastSession}</td>
      <td className="py-4 px-4 text-right">
        <button className="text-slate-400 group-hover:text-blue-600 transition-colors">
          <ChevronRight size={20} />
        </button>
      </td>
    </tr>
);
  
const CoachDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng VĐV" 
          value="24" 
          change="+12%" 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Buổi tập hôm nay" 
          value="8" 
          change="+5%" 
          icon={Activity} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Cần đánh giá" 
          value="13" 
          icon={MessageSquare} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Giờ huấn luyện" 
          value="142" 
          change="+8%" 
          icon={Clock} 
          color="bg-emerald-500" 
        />
      </div>
  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity / Athletes List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-800">Trạng thái VĐV</h2>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Vận động viên</th>
                  <th className="py-3 px-4 font-semibold">Trạng thái</th>
                  <th className="py-3 px-4 font-semibold">Buổi tập cuối</th>
                  <th className="py-3 px-4 font-semibold text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                <AthleteRow name="Nguyễn Văn A" sport="Điền kinh" status="Ổn định" lastSession="2 giờ trước" />
                <AthleteRow name="Trần Thị B" sport="Bơi lội" status="Cần chú ý" lastSession="Hôm qua" />
                <AthleteRow name="Lê Hoàng C" sport="Cử tạ" status="Chấn thương" lastSession="3 ngày trước" />
                <AthleteRow name="Phạm Minh D" sport="Tennis" status="Ổn định" lastSession="Hôm nay, 9:00 AM" />
                <AthleteRow name="Hoàng Anh E" sport="Bóng đá" status="Ổn định" lastSession="Hôm nay, 2:00 PM" />
              </tbody>
            </table>
          </div>
        </div>
  
        {/* Side Widgets */}
        <div className="space-y-6">
          {/* Upcoming Schedule */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-lg text-slate-800 mb-4">Lịch sắp tới</h2>
            <div className="space-y-4">
              {[
                { time: '09:00', title: 'Tập kỹ thuật', type: 'Cá nhân', color: 'border-l-4 border-blue-500' },
                { time: '14:30', title: 'Họp đội tuyển', type: 'Nhóm', color: 'border-l-4 border-purple-500' },
                { time: '16:00', title: 'Gym & Thể lực', type: 'Nhóm', color: 'border-l-4 border-orange-500' }
              ].map((item, idx) => (
                <div key={idx} className={`bg-slate-50 p-3 rounded-md ${item.color}`}>
                  <p className="text-xs font-bold text-slate-500 mb-1">{item.time}</p>
                  <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.type}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-slate-600 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Xem lịch đầy đủ
            </button>
          </div>
  
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md p-6 text-white">
            <h2 className="font-bold text-lg mb-2">Pro Plan</h2>
            <p className="text-blue-100 text-sm mb-4">Bạn đang sử dụng gói cao cấp. Hạn dùng đến 30/12/2024.</p>
            <div className="flex items-center justify-between text-sm bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <Shield size={16} /> Bảo mật
              </span>
              <span className="font-bold text-green-300">Đã bật</span>
            </div>
          </div>
        </div>
      </div>
    </div>
);

export default CoachDashboard;
