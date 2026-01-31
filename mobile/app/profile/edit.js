// app/profile/edit.js
import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfile() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const userString = await AsyncStorage.getItem("user");
            if (userString) {
                const user = JSON.parse(userString);
                setName(user.name || "");
                setEmail(user.email || "");
                setBio(user.bio || "");
            }
        } catch (error) {
            console.error("❌ خطأ في تحميل بيانات المستخدم:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert("خطأ", "الاسم والبريد الإلكتروني مطلوبان");
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
                updatedAt: new Date().toISOString(),
            };

            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

            Alert.alert("نجاح", "تم تحديث الملف الشخصي بنجاح", [
                { text: "حسناً", onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error("❌ خطأ في حفظ البيانات:", error);
            Alert.alert("خطأ", "فشل حفظ التعديلات");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>جاري التحميل...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
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

            <View style={styles.form}>
                <Text style={styles.label}>الاسم الكامل *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="أدخل اسمك الكامل"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>البريد الإلكتروني *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="example@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>نبذة عنك</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="اكتب نبذة قصيرة عنك..."
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
                    )}
                </TouchableOpacity>
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
    form: { padding: 20 },
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
    textArea: { height: 100, textAlignVertical: "top" },
    saveButton: {
        backgroundColor: "#007AFF",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    buttonDisabled: { backgroundColor: "#C7C7CC" },
    saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
