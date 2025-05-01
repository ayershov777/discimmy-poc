import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';
import axios from 'axios';
import {
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { Edit, Visibility } from '@mui/icons-material';

const MyPathways = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pathways, setPathways] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyPathways = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/pathways?userId=${user.id}`);
                setPathways(res.data);
                setError('');
            } catch (err) {
                console.error('Error fetching pathways:', err);
                setError('Failed to load pathways. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyPathways();
    }, [user]);

    // Render loading state
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    // Render error state
    if (error) {
        return (
            <Box mt={3}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h1" gutterBottom>
                    My Learning Pathways
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/dashboard/create/new-pathway"
                >
                    Create New Pathway
                </Button>
            </Box>

            {pathways.length === 0 ? (
                <Box textAlign="center" py={5}>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        You haven't created any pathways yet.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/dashboard/create/new-pathway"
                    >
                        Create Your First Pathway
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {pathways.map((pathway) => (
                        <Grid item xs={12} sm={6} md={4} key={pathway._id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" component="h2" gutterBottom>
                                        {pathway.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {pathway.description.length > 120
                                            ? `${pathway.description.substring(0, 120)}...`
                                            : pathway.description}
                                    </Typography>
                                    {pathway.targetAudience && (
                                        <Chip
                                            label={`For: ${pathway.targetAudience}`}
                                            size="small"
                                            sx={{ mt: 1 }}
                                        />
                                    )}
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        startIcon={<Visibility />}
                                        component={Link}
                                        to={`/dashboard/create/pathway/${pathway._id}`}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        size="small"
                                        startIcon={<Edit />}
                                        component={Link}
                                        to={`/dashboard/create/pathway/${pathway._id}?edit=true`}
                                    >
                                        Edit
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default MyPathways;
