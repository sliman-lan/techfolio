// app/profile/edit.js - الإصدار المعدل للعمل على الويب
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usersAPI } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfile() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [skills, setSkills] = useState("");
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadUserData();
    }, []);

    const { setUser } = useAuth();

    const loadUserData = async () => {
        try {
            setLoading(true);
            const userString = await AsyncStorage.getItem("user");
            if (userString) {
                const user = JSON.parse(userString);
                setName(user.name || "");
                setEmail(user.email || "");
                setBio(user.bio || "");
                setSkills(
                    Array.isArray(user.skills)
                        ? (user.skills || []).join(", ")
                        : user.skills || "",
                );
                setCertifications(
                    Array.isArray(user.certifications)
                        ? user.certifications
                        : [],
                );
            }
        } catch (error) {
            console.error("❌ خطأ في تحميل بيانات المستخدم:", error);
            // استخدام window.alert بدلاً من Alert.alert للويب
            if (typeof window !== "undefined") {
                window.alert("خطأ: تعذر تحميل بيانات المستخدم");
            }
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = "الاسم الكامل مطلوب";
        }

        if (!email.trim()) {
            newErrors.email = "البريد الإلكتروني مطلوب";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            const userString = await AsyncStorage.getItem("user");
            let user = userString ? JSON.parse(userString) : {};

            const updatedUser = {
                ...user,
                name: name.trim(),
                email: email.trim(),
                bio: bio.trim(),
                skills: skills
                    ? skills
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : [],
                certifications: Array.isArray(certifications)
                    ? certifications
                    : [],
                updatedAt: new Date().toISOString(),
            };

            console.log("Sending updated user to server:", updatedUser);
            // إرسال التعديلات إلى الخادم لحفظها في قاعدة البيانات
            try {
                const apiRes = await usersAPI.updateProfile({
                    name: updatedUser.name,
                    email: updatedUser.email,
                    bio: updatedUser.bio,
                    skills: updatedUser.skills,
                    certifications: updatedUser.certifications,
                });

                console.log("updateProfile response:", apiRes);

                // عند نجاح الحفظ على الخادم، حدّث التخزين المحلي
                const serverUser = apiRes.data || apiRes || updatedUser;
                await AsyncStorage.setItem("user", JSON.stringify(serverUser));

                // Update in-memory auth context so profile updates immediately
                try {
                    if (setUser) setUser(serverUser);
                } catch (e) {
                    console.warn("setUser failed:", e);
                }

                if (typeof window !== "undefined" && window.localStorage) {
                    localStorage.setItem("user", JSON.stringify(serverUser));
                }
            } catch (apiError) {
                console.error("❌ خطأ في تحديث الملف على الخادم:", apiError);
                const message =
                    apiError.response?.data?.message ||
                    apiError.message ||
                    "فشل حفظ التعديلات على الخادم";
                if (typeof window !== "undefined") {
                    window.alert(`❌ ${message}`);
                } else {
                    Alert.alert("خطأ", message);
                }
                return; // stop further processing
            }

            // التنقل للصفحة الرئيسية سواء على الويب أو الموبايل
            if (typeof window !== "undefined") {
                const result = window.confirm(
                    "✅ تم تحديث الملف الشخصي بنجاح\nهل تريد العودة للصفحة الرئيسية؟",
                );
                if (result) {
                    router.push("/profile");
                }
            } else {
                router.push("/profile");
            }
        } catch (error) {
            console.error("❌ خطأ في حفظ البيانات:", error);
            // استخدام window.alert للويب
            if (typeof window !== "undefined") {
                window.alert("❌ فشل حفظ التعديلات. يرجى المحاولة مرة أخرى");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (typeof window !== "undefined") {
            const result = window.confirm("هل تريد تجاهل التغييرات والعودة؟");
            if (result) {
                router.push("/profile");
            }
        }
    };

    const handleBack = () => {
        router.push("/profile");
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>جاري التحميل...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* الهيدر */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>تعديل الملف الشخصي</Text>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleBack}
                >
                    <Ionicons name="close" size={24} color="#8E8E93" />
                </TouchableOpacity>
            </View>

            {/* نموذج التعديل */}
            <View style={styles.form}>
                {/* حقل الاسم */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>الاسم الكامل *</Text>
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        placeholder="أدخل اسمك الكامل"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        editable={!saving}
                    />
                    {errors.name && (
                        <Text style={styles.errorText}>{errors.name}</Text>
                    )}
                </View>

                {/* حقل البريد */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>البريد الإلكتروني *</Text>
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
                        editable={!saving}
                    />
                    {errors.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                </View>

                {/* حقل النبذة */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>نبذة عنك</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="اكتب نبذة قصيرة عنك..."
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        editable={!saving}
                        maxLength={200}
                    />
                    <Text style={styles.hintText}>{bio.length}/200 حرف</Text>
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>المهارات (مفصولة بفواصل)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="مثال: React, Node.js"
                        value={skills}
                        onChangeText={setSkills}
                        editable={!saving}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>الشهادات (اختياري)</Text>
                    {certifications.map((c, i) => (
                        <View key={i} style={{ marginBottom: 8 }}>
                            <TextInput
                                style={[styles.input, { marginBottom: 8 }]}
                                placeholder="العنوان"
                                value={c.title || ""}
                                onChangeText={(val) => {
                                    const next = [...certifications];
                                    next[i] = { ...next[i], title: val };
                                    setCertifications(next);
                                }}
                            />
                            <TextInput
                                style={[styles.input, { marginBottom: 8 }]}
                                placeholder="الجهة المانحة"
                                value={c.issuer || ""}
                                onChangeText={(val) => {
                                    const next = [...certifications];
                                    next[i] = { ...next[i], issuer: val };
                                    setCertifications(next);
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    setCertifications(
                                        certifications.filter(
                                            (_, idx) => idx !== i,
                                        ),
                                    );
                                }}
                                style={{ marginBottom: 4 }}
                            >
                                <Text style={{ color: "#FF3B30" }}>
                                    حذف الشهادة
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity
                        onPress={() =>
                            setCertifications([
                                ...certifications,
                                { title: "", issuer: "" },
                            ])
                        }
                    >
                        <Text style={{ color: "#007AFF" }}>إضافة شهادة</Text>
                    </TouchableOpacity>
                </View>

                {/* أزرار التحكم */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleCancel}
                        disabled={saving}
                    >
                        <Text style={styles.cancelButtonText}>إلغاء</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.saveButton,
                            saving && styles.buttonDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.saveButtonText}>
                                حفظ التغييرات
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2F2F7",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#8E8E93",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
    },
    backButton: {
        padding: 5,
    },
    closeButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1D1D1F",
    },
    form: {
        padding: 20,
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
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E5E5EA",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#000",
    },
    inputError: {
        borderColor: "#FF3B30",
        backgroundColor: "#FFF5F5",
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 14,
        marginTop: 5,
        marginLeft: 5,
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    hintText: {
        fontSize: 12,
        color: "#8E8E93",
        marginTop: 5,
        textAlign: "right",
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
        gap: 15,
    },
    button: {
        flex: 1,
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 54,
    },
    cancelButton: {
        backgroundColor: "#F2F2F7",
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    saveButton: {
        backgroundColor: "#007AFF",
    },
    buttonDisabled: {
        backgroundColor: "#C7C7CC",
        opacity: 0.7,
    },
    cancelButtonText: {
        color: "#FF3B30",
        fontSize: 16,
        fontWeight: "600",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
