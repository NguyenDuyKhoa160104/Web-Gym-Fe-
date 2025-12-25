import { useRoutes, Navigate } from 'react-router-dom';

// Import Layouts
import AdminLayout from '../layouts/wrapper/index.admin.jsx';
import CoachLayout from '../layouts/wrapper/index.coach.jsx';
import BlankLayout from '../layouts/wrapper/index.blank.jsx';

// Import Pages
// Admin
import AdminDashboard from '../pages/admin/Dashboard/index.jsx';
import AdminMembers from '../pages/admin/Members/index.jsx';
import AdminCoaches from '../pages/admin/Coaches/index.jsx';
import AdminSchedule from '../pages/admin/Schedule/index.jsx';

import AdminSettings from '../pages/admin/Settings/index.jsx';
import PackageManagement from '../pages/admin/Packages/index.jsx';
import FacilityManagement from '../pages/admin/Facilities/index.jsx';
import OrderManagement from '../pages/admin/Order/index.jsx';
import Statistics from '../pages/admin/Statistics/index.jsx';
import AdminLoginPage from '../pages/admin/Login/index.jsx';
import RoomManagement from '../pages/admin/Rooms/index.jsx';
// Coach
import CoachDashboard from '../pages/coach/Dashboard/index.jsx';
import CoachSchedule from '../pages/coach/Schedule/index.jsx';
import CoachMessages from '../pages/coach/Messages/index.jsx';
import CoachSettings from '../pages/coach/Settings/index.jsx';
import CoachStudents from '../pages/coach/Students/index.jsx';
import CoachLoginPage from '../pages/coach/Login/index.jsx';
// Client
import ClientLayout from '../layouts/wrapper/index.client.jsx';
import HomePage from '../pages/client/Home/index.jsx';
import PackagesPage from '../pages/client/Packages/index.jsx';
import PersonalTrainerPage from '../pages/client/PersonalTrainer/index.jsx';
import LoginPage from '../pages/client/Login/index.jsx';
import RegisterPage from '../pages/client/Register/index.jsx';
import ClientProfile from '../pages/client/Profile/index.jsx';

// import NotFound from '../pages/NotFound';

export default function Router() {
    const routing = useRoutes([
        // ---------------------------------------------------
        // 1. AUTH ROUTES
        // ---------------------------------------------------
        {
            path: '/login',
            element: <BlankLayout />,
            children: [
                { path: '', element: <LoginPage /> }
            ]
        },
        {
            path: '/register',
            element: <BlankLayout />,
            children: [
                { path: '', element: <RegisterPage /> }
            ]
        },
        {
            path: '/admin/login',
            element: <BlankLayout />,
            children: [
                { path: '', element: <AdminLoginPage /> }
            ]
        },
        {
            path: '/coach/login',
            element: <BlankLayout />,
            children: [
                { path: '', element: <CoachLoginPage /> }
            ]
        },

        // ---------------------------------------------------
        // 2. ADMIN ROUTES (/admin)
        // ---------------------------------------------------
        {
            path: '/admin',
            element: <AdminLayout />,
            children: [
                { path: '', element: <Navigate to="dashboard" /> }, // Tự động redirect /admin -> /admin/dashboard
                { path: 'dashboard', element: <AdminDashboard /> },
                { path: 'members', element: <AdminMembers /> },
                { path: 'coaches', element: <AdminCoaches /> },
                { path: 'schedule', element: <AdminSchedule /> },
                
                { path: 'packages', element: <PackageManagement /> },
                { path: 'facilities', element: <FacilityManagement /> },
                { path: 'rooms', element: <RoomManagement /> },
                { path: 'orders', element: <OrderManagement /> },
                { path: 'statistics', element: <Statistics /> },
                { path: 'settings', element: <AdminSettings /> },
            ]
        },

        // ---------------------------------------------------
        // 3. COACH ROUTES (/coach)
        // ---------------------------------------------------
        {
            path: '/coach',
            element: <CoachLayout />,
            children: [
                { path: '', element: <Navigate to="dashboard" /> },
                { path: 'dashboard', element: <CoachDashboard /> },
                { path: 'students', element: <CoachStudents /> },
                { path: 'schedule', element: <CoachSchedule /> },
                { path: 'messages', element: <CoachMessages /> },
                { path: 'settings', element: <CoachSettings /> },
            ]
        },

        // ---------------------------------------------------
        // 4. CLIENT ROUTES (/) - Dành cho user thường
        // ---------------------------------------------------
        {
            path: '/',
            element: <ClientLayout />,
            children: [
                { path: '', element: <HomePage /> },
                { path: 'packages', element: <PackagesPage /> },
                { path: 'pt', element: <PersonalTrainerPage /> },
                { path: 'profile', element: <ClientProfile /> }
            ]
        },

        // ---------------------------------------------------
        // 5. CÁC ROUTE KHÁC
        // ---------------------------------------------------
        // { path: '*', element: <NotFound /> } // Trang 404
    ]);

    return routing;
}