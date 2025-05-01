import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    Alert,
    TextField,
    InputAdornment
} from '@mui/material';
import { Visibility, Search } from '@mui/icons-material';

const AllPathways = () => {
    const [pathways, setPathways] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAllPathways = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/pathways`);
                setPathways(res.data);
                setError('');
            } catch (err) {
                console.error('Error fetching pathways:', err);
                setError('Failed to load pathways. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllPathways();
    }, []);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter pathways based on search term
    const filteredPathways = pathways.filter(pathway =>
        pathway.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pathway.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pathway.targetAudience && pathway.targetAudience.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
            <Typography variant="h5" component="h1" gutterBottom>
                Browse All Learning Pathways
            </Typography>

            <Box mb={3}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search pathways by title, description or target audience"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {filteredPathways.length === 0 ? (
                <Box textAlign="center" py={5}>
                    <Typography variant="body1" color="text.secondary">
                        {searchTerm ? 'No pathways matching your search criteria.' : 'No pathways available yet.'}
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredPathways.map((pathway) => (
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
                                    <Box display="flex" flexWrap="wrap" gap={1}>
                                        {pathway.targetAudience && (
                                            <Chip
                                                label={`For: ${pathway.targetAudience}`}
                                                size="small"
                                            />
                                        )}
                                    </Box>
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
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default AllPathways;
