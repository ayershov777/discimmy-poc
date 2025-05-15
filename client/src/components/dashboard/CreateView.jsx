import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
    Paper, 
    Typography, 
    Box, 
    Drawer, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemIcon, 
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import { 
    Collections, 
    ViewList, 
    Add, 
    ChevronLeft, 
    Menu 
} from '@mui/icons-material';
import MyPathways from './create/MyPathways';
import AllPathways from './create/AllPathways';
import PathwayView from './create/PathwayView';
import ModuleView from './create/ModuleView';
import NewPathway from './create/NewPathway';

const CreateView = () => {
    const location = useLocation();
    const [navCollapsed, setNavCollapsed] = useState(false);
    const [drawerWidth] = useState(240);

    // Helper function to determine active route
    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    const toggleNav = () => {
        setNavCollapsed(!navCollapsed);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Vertical secondary navigation */}
            <Drawer
                variant="permanent"
                sx={{
                    width: navCollapsed ? 64 : drawerWidth,
                    flexShrink: 0,
                    transition: 'width 0.2s ease',
                    '& .MuiDrawer-paper': {
                        width: navCollapsed ? 64 : drawerWidth,
                        position: 'relative',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 'none',
                        overflow: 'hidden',
                        transition: 'width 0.2s ease'
                    },
                }}
                open
            >
                <List>
                    <ListItem sx={{ justifyContent: navCollapsed ? 'center' : 'space-between' }}>
                        {!navCollapsed && (
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Navigation</Typography>
                        )}
                        <IconButton onClick={toggleNav} edge={navCollapsed ? false : "end"}>
                            {navCollapsed ? <Menu /> : <ChevronLeft />}
                        </IconButton>
                    </ListItem>
                    <Divider />
                    <Tooltip title="My Pathways" placement="right" disableHoverListener={!navCollapsed}>
                        <ListItem
                            button
                            component={Link}
                            to="/dashboard/create/my-pathways"
                            selected={isActive('/dashboard/create/my-pathways')}
                        >
                            <ListItemIcon>
                                <Collections />
                            </ListItemIcon>
                            {!navCollapsed && <ListItemText primary="My Pathways" />}
                        </ListItem>
                    </Tooltip>
                    <Tooltip title="All Pathways" placement="right" disableHoverListener={!navCollapsed}>
                        <ListItem
                            button
                            component={Link}
                            to="/dashboard/create/all-pathways"
                            selected={isActive('/dashboard/create/all-pathways')}
                        >
                            <ListItemIcon>
                                <ViewList />
                            </ListItemIcon>
                            {!navCollapsed && <ListItemText primary="All Pathways" />}
                        </ListItem>
                    </Tooltip>
                    <Tooltip title="Create New Pathway" placement="right" disableHoverListener={!navCollapsed}>
                        <ListItem
                            button
                            component={Link}
                            to="/dashboard/create/new-pathway"
                            selected={isActive('/dashboard/create/new-pathway')}
                        >
                            <ListItemIcon>
                                <Add />
                            </ListItemIcon>
                            {!navCollapsed && <ListItemText primary="Create New Pathway" />}
                        </ListItem>
                    </Tooltip>
                </List>
            </Drawer>

            {/* Main content area */}
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: 2, 
                    transition: 'margin-left 0.2s ease',
                }}
            >
                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        minHeight: '80vh'
                    }}
                >
                    <Routes>
                        <Route path="/" element={<MyPathways />} />
                        <Route path="/my-pathways" element={<MyPathways />} />
                        <Route path="/all-pathways" element={<AllPathways />} />
                        <Route path="/pathway/:id" element={<PathwayView />} />
                        <Route path="/module/:pathwayId/:id" element={<ModuleView />} />
                        <Route path="/new-pathway" element={<NewPathway />} />
                    </Routes>
                </Paper>
            </Box>
        </Box>
    );
};

export default CreateView;
