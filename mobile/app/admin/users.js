// app/admin/users.js
import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usersAPI } from "../../src/services/api";

export default function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadUsers = useCallback(async () => {
        try {
            const response = await usersAPI.getAllUsers();
            setUsers(response.data || []);
        } catch (error) {
            console.error("خطأ في تحميل المستخدمين:", error);
            Alert.alert("خطأ", "فشل تحميل المستخدمين");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadUsers();
        setRefreshing(false);
    }, []);

    const handleToggleStatus = (userId) => {
        Alert.alert(
            "تغيير الحالة",
            "هل أنت متأكد من تغيير حالة هذا المستخدم؟",
            [
                { text: "إلغاء", style: "cancel" },
                {
                    text: "تأكيد",
                    onPress: async () => {
                        try {
                            await usersAPI.toggleUserStatus(userId);
                            loadUsers();
                        } catch (error) {
                            Alert.alert("خطأ", "فشل في تغيير حالة المستخدم");
                        }
                    },
                },
            ],
        );
    };

    const handleChangeRole = (user) => {
        Alert.alert(
            "تغيير الصلاحية",
            `اختر الصلاحية الجديدة للمستخدم ${user.name}`,
            [
                { text: "إلغاء", style: "cancel" },
                {
                    text: "طالب",
                    onPress: async () => {
                        try {
                            await usersAPI.updateUserRole(user._id, "student");
                            loadUsers();
                        } catch (error) {
                            Alert.alert("خطأ", "فشل في تغيير الصلاحية");
                        }
                    },
                },
                {
                    text: "مشرف",
                    onPress: async () => {
                        try {
                            await usersAPI.updateUserRole(user._id, "admin");
                            loadUsers();
                        } catch (error) {
                            Alert.alert("خطأ", "فشل في تغيير الصلاحية");
                        }
                    },
                },
            ],
        );
    };

    const renderUserItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {item.name?.charAt(0) || "م"}
                    </Text>
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.badgeContainer}>
                        <View
                            style={[
                                styles.roleBadge,
                                item.role === "admin"
                                    ? styles.adminBadge
                                    : styles.studentBadge,
                            ]}
                        >
                            <Text style={styles.roleText}>
                                {item.role === "admin" ? "مشرف" : "طالب"}
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.statusBadge,
                                item.isActive
                                    ? styles.activeBadge
                                    : styles.inactiveBadge,
                            ]}
                        >
                            <Text style={styles.statusText}>
                                {item.isActive ? "نشط" : "موقوف"}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    onPress={() => handleToggleStatus(item._id)}
                    style={styles.actionIcon}
                >
                    <Ionicons
                        name={
                            item.isActive
                                ? "pause-circle-outline"
                                : "play-circle-outline"
                        }
                        size={24}
                        color={item.isActive ? "#FF9500" : "#34C759"}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleChangeRole(item)}
                    style={styles.actionIcon}
                >
                    <Ionicons
                        name="swap-horizontal-outline"
                        size={24}
                        color="#007AFF"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="people-outline"
                            size={60}
                            color="#C7C7CC"
                        />
                        <Text style={styles.emptyText}>لا يوجد مستخدمين</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContainer: { padding: 15 },
    userCard: {
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
    userInfo: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    avatarText: { fontSize: 20, color: "#fff", fontWeight: "bold" },
    userDetails: { flex: 1 },
    userName: { fontSize: 16, fontWeight: "600", color: "#1D1D1F" },
    userEmail: { fontSize: 14, color: "#8E8E93", marginBottom: 8 },
    badgeContainer: { flexDirection: "row", gap: 8 },
    roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    adminBadge: { backgroundColor: "#FFD70020" },
    studentBadge: { backgroundColor: "#E5F1FF" },
    roleText: { fontSize: 12, fontWeight: "500", color: "#007AFF" },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    activeBadge: { backgroundColor: "#34C75920" },
    inactiveBadge: { backgroundColor: "#FF3B3020" },
    statusText: { fontSize: 12, fontWeight: "500", color: "#34C759" },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 20,
    },
    actionIcon: { padding: 5 },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: { fontSize: 16, color: "#8E8E93", marginTop: 10 },
});
