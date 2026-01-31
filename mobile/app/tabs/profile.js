// app/tabs/profile.js
import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { projectsAPI } from "../../src/services/api";

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        planning: 0,
    });

    useFocusEffect(
        useCallback(() => {
            loadUserProfile();
        }, []),
    );

    const loadUserProfile = async () => {
        try {
            setLoading(true);

            // جلب بيانات المستخدم من AsyncStorage
            const userString = await AsyncStorage.getItem("user");
            const storedUser = userString ? JSON.parse(userString) : null;

            if (storedUser) {
                setUser(storedUser);
                console.log("👤 بيانات المستخدم:", storedUser);
            }

            // 🔥 **جلب المشاريع الحقيقية من AsyncStorage أو API**
            await loadUserProjects();
        } catch (error) {
            console.error("❌ خطأ في تحميل الملف الشخصي:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserProjects = async () => {
        try {
            // في المستقبل: جلب المشاريع من API
            // const response = await projectsAPI.getUserProjects(user.id);

            // 🔥 **حالياً: جلب المشاريع من AsyncStorage أو استخدام بيانات تجريبية**
            const projectsData = await AsyncStorage.getItem("userProjects");

            let userProjects = [];

            if (projectsData) {
                userProjects = JSON.parse(projectsData);
            } else {
                // إذا لم تكن هناك مشاريع محفوظة، استخدم بيانات تجريبية
                userProjects = [
                    {
                        _id: "1",
                        title: "مشروع تطوير الموقع",
                        description: "تطوير موقع الشركة الإلكتروني",
                        status: "مكتمل",
                        budget: 20000,
                        category: "تطوير",
                        userId: "user123",
                    },
                    {
                        _id: "2",
                        title: "تصميم الهوية البصرية",
                        description: "تصميم شعار وألوان الشركة",
                        status: "قيد التنفيذ",
                        budget: 15000,
                        category: "تصميم",
                        userId: "user123",
                    },
                    {
                        _id: "3",
                        title: "تطبيق الجوال",
                        description: "تطبيق لإدارة المشاريع",
                        status: "قيد التخطيط",
                        budget: 30000,
                        category: "تطوير",
                        userId: "user123",
                    },
                    {
                        _id: "4",
                        title: "تحليل البيانات",
                        description: "تحليل بيانات العملاء",
                        status: "مكتمل",
                        budget: 12000,
                        category: "تحليل",
                        userId: "user123",
                    },
                ];

                // حفظ المشاريع في AsyncStorage للمرة الأولى
                await AsyncStorage.setItem(
                    "userProjects",
                    JSON.stringify(userProjects),
                );
            }

            setProjects(userProjects);

            // 🔥 **حساب الإحصائيات الحقيقية**
            calculateStats(userProjects);
        } catch (error) {
            console.error("❌ خطأ في تحميل مشاريع المستخدم:", error);
        }
    };

    const calculateStats = (projectsList) => {
        const total = projectsList.length;
        const completed = projectsList.filter(
            (p) => p.status === "مكتمل",
        ).length;
        const inProgress = projectsList.filter(
            (p) => p.status === "قيد التنفيذ",
        ).length;
        const planning = projectsList.filter(
            (p) => p.status === "قيد التخطيط",
        ).length;

        setStats({
            total,
            completed,
            inProgress,
            planning,
        });

        console.log("📊 الإحصائيات:", {
            total,
            completed,
            inProgress,
            planning,
        });
    };

    const handleLogout = async () => {
        Alert.alert("تسجيل الخروج", "هل أنت متأكد من تسجيل الخروج؟", [
            { text: "إلغاء", style: "cancel" },
            {
                text: "تسجيل الخروج",
                style: "destructive",
                onPress: async () => {
                    try {
                        await AsyncStorage.clear();
                        router.replace("/auth/login");
                    } catch (error) {
                        console.error("❌ خطأ في تسجيل الخروج:", error);
                    }
                },
            },
        ]);
    };

    // 🔥 **الدوال للروابط الجديدة**
    const navigateToSettings = () => {
        router.push("/profile/settings");
    };

    const navigateToMyProjects = () => {
        // يمكنك تمرير ID المستخدم أو استخدام الحالة الحالية
        router.push({
            pathname: "/profile/projects",
            params: { userId: user?.id || "current" },
        });
    };

    const navigateToHelp = () => {
        Alert.alert(
            "المساعدة",
            "مرحباً بك في صفحة المساعدة. يمكنك التواصل مع الدعم الفني عبر البريد: support@example.com",
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>جاري التحميل...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>الملف الشخصي</Text>
                </View>
                <View style={styles.authRequiredContainer}>
                    <Ionicons
                        name="person-circle-outline"
                        size={80}
                        color="#C7C7CC"
                    />
                    <Text style={styles.authRequiredTitle}>
                        تسجيل الدخول مطلوب
                    </Text>
                    <Text style={styles.authRequiredText}>
                        يرجى تسجيل الدخول لعرض الملف الشخصي
                    </Text>
                    <TouchableOpacity
                        style={styles.authButton}
                        onPress={() => router.push("/auth/login")}
                    >
                        <Text style={styles.authButtonText}>تسجيل الدخول</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* رأس الصفحة */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ملفي الشخصي</Text>
            </View>

            {/* بطاقة المستخدم */}
            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={80} color="#007AFF" />
                </View>

                <Text style={styles.userName}>
                    {user.name || user.username || user.email}
                </Text>
                <Text style={styles.userEmail}>{user.email}</Text>

                {user.bio && <Text style={styles.userBio}>{user.bio}</Text>}

                <TouchableOpacity
                    style={styles.editProfileButton}
                    onPress={() => router.push("/profile/edit")}
                >
                    <Ionicons name="create-outline" size={16} color="#007AFF" />
                    <Text style={styles.editProfileText}>
                        تعديل الملف الشخصي
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 🔥 **إحصائيات حقيقية** */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.total}</Text>
                    <Text style={styles.statLabel}>المشاريع</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.completed}</Text>
                    <Text style={styles.statLabel}>مكتملة</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.inProgress}</Text>
                    <Text style={styles.statLabel}>قيد التنفيذ</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.planning}</Text>
                    <Text style={styles.statLabel}>قيد التخطيط</Text>
                </View>
            </View>

            {/* 🔥 **قائمة الخيارات مع روابط تعمل** */}
            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={navigateToSettings}
                >
                    <Ionicons
                        name="settings-outline"
                        size={24}
                        color="#007AFF"
                    />
                    <Text style={styles.menuText}>الإعدادات</Text>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#8E8E93"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={navigateToMyProjects}
                >
                    <Ionicons name="folder-outline" size={24} color="#34C759" />
                    <Text style={styles.menuText}>مشاريعي ({stats.total})</Text>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#8E8E93"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={navigateToHelp}
                >
                    <Ionicons
                        name="help-circle-outline"
                        size={24}
                        color="#FF9500"
                    />
                    <Text style={styles.menuText}>المساعدة والدعم</Text>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#8E8E93"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleLogout}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={24}
                        color="#FF3B30"
                    />
                    <Text style={[styles.menuText, styles.logoutText]}>
                        تسجيل الخروج
                    </Text>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#FF3B30"
                    />
                </TouchableOpacity>
            </View>

            {/* 🔥 **عرض قائمة بالمشاريع الحالية** */}
            {projects.length > 0 && (
                <View style={styles.projectsPreview}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>أحدث مشاريعي</Text>
                        <TouchableOpacity onPress={navigateToMyProjects}>
                            <Text style={styles.seeAllText}>عرض الكل</Text>
                        </TouchableOpacity>
                    </View>

                    {projects.slice(0, 3).map((project) => (
                        <TouchableOpacity
                            key={project._id}
                            style={styles.projectPreviewItem}
                            onPress={() =>
                                router.push(`/project/${project._id}`)
                            }
                        >
                            <View style={styles.projectPreviewInfo}>
                                <Text style={styles.projectPreviewTitle}>
                                    {project.title}
                                </Text>
                                <Text style={styles.projectPreviewCategory}>
                                    {project.category}
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.projectStatusBadge,
                                    {
                                        backgroundColor:
                                            project.status === "مكتمل"
                                                ? "#34C75920"
                                                : project.status ===
                                                    "قيد التنفيذ"
                                                  ? "#007AFF20"
                                                  : "#FF950020",
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.projectStatusText,
                                        {
                                            color:
                                                project.status === "مكتمل"
                                                    ? "#34C759"
                                                    : project.status ===
                                                        "قيد التنفيذ"
                                                      ? "#007AFF"
                                                      : "#FF9500",
                                        },
                                    ]}
                                >
                                    {project.status}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#8E8E93",
    },
    header: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1D1D1F",
    },
    authRequiredContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        marginTop: 50,
    },
    authRequiredTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1D1D1F",
        marginTop: 20,
        marginBottom: 10,
    },
    authRequiredText: {
        fontSize: 16,
        color: "#8E8E93",
        textAlign: "center",
        marginBottom: 30,
    },
    authButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 12,
    },
    authButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    profileCard: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 16,
        padding: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarContainer: {
        marginBottom: 15,
    },
    userName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1D1D1F",
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: "#8E8E93",
        marginBottom: 15,
    },
    userBio: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 20,
    },
    editProfileButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F2F7",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 10,
    },
    editProfileText: {
        color: "#007AFF",
        fontSize: 14,
        fontWeight: "500",
        marginLeft: 8,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 20,
        padding: 25,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: {
        alignItems: "center",
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#007AFF",
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 5,
    },
    menuContainer: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    menuText: {
        fontSize: 16,
        marginLeft: 15,
        color: "#333",
        flex: 1,
    },
    logoutText: {
        color: "#FF3B30",
    },
    projectsPreview: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 30,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1D1D1F",
    },
    seeAllText: {
        fontSize: 14,
        color: "#007AFF",
        fontWeight: "500",
    },
    projectPreviewItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f5f5f5",
    },
    projectPreviewInfo: {
        flex: 1,
    },
    projectPreviewTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1D1D1F",
        marginBottom: 4,
    },
    projectPreviewCategory: {
        fontSize: 12,
        color: "#8E8E93",
    },
    projectStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    projectStatusText: {
        fontSize: 11,
        fontWeight: "600",
    },
});
