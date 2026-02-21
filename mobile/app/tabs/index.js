// mobile/app/tabs/index.js
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
    Image,
    Dimensions,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/context/AuthContext";
import { projectsAPI } from "../../src/services/api";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
    const router = useRouter();
    const { user, logout } = useAuth(); // ✅ نأخذ المستخدم والخروج من السياق

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        avgRating: 0,
        totalLikes: 0,
    });

    // جلب المشاريع
    const loadProjects = useCallback(async () => {
        try {
            setLoading(true);
            const result = await projectsAPI.getAll();
            if (result.success) {
                const projs = result.data || [];
                setProjects(projs);

                // حساب إحصائيات سريعة
                const total = projs.length;
                const avg =
                    projs.reduce((acc, p) => acc + (p.averageRating || 0), 0) /
                    (total || 1);
                const likes = projs.reduce(
                    (acc, p) => acc + (p.likesCount || 0),
                    0,
                );
                setStats({
                    total,
                    avgRating: avg.toFixed(1),
                    totalLikes: likes,
                });
            } else {
                setProjects([]);
            }
        } catch (error) {
            console.error("❌ خطأ في جلب المشاريع:", error);
            setProjects([]);
            if (error.response?.status === 401) {
                Alert.alert("انتهت الجلسة", "يرجى تسجيل الدخول مرة أخرى", [
                    {
                        text: "تسجيل الدخول",
                        onPress: () => router.replace("/auth/login"),
                    },
                ]);
            } else {
                Alert.alert("خطأ", "تعذر تحميل المشاريع");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadProjects();
        }, [loadProjects]),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadProjects();
        setRefreshing(false);
    }, [loadProjects]);

    // دالة تسجيل الخروج (تستخدم logout من السياق)
    const handleLogout = () => {
        Alert.alert("تسجيل الخروج", "هل أنت متأكد؟", [
            { text: "إلغاء", style: "cancel" },
            {
                text: "تسجيل الخروج",
                style: "destructive",
                onPress: async () => {
                    await logout();
                },
            },
        ]);
    };

    // عرض كل مشروع
    const renderProjectItem = ({ item }) => {
        const coverImage = item.images?.[0];
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
                onPress={() => router.push(`/project/${item._id}`)}
                activeOpacity={0.7}
            >
                {coverImage ? (
                    <Image
                        source={{ uri: coverImage }}
                        style={styles.projectImage}
                    />
                ) : (
                    <View
                        style={[styles.projectImage, styles.placeholderImage]}
                    >
                        <Ionicons name="image-outline" size={40} color="#ccc" />
                    </View>
                )}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.imageOverlay}
                />
                <View style={styles.projectContent}>
                    <View style={styles.projectHeader}>
                        <Text style={styles.projectTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>
                                {categoryMap[item.category] || item.category}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.projectDescription} numberOfLines={2}>
                        {item.shortDescription ||
                            item.description ||
                            "لا يوجد وصف"}
                    </Text>
                    <View style={styles.projectStats}>
                        <View style={styles.statItem}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.statText}>
                                {item.averageRating?.toFixed(1) || "0.0"}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="heart" size={14} color="#FF3B30" />
                            <Text style={styles.statText}>
                                {item.likesCount || 0}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons
                                name="time-outline"
                                size={14}
                                color="#fff"
                            />
                            <Text style={styles.statText}>
                                {new Date(item.createdAt).toLocaleDateString(
                                    "ar-EG",
                                )}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && projects.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>جاري تحميل المشاريع...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* الهيدر بالتدرج اللوني */}
            <LinearGradient
                colors={["#007AFF", "#00C6FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>أهلاً بك 👋</Text>
                        <Text style={styles.userName}>
                            {user?.name || "عزيزي المستخدم"}
                        </Text>
                        {user?.email && (
                            <Text style={styles.userEmail}>{user.email}</Text>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={styles.logoutButton}
                    >
                        <Ionicons
                            name="log-out-outline"
                            size={24}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>

                {/* إحصائيات سريعة */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{stats.total}</Text>
                        <Text style={styles.statLabel}>مشروع</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{stats.avgRating}</Text>
                        <Text style={styles.statLabel}>التقييم</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>
                            {stats.totalLikes}
                        </Text>
                        <Text style={styles.statLabel}>إعجاب</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* قائمة المشاريع */}
            <FlatList
                data={projects}
                renderItem={renderProjectItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#007AFF"]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="rocket-outline"
                            size={80}
                            color="#007AFF"
                        />
                        <Text style={styles.emptyTitle}>
                            لا توجد مشاريع بعد
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            ابدأ مشوارك الإبداعي وأنشئ أول مشروع
                        </Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => router.push("/tabs/create")}
                        >
                            <Text style={styles.createButtonText}>
                                + مشروع جديد
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* زر الإضافة العائم */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push("/tabs/create")}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FA" },
    header: {
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    greeting: { fontSize: 16, color: "rgba(255,255,255,0.9)" },
    userName: { fontSize: 24, fontWeight: "bold", color: "#fff" },
    userEmail: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
    logoutButton: {
        backgroundColor: "rgba(255,255,255,0.2)",
        padding: 10,
        borderRadius: 30,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 20,
        paddingVertical: 15,
    },
    statBox: { alignItems: "center" },
    statNumber: { fontSize: 22, fontWeight: "bold", color: "#fff" },
    statLabel: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: { marginTop: 10, fontSize: 16, color: "#8E8E93" },
    listContainer: { padding: 16, paddingBottom: 80 },
    projectCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        overflow: "hidden",
    },
    projectImage: { width: "100%", height: 150, resizeMode: "cover" },
    placeholderImage: {
        backgroundColor: "#E5E5EA",
        justifyContent: "center",
        alignItems: "center",
    },
    imageOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    projectContent: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    projectHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        flex: 1,
        marginRight: 8,
    },
    categoryBadge: {
        backgroundColor: "rgba(255,255,255,0.25)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    categoryText: { fontSize: 12, color: "#fff", fontWeight: "600" },
    projectDescription: {
        fontSize: 13,
        color: "rgba(255,255,255,0.9)",
        marginBottom: 8,
    },
    projectStats: {
        flexDirection: "row",
        alignItems: "center",
    },
    statItem: { flexDirection: "row", alignItems: "center", marginRight: 15 },
    statText: { fontSize: 12, color: "#fff", marginLeft: 4 },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1D1D1F",
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 16,
        color: "#8E8E93",
        textAlign: "center",
        marginVertical: 10,
    },
    createButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        marginTop: 20,
    },
    createButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
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
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
