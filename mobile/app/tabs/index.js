// app/tabs/index.js - الكود الكامل المعدل
import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { projectsAPI } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";

export default function HomeScreen() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState(null);

    // 1. دالة التحقق من التوكن والمستخدم
    const checkAuth = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            const userString = await AsyncStorage.getItem("user");

            if (token && userString) {
                setUser(JSON.parse(userString));
                return true;
            } else {
                Alert.alert("غير مصرح", "يرجى تسجيل الدخول أولاً", [
                    {
                        text: "تسجيل الدخول",
                        onPress: () => router.replace("/auth/login"),
                    },
                ]);
                return false;
            }
        } catch (error) {
            console.error("❌ خطأ في التحقق:", error);
            return false;
        }
    }, [router]);

    // 2. دالة جلب المشاريع - EXACTLY كما عندك
    const loadProjects = useCallback(async () => {
        try {
            setLoading(true);
            console.log("🔄 جاري جلب المشاريع...");

            // استخدم projectsAPI.getAll() كما كانت تعمل
            const result = await projectsAPI.getAll();

            console.log("📊 نتيجة جلب المشاريع:", {
                success: result.success,
                count: result.data?.length || 0,
                firstProject: result.data?.[0],
            });

            if (result.success) {
                setProjects(result.data || []);
            } else {
                setProjects([]);
            }
        } catch (error) {
            console.error("❌ خطأ في جلب المشاريع:", error);

            // إظهار بيانات تجريبية
            setProjects([
                {
                    _id: "1",
                    title: "مشروع ويب تجريبي",
                    description: "مشروع React و Node.js",
                    status: "مكتمل",
                    category: "web",
                    averageRating: 4.5,
                    technologies: ["React", "Node.js", "MongoDB"],
                },
                {
                    _id: "2",
                    title: "تطبيق موبايل",
                    description: "تطبيق React Native لإدارة المهام",
                    status: "قيد التنفيذ",
                    category: "mobile",
                    averageRating: 4.2,
                    technologies: ["React Native", "Firebase"],
                },
            ]);

            if (error.response?.status === 401) {
                Alert.alert("انتهت الجلسة", "يرجى تسجيل الدخول مرة أخرى", [
                    {
                        text: "تسجيل الدخول",
                        onPress: () => {
                            authAPI.logout();
                            router.replace("/auth/login");
                        },
                    },
                ]);
            } else {
                Alert.alert(
                    "⚠️ ملاحظة",
                    "جاري عرض بيانات تجريبية. تأكد من:\n1. تشغيل السيرفر\n2. صحة التوكن",
                    [{ text: "حسناً" }],
                );
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. عند فتح الصفحة أو الرجوع إليها
    useFocusEffect(
        useCallback(() => {
            console.log("🎯 focus effect triggered");
            const init = async () => {
                const isAuth = await checkAuth();
                if (isAuth) {
                    await loadProjects();
                }
            };
            init();

            // تنظيف اختياري
            return () => {
                console.log("🔄 تنظيف focus effect");
            };
        }, [checkAuth, loadProjects]),
    );

    // 4. سحب للتحديث
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadProjects();
        setRefreshing(false);
    }, [loadProjects]);

    const { logout } = useAuth();

    // 5. تسجيل الخروج
    const handleLogout = async () => {
        Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج؟", [
            { text: "إلغاء", style: "cancel" },
            {
                text: "تسجيل الخروج",
                style: "destructive",
                onPress: async () => {
                    try {
                        if (logout) await logout();
                    } catch (e) {
                        console.warn("Logout failed:", e);
                    }
                },
            },
        ]);
    };

    // 6. عرض المشروع
    const renderProjectItem = ({ item }) => {
        const getStatusColor = (status) => {
            switch (status?.toLowerCase()) {
                case "مكتمل":
                    return "#34C759";
                case "قيد التنفيذ":
                    return "#007AFF";
                case "قيد التخطيط":
                    return "#FF9500";
                default:
                    return "#8E8E93";
            }
        };

        const statusColor = getStatusColor(item.status);

        // تحويل التصنيف
        const categoryMap = {
            web: "ويب",
            mobile: "موبايل",
            ai: "ذكاء اصطناعي",
            design: "تصميم",
            other: "أخرى",
        };

        return (
            <TouchableOpacity
                style={styles.projectCard}
                onPress={() => {
                    console.log("👉 الانتقال لمشروع:", item._id);
                    router.push(`/project/${item._id}`);
                }}
            >
                <View style={styles.projectHeader}>
                    <Text style={styles.projectTitle} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusColor + "20" },
                        ]}
                    >
                        <Text
                            style={[styles.statusText, { color: statusColor }]}
                        >
                            {item.status || "قيد التنفيذ"}
                        </Text>
                    </View>
                </View>

                <Text style={styles.projectDescription} numberOfLines={2}>
                    {item.description || "لا يوجد وصف"}
                </Text>

                {item.technologies && item.technologies.length > 0 && (
                    <View style={styles.technologies}>
                        {item.technologies.slice(0, 3).map((tech, index) => (
                            <View key={index} style={styles.techBadge}>
                                <Text style={styles.techText}>{tech}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.projectFooter}>
                    <View style={styles.statItem}>
                        <Ionicons name="star" size={14} color="#FF9500" />
                        <Text style={styles.statText}>
                            {item.averageRating?.toFixed(1) || "0.0"}
                        </Text>
                    </View>
                    <Text style={styles.categoryText}>
                        {categoryMap[item.category] || item.category || "أخرى"}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>جاري تحميل المشاريع...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* الهيدر العلوي */}
            <View style={styles.welcomeHeader}>
                <View style={styles.welcomeTextContainer}>
                    <Text style={styles.welcomeTitle}>
                        أهلاً بك {user?.name || "عزيزي المستخدم"}
                    </Text>
                    <Text style={styles.welcomeSubtitle}>
                        {projects.length} مشروع
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={22}
                        color="#FF3B30"
                    />
                </TouchableOpacity>
            </View>

            {/* قائمة المشاريع */}
            <FlatList
                data={projects}
                renderItem={renderProjectItem}
                keyExtractor={(item) => item._id || Math.random().toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#007AFF"]}
                        tintColor="#007AFF"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="folder-open-outline"
                            size={64}
                            color="#C7C7CC"
                        />
                        <Text style={styles.emptyText}>لا توجد مشاريع</Text>
                        <Text style={styles.emptySubtext}>
                            ابدأ بإنشاء مشروعك الأول
                        </Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => router.push("/tabs/create")}
                        >
                            <Text style={styles.createButtonText}>
                                + إنشاء مشروع جديد
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* زر إنشاء مشروع جديد (FAB) */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push("/tabs/create")}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    welcomeHeader: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 25,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    welcomeTextContainer: { flex: 1 },
    welcomeTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
    welcomeSubtitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.9)",
        marginTop: 4,
    },
    logoutButton: {
        backgroundColor: "rgba(255,255,255,0.2)",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: { marginTop: 10, fontSize: 16, color: "#8E8E93" },
    listContainer: { padding: 15, paddingBottom: 80 },
    projectCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    projectHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1D1D1F",
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: { fontSize: 12, fontWeight: "600" },
    projectDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 15,
    },
    technologies: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 15,
        gap: 8,
    },
    techBadge: {
        backgroundColor: "#E5E5EA",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    techText: {
        fontSize: 12,
        color: "#1D1D1F",
        fontWeight: "500",
    },
    projectFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#F2F2F7",
        paddingTop: 12,
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    statText: {
        fontSize: 14,
        color: "#8E8E93",
        marginLeft: 4,
    },
    categoryText: {
        fontSize: 13,
        color: "#007AFF",
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#8E8E93",
        marginTop: 15,
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#C7C7CC",
        marginTop: 5,
        textAlign: "center",
    },
    createButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 20,
    },
    createButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 20,
        backgroundColor: "#007AFF",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});
