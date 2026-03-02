// app/profile/followers.js
import React, { useState, useEffect } from "react";
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
import { followAPI } from "../../src/services/api";

export default function FollowersScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const userId = params.userId;

    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFollowers();
    }, [userId]);

    const loadFollowers = async () => {
        try {
            setLoading(true);
            const response = await followAPI.getFollowers(userId);
            // الباك إند يعيد مصفوفة مباشرة أو داخل data
            const followersData =
                response.data || response.followers || response;
            setFollowers(Array.isArray(followersData) ? followersData : []);
        } catch (error) {
            console.error("❌ خطأ في جلب المتابعين:", error);
            setFollowers([]);
        } finally {
            setLoading(false);
        }
    };

    const renderFollower = ({ item }) => {
        const follower = item.follower || item; // حسب بنية الاستجابة
        return (
            <TouchableOpacity
                style={styles.followerItem}
                onPress={() => router.push(`/profile?userId=${follower._id}`)}
            >
                <View style={styles.followerAvatar}>
                    {follower.avatar ? (
                        <Image
                            source={{ uri: follower.avatar }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <Text style={styles.followerAvatarText}>
                            {follower.name?.charAt(0) || "م"}
                        </Text>
                    )}
                </View>
                <View style={styles.followerInfo}>
                    <Text style={styles.followerName}>{follower.name}</Text>
                    <Text style={styles.followerEmail}>{follower.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>المتابعون</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.countContainer}>
                <Text style={styles.countText}>{followers.length} متابع</Text>
            </View>

            {followers.length > 0 ? (
                <FlatList
                    data={followers}
                    renderItem={renderFollower}
                    keyExtractor={(item) =>
                        item._id || Math.random().toString()
                    }
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={60} color="#C7C7CC" />
                    <Text style={styles.emptyText}>لا يوجد متابعون بعد</Text>
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
        overflow: "hidden",
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
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
});
