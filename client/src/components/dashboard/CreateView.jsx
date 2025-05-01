import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Paper, Typography, Box, Grid, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { Collections, ViewList, Add } from '@mui/icons-material';
import MyPathways from './create/MyPathways';
import AllPathways from './create/AllPathways';
import PathwayView from './create/PathwayView';
import ModuleView from './create/ModuleView';
import NewPathway from './create/NewPathway';

const CreateView = () => {
    const location = useLocation();
    const [drawerWidth] = useState(240);

    // Helper function to determine active route
    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Vertical secondary navigation */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        position: 'relative',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 'none'
                    },
                }}
                open
            >
                <List>
                    <ListItem>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Navigation</Typography>
                    </ListItem>
                    <Divider />
                    <ListItem
                        button
                        component={Link}
                        to="/dashboard/create/my-pathways"
                        selected={isActive('/dashboard/create/my-pathways')}
                    >
                        <ListItemIcon>
                            <Collections />
                        </ListItemIcon>
                        <ListItemText primary="My Pathways" />
                    </ListItem>
                    <ListItem
                        button
                        component={Link}
                        to="/dashboard/create/all-pathways"
                        selected={isActive('/dashboard/create/all-pathways')}
                    >
                        <ListItemIcon>
                            <ViewList />
                        </ListItemIcon>
                        <ListItemText primary="All Pathways" />
                    </ListItem>
                    <ListItem
                        button
                        component={Link}
                        to="/dashboard/create/new-pathway"
                        selected={isActive('/dashboard/create/new-pathway')}
                    >
                        <ListItemIcon>
                            <Add />
                        </ListItemIcon>
                        <ListItemText primary="Create New Pathway" />
                    </ListItem>
                </List>
            </Drawer>

            {/* Main content area */}
            <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
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
