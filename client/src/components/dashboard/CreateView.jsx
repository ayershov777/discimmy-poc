import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { Create } from '@mui/icons-material';

const CreateView = () => {
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
                Create
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
                <Create
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
                    This is a placeholder for the Create view.
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                >
                    Here, users will be able to create and manage their own learning pathways and modules.
                </Typography>
            </Box>
        </Paper>
    );
};

export default CreateView;
