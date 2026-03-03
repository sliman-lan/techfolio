import React, { createContext, useState, useEffect, useCallback } from "react";
import { authAPI, usersAPI, api } from "../services/api";

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
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // دالة لتحديث التوكن
    const updateToken = useCallback((newToken) => {
        if (newToken) {
            localStorage.setItem("authToken", newToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        } else {
            localStorage.removeItem("authToken");
            delete api.defaults.headers.common["Authorization"];
        }
        setToken(newToken);
    }, []);

    // جلب المستخدم الحالي
    const fetchCurrentUser = useCallback(async () => {
        if (!token) return null;

        setLoading(true);
        try {
            const res = await authAPI.getMe();
            const userData = res.data?.data || res.data;
            if (userData) {
                setUser(userData);
                return userData;
            }
        } catch (error) {
            console.error("❌ فشل جلب بيانات المستخدم:", error);
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, [token]);

    // تهيئة عند تحميل التطبيق
    useEffect(() => {
        const init = async () => {
            if (token) {
                api.defaults.headers.common["Authorization"] =
                    `Bearer ${token}`;
                await fetchCurrentUser();
            } else {
                setInitialized(true);
            }
        };
        init();
    }, [token, fetchCurrentUser]);

    // حفظ المستخدم في localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const res = await authAPI.login(credentials);
            const payload = res.data?.data || res.data;

            if (payload?.token) {
                updateToken(payload.token);
                await fetchCurrentUser();
                return { success: true };
            }
            return { success: false, error: "بيانات الدخول غير صحيحة" };
        } catch (error) {
            console.error("❌ خطأ في تسجيل الدخول:", error);
            return {
                success: false,
                error:
                    error.response?.data?.message || "حدث خطأ في تسجيل الدخول",
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            const res = await authAPI.register(userData);
            const payload = res.data?.data || res.data;

            if (payload?.token) {
                updateToken(payload.token);
                await fetchCurrentUser();
                return { success: true };
            }
            return { success: false, error: "فشل إنشاء الحساب" };
        } catch (error) {
            console.error("❌ خطأ في إنشاء الحساب:", error);
            return {
                success: false,
                error:
                    error.response?.data?.message || "حدث خطأ في إنشاء الحساب",
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = useCallback(() => {
        updateToken(null);
        setUser(null);
        localStorage.removeItem("user");
    }, [updateToken]);

    const updateProfile = async (payload) => {
        setLoading(true);
        try {
            const res = await usersAPI.updateProfile(payload);
            const updatedData = res.data?.data || res.data;

            if (updatedData) {
                setUser((prev) => ({ ...prev, ...updatedData }));
                return { success: true, data: updatedData };
            }
            return { success: false, error: "لم يتم تحديث البيانات" };
        } catch (error) {
            console.error("❌ خطأ في تحديث الملف:", error);
            if (error.response?.status === 401) {
                logout();
            }
            return {
                success: false,
                error:
                    error.response?.data?.message || "حدث خطأ في تحديث الملف",
            };
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        setLoading(true);
        try {
            await authAPI.changePassword({ currentPassword, newPassword });
            return { success: true };
        } catch (error) {
            console.error("❌ خطأ في تغيير كلمة المرور:", error);
            return {
                success: false,
                error:
                    error.response?.data?.message ||
                    "حدث خطأ في تغيير كلمة المرور",
            };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        token,
        user,
        loading,
        initialized,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        fetchCurrentUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isTeacher: user?.role === "teacher",
        isStudent: user?.role === "student",
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export default AuthContext;
