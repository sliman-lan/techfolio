// app/tabs/create.js
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { router } from "expo-router";
import { projectsAPI, checkAuthStatus } from "../../src/services/api";

export default function Create() {
    const CATEGORIES = [
        { label: "عام", value: "other" },
        { label: "تطوير ويب", value: "web" },
        { label: "تصميم", value: "design" },
        { label: "موبايل", value: "mobile" },
        { label: "ذكاء اصطناعي", value: "ai" },
    ];

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [deadline, setDeadline] = useState("");
    const [category, setCategory] = useState(CATEGORIES[1].value);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // load user and check role to prevent admins from creating projects
    useEffect(() => {
        let mounted = true;
        AsyncStorage.getItem("user")
            .then((str) => {
                if (!mounted) return;
                if (!str) return;
                try {
                    const u = JSON.parse(str);
                    if (u && u.role === "admin") setIsAdmin(true);
                } catch (e) {
                    // ignore
                }
            })
            .catch(() => {});
        return () => (mounted = false);
    }, []);

    // app/tabs/create.js (تعديل دالة handleCreate)
    const handleCreate = async () => {
        // 🔥 **التحقق من التوكن مباشرة بدلاً من checkAuthStatus**
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
            Alert.alert(
                "غير مسجل دخول",
                "يجب تسجيل الدخول أولاً لإنشاء مشروع",
                [
                    { text: "إلغاء", style: "cancel" },
                    {
                        text: "تسجيل الدخول",
                        onPress: () => router.push("/auth/login"),
                    },
                ],
            );
            return;
        }

        if (!title.trim()) {
            Alert.alert("خطأ", "يرجى إدخال عنوان للمشروع");
            return;
        }
        if (!description.trim()) {
            Alert.alert("خطأ", "يرجى إدخال وصف للمشروع");
            return;
        }

        setLoading(true);
        try {
            const projectData = {
                title: title.trim(),
                description: description.trim(),
                budget: budget ? parseFloat(budget) : 0,
                deadline: deadline.trim() || null,
                category: category || "web",
                status: "قيد التخطيط",
            };

            console.log("📤 إرسال بيانات المشروع:", projectData);
            const response = await projectsAPI.create(projectData);
            console.log("📥 استجابة إنشاء المشروع:", response);

            // إذا أعاد الخادم الكائن المنشأ أو معرفه نفترض النجاح
            const createdId =
                response?._id || response?.id || response?.data?._id || null;

            // إعادة تعيين الحقول والتنقل فوراً عند النجاح
            if (createdId || response) {
                setTitle("");
                setDescription("");
                setBudget("");
                setDeadline("");
                setCategory(CATEGORIES[1].value);
                router.push("/tabs/home");
            } else {
                Alert.alert(
                    "تنبيه",
                    "لم يتم إنشاء المشروع. تحقق من الكونسول للمزيد.",
                );
            }
        } catch (error) {
            console.error("❌ خطأ في إنشاء المشروع:", error);

            let errorMessage = "فشل إنشاء المشروع. يرجى المحاولة مرة أخرى";

            if (error.response) {
                console.error("🔴 تفاصيل الخطأ:", error.response.data);

                if (error.response.status === 401) {
                    errorMessage = "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى";
                    // مسح التخزين وإعادة التوجيه
                    await AsyncStorage.clear();
                    router.push("/auth/login");
                } else if (error.response.data?.errors) {
                    const validationErrors = error.response.data.errors
                        .map((err) => err.msg)
                        .join("\n");
                    errorMessage = validationErrors;
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            }

            Alert.alert("خطأ", errorMessage);
        } finally {
            setLoading(false);
        }
    };
    if (isAdmin) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text style={{ fontSize: 18, marginBottom: 12 }}>
                    لا يمكنك إنشاء مشاريع كمشرف
                </Text>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.cancelButtonText}>عودة</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.title}>إنشاء مشروع جديد</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>عنوان المشروع *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="أدخل عنوان المشروع"
                    placeholderTextColor="#999"
                    value={title}
                    onChangeText={setTitle}
                    editable={!loading}
                />

                <Text style={styles.label}>وصف المشروع</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="أدخل وصف المشروع (اختياري)"
                    placeholderTextColor="#999"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!loading}
                />

                <Text style={styles.label}>الميزانية (ريال)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="أدخل الميزانية (اختياري)"
                    placeholderTextColor="#999"
                    value={budget}
                    onChangeText={setBudget}
                    keyboardType="numeric"
                    editable={!loading}
                />

                <Text style={styles.label}>تاريخ التسليم</Text>
                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD (اختياري)"
                    placeholderTextColor="#999"
                    value={deadline}
                    onChangeText={setDeadline}
                    editable={!loading}
                />

                <Text style={styles.label}>التصنيف</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 20 }}
                >
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.value}
                            style={[
                                styles.categoryButton,
                                category === cat.value &&
                                    styles.categorySelected,
                            ]}
                            onPress={() => setCategory(cat.value)}
                            disabled={loading}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    category === cat.value &&
                                        styles.categoryTextSelected,
                                ]}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.note}>
                    <Text style={styles.noteText}>* الحقول المطلوبة</Text>
                    <Text style={styles.noteText}>
                        سيتم حفظ المشروع في قاعدة البيانات
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.createButton,
                        loading && styles.buttonDisabled,
                    ]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.createButtonText}>
                            إنشاء المشروع
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                    disabled={loading}
                >
                    <Text style={styles.cancelButtonText}>إلغاء</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    header: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1D1D1F",
    },
    form: {
        padding: 20,
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
        marginBottom: 20,
        color: "#000",
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    note: {
        backgroundColor: "#F9F9F9",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    noteText: {
        fontSize: 14,
        color: "#8E8E93",
        marginBottom: 5,
    },
    createButton: {
        backgroundColor: "#007AFF",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    buttonDisabled: {
        backgroundColor: "#C7C7CC",
    },
    createButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: "#E5E5EA",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#FF3B30",
        fontSize: 18,
        fontWeight: "600",
    },
    categoryButton: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E5E5EA",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        marginRight: 10,
    },
    categorySelected: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    categoryText: {
        color: "#1D1D1F",
        fontSize: 14,
        fontWeight: "600",
    },
    categoryTextSelected: {
        color: "#fff",
    },
});
