import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/client/Header/index.jsx';
import Footer from '../components/client/Footer/index.jsx';

const ClientLayout = () => {
    return (
        <div className="bg-gray-900 text-white antialiased">
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default ClientLayout;