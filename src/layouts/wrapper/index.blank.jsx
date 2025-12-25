import React from 'react';
import { Outlet } from 'react-router-dom';

// This layout is for pages that don't have the main Header and Footer,
// like the Login or Register pages.
const BlankLayout = () => {
    return (
        <div className="bg-gray-900 text-white antialiased">
            <Outlet />
        </div>
    );
};

export default BlankLayout;
