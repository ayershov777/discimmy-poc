import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load user on initial render if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                setAuthToken(token);
                try {
                    // We would normally have a route to get the user profile
                    // For now we'll just decode the JWT to get the user ID
                    const decoded = parseJwt(token);
                    setUser({ id: decoded.id });
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Error loading user:', err);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    // Set token in axios headers
    const setAuthToken = (token) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    };

    // Parse JWT token to get user data
    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    // Register user
    const register = async (formData) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const res = await axios.post(`${baseUrl}/auth/signup`, formData);

            if (res.data.token) {
                setToken(res.data.token);
                setUser(res.data.user);
                setIsAuthenticated(true);
                setAuthToken(res.data.token);
                return { success: true };
            }
        } catch (err) {
            console.error('Registration error:', err);
            return {
                success: false,
                message: err.response?.data?.message || 'Registration failed'
            };
        }
    };

    // Login user
    const login = async (formData) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData);

            if (res.data.token) {
                setToken(res.data.token);
                setUser(res.data.user);
                setIsAuthenticated(true);
                setAuthToken(res.data.token);
                return { success: true };
            }
        } catch (err) {
            console.error('Login error:', err);
            return {
                success: false,
                message: err.response?.data?.message || 'Login failed'
            };
        }
    };

    // Logout user
    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                loading,
                register,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
