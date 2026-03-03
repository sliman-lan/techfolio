// app/tabs/index.js
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
import { projectsAPI } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native";

export default function HomeScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadProjects = useCallback(async () => {
        try {
            setLoading(true);
            const result = await projectsAPI.getAll();
            if (result.success) {
                setProjects(result.data || []);
            } else {
                setProjects([]);
            }
        } catch (error) {
            console.error("❌ خطأ في جلب المشاريع:", error);
            if (error.response?.status === 401) {
                Alert.alert("انتهت الجلسة", "يرجى تسجيل الدخول مرة أخرى", [
                    {
                        text: "تسجيل الدخول",
                        onPress: () => router.replace("/auth/login"),
                    },
                ]);
            } else {
                Alert.alert("خطأ", "تعذر تحميل المشاريع");
                setProjects([]);
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

    const renderProjectItem = ({ item }) => {
        const categoryMap = {
            web: "ويب",
            mobile: "موبايل",
            ai: "ذكاء اصطناعي",
            design: "تصميم",
            other: "أخرى",
        };

        const testAsyncStorage = async () => {
            await AsyncStorage.setItem("test", "hello");
            const value = await AsyncStorage.getItem("test");
            console.log("🧪 AsyncStorage test:", value);
        };

        return (
            <TouchableOpacity
                style={styles.projectCard}
                onPress={() => router.push(`/project/${item._id}`)}
            >
                <Button title="Test AsyncStorage" onPress={testAsyncStorage} />
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
                    {item.shortDescription || item.description || "لا يوجد وصف"}
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
                            color="#8E8E93"
                        />
                        <Text style={styles.statText}>
                            {new Date(item.createdAt).toLocaleDateString(
                                "ar-EG",
                            )}
                        </Text>
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
            {/* الهيدر */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>أهلاً بك 👋</Text>
                    <Text style={styles.userName}>
                        {user?.name || "عزيزي المستخدم"}
                    </Text>
                </View>
                <View style={styles.headerActions}>
                    {user?.role === "admin" && (
                        <TouchableOpacity
                            style={styles.adminButton}
                            onPress={() => router.push("/admin")}
                        >
                            <Ionicons
                                name="settings-outline"
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Ionicons
                            name="log-out-outline"
                            size={24}
                            color="#FF3B30"
                        />
                    </TouchableOpacity>
                </View>
            </View>

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
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: {
        backgroundColor: "#007AFF",
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    greeting: { fontSize: 16, color: "rgba(255,255,255,0.9)" },
    userName: { fontSize: 24, fontWeight: "bold", color: "#fff" },
    headerActions: { flexDirection: "row", gap: 10 },
    adminButton: {
        backgroundColor: "rgba(255,255,255,0.2)",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    logoutButton: {
        backgroundColor: "rgba(255,255,255,0.2)",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: { marginTop: 10, fontSize: 16, color: "#8E8E93" },
    listContainer: { padding: 16, paddingBottom: 80 },
    projectCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 15,
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
        marginBottom: 10,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1D1D1F",
        flex: 1,
        marginRight: 10,
    },
    categoryBadge: {
        backgroundColor: "#E5F1FF",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    categoryText: { fontSize: 12, color: "#007AFF", fontWeight: "500" },
    projectDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 12,
    },
    projectStats: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#F2F2F7",
        paddingTop: 10,
        gap: 15,
    },
    statItem: { flexDirection: "row", alignItems: "center" },
    statText: { fontSize: 12, color: "#8E8E93", marginLeft: 4 },
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
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});
