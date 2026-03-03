// app/profile/edit.js - نسخة محسنة مع دمج البيانات
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    Alert,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usersAPI } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfile() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [skills, setSkills] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const { user: authUser, setUser: setAuthUser } = useAuth();

    useEffect(() => {
        loadUserData();
        requestPermission();
    }, []);

    const requestPermission = async () => {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "صلاحية مطلوبة",
                "نحتاج للوصول إلى مكتبة الصور لتغيير الصورة الشخصية",
            );
        }
    };

    const loadUserData = async () => {
        try {
            setLoading(true);
            // نجلب أحدث البيانات من الخادم إن أمكن
            let user = authUser;
            try {
                const res = await usersAPI.getProfile();
                if (res?.data) user = res.data;
            } catch (e) {
                console.log("use local user data");
            }

            setName(user?.name || "");
            setEmail(user?.email || "");
            setBio(user?.bio || "");
            setAvatar(user?.avatar || null);
            setSkills(
                Array.isArray(user?.skills)
                    ? user.skills.join(", ")
                    : user?.skills || "",
            );
        } catch (error) {
            Alert.alert("خطأ", "فشل تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            base64: false,
        });
        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = "الاسم مطلوب";
        if (!email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
        else if (!/\S+@\S+\.\S+/.test(email))
            newErrors.email = "البريد غير صحيح";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setSaving(true);
        try {
            // إعداد البيانات
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("email", email.trim());
            formData.append("bio", bio.trim());
            skills
                .split(",")
                .forEach((s) => formData.append("skills", s.trim()));
            if (avatar && avatar.startsWith("file://")) {
                const filename = avatar.split("/").pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : "image/jpeg";
                formData.append("avatar", {
                    uri: avatar,
                    name: filename,
                    type,
                });
            } else if (avatar && avatar !== authUser?.avatar) {
                formData.append("avatar", avatar); // رابط URL مباشر
            }

            const response = await usersAPI.updateProfile(formData);
            const updatedUser = response.data || response;

            // دمج البيانات الجديدة مع البيانات الحالية (authUser) للحفاظ على جميع الحقول
            const mergedUser = {
                ...authUser, // البيانات القديمة (الاسم، البريد، الصورة، المهارات، الشهادات...)
                ...updatedUser, // البيانات الجديدة من الخادم
            };

            // تحديث التخزين المحلي
            await AsyncStorage.setItem("user", JSON.stringify(mergedUser));
            if (setAuthUser) setAuthUser(mergedUser);

            Alert.alert("نجاح", "تم تحديث الملف الشخصي", [
                { text: "حسناً", onPress: () => router.push("/profile") },
            ]);
        } catch (error) {
            Alert.alert("خطأ", error.response?.data?.message || "فشل الحفظ");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* الهيدر */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>تعديل الملف الشخصي</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* صورة المستخدم */}
            <View style={styles.avatarSection}>
                <TouchableOpacity
                    onPress={pickImage}
                    style={styles.avatarContainer}
                >
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {name.charAt(0) || "م"}
                            </Text>
                        </View>
                    )}
                    <View style={styles.cameraIcon}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.changePhotoText}>اضغط لتغيير الصورة</Text>
            </View>

            {/* النموذج */}
            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>الاسم الكامل *</Text>
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        value={name}
                        onChangeText={setName}
                        placeholder="أدخل اسمك"
                    />
                    {errors.name && (
                        <Text style={styles.errorText}>{errors.name}</Text>
                    )}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>البريد الإلكتروني *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            errors.email && styles.inputError,
                        ]}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {errors.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>نبذة عنك</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        numberOfLines={4}
                        placeholder="اكتب نبذة قصيرة عن نفسك..."
                        maxLength={300}
                    />
                    <Text style={styles.hint}>{bio.length}/300</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>المهارات (مفصولة بفواصل)</Text>
                    <TextInput
                        style={styles.input}
                        value={skills}
                        onChangeText={setSkills}
                        placeholder="مثال: React, Node.js, MongoDB"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                        disabled={saving}
                    >
                        <Text style={styles.cancelButtonText}>إلغاء</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>حفظ</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: "600", color: "#1D1D1F" },
    avatarSection: { alignItems: "center", marginTop: 20, marginBottom: 20 },
    avatarContainer: { position: "relative", marginBottom: 8 },
    avatar: { width: 120, height: 120, borderRadius: 60 },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: { fontSize: 48, color: "#fff", fontWeight: "bold" },
    cameraIcon: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: "#007AFF",
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
    },
    changePhotoText: { fontSize: 14, color: "#007AFF", marginBottom: 10 },
    form: { paddingHorizontal: 20, paddingBottom: 40 },
    inputGroup: { marginBottom: 20 },
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
    },
    inputError: { borderColor: "#FF3B30", backgroundColor: "#FFF5F5" },
    errorText: { color: "#FF3B30", fontSize: 14, marginTop: 5 },
    textArea: { height: 120, textAlignVertical: "top" },
    hint: { fontSize: 12, color: "#8E8E93", textAlign: "right", marginTop: 5 },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#F2F2F7",
        padding: 16,
        borderRadius: 12,
        marginRight: 10,
        alignItems: "center",
    },
    cancelButtonText: { color: "#FF3B30", fontSize: 16, fontWeight: "600" },
    saveButton: {
        flex: 1,
        backgroundColor: "#007AFF",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
