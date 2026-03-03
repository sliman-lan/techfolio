// app/profile/projects.js
import React, { useState, useCallback } from "react";
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
import { projectsAPI } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function MyProjects() {
    const router = useRouter();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadProjects = async () => {
        try {
            const res = await projectsAPI.getMyProjects();
            // توقع أن تكون البيانات في res.data (مصفوفة)
            setProjects(res.data || []);
        } catch (error) {
            Alert.alert("خطأ", "فشل تحميل المشاريع");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadProjects();
        }, []),
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadProjects();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return { text: "مقبول", color: "#34C759", bg: "#E6F9E6" };
            case "pending":
                return {
                    text: "قيد المراجعة",
                    color: "#FF9500",
                    bg: "#FFF2E0",
                };
            case "rejected":
                return { text: "مرفوض", color: "#FF3B30", bg: "#FFE5E5" };
            default:
                return { text: "غير معروف", color: "#8E8E93", bg: "#F2F2F7" };
        }
    };

    const renderItem = ({ item }) => {
        const badge = getStatusBadge(item.status);
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/project/${item._id}`)}
            >
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                        <Text
                            style={[styles.badgeText, { color: badge.color }]}
                        >
                            {badge.text}
                        </Text>
                    </View>
                </View>
                <Text style={styles.description} numberOfLines={2}>
                    {item.shortDescription || item.description || "لا يوجد وصف"}
                </Text>
                <View style={styles.footer}>
                    <Text style={styles.category}>{item.category}</Text>
                    <Text style={styles.date}>
                        {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                    </Text>
                </View>
                {item.status === "rejected" && item.rejectionReason && (
                    <View style={styles.rejection}>
                        <Text style={styles.rejectionLabel}>سبب الرفض:</Text>
                        <Text style={styles.rejectionText}>
                            {item.rejectionReason}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>مشاريعي</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={projects}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons
                            name="folder-open-outline"
                            size={60}
                            color="#C7C7CC"
                        />
                        <Text style={styles.emptyText}>لا توجد مشاريع بعد</Text>
                        {user?.role === "student" && (
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => router.push("/tabs/create")}
                            >
                                <Text style={styles.createButtonText}>
                                    + إنشاء مشروع
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: { fontSize: 20, fontWeight: "600", color: "#1D1D1F" },
    list: { padding: 16 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    title: { fontSize: 16, fontWeight: "600", flex: 1, marginRight: 8 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 12, fontWeight: "600" },
    description: { fontSize: 14, color: "#666", marginBottom: 12 },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    category: { fontSize: 13, color: "#007AFF", fontWeight: "500" },
    date: { fontSize: 12, color: "#8E8E93" },
    rejection: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#F2F2F7",
    },
    rejectionLabel: { fontSize: 12, color: "#FF3B30", marginBottom: 4 },
    rejectionText: {
        fontSize: 13,
        color: "#1D1D1F",
        backgroundColor: "#FFF5F5",
        padding: 8,
        borderRadius: 8,
    },
    empty: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: { fontSize: 18, color: "#8E8E93", marginVertical: 16 },
    createButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    createButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
