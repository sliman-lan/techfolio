// app/auth/register.js
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

export default function Register() {
    const router = useRouter();

    // الحقول
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // حالات التحميل والأخطاء
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // التحقق من صحة البيانات قبل الإرسال
    const validateForm = () => {
        const newErrors = {};

        // التحقق من الاسم
        if (!name.trim()) {
            newErrors.name = "الاسم الكامل مطلوب";
        } else if (name.trim().length < 2) {
            newErrors.name = "الاسم يجب أن يكون حرفين على الأقل";
        }

        // التحقق من البريد الإلكتروني
        if (!email.trim()) {
            newErrors.email = "البريد الإلكتروني مطلوب";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
        }

        // التحقق من كلمة المرور
        if (!password) {
            newErrors.password = "كلمة المرور مطلوبة";
        } else if (password.length < 6) {
            newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
        }

        // التحقق من تأكيد كلمة المرور
        if (!confirmPassword) {
            newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "كلمة المرور غير متطابقة";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // معالجة إنشاء الحساب
    const handleRegister = async () => {
        // إعادة ضبط الأخطاء والرسائل
        setErrors({});
        setGeneralError("");
        setSuccessMessage("");

        // التحقق من صحة البيانات
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            console.log("🔄 جاري إنشاء الحساب...");

            const userData = {
                name: name.trim(),
                email: email.trim(),
                password: password,
            };

            const response = await authAPI.register(userData);

            if (response.data.token) {
                setSuccessMessage(
                    "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول",
                );

                // الانتقال إلى صفحة تسجيل الدخول بعد ثانيتين
                setTimeout(() => {
                    router.push("/auth/login");
                }, 2000);
            }
        } catch (error) {
            console.error("❌ خطأ في إنشاء الحساب:", error);

            let errorMessage = "حدث خطأ أثناء إنشاء الحساب";

            if (error.response) {
                if (error.response.status === 400) {
                    if (error.response.data?.errors) {
                        // تحويل أخطاء الخادم إلى أخطاء في الحقول
                        const serverErrors = {};
                        error.response.data.errors.forEach((err) => {
                            if (err.path === "email") {
                                serverErrors.email =
                                    err.msg || "البريد الإلكتروني غير صالح";
                            } else if (err.path === "password") {
                                serverErrors.password =
                                    err.msg || "كلمة المرور غير صالحة";
                            }
                        });
                        setErrors(serverErrors);
                        errorMessage = "يوجد أخطاء في البيانات المدخلة";
                    } else if (error.response.data?.message) {
                        if (
                            error.response.data.message.includes("email") ||
                            error.response.data.message.includes("بريد")
                        ) {
                            setErrors({
                                email: "البريد الإلكتروني مستخدم مسبقاً",
                            });
                        } else {
                            setGeneralError(error.response.data.message);
                        }
                    }
                } else if (error.response.status === 409) {
                    setErrors({ email: "البريد الإلكتروني مستخدم مسبقاً" });
                } else {
                    setGeneralError(
                        error.response.data?.message || "حدث خطأ في الخادم",
                    );
                }
            } else if (error.request) {
                setGeneralError("تعذر الاتصال بالخادم. تأكد من اتصال الإنترنت");
            } else {
                setGeneralError("حدث خطأ غير متوقع");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                {/* العنوان */}
                <View style={styles.header}>
                    <Text style={styles.title}>إنشاء حساب جديد</Text>
                    <Text style={styles.subtitle}>
                        املأ النموذج لإنشاء حساب جديد
                    </Text>
                </View>

                {/* رسالة النجاح */}
                {successMessage ? (
                    <View style={styles.successContainer}>
                        <Text style={styles.successText}>{successMessage}</Text>
                    </View>
                ) : null}

                {/* رسالة الخطأ العامة */}
                {generalError && !successMessage ? (
                    <View style={styles.generalErrorContainer}>
                        <Text style={styles.generalErrorText}>
                            {generalError}
                        </Text>
                    </View>
                ) : null}

                {/* حقل الاسم */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>الاسم الكامل</Text>
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        placeholder="أحمد محمد"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        autoCapitalize="words"
                        editable={!loading}
                    />
                    {errors.name ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{errors.name}</Text>
                        </View>
                    ) : null}
                </View>

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
                    <Text style={styles.passwordHint}>
                        يجب أن تكون 6 أحرف على الأقل
                    </Text>
                </View>

                {/* حقل تأكيد كلمة المرور */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>تأكيد كلمة المرور</Text>
                    <TextInput
                        style={[
                            styles.input,
                            errors.confirmPassword && styles.inputError,
                        ]}
                        placeholder="أعد إدخال كلمة المرور"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (errors.confirmPassword)
                                setErrors({ ...errors, confirmPassword: "" });
                        }}
                        secureTextEntry
                        editable={!loading}
                    />
                    {errors.confirmPassword ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>
                                {errors.confirmPassword}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* زر إنشاء الحساب */}
                <TouchableOpacity
                    style={[
                        styles.registerButton,
                        loading && styles.buttonDisabled,
                    ]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.registerButtonText}>
                        {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                    </Text>
                </TouchableOpacity>

                {/* رابط العودة لتسجيل الدخول */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>لديك حساب بالفعل؟ </Text>
                    <TouchableOpacity
                        onPress={() => router.push("/auth/login")}
                    >
                        <Text style={styles.loginLink}>سجل الدخول الآن</Text>
                    </TouchableOpacity>
                </View>

                {/* معلومات إرشادية */}
                <View style={styles.infoContainer}>
                    <Text style={styles.infoTitle}>معلومات مهمة:</Text>
                    <Text style={styles.infoText}>
                        • استخدم بريد إلكتروني صالح لتلقي رسائل التفعيل
                    </Text>
                    <Text style={styles.infoText}>
                        • اختر كلمة مرور قوية يسهل تذكرها
                    </Text>
                    <Text style={styles.infoText}>
                        • تأكد من تطابق كلمتي المرور
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
        paddingTop: 50,
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
    successContainer: {
        backgroundColor: "#E5F7E5",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#34C759",
    },
    successText: {
        color: "#34C759",
        fontSize: 14,
        textAlign: "center",
        fontWeight: "500",
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
    passwordHint: {
        fontSize: 12,
        color: "#8E8E93",
        marginTop: 5,
        fontStyle: "italic",
    },
    registerButton: {
        backgroundColor: "#34C759",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    buttonDisabled: {
        backgroundColor: "#8E8E93",
        opacity: 0.7,
    },
    registerButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
    },
    loginText: {
        color: "#8E8E93",
        fontSize: 16,
    },
    loginLink: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
    },
    infoContainer: {
        backgroundColor: "#F2F2F7",
        padding: 20,
        borderRadius: 12,
        marginTop: 10,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1D1D1F",
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
        lineHeight: 22,
    },
});
