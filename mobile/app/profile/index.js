// app/profile/index.js
import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Image,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { followAPI, usersAPI, projectsAPI } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";

export default function ProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const {
        user: authUser,
        setUser: setAuthUser,
        logout: contextLogout,
        isCheckingAuth,
    } = useAuth();

    const [displayedUser, setDisplayedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [stats, setStats] = useState({
        followersCount: 0,
        followingCount: 0,
        projectsCount: 0,
        likesCount: 0,
    });

    const isOwnProfile = !params.userId || params.userId === authUser?._id;

    const fetchProfileFromServer = useCallback(async () => {
        try {
            let userData;

            if (isOwnProfile) {
                const res = await usersAPI.getProfile();
                userData = res;

                if (
                    userData &&
                    JSON.stringify(userData) !== JSON.stringify(authUser)
                ) {
                    setAuthUser(userData);
                    await AsyncStorage.setItem(
                        "user",
                        JSON.stringify(userData),
                    );
                }
            } else {
                const res = await usersAPI.getUserProfile(params.userId);
                userData = res;
            }

            setDisplayedUser(userData);
        } catch (error) {
            console.error("❌ فشل جلب بيانات الملف الشخصي:", error);
            if (error.response?.status === 401) {
                Alert.alert("انتهت الجلسة", "يرجى تسجيل الدخول مرة أخرى", [
                    {
                        text: "تسجيل الدخول",
                        onPress: () => router.replace("/auth/login"),
                    },
                ]);
                contextLogout();
            }
        }
    }, [
        isOwnProfile,
        params.userId,
        authUser,
        setAuthUser,
        contextLogout,
        router,
    ]);

    const fetchStats = useCallback(async () => {
        try {
            const targetId = isOwnProfile ? authUser?._id : params.userId;
            if (!targetId) return;

            // جلب إحصائيات المتابعة
            try {
                const followersRes = await followAPI.getFollowers(targetId);
                const followingRes = await followAPI.getFollowing(targetId);

                setStats((prev) => ({
                    ...prev,
                    followersCount: followersRes.data?.length || 0,
                    followingCount: followingRes.data?.length || 0,
                }));
            } catch (error) {
                console.log("⚠️ فشل جلب إحصائيات المتابعة");
            }

            // جلب عدد مشاريع المستخدم
            try {
                const projectsRes = await projectsAPI.list({
                    userId: targetId,
                    limit: 1,
                });
                setStats((prev) => ({
                    ...prev,
                    projectsCount: projectsRes.total || 0,
                }));
            } catch (error) {
                console.log("⚠️ فشل جلب عدد المشاريع");
            }

            // التحقق من حالة المتابعة إذا كان ملف شخصي لشخص آخر
            if (!isOwnProfile) {
                try {
                    const followRes =
                        await followAPI.checkFollowStatus(targetId);
                    setIsFollowing(followRes.data?.isFollowing || false);
                } catch (followError) {
                    console.log("⚠️ فشل التحقق من حالة المتابعة");
                }
            }
        } catch (error) {
            console.warn("⚠️ فشل جلب الإحصائيات:", error);
        }
    }, [isOwnProfile, params.userId, authUser?._id]);

    const loadAllData = useCallback(async () => {
        setLoading(true);
        try {
            await fetchProfileFromServer();
            await fetchStats();
        } catch (error) {
            console.error("خطأ في تحميل البيانات:", error);
        } finally {
            setLoading(false);
        }
    }, [fetchProfileFromServer, fetchStats]);

    useFocusEffect(
        useCallback(() => {
            if (!isCheckingAuth) {
                loadAllData();
            }
        }, [isCheckingAuth, params.userId]),
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAllData();
        setRefreshing(false);
    };

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await followAPI.unfollowUser(params.userId);
                setIsFollowing(false);
                setStats((prev) => ({
                    ...prev,
                    followersCount: prev.followersCount - 1,
                }));
            } else {
                await followAPI.followUser(params.userId);
                setIsFollowing(true);
                setStats((prev) => ({
                    ...prev,
                    followersCount: prev.followersCount + 1,
                }));
            }
        } catch {
            Alert.alert("خطأ", "فشل في عملية المتابعة");
        }
    };

    const handleLogout = async () => {
        try {
            await contextLogout();
            router.replace("/auth/login");
        } catch (error) {
            console.error("❌ فشل تسجيل الخروج:", error);
        }
    };

    if (isCheckingAuth) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!authUser && isOwnProfile) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>أنت غير مسجل الدخول</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => router.replace("/auth/login")}
                >
                    <Text style={styles.retryText}>تسجيل الدخول</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!displayedUser) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>فشل تحميل الملف الشخصي</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={loadAllData}
                >
                    <Text style={styles.retryText}>إعادة المحاولة</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* الهيدر */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.replace("/tabs")}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>الملف الشخصي</Text>
                {isOwnProfile ? (
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            onPress={() => router.push("/profile/edit")}
                            style={styles.editButton}
                        >
                            <Ionicons
                                name="create-outline"
                                size={22}
                                color="#007AFF"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleLogout}
                            style={styles.logoutButton}
                        >
                            <Ionicons
                                name="log-out-outline"
                                size={22}
                                color="#FF3B30"
                            />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            {/* المحتوى */}
            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    {displayedUser.avatar ? (
                        <Image
                            source={{ uri: displayedUser.avatar }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {displayedUser.name?.charAt(0) || "م"}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.userName}>
                    {displayedUser.name || "مستخدم"}
                </Text>
                <Text style={styles.userEmail}>
                    {displayedUser.email || ""}
                </Text>

                <View style={styles.statsRow}>
                    <TouchableOpacity
                        style={styles.statItem}
                        onPress={() =>
                            router.push(
                                `/profile/projects?userId=${displayedUser._id}`,
                            )
                        }
                    >
                        <Text style={styles.statNumber}>
                            {stats.projectsCount}
                        </Text>
                        <Text style={styles.statLabel}>المشاريع</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.statItem}
                        onPress={() =>
                            router.push(
                                `/profile/followers?userId=${displayedUser._id}`,
                            )
                        }
                    >
                        <Text style={styles.statNumber}>
                            {stats.followersCount}
                        </Text>
                        <Text style={styles.statLabel}>المتابعون</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.statItem}
                        onPress={() =>
                            router.push(
                                `/profile/following?userId=${displayedUser._id}`,
                            )
                        }
                    >
                        <Text style={styles.statNumber}>
                            {stats.followingCount}
                        </Text>
                        <Text style={styles.statLabel}>يتابع</Text>
                    </TouchableOpacity>
                </View>

                {/* زر المتابعة للمستخدمين الآخرين */}
                {!isOwnProfile && (
                    <TouchableOpacity
                        style={[
                            styles.followButton,
                            isFollowing && styles.followingButton,
                        ]}
                        onPress={handleFollow}
                    >
                        <Text
                            style={[
                                styles.followButtonText,
                                isFollowing && styles.followingButtonText,
                            ]}
                        >
                            {isFollowing ? "إلغاء المتابعة" : "متابعة"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
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
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: "#FF3B30",
        marginBottom: 12,
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: { color: "#fff", fontWeight: "600" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: "600" },
    headerButtons: { flexDirection: "row", gap: 10 },
    editButton: { padding: 5 },
    logoutButton: { padding: 5 },
    profileCard: {
        backgroundColor: "#fff",
        margin: 15,
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
    },
    avatarContainer: { marginBottom: 12 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: { fontSize: 40, color: "#fff", fontWeight: "bold" },
    userName: { fontSize: 22, fontWeight: "bold" },
    userEmail: { fontSize: 14, color: "#8E8E93", marginBottom: 10 },
    statsRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-around",
        marginTop: 20,
    },
    statItem: { alignItems: "center", flex: 1 },
    statNumber: { fontSize: 18, fontWeight: "bold", color: "#007AFF" },
    statLabel: { fontSize: 12, color: "#8E8E93" },
    divider: { width: 1, height: 30, backgroundColor: "#E5E5EA" },
    followButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 25,
        marginTop: 20,
    },
    followingButton: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#007AFF",
    },
    followButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    followingButtonText: {
        color: "#007AFF",
    },
});
