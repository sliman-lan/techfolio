// app/profile/projects.js - يعمل مع API حقيقي
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { projectsAPI } from "../../src/services/api";

export default function MyProjects() {
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
                console.log("✅ المستخدم مسجل دخول في مشاريعي");
                return true;
            } else {
                setIsAuthenticated(false);
                setUser(null);
                console.log("❌ المستخدم غير مسجل دخول في مشاريعي");
                return false;
            }
        } catch (error) {
            console.error("❌ خطأ في التحقق:", error);
            return false;
        }
    }, []);

    // 🔥 **جلب مشاريع المستخدم من API الحقيقي**
    const loadMyProjects = useCallback(async () => {
        try {
            console.log("🔄 جاري تحديث مشاريعي من API...");
            setApiError(null);

            // استخدام دالة API لجلب مشاريع المستخدم
            const result = await projectsAPI.getMyProjects();

            if (result.success) {
                setProjects(result.data || []);
                console.log(
                    `✅ تم تحميل ${result.data?.length || 0} مشروع شخصي من API`,
                );
            } else {
                setProjects([]);
                console.warn("⚠️ لم يتم جلب مشاريع شخصية");
            }
        } catch (error) {
            console.error("❌ خطأ في جلب مشاريعي:", error);
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
            } else if (error.code === "ECONNABORTED") {
                Alert.alert(
                    "انتهت المهلة",
                    "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.",
                    [{ text: "حسناً" }],
                );
            } else {
                Alert.alert(
                    "خطأ في الاتصال",
                    "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
                    [{ text: "حسناً" }],
                );

                // بيانات محلية للاختبار فقط عند فشل الاتصال
                setProjects([
                    {
                        _id: "1",
                        title: "مشروعي التجريبي - اتصال API فاشل",
                        description: "هذه بيانات محلية لأن الاتصال بالخادم فشل",
                        status: "قيد التنفيذ",
                        budget: 5000,
                        deadline: "2024-12-31",
                        category: "تطوير",
                        createdAt: "2024-01-01",
                    },
                ]);
            }
        }
    }, []);

    // عند التركيز على الصفحة
    useFocusEffect(
        useCallback(() => {
            console.log("📁 MyProjects screen focused - Loading from API");

            const init = async () => {
                setLoading(true);
                const isAuth = await checkAuth();

                if (isAuth) {
                    await loadMyProjects();
                }

                setLoading(false);
            };

            init();
        }, [checkAuth, loadMyProjects]),
    );

    // السحب للتحديث
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadMyProjects();
        setRefreshing(false);
    }, [loadMyProjects]);

    // إذا لم يكن مسجل دخول
    if (!isAuthenticated && !loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>مشاريعي</Text>
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
                        يرجى تسجيل الدخول لعرض مشاريعك الشخصية
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

    const renderProjectItem = ({ item }) => {
        const statusColor = getStatusColor(item.status);

        return (
            <TouchableOpacity
                style={styles.projectCard}
                onPress={() => router.push(`/project/${item._id}`)}
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
                            size={14}
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
                            size={14}
                            color="#8E8E93"
                        />
                        <Text style={styles.detailText}>
                            {item.deadline || "غير محدد"}
                        </Text>
                    </View>

                    {item.category && (
                        <View style={styles.detailItem}>
                            <Ionicons
                                name="grid-outline"
                                size={14}
                                color="#8E8E93"
                            />
                            <Text style={styles.detailText}>
                                {item.category}
                            </Text>
                        </View>
                    )}
                </View>

                {item.createdAt && (
                    <View style={styles.createdDate}>
                        <Ionicons
                            name="time-outline"
                            size={12}
                            color="#C7C7CC"
                        />
                        <Text style={styles.createdDateText}>
                            تم الإنشاء: {item.createdAt}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>
                    {isAuthenticated
                        ? "جاري تحميل مشاريعك من الخادم..."
                        : "جاري التحقق من المصادقة..."}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>مشاريعي</Text>

                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => console.log("فتح الفلاتر")}
                >
                    <Ionicons name="filter-outline" size={22} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{projects.length}</Text>
                    <Text style={styles.statLabel}>جميع المشاريع</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                        {projects.filter((p) => p.status === "مكتمل").length}
                    </Text>
                    <Text style={styles.statLabel}>مكتملة</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                        {
                            projects.filter((p) => p.status === "قيد التنفيذ")
                                .length
                        }
                    </Text>
                    <Text style={styles.statLabel}>قيد التنفيذ</Text>
                </View>
            </View>

            {/* Error Banner */}
            {apiError && (
                <View style={styles.errorBanner}>
                    <Ionicons
                        name="warning-outline"
                        size={16}
                        color="#FF9500"
                    />
                    <Text style={styles.errorText}>
                        مشكلة في الاتصال بالخادم - عرض بيانات محلية
                    </Text>
                </View>
            )}

            {/* Projects List */}
            {projects.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons
                        name="folder-open-outline"
                        size={80}
                        color="#C7C7CC"
                    />
                    <Text style={styles.emptyTitle}>لا توجد مشاريع</Text>
                    <Text style={styles.emptyText}>
                        {apiError
                            ? "تعذر الاتصال بالخادم"
                            : "لم تقم بإنشاء أي مشاريع بعد. ابدأ بمشروع جديد!"}
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
                />
            )}
        </View>
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1D1D1F",
    },
    filterButton: {
        padding: 5,
    },
    statsBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        paddingVertical: 15,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#007AFF",
    },
    statLabel: {
        fontSize: 12,
        color: "#8E8E93",
        marginTop: 4,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: "#F2F2F7",
    },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF3CD",
        marginHorizontal: 20,
        marginTop: 15,
        padding: 12,
        borderRadius: 8,
    },
    errorText: {
        marginLeft: 8,
        color: "#856404",
        fontSize: 12,
    },
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
    authButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    listContainer: {
        padding: 20,
        paddingBottom: 40,
    },
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
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
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
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailText: {
        fontSize: 12,
        color: "#8E8E93",
        marginLeft: 5,
    },
    createdDate: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#F2F2F7",
    },
    createdDateText: {
        fontSize: 11,
        color: "#C7C7CC",
        marginLeft: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1D1D1F",
        marginTop: 20,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: "#8E8E93",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 30,
    },
    createButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 12,
    },
    createButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
