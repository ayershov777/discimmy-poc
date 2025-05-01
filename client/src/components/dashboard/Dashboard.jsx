import React, { useContext } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import LearnView from './LearnView';
import CreateView from './CreateView';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    Container,
    Tab,
    Tabs
} from '@mui/material';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper function to get current tab value
    const getCurrentTabValue = () => {
        if (location.pathname === '/dashboard/create') return 1;
        return 0; // Default to "Learn" tab
    };

    // Handle tab change
    const handleTabChange = (_event, newValue) => {
        navigate(newValue === 0 ? '/dashboard/learn' : '/dashboard/create');
    };

    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static" sx={{ backgroundColor: 'secondary.main' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        Learning Pathways
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1">
                            Hello, {user?.username || 'User'}
                        </Typography>
                        <Button
                            color="inherit"
                            variant="outlined"
                            size="small"
                            onClick={handleLogout}
                            sx={{
                                borderColor: 'white',
                                '&:hover': {
                                    backgroundColor: 'white',
                                    color: 'secondary.main'
                                }
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>

                <Box sx={{ backgroundColor: 'secondary.dark' }}>
                    <Container>
                        <Tabs
                            value={getCurrentTabValue()}
                            onChange={handleTabChange}
                            textColor="inherit"
                            indicatorColor="primary"
                            sx={{
                                '& .MuiTab-root': {
                                    color: 'rgba(255,255,255,0.7)',
                                    '&.Mui-selected': {
                                        color: 'primary.main'
                                    }
                                }
                            }}
                        >
                            <Tab label="Learn" />
                            <Tab label="Create" />
                        </Tabs>
                    </Container>
                </Box>
            </AppBar>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    backgroundColor: 'background.default'
                }}
            >
                <Container>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard/learn" />} />
                        <Route path="/learn/*" element={<LearnView />} />
                        <Route path="/create/*" element={<CreateView />} />
                    </Routes>
                </Container>
            </Box>
        </Box>
    );
};

export default Dashboard;
