// app/profile/index.js - مع نظام المتابعة والإحصائيات
import React, { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { followAPI, usersAPI, authAPI } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";

export default function ProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [stats, setStats] = useState({
        followersCount: 0,
        followingCount: 0,
        projectsCount: 0,
        likesCount: 0,
        ratedCount: 0,
        unratedCount: 0,
    });

    // تحديد إذا كان هذا البروفايل للمستخدم الحالي
    const [isOwnProfile, setIsOwnProfile] = useState(true);

    const loadProfileData = useCallback(async () => {
        try {
            setLoading(true);

            // جلب المستخدم الحالي
            const userString = await AsyncStorage.getItem("user");
            if (userString) {
                const currentUserData = JSON.parse(userString);
                setCurrentUser(currentUserData);

                // إذا كان هناك معرف مستخدم في الرابط
                if (params.userId && params.userId !== currentUserData._id) {
                    setIsOwnProfile(false);
                    // جلب بيانات المستخدم المعروض + حالة المتابعة وإحصائياته
                    const [userResponse, followStatusRes, statsRes] =
                        await Promise.all([
                            usersAPI.getUserProfile(params.userId),
                            followAPI.checkFollowStatus(params.userId),
                            followAPI.getUserStats(params.userId),
                        ]);

                    // usersAPI.getUserProfile returns the user object directly
                    setUser(userResponse);

                    // followAPI.checkFollowStatus returns { success, data: { isFollowing } }
                    setIsFollowing(followStatusRes?.data?.isFollowing || false);

                    // followAPI.getUserStats returns { data: { followersCount, followingCount, projectsCount, likesCount } }
                    setStats(
                        statsRes?.data || {
                            followersCount: 0,
                            followingCount: 0,
                            projectsCount: 0,
                            likesCount: 0,
                        },
                    );
                } else {
                    // عرض بيانات المستخدم الحالي — حاول تحديثه من السيرفر حتى يظهر الـ bio
                    setIsOwnProfile(true);
                    try {
                        const profileRes = await usersAPI.getProfile();
                        const serverUser = profileRes?.data || profileRes;
                        if (serverUser) {
                            setUser(serverUser);
                            try {
                                await AsyncStorage.setItem(
                                    "user",
                                    JSON.stringify(serverUser),
                                );
                            } catch (e) {}
                            try {
                                if (typeof setAuthUser === "function") {
                                    setAuthUser(serverUser);
                                }
                            } catch (e) {
                                console.warn("setAuthUser failed:", e);
                            }
                        } else {
                            setUser(currentUserData);
                        }
                    } catch (err) {
                        console.warn(
                            "getProfile failed, fallback to local user:",
                            err?.message || err,
                        );
                        setUser(currentUserData);
                    }

                    // جلب إحصائيات المستخدم الحالي
                    // If admin, compute global project stats
                    if (currentUserData.role === "admin") {
                        try {
                            const adminRes = await (await import("../../src/services/api")).projectsAPI.adminList();
                            const projects = (adminRes.data && adminRes.data.data) || adminRes.data || [];
                            const total = projects.length;
                            const rated = projects.filter((p) => Array.isArray(p.ratings) && p.ratings.length > 0).length;
                            const unrated = total - rated;
                            setStats((prev) => ({ ...prev, projectsCount: total, ratedCount: rated, unratedCount: unrated }));
                        } catch (e) {
                            console.warn("failed loading admin project stats", e);
                        }
                    } else {
                        const statsResponse = await followAPI.getUserStats(currentUserData._id);
                        setStats(statsResponse.data);
                    }
                }
            }
        } catch (error) {
            console.error("❌ خطأ في تحميل بيانات البروفايل:", error);
        } finally {
            setLoading(false);
        }
    }, [params.userId]);

    useEffect(() => {
        loadProfileData();
    }, [loadProfileData]);

    const { logout: contextLogout, setUser: setAuthUser } = useAuth();

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await followAPI.unfollowUser(params.userId);
                setIsFollowing(false);
                setStats((prev) => ({
                    ...prev,
                    followersCount: prev.followersCount - 1,
                }));
                Alert.alert("✅ تم", "تم إلغاء المتابعة بنجاح");
            } else {
                await followAPI.followUser(params.userId);
                setIsFollowing(true);
                setStats((prev) => ({
                    ...prev,
                    followersCount: prev.followersCount + 1,
                }));
                Alert.alert("✅ تم", "تمت المتابعة بنجاح");
            }
        } catch (error) {
            console.error("❌ خطأ في المتابعة:", error);
            Alert.alert("❌ خطأ", "فشل في عملية المتابعة");
        }
    };

    const handleLogout = async () => {
        // Use window.confirm on web for visible sync behavior
        if (typeof window !== "undefined") {
            const ok = window.confirm("هل تريد تسجيل الخروج؟");
            if (!ok) return;
            console.log("Logout confirmed (web)");
            try {
                if (contextLogout) {
                    await contextLogout();
                    console.log("Context logout completed");
                } else {
                    await authAPI.logout();
                    console.log("authAPI.logout completed");
                    router.replace("/auth/login");
                }
            } catch (e) {
                console.warn("Logout error:", e);
            }
            return;
        }

        // native
        Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج؟", [
            { text: "إلغاء", style: "cancel" },
            {
                text: "تسجيل الخروج",
                style: "destructive",
                onPress: async () => {
                    console.log("Logout pressed - starting logout flow");
                    try {
                        if (contextLogout) {
                            await contextLogout();
                            console.log("Context logout completed");
                        } else {
                            await authAPI.logout();
                            console.log("authAPI.logout completed");
                            router.replace("/auth/login");
                        }
                    } catch (e) {
                        console.warn("Logout error:", e);
                    }
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
            showsVerticalScrollIndicator={false}
        >
            {/* الهيدر */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("/tabs")}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>الملف الشخصي</Text>
                {isOwnProfile ? (
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
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            {/* معلومات المستخدم */}
            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0) || "م"}
                        </Text>
                    </View>
                </View>

                <Text style={styles.userName}>{user?.name || "زائر"}</Text>
                <Text style={styles.userEmail}>{user?.email || "زائر"}</Text>

                {/* الإحصائيات */}
                <View style={styles.statsContainer}>
                    <TouchableOpacity style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.projectsCount}</Text>
                        <Text style={styles.statLabel}>المشاريع</Text>
                    </TouchableOpacity>

                    <View style={styles.statDivider} />

                    {/* admin extra stats */}
                    {currentUser?.role === "admin" && (
                        <>
                            <TouchableOpacity style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.ratedCount}</Text>
                                <Text style={styles.statLabel}>المقيمة</Text>
                            </TouchableOpacity>
                            <View style={styles.statDivider} />
                            <TouchableOpacity style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.unratedCount}</Text>
                                <Text style={styles.statLabel}>غير المقيمة</Text>
                            </TouchableOpacity>
                            <View style={styles.statDivider} />
                        </>
                    )}

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

                    <View style={styles.statDivider} />

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

                    <View style={styles.statDivider} />

                    <TouchableOpacity style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {stats.likesCount}
                        </Text>
                        <Text style={styles.statLabel}>الإعجابات</Text>
                    </TouchableOpacity>
                </View>

                {/* زر المتابعة أو التعديل */}
                {isOwnProfile ? (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => router.push("/profile/edit")}
                    >
                        <Text style={styles.editButtonText}>
                            تعديل الملف الشخصي
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.followButton,
                            isFollowing && styles.unfollowButton,
                        ]}
                        onPress={handleFollow}
                    >
                        <Text
                            style={[
                                styles.followButtonText,
                                isFollowing && styles.unfollowButtonText,
                            ]}
                        >
                            {isFollowing ? "إلغاء المتابعة" : "متابعة"}
                        </Text>
                    </TouchableOpacity>
                )}

                {user?.bio ? (
                    <View style={styles.bioContainer}>
                        <Text style={styles.bioText}>{user.bio}</Text>
                    </View>
                ) : isOwnProfile ? (
                    <TouchableOpacity
                        style={styles.addBioButton}
                        onPress={() => router.push("/profile/edit")}
                    >
                        <Ionicons name="add" size={16} color="#007AFF" />
                        <Text style={styles.addBioText}>أضف نبذة عنك</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* قائمة الخيارات - للمستخدم الحالي فقط */}
            {isOwnProfile && (
                <View style={styles.optionsSection}>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => router.push("/profile/edit")}
                    >
                        <View style={styles.optionLeft}>
                            <Ionicons
                                name="person-outline"
                                size={22}
                                color="#007AFF"
                            />
                            <Text style={styles.optionText}>
                                تعديل الملف الشخصي
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#8E8E93"
                        />
                    </TouchableOpacity>

                    {/* Hide 'مشاريعي' for admin accounts */}
                    {currentUser?.role !== "admin" && (
                        <TouchableOpacity style={styles.optionItem} onPress={() => router.push("/profile/projects")}>
                            <View style={styles.optionLeft}>
                                <Ionicons name="folder-outline" size={22} color="#007AFF" />
                                <Text style={styles.optionText}>مشاريعي</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => router.push("/profile/followers")}
                    >
                        <View style={styles.optionLeft}>
                            <Ionicons
                                name="people-outline"
                                size={22}
                                color="#007AFF"
                            />
                            <Text style={styles.optionText}>المتابعون</Text>
                        </View>
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
                        <View style={styles.optionLeft}>
                            <Ionicons
                                name="settings-outline"
                                size={22}
                                color="#007AFF"
                            />
                            <Text style={styles.optionText}>الإعدادات</Text>
                        </View>
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
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1D1D1F",
    },
    logoutButton: { padding: 5 },
    profileSection: {
        backgroundColor: "#fff",
        alignItems: "center",
        paddingVertical: 30,
        marginTop: 10,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 36,
        color: "#fff",
        fontWeight: "bold",
    },
    userName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1D1D1F",
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: "#8E8E93",
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: "row",
        backgroundColor: "#F2F2F7",
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 30,
        marginBottom: 20,
        width: "90%",
        justifyContent: "space-around",
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
        marginTop: 5,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#E5E5EA",
    },
    editButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        marginBottom: 20,
    },
    editButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    followButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
        marginBottom: 20,
    },
    unfollowButton: {
        backgroundColor: "#F2F2F7",
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    followButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    unfollowButtonText: {
        color: "#1D1D1F",
    },
    bioContainer: {
        backgroundColor: "#F2F2F7",
        padding: 15,
        borderRadius: 12,
        width: "90%",
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
    },
    addBioText: {
        color: "#007AFF",
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "500",
    },
    optionsSection: {
        backgroundColor: "#fff",
        marginTop: 15,
        marginHorizontal: 15,
        borderRadius: 12,
        overflow: "hidden",
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#F2F2F7",
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    optionText: {
        fontSize: 16,
        color: "#1D1D1F",
        marginLeft: 12,
        flex: 1,
    },
});
