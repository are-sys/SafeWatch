import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const saved = localStorage.getItem('user');
        if (token) {
            if (saved) {
                try {
                    setUser(JSON.parse(saved));
                } catch (e) {}
            }
            // Verify token is still valid
            api.get('/me').then(res => {
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));
            }).catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }).finally(() => setLoading(false));
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/login', { email, password });
        if (res.data.requires_2fa) {
            return res.data;
        }
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data;
    };

    const verify2fa = async (email, code) => {
        const res = await api.post('/verify-2fa', { email, code });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data;
    };

    const resend2fa = async (email) => {
        const res = await api.post('/resend-2fa', { email });
        return res.data;
    };

    const enable2fa = async () => {
        const res = await api.post('/2fa/enable');
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return res.data;
    };

    const disable2fa = async () => {
        const res = await api.post('/2fa/disable');
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return res.data;
    };

    const register = async (name, email, password, password_confirmation, role) => {
        const res = await api.post('/register', { name, email, password, password_confirmation, role });
        if (res.data.requires_2fa) {
            return res.data;
        }
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        try { await api.post('/logout'); } catch {}
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const forgotPassword = async (email) => {
        const res = await api.post('/forgot-password', { email });
        return res.data;
    };

    const verifyResetCode = async (email, code) => {
        const res = await api.post('/verify-reset-code', { email, code });
        return res.data;
    };

    const resetPassword = async (email, resetToken, password, passwordConfirmation) => {
        const res = await api.post('/reset-password', {
            email,
            reset_token: resetToken,
            password,
            password_confirmation: passwordConfirmation,
        });
        return res.data;
    };

    return (
        <AuthContext.Provider value={{ user, login, verify2fa, resend2fa, enable2fa, disable2fa, register, logout, forgotPassword, verifyResetCode, resetPassword, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
