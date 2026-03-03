// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, setAuthToken } from "../services/api";

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const loadStoredUser = async () => {
            setIsCheckingAuth(true);
            try {
                const token = await AsyncStorage.getItem("authToken");
                const userStr = await AsyncStorage.getItem("user");
                console.log(
                    "📦 loadStoredUser: token from storage:",
                    token ? "موجود" : "غير موجود",
                );
                console.log(
                    "📦 loadStoredUser: user from storage:",
                    userStr ? "موجود" : "غير موجود",
                );

                if (token && userStr) {
                    try {
                        const parsedUser = JSON.parse(userStr);
                        setUser(parsedUser);
                        await setAuthToken(token); // تحديث الكاش
                        console.log(
                            "📦 loadStoredUser: تم تحميل المستخدم والتوكن",
                        );
                    } catch (e) {
                        console.error(
                            "📦 loadStoredUser: خطأ في تحليل user JSON",
                            e,
                        );
                        // إذا كان userStr غير صالح، نقوم بتسجيل الخروج
                        await setAuthToken(null);
                        await AsyncStorage.removeItem("user");
                    }
                } else if (token) {
                    // يوجد توكن ولكن لا يوجد مستخدم -> حالة غير متسقة، نسحبه
                    console.log(
                        "📦 loadStoredUser: يوجد توكن بدون مستخدم، سيتم إزالته",
                    );
                    await setAuthToken(null);
                }
                // إذا لم يكن هناك توكن، لا تفعل شيئًا
            } catch (e) {
                console.error("❌ loadStoredUser error:", e);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        loadStoredUser();
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            console.log("🔄 جاري تسجيل الدخول...", { email });
            const response = await authAPI.login({ email, password });

            if (!response?.success || !response?.data) {
                return {
                    success: false,
                    error: "فشل تسجيل الدخول: استجابة غير صحيحة",
                };
            }

            const userData = response.data.data;
            if (!userData || !userData.token) {
                console.error(
                    "❌ login: البيانات لا تحتوي على token",
                    userData,
                );
                return {
                    success: false,
                    error: "بيانات تسجيل الدخول غير مكتملة",
                };
            }

            const token = userData.token;
            const { token: _, ...userWithoutToken } = userData;

            console.log("✅ تسجيل الدخول ناجح:", {
                userId: userData._id,
                tokenLength: token.length,
            });

            // حفظ التوكن أولاً (يحدث الكاش و AsyncStorage)
            await setAuthToken(token);
            console.log("🔑 login: after setAuthToken");

            // حفظ المستخدم
            const userString = JSON.stringify(userWithoutToken);
            await AsyncStorage.setItem("user", userString);
            console.log(
                "🔑 login: user saved to AsyncStorage, length:",
                userString.length,
            );

            // تحديث الحالة
            setUser(userWithoutToken);

            return { success: true };
        } catch (e) {
            console.error("❌ login error:", e);
            return {
                success: false,
                error: e.message || "حدث خطأ أثناء تسجيل الدخول",
            };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await setAuthToken(null); // إزالة التوكن من AsyncStorage والكاش
            await AsyncStorage.removeItem("user");
            setUser(null);
            console.log("✅ logout: تم تسجيل الخروج");
        } catch (e) {
            console.error("❌ logout error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                isLoading,
                isCheckingAuth,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
