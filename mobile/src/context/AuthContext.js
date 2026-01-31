import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../services/api";
import { router } from "expo-router";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // تحقق من المصادقة عند فتح التطبيق
    useEffect(() => {
        checkExistingAuth();
    }, []);

    const checkExistingAuth = async () => {
        try {
            console.log("🔍 Checking existing auth...");
            const token = await AsyncStorage.getItem("token");
            const userStr = await AsyncStorage.getItem("user");

            console.log("📊 Stored token:", !!token);
            console.log("📊 Stored user:", !!userStr);

            if (token && userStr) {
                try {
                    // تحقق من صلاحية التوكن
                    const response = await authAPI.getProfile();
                    setUser(JSON.parse(userStr));
                    console.log("✅ User authenticated from storage");
                } catch (error) {
                    console.log("❌ Token invalid, clearing storage");
                    await clearStorage();
                }
            } else {
                console.log("⚠️ No stored auth found");
            }
        } catch (error) {
            console.error("Error checking auth:", error);
        } finally {
            setIsCheckingAuth(false);
        }
    };

    const clearStorage = async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        setUser(null);
    };

    const login = async (email, password) => {
        setIsLoading(true);
        console.log("🔑 Attempting login...");

        try {
            const response = await authAPI.login({ email, password });

            if (response.data.token) {
                // تحقق من حفظ التوكن
                const token = await AsyncStorage.getItem("token");
                const user = await AsyncStorage.getItem("user");

                if (token) {
                    console.log("✅ Login successful, token saved");
                    setUser(response.data.user);
                    return { success: true, user: response.data.user };
                } else {
                    console.log("❌ Token not saved after login");
                    return { success: false, error: "Failed to save token" };
                }
            } else {
                console.log("❌ No token in response");
                return {
                    success: false,
                    error: "Invalid response from server",
                };
            }
        } catch (error) {
            console.error("Login error:", error);

            let errorMessage = "فشل تسجيل الدخول";
            if (error.response?.status === 401) {
                errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
            } else if (error.response?.status === 404) {
                errorMessage = "لا يمكن الاتصال بالخادم";
            }

            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        console.log("📝 Attempting registration...");

        try {
            const response = await authAPI.register(userData);

            if (response.data.token) {
                const token = await AsyncStorage.getItem("token");
                if (token) {
                    console.log("✅ Registration successful");
                    setUser(response.data.user);
                    return { success: true, user: response.data.user };
                } else {
                    return { success: false, error: "Failed to save token" };
                }
            } else {
                return {
                    success: false,
                    error: "Invalid response from server",
                };
            }
        } catch (error) {
            console.error("Registration error:", error);

            let errorMessage = "فشل إنشاء الحساب";
            if (error.response?.status === 400) {
                errorMessage = "البريد الإلكتروني مستخدم بالفعل";
            }

            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await clearStorage();
        router.replace("/auth/login");
    };

    const checkAuthStatus = async () => {
        const token = await AsyncStorage.getItem("token");
        return { isAuthenticated: !!token, token };
    };

    return (
        <AuthContext.Provider
            value={{
                user,
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
