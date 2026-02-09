import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authAPI } from "../../src/services/api";

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!currentPassword || !newPassword) {
            Alert.alert("خطأ", "الرجاء ملء جميع الحقول المطلوبة");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert(
                "خطأ",
                "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل",
            );
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("خطأ", "تأكيد كلمة المرور لا يطابق");
            return;
        }

        setLoading(true);
        try {
            const res = await authAPI.changePassword({
                currentPassword,
                newPassword,
            });
            if (res && res.success) {
                Alert.alert("نجاح", "تم تغيير كلمة المرور بنجاح", [
                    { text: "حسناً", onPress: () => router.back() },
                ]);
            } else {
                const msg = res?.message || "فشل تغيير كلمة المرور";
                Alert.alert("خطأ", msg);
            }
        } catch (error) {
            const msg =
                error.response?.data?.message || error.message || "حدث خطأ";
            Alert.alert("خطأ", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>تغيير كلمة المرور</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>كلمة المرور الحالية</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                />

                <Text style={styles.label}>كلمة المرور الجديدة</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />

                <Text style={styles.label}>تأكيد كلمة المرور</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>حفظ</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
    },
    headerTitle: { fontSize: 20, fontWeight: "600", color: "#1D1D1F" },
    form: { padding: 20 },
    label: { marginBottom: 6, color: "#1D1D1F" },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E5E5EA",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    button: {
        backgroundColor: "#007AFF",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "600" },
    buttonDisabled: { opacity: 0.7 },
});
