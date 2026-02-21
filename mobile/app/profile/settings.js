// app/profile/settings.js - نسخة محسنة
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../src/context/AuthContext";

export default function Settings() {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [privacyMode, setPrivacyMode] = useState(false);
    const { logout } = useAuth();

    const handleLogout = () => {
        Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج؟", [
            { text: "إلغاء", style: "cancel" },
            {
                text: "تسجيل الخروج",
                style: "destructive",
                onPress: async () => {
                    await logout?.();
                    router.replace("/auth/login");
                },
            },
        ]);
    };

    const settingsSections = [
        {
            title: "الحساب",
            items: [
                {
                    icon: "person-outline",
                    label: "تعديل الملف الشخصي",
                    action: () => router.push("/profile/edit"),
                },
                {
                    icon: "lock-closed-outline",
                    label: "تغيير كلمة المرور",
                    action: () => router.push("/profile/change-password"),
                },
            ],
        },
        {
            title: "الإشعارات",
            items: [
                {
                    icon: "notifications-outline",
                    label: "تفعيل الإشعارات",
                    isToggle: true,
                    value: notifications,
                    onToggle: setNotifications,
                },
            ],
        },
        {
            title: "المظهر",
            items: [
                {
                    icon: "moon-outline",
                    label: "الوضع الليلي",
                    isToggle: true,
                    value: darkMode,
                    onToggle: setDarkMode,
                },
                {
                    icon: "language-outline",
                    label: "اللغة",
                    action: () => router.push("/profile/language"),
                },
            ],
        },
        {
            title: "الخصوصية",
            items: [
                {
                    icon: "shield-checkmark-outline",
                    label: "الخصوصية والأمان",
                    action: () => router.push("/profile/privacy"),
                },
                {
                    icon: "eye-outline",
                    label: "حساب خاص",
                    isToggle: true,
                    value: privacyMode,
                    onToggle: setPrivacyMode,
                },
            ],
        },
        {
            title: "الدعم",
            items: [
                {
                    icon: "help-circle-outline",
                    label: "المساعدة",
                    action: () => router.push("/profile/help"),
                },
                {
                    icon: "information-circle-outline",
                    label: "عن التطبيق",
                    action: () => router.push("/profile/about"),
                },
            ],
        },
        {
            title: "خطر",
            items: [
                {
                    icon: "log-out-outline",
                    label: "تسجيل الخروج",
                    action: handleLogout,
                    color: "#FF3B30",
                },
            ],
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>الإعدادات</Text>
                <View style={{ width: 40 }} />
            </View>

            {settingsSections.map((section, idx) => (
                <View key={idx} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.sectionContent}>
                        {section.items.map((item, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.item}
                                onPress={item.action}
                                disabled={item.isToggle}
                            >
                                <View style={styles.itemLeft}>
                                    <Ionicons
                                        name={item.icon}
                                        size={22}
                                        color={item.color || "#007AFF"}
                                    />
                                    <Text
                                        style={[
                                            styles.itemLabel,
                                            item.color && { color: item.color },
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </View>
                                {item.isToggle ? (
                                    <Switch
                                        value={item.value}
                                        onValueChange={item.onToggle}
                                        trackColor={{
                                            false: "#E5E5EA",
                                            true: "#007AFF",
                                        }}
                                        thumbColor="#fff"
                                    />
                                ) : (
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color="#8E8E93"
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
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
    section: { marginTop: 25 },
    sectionTitle: {
        fontSize: 14,
        color: "#8E8E93",
        marginBottom: 8,
        marginHorizontal: 20,
        fontWeight: "500",
    },
    sectionContent: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginHorizontal: 20,
        overflow: "hidden",
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#F2F2F7",
    },
    itemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    itemLabel: { fontSize: 16, color: "#1D1D1F", marginLeft: 12 },
});
