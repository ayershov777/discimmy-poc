import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    Link,
    Stack
} from '@mui/material';

const Register = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { username, email, password, password2 } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== password2) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        const result = await register({ username, email, password });
        setLoading(false);

        if (!result.success) {
            setError(result.message);
        } else {
            navigate('/dashboard');
        }
    };

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'background.default'
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h4" component="h1" align="center" gutterBottom>
                        Register
                    </Typography>

                    <Typography
                        variant="subtitle1"
                        align="center"
                        sx={{ mb: 3 }}
                    >
                        Create Your Account
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={onSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                label="Username"
                                type="text"
                                name="username"
                                variant="outlined"
                                fullWidth
                                value={username}
                                onChange={onChange}
                                required
                            />

                            <TextField
                                label="Email"
                                type="email"
                                name="email"
                                variant="outlined"
                                fullWidth
                                value={email}
                                onChange={onChange}
                                required
                            />

                            <TextField
                                label="Password"
                                type="password"
                                name="password"
                                variant="outlined"
                                fullWidth
                                value={password}
                                onChange={onChange}
                                inputProps={{ minLength: 6 }}
                                required
                            />

                            <TextField
                                label="Confirm Password"
                                type="password"
                                name="password2"
                                variant="outlined"
                                fullWidth
                                value={password2}
                                onChange={onChange}
                                inputProps={{ minLength: 6 }}
                                required
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </Button>
                        </Stack>
                    </Box>

                    <Typography
                        variant="body2"
                        align="center"
                        sx={{ mt: 3 }}
                    >
                        Already have an account?{' '}
                        <Link component={RouterLink} to="/login" underline="hover">
                            Sign In
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default Register;
