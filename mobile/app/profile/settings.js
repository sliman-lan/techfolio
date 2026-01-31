// app/profile/settings.js
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

export default function Settings() {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState("ar");

    const settingsOptions = [
        {
            title: "الحساب",
            items: [
                {
                    icon: "person-outline",
                    label: "الملف الشخصي",
                    action: () => router.push("/profile/edit"),
                },
                {
                    icon: "lock-closed-outline",
                    label: "تغيير كلمة المرور",
                    action: () => Alert.alert("قريباً", "هذه الميزة قريباً"),
                },
                {
                    icon: "card-outline",
                    label: "الاشتراكات",
                    action: () => Alert.alert("قريباً", "هذه الميزة قريباً"),
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
            ],
        },
        {
            title: "عام",
            items: [
                {
                    icon: "language-outline",
                    label: "اللغة",
                    action: () => Alert.alert("اللغة", "العربية (الحالية)"),
                },
                {
                    icon: "shield-checkmark-outline",
                    label: "الخصوصية والأمان",
                    action: () => Alert.alert("الخصوصية", "إعدادات الخصوصية"),
                },
                {
                    icon: "help-circle-outline",
                    label: "المساعدة والدعم",
                    action: () => Alert.alert("الدعم", "support@example.com"),
                },
                {
                    icon: "information-circle-outline",
                    label: "عن التطبيق",
                    action: () => Alert.alert("عن التطبيق", "إصدار 1.0.0"),
                },
            ],
        },
    ];

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
                <Text style={styles.headerTitle}>الإعدادات</Text>
                <View style={{ width: 40 }} />
            </View>

            {settingsOptions.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.sectionContent}>
                        {section.items.map((item, itemIndex) => (
                            <TouchableOpacity
                                key={itemIndex}
                                style={styles.settingItem}
                                onPress={item.action}
                                disabled={item.isToggle}
                            >
                                <View style={styles.settingLeft}>
                                    <Ionicons
                                        name={item.icon}
                                        size={22}
                                        color="#007AFF"
                                        style={styles.settingIcon}
                                    />
                                    <Text style={styles.settingLabel}>
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
    section: { marginTop: 20 },
    sectionTitle: {
        fontSize: 14,
        color: "#8E8E93",
        marginBottom: 10,
        marginHorizontal: 20,
        fontWeight: "500",
    },
    sectionContent: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginHorizontal: 20,
        overflow: "hidden",
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    settingLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    settingIcon: { marginRight: 12 },
    settingLabel: { fontSize: 16, color: "#1D1D1F", flex: 1 },
});
