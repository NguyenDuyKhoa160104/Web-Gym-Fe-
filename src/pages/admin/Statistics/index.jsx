import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  Activity, 
  Download, 
  Filter, 
  ChevronDown,
  PieChart,
  BarChart2
} from 'lucide-react';

const Statistics = () => {
  const [timeRange, setTimeRange] = useState('month');

  // Mock Data: Doanh thu 6 tháng gần nhất (Đơn vị: Triệu VNĐ)
  const revenueData = [
    { month: 'T7', value: 120, height: 'h-32' },
    { month: 'T8', value: 145, height: 'h-40' },
    { month: 'T9', value: 135, height: 'h-36' },
    { month: 'T10', value: 160, height: 'h-48' },
    { month: 'T11', value: 190, height: 'h-56' },
    { month: 'T12', value: 245, height: 'h-64' },
  ];

  // Mock Data: Top Coach
  const topCoaches = [
    { name: "Nguyễn Văn Hùng", classes: 45, rating: 4.9, revenue: "25M" },
    { name: "Trần Thu Hà", classes: 42, rating: 4.8, revenue: "22M" },
    { name: "Mike Johnson", classes: 38, rating: 4.7, revenue: "18M" },
  ];

  // Helper render biểu đồ cột đơn giản bằng CSS
  const renderBarChart = () => (
    <div className="flex items-end justify-between gap-4 h-64 mt-8 px-2">
      {revenueData.map((data, index) => (
        <div key={index} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
          <div className="relative w-full flex justify-center">
            {/* Tooltip */}
            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
              {data.value} Triệu
            </div>
            {/* Bar */}
            <div 
              className={`w-full max-w-[40px] ${data.height} bg-blue-100 group-hover:bg-blue-500 rounded-t-lg transition-all duration-300 relative`}
            ></div>
          </div>
          <span className="text-xs font-medium text-gray-500">{data.month}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thống Kê & Báo Cáo</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng quan hiệu suất kinh doanh và hoạt động.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">7 ngày qua</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm nay</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={18} />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Tổng Doanh Thu", value: "245.8M", trend: "+12.5%", isPositive: true, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Hội Viên Mới", value: "128", trend: "+4.2%", isPositive: true, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Lượt Check-in", value: "1,452", trend: "-2.1%", isPositive: false, icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
          { title: "Gói Hết Hạn", value: "12", trend: "Cần xử lý", isPositive: false, icon: Calendar, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stat.isPositive ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <BarChart2 size={20} className="text-gray-500"/>
              Biểu đồ doanh thu (6 tháng)
            </h3>
            <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></span>
                <span className="text-sm text-gray-500">Doanh thu thực tế</span>
            </div>
          </div>
          {renderBarChart()}
        </div>

        {/* Demographics / Pie Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
            <PieChart size={20} className="text-gray-500"/>
            Phân bổ gói tập
          </h3>
          <div className="flex-1 flex items-center justify-center relative">
            {/* CSS Conic Gradient Pie Chart */}
            <div 
              className="w-48 h-48 rounded-full relative"
              style={{
                background: 'conic-gradient(#3b82f6 0% 45%, #a855f7 45% 70%, #f97316 70% 100%)'
              }}
            >
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-gray-800">1,245</span>
                    <span className="text-xs text-gray-500">Tổng HV</span>
                </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-gray-600">Gói 1 Năm (45%)</span>
                </div>
                <span className="font-semibold text-gray-900">560</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span className="text-gray-600">Gói PT 1:1 (25%)</span>
                </div>
                <span className="font-semibold text-gray-900">311</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span className="text-gray-600">Gói tháng (30%)</span>
                </div>
                <span className="font-semibold text-gray-900">374</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Coaches & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Top Huấn Luyện Viên (Tháng 12)</h3>
          <div className="space-y-4">
            {topCoaches.map((coach, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            {i + 1}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{coach.name}</p>
                            <p className="text-xs text-gray-500">{coach.classes} lớp • {coach.rating} sao</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-green-600">+{coach.revenue}</p>
                        <p className="text-xs text-gray-400">Doanh thu</p>
                    </div>
                </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
            {/* Decor element */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            
            <div>
                <h3 className="font-bold text-xl mb-2">Mục tiêu tháng 12</h3>
                <p className="text-indigo-100 text-sm mb-6">Tiến độ đạt được so với kế hoạch đề ra đầu tháng.</p>
                
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Doanh thu (250M)</span>
                            <span className="font-bold">98%</span>
                        </div>
                        <div className="w-full bg-indigo-900/50 rounded-full h-2">
                            <div className="bg-white h-2 rounded-full" style={{width: '98%'}}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Hội viên mới (150)</span>
                            <span className="font-bold">85%</span>
                        </div>
                        <div className="w-full bg-indigo-900/50 rounded-full h-2">
                            <div className="bg-white h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <button className="mt-6 w-full py-3 bg-white text-indigo-700 font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-md">
                Xem báo cáo chi tiết
            </button>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
