import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar/index.jsx';
import Header from '../components/admin/Header/index.jsx';
import Footer from '../components/admin/Footer/index.jsx';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const activeTab = location.pathname.split('/').pop();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">

            {/* 1. Sidebar (Menu cố định bên trái) */}
            <Sidebar
                isOpen={sidebarOpen}
                activeTab={activeTab}
            />

            {/* 2. Main Wrapper (Phần bên phải) */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

                {/* Header (Thanh tìm kiếm & thông báo) */}
                <Header toggleSidebar={toggleSidebar} />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
                    {/* <Outlet /> là nơi các trang con (Dashboard, Members, v.v.) sẽ được render vào */}
                    <div className="flex-1">
                        <Outlet />
                    </div>

                    {/* Footer luôn nằm dưới cùng của nội dung cuộn */}
                    <Footer />
                </main>

            </div>
        </div>
    );
};

export default AdminLayout;