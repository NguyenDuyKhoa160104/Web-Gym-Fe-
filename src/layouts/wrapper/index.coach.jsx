import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/coach/Sidebar/index.jsx';
import Header from '../components/coach/Header/index.jsx';
import Footer from '../components/coach/Footer/index.jsx';

const CoachLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const activeTab = location.pathname.split('/')[2] || 'dashboard';

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activeTab={activeTab}
        setActiveTab={(tab) => {
            // This is a dummy function to avoid errors in the sidebar component
            // The navigation is handled by the Link components
        }}
      />
      
      {/* Wrapper / Layout Content */}
      <div className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        
        {/* Header Component */}
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          title={
            activeTab === 'dashboard' ? 'Dashboard Tổng Quan' : 
            activeTab === 'students' ? 'Quản lý Học viên' :
            activeTab === 'schedule' ? 'Quản lý Lịch trình' :
            activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
          }
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer Component */}
        <Footer />
      </div>
    </div>
  );
};

export default CoachLayout;
