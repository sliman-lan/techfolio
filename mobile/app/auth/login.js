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
} from "react-native";
import { useRouter } from "expo-router";
import { authAPI } from "../../src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
    const router = useRouter();

    // الحقول
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // حالات التحميل والأخطاء
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    // معالجة تسجيل الدخول
    const handleLogin = async () => {
        // التحقق من صحة البيانات أولاً
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "البريد الإلكتروني مطلوب";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
        }

        if (!password) {
            newErrors.password = "كلمة المرور مطلوبة";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});
        setGeneralError("");

        try {
            console.log("🔄 جاري تسجيل الدخول...", { email });

            const response = await authAPI.login({ email, password });

            console.log(
                "✅ تسجيل الدخول ناجح، الرد الكامل:",
                JSON.stringify(response.data, null, 2),
            );

            // 🔥 التصحيح: التوكن موجود في response.data.data وليس response.data مباشرة
            // في login.js - جزء من دالة handleLogin
            if (response.data.success && response.data.data?.token) {
                const token = response.data.data.token;
                const user =
                    response.data.data.user || response.data.data || {};

                console.log(
                    "🔑 التوكن المستلم:",
                    token.substring(0, 20) + "...",
                );
                console.log("👤 بيانات المستخدم:", user);

                // 🔥 حفظ البيانات المهمة
                await AsyncStorage.setItem("authToken", token);
                await AsyncStorage.setItem("user", JSON.stringify(user));
                await AsyncStorage.setItem(
                    "user_id",
                    user.id || user._id || "",
                );
                await AsyncStorage.setItem("user_email", user.email || "");
                await AsyncStorage.setItem(
                    "user_name",
                    user.name || user.username || "",
                );

                // التحقق من الحفظ
                const savedUser = await AsyncStorage.getItem("user");
                console.log("💾 المستخدم المحفوظ:", savedUser);

                // التوجيه إلى الصفحة الرئيسية
                router.replace("/tabs/home");
            } else {
                console.error("❌ بنية الرد غير متوقعة:", response.data);
                setGeneralError("بنية البيانات غير صحيحة من الخادم");

                // 🔥 عرض بنية الرد للتصحيح
                Alert.alert(
                    "تنبيه",
                    `الخادم أرسل: ${JSON.stringify(response.data, null, 2)}`,
                    [{ text: "حسناً" }],
                );
            }
        } catch (error) {
            console.error("❌ خطأ في تسجيل الدخول:", error);

            // 🔥 تسجيل تفاصيل الخطأ
            if (error.response) {
                console.error("🔴 تفاصيل الخطأ:", {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers,
                });
            }

            let errorMessage = "حدث خطأ أثناء تسجيل الدخول";

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
                } else if (error.response.status === 400) {
                    errorMessage = "بيانات غير صحيحة";
                } else {
                    errorMessage =
                        error.response.data?.message || "خطأ في الخادم";
                }
            } else if (error.request) {
                errorMessage = "تعذر الاتصال بالخادم";
            }

            setGeneralError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // إدخال بيانات تجريبية
    const useTestCredentials = () => {
        setEmail("test@test.com");
        setPassword("123456");
        setErrors({});
        setGeneralError("");
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                {/* العنوان */}
                <View style={styles.header}>
                    <Text style={styles.title}>تسجيل الدخول</Text>
                    <Text style={styles.subtitle}>
                        أدخل بياناتك للوصول إلى حسابك
                    </Text>
                </View>

                {/* رسالة الخطأ العامة */}
                {generalError ? (
                    <View style={styles.generalErrorContainer}>
                        <Text style={styles.generalErrorText}>
                            {generalError}
                        </Text>
                    </View>
                ) : null}

                {/* حقل البريد الإلكتروني */}
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
                            <Text style={styles.errorText}>{errors.email}</Text>
                        </View>
                    ) : null}
                </View>

                {/* حقل كلمة المرور */}
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
                            <Text style={styles.errorText}>
                                {errors.password}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* زر تسجيل الدخول */}
                <TouchableOpacity
                    style={[
                        styles.loginButton,
                        loading && styles.buttonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.loginButtonText}>
                        {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </Text>
                </TouchableOpacity>

                {/* زر البيانات التجريبية (للتطوير) */}
                <TouchableOpacity
                    style={styles.testButton}
                    onPress={useTestCredentials}
                    disabled={loading}
                >
                    <Text style={styles.testButtonText}>
                        استخدام بيانات تجريبية
                    </Text>
                </TouchableOpacity>

                {/* روابط إضافية */}
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

                {/* تلميحات للمستخدم */}
                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>تلميحات:</Text>
                    <Text style={styles.tip}>
                        • تأكد من صحة البريد الإلكتروني
                    </Text>
                    <Text style={styles.tip}>• تأكد من صحة كلمة المرور</Text>
                    <Text style={styles.tip}>
                        • إذا نسيت كلمة المرور، يمكنك استعادتها
                    </Text>
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
    },
    generalErrorText: {
        color: "#FF3B30",
        fontSize: 14,
        textAlign: "center",
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
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 14,
        marginLeft: 5,
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
    tipsContainer: {
        backgroundColor: "#F2F2F7",
        padding: 20,
        borderRadius: 12,
        marginTop: 10,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1D1D1F",
        marginBottom: 10,
    },
    tip: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
        lineHeight: 22,
    },
});
