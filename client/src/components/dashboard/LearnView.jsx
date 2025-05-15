import React, { useState } from 'react';
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
    School, 
    BookmarkBorder, 
    Explore, 
    ChevronLeft, 
    Menu 
} from '@mui/icons-material';

const LearnView = () => {
    const [navCollapsed, setNavCollapsed] = useState(false);
    const [drawerWidth] = useState(240);

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
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Learning</Typography>
                        )}
                        <IconButton onClick={toggleNav} edge={navCollapsed ? false : "end"}>
                            {navCollapsed ? <Menu /> : <ChevronLeft />}
                        </IconButton>
                    </ListItem>
                    <Divider />
                    <Tooltip title="My Learning" placement="right" disableHoverListener={!navCollapsed}>
                        <ListItem button>
                            <ListItemIcon>
                                <BookmarkBorder />
                            </ListItemIcon>
                            {!navCollapsed && <ListItemText primary="My Learning" />}
                        </ListItem>
                    </Tooltip>
                    <Tooltip title="Explore Pathways" placement="right" disableHoverListener={!navCollapsed}>
                        <ListItem button>
                            <ListItemIcon>
                                <Explore />
                            </ListItemIcon>
                            {!navCollapsed && <ListItemText primary="Explore Pathways" />}
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
                    <Typography
                        variant="h5"
                        component="h1"
                        gutterBottom
                        sx={{
                            pb: 1.5,
                            borderBottom: '2px solid',
                            borderColor: 'divider'
                        }}
                    >
                        Learn
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 4,
                            textAlign: 'center',
                            backgroundColor: 'grey.50',
                            borderRadius: 1
                        }}
                    >
                        <School
                            sx={{
                                fontSize: 60,
                                color: 'text.secondary',
                                mb: 2
                            }}
                        />

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            paragraph
                        >
                            This is a placeholder for the Learning view.
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                        >
                            Here, users will be able to explore and follow learning pathways.
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default LearnView;
