// app/profile/settings.js - معدل باستخدام router.push
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

    const handleBack = () => {
        router.push("/profile");
    };

    const { logout } = useAuth();

    const handleLogout = async () => {
        if (typeof window !== "undefined") {
            const ok = window.confirm("هل تريد تسجيل الخروج؟");
            if (!ok) return;
            try {
                if (logout) await logout();
            } catch (e) {
                console.warn("Logout failed:", e);
            }
            return;
        }

        Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج؟", [
            { text: "إلغاء", style: "cancel" },
            {
                text: "تسجيل الخروج",
                style: "destructive",
                onPress: async () => {
                    console.log(
                        "Settings logout onPress invoked, logout func exists:",
                        typeof logout === "function",
                    );
                    try {
                        if (logout) {
                            console.log("Calling logout() from settings");
                            await logout();
                            console.log("logout() resolved");
                        } else {
                            console.log("logout() not available in context");
                        }
                    } catch (e) {
                        console.warn("Logout failed:", e);
                    }
                },
            },
        ]);
    };

    const settingsOptions = [
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
            ],
        },
        {
            title: "عام",
            items: [
                {
                    icon: "shield-checkmark-outline",
                    label: "الخصوصية والأمان",
                    action: () => router.push("/profile/privacy"),
                },
                {
                    icon: "help-circle-outline",
                    label: "المساعدة والدعم",
                    action: () => router.push("/profile/support"),
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
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* الهيدر */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>الإعدادات</Text>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleBack}
                >
                    <Ionicons name="close" size={24} color="#8E8E93" />
                </TouchableOpacity>
            </View>

            {/* أقسام الإعدادات */}
            {settingsOptions.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.sectionContent}>
                        {section.items.map((item, itemIndex) => (
                            <TouchableOpacity
                                key={itemIndex}
                                style={styles.settingItem}
                                onPress={() => {
                                    console.log(
                                        "Settings action invoked:",
                                        item?.label,
                                    );
                                    if (
                                        item &&
                                        typeof item.action === "function"
                                    ) {
                                        try {
                                            item.action();
                                        } catch (e) {
                                            console.warn("Action error:", e);
                                        }
                                    }
                                }}
                                disabled={!!item.isToggle}
                            >
                                <View style={styles.settingLeft}>
                                    <Ionicons
                                        name={item.icon}
                                        size={22}
                                        color={item.color || "#007AFF"}
                                        style={styles.settingIcon}
                                    />
                                    <Text
                                        style={[
                                            styles.settingLabel,
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
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
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
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1D1D1F",
    },
    closeButton: {
        padding: 5,
    },
    section: {
        marginTop: 25,
    },
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
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#F2F2F7",
    },
    settingLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    settingIcon: {
        marginRight: 12,
    },
    settingLabel: {
        fontSize: 16,
        color: "#1D1D1F",
        flex: 1,
    },
});
