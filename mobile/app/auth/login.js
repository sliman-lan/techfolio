// app/auth/login.js
import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../../src/services/api";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    // const handleLogin = async () => {
    //     // التحقق من صحة البيانات
    //     const newErrors = {};
    //     if (!email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
    //     else if (!/\S+@\S+\.\S+/.test(email))
    //         newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
    //     if (!password.trim()) newErrors.password = "كلمة المرور مطلوبة";

    //     if (Object.keys(newErrors).length > 0) {
    //         setErrors(newErrors);
    //         return;
    //     }

    //     setLoading(true);
    //     setErrors({});
    //     setGeneralError("");

    //     try {
    //         console.log("🔄 جاري تسجيل الدخول...", { email });
    //         const response = await authAPI.login({ email, password });

    //         console.log("🔍 تحليل الاستجابة:", {
    //             هيكل_الاستجابة: Object.keys(response.data),
    //             هل_يوجد_success: !!response.data.success,
    //             هل_يوجد_data: !!response.data.data,
    //             محتوى_data: response.data.data
    //                 ? Object.keys(response.data.data)
    //                 : "غير موجود",
    //             هل_يوجد_token_في_data: !!response.data.data?.token,
    //             هل_يوجد_token_في_المستوى_الرئيسي: !!response.data.token,
    //         });

    //         // 🔑 الحل: البحث عن التوكن في جميع الأماكن الممكنة
    //         let token = null;
    //         let userData = {};

    //         // البحث في جميع المواقع الممكنة للتوكن
    //         const possibleTokenLocations = [
    //             response.data.data?.token, // { success, data: { token } }
    //             response.data.token, // { token }
    //             response.data.data?.accessToken, // { success, data: { accessToken } }
    //             response.data.accessToken, // { accessToken }
    //             response.data.jwt, // { jwt }
    //             response.headers?.["authorization"]?.replace("Bearer ", ""),
    //             response.headers?.["x-auth-token"],
    //         ];

    //         token = possibleTokenLocations.find(
    //             (t) => t && typeof t === "string" && t.length > 20,
    //         );

    //         // استخراج بيانات المستخدم
    //         if (response.data.data && response.data.data._id) {
    //             userData = {
    //                 _id: response.data.data._id,
    //                 name: response.data.data.name || "",
    //                 email: response.data.data.email || "",
    //                 role: response.data.data.role || "student",
    //             };
    //         } else if (response.data._id) {
    //             userData = {
    //                 _id: response.data._id,
    //                 name: response.data.name || "",
    //                 email: response.data.email || "",
    //                 role: response.data.role || "student",
    //             };
    //         }

    //         // التحقق من وجود التوكن
    //         if (!token) {
    //             console.error("❌ خطأ حرج: التوكن مفقود تماماً في الاستجابة!");
    //             console.error(
    //                 "💡 الحل الفوري: تأكد من وجود هذا السطر في backend/routes/auth.js:",
    //             );
    //             console.error(
    //                 "   token: generateToken(user._id), // داخل كائن data",
    //             );

    //             throw new Error(
    //                 "الخادم لم يُرجع رمز المصادقة. يرجى مراجعة كود الـ Backend في ملف auth.js",
    //             );
    //         }

    //         // 🔑 حفظ البيانات بشكل صحيح
    //         await AsyncStorage.setItem("authToken", token);
    //         await AsyncStorage.setItem("user", JSON.stringify(userData));

    //         console.log("✅ تم تسجيل الدخول بنجاح");
    //         console.log("👤 المستخدم:", userData);
    //         console.log("🔑 التوكن (20 حرف):", token.substring(0, 20) + "...");

    //         // التوجيه إلى الصفحة الرئيسية
    //         router.replace("/tabs");
    //     } catch (error) {
    //         console.error("❌ خطأ في تسجيل الدخول:", {
    //             رسالة: error.message,
    //             تفاصيل: error.response?.data || error.config?.url,
    //         });

    //         let errorMessage = "حدث خطأ أثناء تسجيل الدخول";

    //         if (error.response) {
    //             if (error.response.status === 401) {
    //                 errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    //             } else if (error.response.status === 400) {
    //                 errorMessage =
    //                     error.response.data?.message || "بيانات غير صحيحة";
    //             } else if (error.response.status === 500) {
    //                 errorMessage = "خطأ في الخادم. يرجى المحاولة لاحقاً";
    //             } else {
    //                 errorMessage =
    //                     error.response.data?.message || "خطأ غير متوقع";
    //             }
    //         } else if (error.request) {
    //             errorMessage = "تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت";
    //         }

    //         setGeneralError(errorMessage);
    //         Alert.alert("خطأ في تسجيل الدخول", errorMessage);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // استبدل الكود المعقد في handleLogin بـ:
    const handleLogin = async () => {
        // ... التحقق من الصحة

        setLoading(true);
        setErrors({});
        setGeneralError("");

        try {
            console.log("🔄 جاري تسجيل الدخول...", { email });

            // استخدم authAPI.login الجديدة
            const result = await authAPI.login({ email, password });

            console.log("✅ تسجيل الدخول ناجح:", {
                userId: result.data._id,
                tokenLength: result.token?.length,
            });

            // التوجيه إلى الصفحة الرئيسية
            router.replace("/tabs");
        } catch (error) {
            console.error("❌ خطأ في تسجيل الدخول:", error.message);

            let errorMessage = "حدث خطأ أثناء تسجيل الدخول";

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
                } else if (error.response.status === 400) {
                    errorMessage =
                        error.response.data?.message || "بيانات غير صحيحة";
                }
            } else if (error.request) {
                errorMessage = "تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت";
            }

            setGeneralError(errorMessage);
            Alert.alert("خطأ في تسجيل الدخول", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const useTestCredentials = () => {
        setEmail("test@test.com");
        setPassword("123456");
        setErrors({});
        setGeneralError("");
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>تسجيل الدخول</Text>
                    <Text style={styles.subtitle}>
                        أدخل بياناتك للوصول إلى حسابك
                    </Text>
                </View>

                {generalError ? (
                    <View style={styles.generalErrorContainer}>
                        <Ionicons
                            name="alert-circle"
                            size={20}
                            color="#FF3B30"
                        />
                        <Text style={styles.generalErrorText}>
                            {generalError}
                        </Text>
                    </View>
                ) : null}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>البريد الإلكتروني</Text>
                    <TextInput
                        style={[
                            styles.input,
                            errors.email && styles.inputError,
                        ]}
                        placeholder="example@email.com"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email)
                                setErrors({ ...errors, email: "" });
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                    />
                    {errors.email ? (
                        <View style={styles.errorContainer}>
                            <Ionicons
                                name="warning"
                                size={14}
                                color="#FF3B30"
                            />
                            <Text style={styles.errorText}>{errors.email}</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>كلمة المرور</Text>
                    <TextInput
                        style={[
                            styles.input,
                            errors.password && styles.inputError,
                        ]}
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password)
                                setErrors({ ...errors, password: "" });
                        }}
                        secureTextEntry
                        editable={!loading}
                    />
                    {errors.password ? (
                        <View style={styles.errorContainer}>
                            <Ionicons
                                name="warning"
                                size={14}
                                color="#FF3B30"
                            />
                            <Text style={styles.errorText}>
                                {errors.password}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <TouchableOpacity
                    style={[
                        styles.loginButton,
                        loading && styles.buttonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={useTestCredentials}
                    disabled={loading}
                >
                    <Text style={styles.testButtonText}>
                        استخدام بيانات تجريبية
                    </Text>
                </TouchableOpacity>

                <View style={styles.linksContainer}>
                    <TouchableOpacity
                        onPress={() => router.push("/auth/forgot-password")}
                    >
                        <Text style={styles.linkText}>نسيت كلمة المرور؟</Text>
                    </TouchableOpacity>

                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>ليس لديك حساب؟ </Text>
                        <TouchableOpacity
                            onPress={() => router.push("/auth/register")}
                        >
                            <Text style={styles.signupLink}>
                                أنشئ حساب الآن
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 30,
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1D1D1F",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#8E8E93",
        textAlign: "center",
    },
    generalErrorContainer: {
        backgroundColor: "#FFE5E5",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#FF3B30",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    generalErrorText: {
        color: "#FF3B30",
        fontSize: 14,
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1D1D1F",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#C7C7CC",
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        backgroundColor: "#F9F9F9",
    },
    inputError: {
        borderColor: "#FF3B30",
        backgroundColor: "#FFF5F5",
    },
    errorContainer: {
        marginTop: 5,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: "#007AFF",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 15,
    },
    buttonDisabled: {
        backgroundColor: "#8E8E93",
        opacity: 0.7,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    testButton: {
        backgroundColor: "#34C759",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 25,
    },
    testButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
    linksContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    linkText: {
        color: "#007AFF",
        fontSize: 16,
        marginBottom: 20,
    },
    signupContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    signupText: {
        color: "#8E8E93",
        fontSize: 16,
    },
    signupLink: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
