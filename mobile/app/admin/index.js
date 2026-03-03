// app/admin/index.js
import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { projectsAPI, usersAPI } from "../../src/services/api";

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalProjects: 0,
        pendingProjects: 0,
        totalUsers: 0,
        totalStudents: 0,
        totalSupervisors: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = useCallback(async () => {
        try {
            const [projectsRes, usersRes] = await Promise.all([
                projectsAPI.adminList({ limit: 1 }), // للحصول على العدد الإجمالي
                usersAPI.getAllUsers({ limit: 1 }),
                projectsAPI.getPendingProjects(), // للحصول على العدد المعلق
            ]);

            // افترض أن الـ API يعيد العدد الإجمالي في headers أو metadata
            // إذا لم يكن كذلك، قد تحتاج إلى نقطة نهاية مخصصة للإحصائيات
            setStats({
                totalProjects: projectsRes.total || 0,
                pendingProjects:
                    (await projectsAPI.getPendingProjects()).data?.length || 0,
                totalUsers: usersRes.total || 0,
                totalStudents: 0, // تحتاج إلى حسابها من usersRes
                totalSupervisors: 0,
            });
        } catch (error) {
            console.error("خطأ في تحميل الإحصائيات:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const menuItems = [
        {
            title: "المشاريع المعلقة",
            icon: "time-outline",
            color: "#FF9500",
            count: stats.pendingProjects,
            onPress: () => router.push("/admin/pending-projects"),
        },
        {
            title: "إدارة المستخدمين",
            icon: "people-outline",
            color: "#007AFF",
            count: stats.totalUsers,
            onPress: () => router.push("/admin/users"),
        },
        {
            title: "التصنيفات",
            icon: "pricetags-outline",
            color: "#34C759",
            onPress: () => router.push("/admin/categories"),
        },
        {
            title: "جميع المشاريع",
            icon: "folder-outline",
            color: "#5856D6",
            count: stats.totalProjects,
            onPress: () => router.push("/admin/all-projects"), // يمكنك إنشاء هذه الصفحة لاحقاً
        },
    ];

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>لوحة التحكم</Text>
            </View>

            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: "#007AFF" }]}>
                    <Ionicons name="folder-outline" size={32} color="#fff" />
                    <Text style={styles.statNumber}>{stats.totalProjects}</Text>
                    <Text style={styles.statLabel}>إجمالي المشاريع</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: "#FF9500" }]}>
                    <Ionicons name="time-outline" size={32} color="#fff" />
                    <Text style={styles.statNumber}>
                        {stats.pendingProjects}
                    </Text>
                    <Text style={styles.statLabel}>مشاريع معلقة</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: "#34C759" }]}>
                    <Ionicons name="people-outline" size={32} color="#fff" />
                    <Text style={styles.statNumber}>{stats.totalUsers}</Text>
                    <Text style={styles.statLabel}>المستخدمين</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>القائمة السريعة</Text>

            {menuItems.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={item.onPress}
                >
                    <View
                        style={[
                            styles.menuIcon,
                            { backgroundColor: item.color + "20" },
                        ]}
                    >
                        <Ionicons
                            name={item.icon}
                            size={24}
                            color={item.color}
                        />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuTitle}>{item.title}</Text>
                        {item.count !== undefined && (
                            <Text style={styles.menuCount}>{item.count}</Text>
                        )}
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#C7C7CC"
                    />
                </TouchableOpacity>
            ))}
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
        backgroundColor: "#007AFF",
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff" },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginTop: -40,
        marginBottom: 30,
    },
    statCard: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 15,
        padding: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginTop: 5,
    },
    statLabel: { fontSize: 12, color: "#fff", opacity: 0.9 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginHorizontal: 20,
        marginBottom: 15,
        color: "#1D1D1F",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginBottom: 10,
        padding: 15,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    menuIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    menuContent: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    menuTitle: { fontSize: 16, fontWeight: "500", color: "#1D1D1F" },
    menuCount: { fontSize: 16, fontWeight: "600", color: "#007AFF" },
});
