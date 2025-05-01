import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { School } from '@mui/icons-material';

const LearnView = () => {
    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                borderRadius: 2
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
    );
};

export default LearnView;
