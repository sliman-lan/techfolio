// app/tabs/create.js
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
import { router } from "expo-router";
import { projectsAPI, checkAuthStatus } from "../../src/services/api";

export default function Create() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [deadline, setDeadline] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);

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

        setLoading(true);
        try {
            const projectData = {
                title: title.trim(),
                description: description.trim(),
                budget: budget ? parseFloat(budget) : 0,
                deadline: deadline.trim() || null,
                category: category.trim() || "عام",
                status: "قيد التخطيط",
            };

            console.log("📤 إرسال بيانات المشروع:", projectData);
            const response = await projectsAPI.create(projectData);

            Alert.alert("نجاح", "تم إنشاء المشروع بنجاح", [
                {
                    text: "حسناً",
                    onPress: () => {
                        // إعادة تعيين الحقول
                        setTitle("");
                        setDescription("");
                        setBudget("");
                        setDeadline("");
                        setCategory("");

                        // العودة للصفحة الرئيسية
                        router.push("/tabs/home");
                    },
                },
            ]);
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
                <TextInput
                    style={styles.input}
                    placeholder="أدخل تصنيف المشروع (اختياري)"
                    placeholderTextColor="#999"
                    value={category}
                    onChangeText={setCategory}
                    editable={!loading}
                />

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
});
