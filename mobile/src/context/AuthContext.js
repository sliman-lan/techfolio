import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, usersAPI } from "../services/api";
import { router } from "expo-router";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const clearLocalAuth = async () => {
        try {
            await AsyncStorage.removeItem("authToken");
            await AsyncStorage.removeItem("user");
        } catch (e) {
            console.warn("clearLocalAuth failed:", e);
        }
        setUser(null);
    };

    const initAuth = async () => {
        setIsCheckingAuth(true);
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                await clearLocalAuth();
                setIsCheckingAuth(false);
                return;
            }

            try {
                const profileRes = await usersAPI.getProfile();
                const serverUser = profileRes?.data || profileRes;
                if (serverUser) {
                    setUser(serverUser);
                    await AsyncStorage.setItem("user", JSON.stringify(serverUser));
                    try {
                        if (typeof window !== "undefined" && window.localStorage) {
                            localStorage.setItem("user", JSON.stringify(serverUser));
                        }
                    } catch (e) {}
                    setIsCheckingAuth(false);
                    return;
                }
            } catch (e) {
                console.warn("initAuth: /auth/me failed:", e?.message || e);
                // fallback: keep local stored user if available so bio still shows
                try {
                    const userStr = await AsyncStorage.getItem("user");
                    if (userStr) {
                        setUser(JSON.parse(userStr));
                        setIsCheckingAuth(false);
                        return;
                    }
                } catch (readErr) {
                    console.warn("initAuth fallback read failed:", readErr);
                }
                await clearLocalAuth();
            }
        } catch (e) {
            console.error("initAuth unexpected error:", e);
            await clearLocalAuth();
        }
        setIsCheckingAuth(false);
    };

    useEffect(() => {
        initAuth();
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const res = await authAPI.login({ email, password });
            if (res?.success && res?.data) {
                setUser(res.data);
                try {
                    await AsyncStorage.setItem("user", JSON.stringify(res.data));
                } catch (e) {}
                return { success: true, user: res.data };
            }
            return { success: false, error: "Invalid server response" };
        } catch (error) {
            console.error("login error:", error);
            return { success: false, error };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        try {
            const res = await authAPI.register(userData);
            if (res?.success && res?.data) {
                setUser(res.data);
                try {
                    await AsyncStorage.setItem("user", JSON.stringify(res.data));
                } catch (e) {}
                return { success: true, user: res.data };
            }
            return { success: false, error: "Invalid server response" };
        } catch (error) {
            console.error("register error:", error);
            return { success: false, error };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        console.log("logout: start");
        setIsLoading(true);
        try {
            await authAPI.logout();
            console.log("authAPI.logout cleared storage");
        } catch (e) {
            console.warn("authAPI.logout error:", e);
        }
        await clearLocalAuth();
        try {
            router.replace("/auth/login");
        } catch (e) {
            console.warn("router.replace failed:", e);
        }
        setIsLoading(false);
        console.log("logout: done");
    };

    const checkAuthStatus = async () => {
        const token = await AsyncStorage.getItem("authToken");
        return { isAuthenticated: !!token, token };
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                isLoading,
                isCheckingAuth,
                login,
                register,
                logout,
                checkAuthStatus,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
