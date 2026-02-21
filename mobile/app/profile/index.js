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
import { followAPI, usersAPI } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";

export default function ProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const {
        user: authUser,
        setUser: setAuthUser,
        logout: contextLogout,
    } = useAuth();

    const [user, setUser] = useState(null);
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

    const loadProfileData = useCallback(async () => {
        try {
            setLoading(true);
            if (isOwnProfile) {
                const profileRes = await usersAPI.getProfile();
                const profileData = profileRes.data || profileRes;
                setUser(profileData);
                await AsyncStorage.setItem("user", JSON.stringify(profileData));
                if (setAuthUser) setAuthUser(profileData);

                const statsRes = await followAPI.getUserStats(profileData._id);
                setStats(statsRes.data || stats);
            } else {
                const [userRes, followRes, statsRes] = await Promise.all([
                    usersAPI.getUserProfile(params.userId),
                    followAPI.checkFollowStatus(params.userId),
                    followAPI.getUserStats(params.userId),
                ]);
                setUser(userRes.data || userRes);
                setIsFollowing(followRes.data?.isFollowing || false);
                setStats(statsRes.data || stats);
            }
        } catch (error) {
            Alert.alert("خطأ", "فشل تحميل البيانات");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [params.userId, isOwnProfile]);

    useFocusEffect(
        useCallback(() => {
            loadProfileData();
        }, [loadProfileData]),
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadProfileData();
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
        } catch (error) {
            Alert.alert("خطأ", "فشل في عملية المتابعة");
        }
    };

    const handleLogout = () => {
        Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج؟", [
            { text: "إلغاء", style: "cancel" },
            {
                text: "تسجيل الخروج",
                style: "destructive",
                onPress: async () => {
                    console.log("🔴 تسجيل الخروج من البروفايل");
                    await contextLogout?.();
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
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
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            {/* باقي المحتوى (لم يتغير) */}
            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    {user?.avatar ? (
                        <Image
                            source={{ uri: user.avatar }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0) || "م"}
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={styles.userName}>{user?.name || "مستخدم"}</Text>
                <Text style={styles.userEmail}>{user?.email || ""}</Text>

                {user?.bio ? (
                    <View style={styles.bioContainer}>
                        <Text style={styles.bioText}>{user.bio}</Text>
                    </View>
                ) : isOwnProfile ? (
                    <TouchableOpacity
                        style={styles.addBioButton}
                        onPress={() => router.push("/profile/edit")}
                    >
                        <Ionicons
                            name="add-circle-outline"
                            size={20}
                            color="#007AFF"
                        />
                        <Text style={styles.addBioText}>أضف نبذة عنك</Text>
                    </TouchableOpacity>
                ) : null}

                <View style={styles.statsRow}>
                    <TouchableOpacity
                        style={styles.statItem}
                        onPress={() =>
                            router.push(`/profile/projects?userId=${user?._id}`)
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
                            router.push(`/profile/followers/${user?._id}`)
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
                            router.push(`/profile/following/${user?._id}`)
                        }
                    >
                        <Text style={styles.statNumber}>
                            {stats.followingCount}
                        </Text>
                        <Text style={styles.statLabel}>يتابع</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {stats.likesCount}
                        </Text>
                        <Text style={styles.statLabel}>إعجابات</Text>
                    </View>
                </View>

                {isOwnProfile ? (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => router.push("/profile/edit")}
                    >
                        <Ionicons
                            name="create-outline"
                            size={20}
                            color="#fff"
                        />
                        <Text style={styles.editButtonText}>تعديل الملف</Text>
                    </TouchableOpacity>
                ) : (
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

            {isOwnProfile && (
                <View style={styles.optionsCard}>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => router.push("/profile/edit")}
                    >
                        <Ionicons
                            name="person-outline"
                            size={22}
                            color="#007AFF"
                        />
                        <Text style={styles.optionText}>
                            تعديل الملف الشخصي
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#8E8E93"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => router.push("/profile/projects")}
                    >
                        <Ionicons
                            name="folder-outline"
                            size={22}
                            color="#007AFF"
                        />
                        <Text style={styles.optionText}>مشاريعي</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#8E8E93"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => router.push("/profile/settings")}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={22}
                            color="#007AFF"
                        />
                        <Text style={styles.optionText}>الإعدادات</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#8E8E93"
                        />
                    </TouchableOpacity>
                </View>
            )}
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
    headerTitle: { fontSize: 20, fontWeight: "600", color: "#1D1D1F" },
    logoutButton: { padding: 5 },
    profileCard: {
        backgroundColor: "#fff",
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarContainer: { marginBottom: 15 },
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
    userName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1D1D1F",
        marginBottom: 5,
    },
    userEmail: { fontSize: 14, color: "#8E8E93", marginBottom: 15 },
    bioContainer: {
        backgroundColor: "#F2F2F7",
        padding: 15,
        borderRadius: 12,
        width: "100%",
        marginBottom: 20,
    },
    bioText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
    },
    addBioButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F2F7",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 20,
    },
    addBioText: {
        color: "#007AFF",
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "500",
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        paddingVertical: 15,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#F2F2F7",
        marginBottom: 15,
    },
    statItem: { alignItems: "center", flex: 1 },
    statNumber: { fontSize: 20, fontWeight: "bold", color: "#007AFF" },
    statLabel: { fontSize: 12, color: "#8E8E93", marginTop: 4 },
    divider: { width: 1, height: 30, backgroundColor: "#E5E5EA" },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007AFF",
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    editButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    followButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
    },
    followingButton: {
        backgroundColor: "#F2F2F7",
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    followButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    followingButtonText: { color: "#1D1D1F" },
    optionsCard: {
        backgroundColor: "#fff",
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 20,
        overflow: "hidden",
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#F2F2F7",
    },
    optionText: { flex: 1, fontSize: 16, color: "#1D1D1F", marginLeft: 12 },
});
