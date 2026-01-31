// app/tabs/home.js - يعمل مع API حقيقي
import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { projectsAPI } from "../../src/services/api";

export default function Home() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [apiError, setApiError] = useState(null);

    // 🔥 **التحقق من المصادقة**
    const checkAuth = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            const userString = await AsyncStorage.getItem("user");

            if (token && userString) {
                setIsAuthenticated(true);
                setUser(JSON.parse(userString));
                console.log("✅ المستخدم مسجل دخول");
                return true;
            } else {
                setIsAuthenticated(false);
                setUser(null);
                console.log("❌ المستخدم غير مسجل دخول");
                return false;
            }
        } catch (error) {
            console.error("❌ خطأ في التحقق:", error);
            return false;
        }
    }, []);

    // 🔥 **جلب المشاريع من API الحقيقي**
    const loadProjects = useCallback(async () => {
        try {
            console.log("🔄 جاري تحديث المشاريع من API...");
            setApiError(null);

            const result = await projectsAPI.getAll();

            if (result.success) {
                setProjects(result.data || []);
                console.log(
                    `✅ تم تحميل ${result.data?.length || 0} مشروع من API`,
                );
            } else {
                setProjects([]);
                console.warn("⚠️ لم يتم جلب مشاريع");
            }
        } catch (error) {
            console.error("❌ خطأ في جلب المشاريع:", error);
            setApiError(error.message);

            if (error.response?.status === 401) {
                console.log("🔒 تم رفض الوصول، مسح بيانات المستخدم");
                await AsyncStorage.clear();
                setIsAuthenticated(false);
                Alert.alert("انتهت الجلسة", "يرجى تسجيل الدخول مرة أخرى", [
                    {
                        text: "تسجيل الدخول",
                        onPress: () => router.push("/auth/login"),
                    },
                ]);
            } else {
                Alert.alert(
                    "خطأ في الاتصال",
                    "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
                    [{ text: "حسناً" }],
                );
                // عرض بيانات محلية للاختبار فقط
                setProjects([
                    {
                        _id: "1",
                        title: "مشروع تجريبي - اتصال API فاشل",
                        description: "هذه بيانات محلية لأن الاتصال بالخادم فشل",
                        status: "قيد التخطيط",
                        budget: 0,
                        deadline: "2024-12-31",
                        category: "اختبار",
                    },
                ]);
            }
        }
    }, []);

    // عند التركيز على الصفحة
    useFocusEffect(
        useCallback(() => {
            console.log("🏠 Home screen focused - Loading from API");

            const init = async () => {
                setLoading(true);
                const isAuth = await checkAuth();

                if (isAuth) {
                    await loadProjects();
                }

                setLoading(false);
            };

            init();
        }, [checkAuth, loadProjects]),
    );

    // السحب للتحديث
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadProjects();
        setRefreshing(false);
    }, [loadProjects]);

    // تسجيل الخروج
    const handleLogout = async () => {
        Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج؟", [
            { text: "إلغاء", style: "cancel" },
            {
                text: "تسجيل الخروج",
                style: "destructive",
                onPress: async () => {
                    try {
                        await AsyncStorage.clear();
                        setIsAuthenticated(false);
                        setUser(null);
                        setProjects([]);
                        router.replace("/auth/login");
                    } catch (error) {
                        console.error("❌ خطأ في تسجيل الخروج:", error);
                    }
                },
            },
        ]);
    };

    // عرض عنصر المشروع
    const renderProjectItem = ({ item }) => {
        const getStatusColor = (status) => {
            switch (status) {
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

        return (
            <TouchableOpacity
                style={styles.projectCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/project/${item._id || item.id}`)}
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
                            {item.status}
                        </Text>
                    </View>
                </View>

                <Text style={styles.projectDescription} numberOfLines={2}>
                    {item.description || "لا يوجد وصف"}
                </Text>

                <View style={styles.projectDetails}>
                    <View style={styles.detailItem}>
                        <Ionicons
                            name="cash-outline"
                            size={16}
                            color="#8E8E93"
                        />
                        <Text style={styles.detailText}>
                            {item.budget
                                ? `${item.budget.toLocaleString()} ريال`
                                : "غير محدد"}
                        </Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons
                            name="calendar-outline"
                            size={16}
                            color="#8E8E93"
                        />
                        <Text style={styles.detailText}>
                            {item.deadline || "غير محدد"}
                        </Text>
                    </View>
                </View>

                {item.category && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // إذا لم يكن مسجل دخول
    if (!isAuthenticated && !loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>المشاريع</Text>
                    <Text style={styles.headerSubtitle}>
                        سجل دخول لعرض المشاريع
                    </Text>
                </View>

                <View style={styles.authRequiredContainer}>
                    <Ionicons
                        name="lock-closed-outline"
                        size={80}
                        color="#C7C7CC"
                    />
                    <Text style={styles.authRequiredTitle}>
                        تسجيل الدخول مطلوب
                    </Text>
                    <Text style={styles.authRequiredText}>
                        يرجى تسجيل الدخول لعرض المشاريع الخاصة بك
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
        <View style={styles.container}>
            {/* رأس الترحيب */}
            <View style={styles.welcomeHeader}>
                <View style={styles.welcomeTextContainer}>
                    <Text style={styles.welcomeTitle}>
                        أهلاً بك {user?.name || user?.email || "عزيزي المستخدم"}
                    </Text>
                    <Text style={styles.welcomeSubtitle}>
                        {apiError
                            ? "⚠️ مشكلة في الاتصال"
                            : `لديك ${projects.length} مشروع`}
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

            {/* معلومات المشاريع */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>المشاريع</Text>
                <Text style={styles.headerSubtitle}>
                    {loading ? "جاري التحميل..." : `${projects.length} مشروع`}
                </Text>

                {apiError && (
                    <View style={styles.errorBanner}>
                        <Ionicons
                            name="warning-outline"
                            size={16}
                            color="#FF9500"
                        />
                        <Text style={styles.errorText}>
                            مشكلة في الاتصال بالخادم
                        </Text>
                    </View>
                )}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>
                        جاري جلب المشاريع من الخادم...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={projects}
                    renderItem={renderProjectItem}
                    keyExtractor={(item) => item._id || item.id}
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
                                {apiError
                                    ? "تعذر الاتصال بالخادم"
                                    : "ابدأ بإنشاء مشروعك الأول"}
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
            )}
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
    header: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        marginBottom: 10,
    },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1D1D1F" },
    headerSubtitle: { fontSize: 14, color: "#8E8E93", marginTop: 2 },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF3CD",
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    errorText: { marginLeft: 8, color: "#856404", fontSize: 12 },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: { marginTop: 10, fontSize: 16, color: "#8E8E93" },
    authRequiredContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
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
    authButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    listContainer: { padding: 15, paddingBottom: 30 },
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
    projectDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#F2F2F7",
        paddingTop: 15,
    },
    detailItem: { flexDirection: "row", alignItems: "center" },
    detailText: { fontSize: 12, color: "#8E8E93", marginLeft: 5 },
    categoryBadge: {
        backgroundColor: "#F2F2F7",
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 10,
    },
    categoryText: { fontSize: 11, color: "#666" },
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
});
