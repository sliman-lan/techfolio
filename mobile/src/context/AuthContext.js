// mobile/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, usersAPI } from "../services/api";
import { router } from "expo-router";

// إنشاء السياق
const AuthContext = createContext({});

// خطاف لاستخدام السياق
export const useAuth = () => useContext(AuthContext);

// مزود السياق
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // دالة مسح بيانات المصادقة من التخزين
    const clearAuthStorage = async () => {
        try {
            await AsyncStorage.removeItem("authToken");
            await AsyncStorage.removeItem("user");
            console.log("✅ تم مسح authToken و user من AsyncStorage");
        } catch (e) {
            console.warn("⚠️ فشل مسح AsyncStorage:", e);
        }
    };

    // تحميل المستخدم من التخزين عند بدء التشغيل
    useEffect(() => {
        const loadStoredUser = async () => {
            setIsCheckingAuth(true);
            try {
                const token = await AsyncStorage.getItem("authToken");
                const userStr = await AsyncStorage.getItem("user");

                if (token && userStr) {
                    const parsedUser = JSON.parse(userStr);
                    setUser(parsedUser);
                    console.log(
                        "✅ تم تحميل المستخدم من التخزين:",
                        parsedUser.name,
                    );

                    // محاولة تحديث بيانات المستخدم من الخادم للتأكد من حداثتها
                    try {
                        const profileRes = await usersAPI.getProfile();
                        // قد تكون الاستجابة مباشرة أو داخل data
                        const serverUser = profileRes.data || profileRes;
                        if (serverUser && serverUser._id === parsedUser._id) {
                            setUser(serverUser);
                            await AsyncStorage.setItem(
                                "user",
                                JSON.stringify(serverUser),
                            );
                            console.log(
                                "✅ تم تحديث بيانات المستخدم من الخادم",
                            );
                        }
                    } catch (e) {
                        console.log(
                            "⚠️ فشل تحديث بيانات المستخدم من الخادم، نستخدم المحلية",
                        );
                    }
                } else {
                    console.log("ℹ️ لا يوجد مستخدم مخزن");
                }
            } catch (e) {
                console.error("❌ خطأ في تحميل المستخدم:", e);
            } finally {
                setIsCheckingAuth(false);
            }
        };
        loadStoredUser();
    }, []);

    // دالة تسجيل الدخول
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await authAPI.login({ email, password });
            if (response?.success && response?.data) {
                const userData = response.data;
                // حفظ التوكن والمستخدم
                await AsyncStorage.setItem("authToken", userData.token);
                await AsyncStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
                console.log("✅ تم تسجيل الدخول وحفظ المستخدم:", userData.name);
                return { success: true };
            }
            return { success: false, error: "بيانات غير صحيحة" };
        } catch (error) {
            console.error("❌ خطأ في تسجيل الدخول:", error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // دالة تسجيل جديد
    const register = async (userData) => {
        setIsLoading(true);
        try {
            const response = await authAPI.register(userData);
            if (response?.success && response?.data) {
                const userData = response.data;
                await AsyncStorage.setItem("authToken", userData.token);
                await AsyncStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
                return { success: true };
            }
            return { success: false, error: "فشل التسجيل" };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // دالة تسجيل الخروج (مضمونة)
    const logout = async () => {
        console.log("🔵 بدء تسجيل الخروج...");
        setIsLoading(true);

        // مسح البيانات المخزنة
        await clearAuthStorage();
        setUser(null);

        // تأخير بسيط لضمان اكتمال المسح
        setTimeout(() => {
            try {
                console.log("🔵 محاولة التنقل إلى /auth/login");
                router.replace("/auth/login");
            } catch (e) {
                console.warn("⚠️ فشل التنقل عبر router، استخدام fallback:", e);
                // إذا فشل التنقل عبر router (يحدث أحياناً على الويب)
                if (typeof window !== "undefined") {
                    window.location.href = "/auth/login";
                }
            } finally {
                setIsLoading(false);
            }
        }, 100);
    };

    // قيمة السياق
    const value = {
        user,
        setUser,
        isLoading,
        isCheckingAuth,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
