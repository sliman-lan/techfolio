// app/debug-logout.js
import React from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DebugLogout() {
    const router = useRouter();

    const handleLogout = async () => {
        Alert.alert("تسجيل الخروج", "هل أنت متأكد؟", [
            { text: "إلغاء", style: "cancel" },
            {
                text: "تسجيل الخروج",
                style: "destructive",
                onPress: async () => {
                    try {
                        console.log("1️⃣ بدء تسجيل الخروج من صفحة التصحيح");
                        await AsyncStorage.clear();
                        console.log("2️⃣ تم مسح التخزين");
                        // استخدام replace بعد تأخير
                        setTimeout(() => {
                            console.log("3️⃣ تنفيذ replace");
                            router.replace("/auth/login");
                        }, 100);
                    } catch (error) {
                        console.error("❌ خطأ:", error);
                        Alert.alert("خطأ", "فشل تسجيل الخروج");
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>صفحة اختبار تسجيل الخروج</Text>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>تسجيل الخروج</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 20, marginBottom: 20 },
    button: { backgroundColor: "#FF3B30", padding: 15, borderRadius: 10 },
    buttonText: { color: "#fff", fontSize: 16 },
});
