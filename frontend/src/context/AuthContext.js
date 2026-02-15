import React, { createContext, useState, useEffect } from "react";
import { authAPI, api, usersAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("authToken"));
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem("authToken", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            localStorage.removeItem("authToken");
            delete api.defaults.headers.common["Authorization"];
        }
    }, [token]);

    useEffect(() => {
        if (user) localStorage.setItem("user", JSON.stringify(user));
        else localStorage.removeItem("user");
    }, [user]);

    const login = async (credentials) => {
        const res = await authAPI.login(credentials);
        const payload = res.data && res.data.data ? res.data.data : null;
        if (payload) {
            if (payload.token) setToken(payload.token);
            setUser({
                _id: payload._id,
                name: payload.name,
                email: payload.email,
                role: payload.role,
            });
        }
        return res;
    };

    const register = async (payload) => {
        const res = await authAPI.register(payload);
        const payloadData = res.data && res.data.data ? res.data.data : null;
        if (payloadData) {
            if (payloadData.token) setToken(payloadData.token);
            setUser({
                _id: payloadData._id,
                name: payloadData.name,
                email: payloadData.email,
                role: payloadData.role,
            });
        }
        return res;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (payload) => {
        const res = await usersAPI.updateProfile(payload);
        // usersAPI.updateProfile returns response.data typically, but some endpoints
        // may return the full axios response. Normalize both shapes.
        let data = null;
        if (!res) data = null;
        else if (res.data && res.data.data) data = res.data.data;
        else if (res.data) data = res.data;
        else data = res;

        if (data) {
            // backend returns updated fields; merge into user state
            setUser((u) => ({ ...(u || {}), ...data }));
        }
        return res;
    };

    return (
        <AuthContext.Provider
            value={{ token, user, login, register, logout, updateProfile }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
