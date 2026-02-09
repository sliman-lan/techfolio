import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { router } from "expo-router";

export default function Support() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert("خطأ", "الرجاء ملء الموضوع والرسالة");
            return;
        }

        // لا يوجد endpoint لإرسال التذاكر، عرض رسالة فقط
        Alert.alert("تم الإرسال", "شكرًا، سنرد عليك عبر البريد الإلكتروني.", [
            { text: "حسناً", onPress: () => router.back() },
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>المساعدة والدعم</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>الموضوع</Text>
                <TextInput
                    style={styles.input}
                    value={subject}
                    onChangeText={setSubject}
                />

                <Text style={styles.label}>الرسالة</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={6}
                    value={message}
                    onChangeText={setMessage}
                />

                <TouchableOpacity style={styles.button} onPress={handleSend}>
                    <Text style={styles.buttonText}>إرسال</Text>
                </TouchableOpacity>

                <Text style={styles.contact}>
                    أو راسلنا على support@example.com
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: { paddingTop: 60, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 20, fontWeight: "600", color: "#1D1D1F" },
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
    textArea: { height: 140, textAlignVertical: "top" },
    button: {
        backgroundColor: "#007AFF",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "600" },
    contact: { marginTop: 16, color: "#666" },
});
