import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { projectsAPI, usersAPI } from "../../src/services/api";

const CATEGORIES = [
    { label: "الكل", value: "all" },
    { label: "ويب", value: "web" },
    { label: "موبايل", value: "mobile" },
    { label: "ذكاء اصطناعي", value: "ai" },
    { label: "تصميم", value: "design" },
    { label: "أخرى", value: "other" },
];

export default function ExploreScreen() {
    const router = useRouter();
    const [allProjects, setAllProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [usersMap, setUsersMap] = useState({}); // تخزين بيانات المستخدمين بعد جلبها

    // دالة لجلب بيانات مستخدم معين إذا لم تكن موجودة
    const fetchUserIfNeeded = async (userId) => {
        if (!userId || usersMap[userId]) return;
        try {
            const response = await usersAPI.getUserProfile(userId);
            if (response.success && response.data) {
                setUsersMap((prev) => ({ ...prev, [userId]: response.data }));
            }
        } catch (error) {
            console.error(`فشل جلب المستخدم ${userId}:`, error);
        }
    };

    // بعد تحميل المشاريع، نحتاج لجلب بيانات المستخدمين لكل مشروع (إذا لم تكن موجودة)
    useEffect(() => {
        if (allProjects.length > 0) {
            const uniqueUserIds = [
                ...new Set(allProjects.map((p) => p.userId).filter((id) => id)),
            ];
            uniqueUserIds.forEach((userId) => {
                if (!usersMap[userId]) {
                    fetchUserIfNeeded(userId);
                }
            });
        }
    }, [allProjects]);

    const loadProjects = useCallback(async (pageNum = 1, refresh = false) => {
        try {
            const params = {
                page: pageNum,
                limit: 10,
                isPublic: true,
                // إذا كان الخادم يدعم populate، أضف هذا السطر (اختياري)
                // populate: 'userId',
            };

            const response = await projectsAPI.list(params);
            const newProjects = response.data || [];

            if (refresh || pageNum === 1) {
                setAllProjects(newProjects);
            } else {
                setAllProjects((prev) => [...prev, ...newProjects]);
            }

            setHasMore(newProjects.length === 10);
            setPage(pageNum);
        } catch (error) {
            console.error("خطأ في تحميل المشاريع:", error);
        }
    }, []);

    const initialLoad = useCallback(async () => {
        setLoading(true);
        await loadProjects(1, true);
        setLoading(false);
    }, [loadProjects]);

    useEffect(() => {
        initialLoad();
    }, [initialLoad]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadProjects(1, true);
        setRefreshing(false);
    }, [loadProjects]);

    const loadMore = useCallback(() => {
        if (hasMore && !loadingMore) {
            setLoadingMore(true);
            loadProjects(page + 1).finally(() => setLoadingMore(false));
        }
    }, [hasMore, loadingMore, page, loadProjects]);

    // تصفية المشاريع محلياً
    const filteredProjects = useMemo(() => {
        let filtered = [...allProjects];

        if (selectedCategory !== "all") {
            filtered = filtered.filter((p) => p.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((p) => {
                // البحث في النصوص الأساسية
                if (p.title?.toLowerCase().includes(query)) return true;
                if (p.shortDescription?.toLowerCase().includes(query))
                    return true;
                if (p.description?.toLowerCase().includes(query)) return true;
                if (p.tags?.some((tag) => tag.toLowerCase().includes(query)))
                    return true;
                if (
                    p.technologies?.some((tech) =>
                        tech.toLowerCase().includes(query),
                    )
                )
                    return true;

                // البحث في اسم المستخدم إذا كان متوفراً
                const user = usersMap[p.userId];
                if (user) {
                    if (user.name?.toLowerCase().includes(query)) return true;
                    if (user.username?.toLowerCase().includes(query))
                        return true;
                    if (user.email?.toLowerCase().includes(query)) return true;
                }

                return false;
            });
        }

        return filtered;
    }, [allProjects, searchQuery, selectedCategory, usersMap]);

    const renderProjectItem = ({ item }) => {
        const coverImage =
            item.images && item.images.length > 0 ? item.images[0] : null;
        const user = usersMap[item.userId]; // قد يكون undefined حتى يتم تحميله

        return (
            <TouchableOpacity
                style={styles.projectCard}
                onPress={() => router.push(`/project/${item._id}`)}
            >
                {coverImage && (
                    <Image
                        source={{ uri: coverImage }}
                        style={styles.projectImage}
                    />
                )}
                <View style={styles.projectContent}>
                    <View style={styles.projectHeader}>
                        <Text style={styles.projectTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>
                                {item.category}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.projectDescription} numberOfLines={2}>
                        {item.shortDescription ||
                            item.description ||
                            "لا يوجد وصف"}
                    </Text>

                    {/* عرض اسم المستخدم إذا كان متاحاً */}
                    {user && (
                        <View style={styles.userInfo}>
                            <Ionicons
                                name="person-outline"
                                size={14}
                                color="#8E8E93"
                            />
                            <Text style={styles.userName}>
                                {user.name || user.username || "مستخدم"}
                            </Text>
                        </View>
                    )}

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
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>جاري تحميل المشاريع...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>استكشاف</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#8E8E93" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="ابحث عن مشروع..."
                    placeholderTextColor="#8E8E93"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons
                            name="close-circle"
                            size={20}
                            color="#8E8E93"
                        />
                    </TouchableOpacity>
                ) : null}
            </View>

            <FlatList
                horizontal
                data={CATEGORIES}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            selectedCategory === item.value &&
                                styles.categoryChipSelected,
                        ]}
                        onPress={() => setSelectedCategory(item.value)}
                    >
                        <Text
                            style={[
                                styles.categoryChipText,
                                selectedCategory === item.value &&
                                    styles.categoryChipTextSelected,
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
            />

            <FlatList
                data={filteredProjects}
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
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    loadingMore ? (
                        <ActivityIndicator
                            style={{ marginVertical: 20 }}
                            color="#007AFF"
                        />
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="search-outline"
                            size={60}
                            color="#C7C7CC"
                        />
                        <Text style={styles.emptyText}>
                            {allProjects.length === 0
                                ? "لا توجد مشاريع متاحة"
                                : "لا توجد نتائج تطابق بحثك"}
                        </Text>
                    </View>
                }
            />
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
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1D1D1F",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 15,
        marginBottom: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: "#1D1D1F",
        padding: 0,
    },
    categoriesList: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    categoryChip: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    categoryChipSelected: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    categoryChipText: {
        color: "#1D1D1F",
        fontSize: 14,
        fontWeight: "500",
    },
    categoryChipTextSelected: {
        color: "#fff",
    },
    listContainer: {
        padding: 20,
        paddingTop: 5,
    },
    projectCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: "hidden",
    },
    projectImage: {
        width: "100%",
        height: 150,
        resizeMode: "cover",
    },
    projectContent: {
        padding: 15,
    },
    projectHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
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
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        color: "#007AFF",
        fontWeight: "500",
    },
    projectDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 10,
    },
    projectStats: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#F2F2F7",
        paddingTop: 10,
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 15,
    },
    statText: {
        fontSize: 12,
        color: "#8E8E93",
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: "#8E8E93",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    userName: {
        fontSize: 13,
        color: "#8E8E93",
        marginLeft: 4,
    },
});
