// app/profile/followers.js - صفحة المتابعين
import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { followAPI, usersAPI } from "../../src/services/api";

export default function FollowersScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const userId = params.userId;

    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    const loadFollowers = useCallback(async () => {
        try {
            setLoading(true);

            // جلب المستخدم الحالي
            const userString = await AsyncStorage.getItem("user");
            if (userString) {
                setCurrentUser(JSON.parse(userString));
            }

            // جلب المتابعين
            const response = await followAPI.getFollowers(
                userId || currentUser?._id,
            );
            setFollowers(response.followers || []);
        } catch (error) {
            console.error("❌ خطأ في جلب المتابعين:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadFollowers();
    }, [loadFollowers]);

    const renderFollower = ({ item }) => (
        <TouchableOpacity
            style={styles.followerItem}
            onPress={() => router.push(`/profile?userId=${item._id}`)}
        >
            <View style={styles.followerAvatar}>
                <Text style={styles.followerAvatarText}>
                    {item.name?.charAt(0) || "م"}
                </Text>
            </View>
            <View style={styles.followerInfo}>
                <Text style={styles.followerName}>{item.name}</Text>
                <Text style={styles.followerEmail}>{item.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>
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
            {/* الهيدر */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("/profile")}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>المتابعون</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* عدد المتابعين */}
            <View style={styles.countContainer}>
                <Text style={styles.countText}>{followers.length} متابع</Text>
            </View>

            {/* قائمة المتابعين */}
            {followers.length > 0 ? (
                <FlatList
                    data={followers}
                    renderItem={renderFollower}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={60} color="#C7C7CC" />
                    <Text style={styles.emptyText}>لا يوجد متابعون بعد</Text>
                    <Text style={styles.emptySubtext}>
                        شارك مشاريعك لجذب المتابعين
                    </Text>
                </View>
            )}
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: { padding: 5 },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1D1D1F",
    },
    countContainer: {
        backgroundColor: "#fff",
        padding: 15,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 12,
    },
    countText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#007AFF",
    },
    listContainer: {
        padding: 20,
    },
    followerItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    followerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    followerAvatarText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    followerInfo: {
        flex: 1,
    },
    followerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1D1D1F",
        marginBottom: 2,
    },
    followerEmail: {
        fontSize: 14,
        color: "#8E8E93",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#8E8E93",
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#C7C7CC",
        textAlign: "center",
    },
});
