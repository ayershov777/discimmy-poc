import React, { useContext } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import LearnView from './LearnView';
import CreateView from './CreateView';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper function to check if the link is active
    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="logo">Learning Pathways</div>
                <div className="user-controls">
                    <span className="username">Hello, {user?.username || 'User'}</span>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <nav className="primary-nav">
                <ul>
                    <li>
                        <Link
                            to="/dashboard/learn"
                            className={isActive('/dashboard/learn') ? 'active' : ''}
                        >
                            Learn
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/dashboard/create"
                            className={isActive('/dashboard/create') ? 'active' : ''}
                        >
                            Create
                        </Link>
                    </li>
                </ul>
            </nav>

            <main className="dashboard-content">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard/learn" />} />
                    <Route path="/learn/*" element={<LearnView />} />
                    <Route path="/create/*" element={<CreateView />} />
                </Routes>
            </main>
        </div>
    );
};

export default Dashboard;
