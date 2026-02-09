// app/project/[id].js - الإصدار المعدل بالكامل
import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    FlatList,
    Alert,
    Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { projectsAPI, likeAPI, commentAPI } from "../../src/services/api";

export default function ProjectDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const projectId = params.id;

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [commenting, setCommenting] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // دالة بديلة للتحقق من حالة الإعجاب باستخدام بيانات المشروع
    const checkLikeStatusFromProject = (projectData, currentUser) => {
        if (!projectData || !currentUser) {
            return { isLiked: false, likesCount: 0 };
        }

        let isLiked = false;
        let likesCount = 0;

        // الطريقة 1: إذا كان هناك حقل likes كمصفوفة من معرفات المستخدمين
        if (projectData.likes && Array.isArray(projectData.likes)) {
            likesCount = projectData.likes.length;
            isLiked = projectData.likes.includes(currentUser._id);
        }
        // الطريقة 2: إذا كان هناك حقل likedBy
        else if (projectData.likedBy && Array.isArray(projectData.likedBy)) {
            likesCount = projectData.likedBy.length;
            isLiked = projectData.likedBy.includes(currentUser._id);
        }
        // الطريقة 3: إذا كان هناك حقل likesCount
        else if (projectData.likesCount !== undefined) {
            likesCount = projectData.likesCount;
            // لا يمكننا معرفة إذا كان المستخدم معجبًا بدون بيانات إضافية
        }

        return { isLiked, likesCount };
    };

    // دالة لتحميل بيانات المشروع
    // في app/project/[id].js - استبدل دالة loadProjectData:

    const loadProjectData = useCallback(async () => {
        if (!projectId) {
            Alert.alert("خطأ", "معرف المشروع غير موجود");
            router.push("/tabs");
            return;
        }

        try {
            setLoading(true);

            // جلب المستخدم الحالي
            const userString = await AsyncStorage.getItem("user");
            if (userString) {
                const userData = JSON.parse(userString);
                setCurrentUser(userData);
            }

            console.log("📡 جاري تحميل المشروع:", projectId);

            // 1. جلب بيانات المشروع الرئيسية
            const projectResponse = await projectsAPI.getById(projectId);
            console.log("📊 بيانات المشروع من API:", projectResponse);

            // التعامل مع استجابة المشروع
            let projectData;
            if (projectResponse.success) {
                projectData = projectResponse.data || projectResponse;
            } else if (projectResponse.data) {
                projectData = projectResponse.data;
            } else {
                projectData = projectResponse;
            }

            if (!projectData) {
                throw new Error("لا توجد بيانات للمشروع");
            }

            setProject(projectData);

            // 2. جلب التعليقات
            try {
                const commentsResponse =
                    await commentAPI.getComments(projectId);
                console.log("💬 تعليقات المشروع:", commentsResponse);

                let commentsList = [];
                if (commentsResponse.comments) {
                    commentsList = commentsResponse.comments;
                } else if (commentsResponse.data) {
                    commentsList = commentsResponse.data;
                } else if (Array.isArray(commentsResponse)) {
                    commentsList = commentsResponse;
                }

                setComments(commentsList);
            } catch (commentsError) {
                console.log("⚠️ خطأ في جلب التعليقات:", commentsError.message);
                setComments([]);
            }

            // 3. جلب عدد الإعجابات (إذا كانت موجودة في Project.js)
            // لاحظ أن Project.js الحالي لا يحتوي على likes
            // إذا كنت تحتاج هذه الميزة، أضفها للنموذج أولاً
            setLikesCount(0);
            setIsLiked(false);

            // 4. محاولة التحقق من حالة الإعجاب (إذا كانت الميزة موجودة)
            try {
                const likeStatus = await likeAPI.checkLikeStatus(projectId);
                console.log("❤️ حالة الإعجاب:", likeStatus);

                // إذا كانت الميزة غير موجودة، تجاهل الخطأ
                if (
                    likeStatus.message &&
                    likeStatus.message.includes("غير موجود")
                ) {
                    console.log("ℹ️ ميزة الإعجاب غير مفعلة في السيرفر");
                } else if (likeStatus.isLiked !== undefined) {
                    setIsLiked(likeStatus.isLiked);
                    if (likeStatus.likesCount !== undefined) {
                        setLikesCount(likeStatus.likesCount);
                    }
                }
            } catch (likeError) {
                console.log(
                    "⚠️ لا يمكن التحقق من حالة الإعجاب:",
                    likeError.message,
                );
            }
        } catch (error) {
            console.error("❌ خطأ في تحميل بيانات المشروع:", error);

            let errorMessage = "تعذر تحميل بيانات المشروع";

            if (error.response?.status === 401) {
                errorMessage = "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى";
                await AsyncStorage.clear();
                router.push("/auth/login");
            } else if (error.response?.status === 404) {
                errorMessage = "المشروع غير موجود";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert("خطأ", errorMessage, [
                { text: "حسناً", onPress: () => router.push("/tabs") },
            ]);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            loadProjectData();
        }
    }, [projectId, loadProjectData]);

    // استبدل دوال التعليقات والإعجابات في ملف [id].js بالنسخ المعدلة:

    const handleLike = async () => {
        try {
            if (!currentUser) {
                Alert.alert(
                    "يرجى تسجيل الدخول",
                    "يجب تسجيل الدخول للإعجاب بالمشاريع",
                    [
                        { text: "إلغاء" },
                        {
                            text: "تسجيل الدخول",
                            onPress: () => router.push("/auth/login"),
                        },
                    ],
                );
                return;
            }

            console.log("❤️ جاري الإعجاب/إلغاء الإعجاب...");

            if (isLiked) {
                await likeAPI.unlikeProject(projectId);
                setIsLiked(false);
                setLikesCount((prev) => Math.max(0, prev - 1));
                console.log("✅ تم إلغاء الإعجاب");
            } else {
                await likeAPI.likeProject(projectId);
                setIsLiked(true);
                setLikesCount((prev) => prev + 1);
                console.log("✅ تم الإعجاب");
            }
        } catch (error) {
            console.error("❌ خطأ في الإعجاب:", error);

            let errorMessage = "فشل في عملية الإعجاب";
            if (error.response?.status === 401) {
                errorMessage = "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى";
                await AsyncStorage.clear();
                router.push("/auth/login");
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Alert.alert("❌ خطأ", errorMessage);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            Alert.alert("خطأ", "يرجى كتابة تعليق");
            return;
        }

        if (!currentUser) {
            Alert.alert("يرجى تسجيل الدخول", "يجب تسجيل الدخول لإضافة تعليق", [
                { text: "إلغاء" },
                {
                    text: "تسجيل الدخول",
                    onPress: () => router.push("/auth/login"),
                },
            ]);
            return;
        }

        try {
            setCommenting(true);
            console.log("💬 جاري إضافة تعليق...");

            // إضافة التعليق عبر API
            const response = await commentAPI.addComment(
                projectId,
                newComment.trim(),
            );
            console.log("📨 استجابة إضافة التعليق:", response);

            // جلب التعليقات المحدثة بعد الإضافة
            await loadProjectData();

            setNewComment("");

            Alert.alert("✅ تم", "تم إضافة التعليق بنجاح");
        } catch (error) {
            console.error("❌ خطأ في إضافة التعليق:", error);

            let errorMessage = "فشل في إضافة التعليق";
            if (error.response?.status === 401) {
                errorMessage = "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى";
                await AsyncStorage.clear();
                router.push("/auth/login");
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Alert.alert("❌ خطأ", errorMessage);
        } finally {
            setCommenting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        Alert.alert("حذف التعليق", "هل تريد حذف هذا التعليق؟", [
            { text: "إلغاء", style: "cancel" },
            {
                text: "حذف",
                style: "destructive",
                onPress: async () => {
                    try {
                        // حذف من API
                        await commentAPI.deleteComment(projectId, commentId);

                        // تحديث التعليقات بعد الحذف
                        await loadProjectData();

                        Alert.alert("✅ تم", "تم حذف التعليق بنجاح");
                    } catch (error) {
                        console.error("❌ خطأ في حذف التعليق:", error);

                        let errorMessage = "فشل في حذف التعليق";
                        if (error.response?.status === 401) {
                            errorMessage = "غير مصرح لك بحذف هذا التعليق";
                        } else if (error.response?.data?.message) {
                            errorMessage = error.response.data.message;
                        }

                        Alert.alert("❌ خطأ", errorMessage);
                    }
                },
            },
        ]);
    };
    // تنسيق التاريخ
    const formatDate = (dateString) => {
        try {
            if (!dateString) return "غير محدد";

            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "غير محدد";

            const now = new Date();
            const diffMs = now - date;
            const diffSec = Math.floor(diffMs / 1000);
            const diffMin = Math.floor(diffSec / 60);
            const diffHour = Math.floor(diffMin / 60);
            const diffDay = Math.floor(diffHour / 24);

            if (diffSec < 60) return "الآن";
            if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
            if (diffHour < 24) return `منذ ${diffHour} ساعة`;
            if (diffDay < 7) return `منذ ${diffDay} يوم`;

            return date.toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch (error) {
            return "منذ فترة";
        }
    };

    // فتح الروابط
    const openLink = (url) => {
        if (url) {
            Linking.openURL(url).catch((err) => {
                console.error("❌ فشل فتح الرابط:", err);
                Alert.alert("خطأ", "تعذر فتح الرابط");
            });
        }
    };

    // دالة لجلب التعليقات مرة أخرى
    const refreshComments = async () => {
        try {
            const commentsResponse = await commentAPI.getComments(projectId);

            let commentsList = [];
            if (commentsResponse.comments) {
                commentsList = commentsResponse.comments;
            } else if (commentsResponse.data) {
                commentsList = commentsResponse.data;
            } else if (Array.isArray(commentsResponse)) {
                commentsList = commentsResponse;
            }

            setComments(commentsList);
        } catch (error) {
            console.error("❌ خطأ في تحديث التعليقات:", error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>جاري تحميل المشروع...</Text>
            </View>
        );
    }

    if (!project) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.push("/tabs")}
                    >
                        <Ionicons name="arrow-back" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>تفاصيل المشروع</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={60}
                        color="#FF3B30"
                    />
                    <Text style={styles.errorText}>المشروع غير موجود</Text>
                    <TouchableOpacity
                        style={styles.backHomeButton}
                        onPress={() => router.push("/tabs")}
                    >
                        <Text style={styles.backHomeButtonText}>
                            العودة للرئيسية
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={loadProjectData}
                    colors={["#007AFF"]}
                />
            }
        >
            {/* الهيدر */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("/tabs")}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>تفاصيل المشروع</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={loadProjectData}
                >
                    <Ionicons
                        name="refresh-outline"
                        size={24}
                        color="#007AFF"
                    />
                </TouchableOpacity>
            </View>

            {/* معلومات المشروع */}
            <View style={styles.projectCard}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectDescription}>
                    {project.description}
                </Text>

                {/* معلومات المشروع */}
                <View style={styles.projectInfo}>
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="person-outline"
                            size={16}
                            color="#8E8E93"
                        />
                        <TouchableOpacity
                            onPress={() => {
                                if (project.owner?._id) {
                                    router.push(
                                        `/profile?userId=${project.owner._id}`,
                                    );
                                }
                            }}
                        >
                            <Text style={styles.infoText}>
                                {project.owner?.name ||
                                    project.user?.name ||
                                    "مجهول"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons
                            name="calendar-outline"
                            size={16}
                            color="#8E8E93"
                        />
                        <Text style={styles.infoText}>
                            {project.createdAt
                                ? formatDate(project.createdAt)
                                : "غير محدد"}
                        </Text>
                    </View>

                    {project.category && (
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="grid-outline"
                                size={16}
                                color="#8E8E93"
                            />
                            <Text style={styles.infoText}>
                                {project.category}
                            </Text>
                        </View>
                    )}

                    {project.status && (
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="flag-outline"
                                size={16}
                                color="#8E8E93"
                            />
                            <Text style={styles.infoText}>
                                {project.status}
                            </Text>
                        </View>
                    )}
                </View>

                {/* التقنيات */}
                {project.technologies && project.technologies.length > 0 && (
                    <View style={styles.technologiesContainer}>
                        <Text style={styles.sectionTitle}>
                            التقنيات المستخدمة
                        </Text>
                        <View style={styles.technologiesList}>
                            {project.technologies
                                .slice(0, 5)
                                .map((tech, index) => (
                                    <View key={index} style={styles.techBadge}>
                                        <Text style={styles.techText}>
                                            {tech}
                                        </Text>
                                    </View>
                                ))}
                        </View>
                    </View>
                )}

                {/* الروابط */}
                {(project.demoUrl || project.githubUrl) && (
                    <View style={styles.linksContainer}>
                        <Text style={styles.sectionTitle}>الروابط</Text>
                        <View style={styles.linksList}>
                            {project.demoUrl && (
                                <TouchableOpacity
                                    style={styles.linkButton}
                                    onPress={() => openLink(project.demoUrl)}
                                >
                                    <Ionicons
                                        name="globe-outline"
                                        size={18}
                                        color="#007AFF"
                                    />
                                    <Text style={styles.linkText}>
                                        عرض الموقع
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {project.githubUrl && (
                                <TouchableOpacity
                                    style={styles.linkButton}
                                    onPress={() => openLink(project.githubUrl)}
                                >
                                    <Ionicons
                                        name="logo-github"
                                        size={18}
                                        color="#007AFF"
                                    />
                                    <Text style={styles.linkText}>
                                        عرض الكود
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>

            {/* قسم الإعجابات والتعليقات */}
            <View style={styles.interactionSection}>
                {/* زر الإعجاب */}
                <TouchableOpacity
                    style={styles.likeContainer}
                    onPress={handleLike}
                    activeOpacity={0.7}
                >
                    <View style={styles.likeButton}>
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={28}
                            color={isLiked ? "#FF3B30" : "#8E8E93"}
                        />
                        <Text
                            style={[
                                styles.likeText,
                                isLiked && styles.likedText,
                            ]}
                        >
                            {isLiked ? "معجب به" : "أعجبني"}
                        </Text>
                    </View>
                    <Text style={styles.likesCount}>{likesCount} إعجاب</Text>
                </TouchableOpacity>

                {/* قسم التعليقات */}
                <View style={styles.commentsContainer}>
                    <Text style={styles.sectionTitle}>
                        التعليقات ({comments.length})
                    </Text>

                    {/* إضافة تعليق جديد */}
                    <View style={styles.addCommentContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="أضف تعليقًا..."
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                            maxLength={500}
                            placeholderTextColor="#8E8E93"
                        />
                        <TouchableOpacity
                            style={[
                                styles.commentButton,
                                (commenting || !newComment.trim()) &&
                                    styles.buttonDisabled,
                            ]}
                            onPress={handleAddComment}
                            disabled={commenting || !newComment.trim()}
                        >
                            {commenting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.commentButtonText}>
                                    نشر
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* قائمة التعليقات */}
                    {comments.length > 0 ? (
                        <FlatList
                            data={comments}
                            keyExtractor={(item) => item._id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.commentItem}>
                                    <View style={styles.commentHeader}>
                                        <View style={styles.commentAuthor}>
                                            <View style={styles.commentAvatar}>
                                                <Text
                                                    style={
                                                        styles.commentAvatarText
                                                    }
                                                >
                                                    {item.user?.name?.charAt(
                                                        0,
                                                    ) || "م"}
                                                </Text>
                                            </View>
                                            <View
                                                style={styles.commentAuthorInfo}
                                            >
                                                <Text
                                                    style={
                                                        styles.commentAuthorName
                                                    }
                                                >
                                                    {item.user?.name || "مجهول"}
                                                </Text>
                                                <Text
                                                    style={styles.commentDate}
                                                >
                                                    {formatDate(item.createdAt)}
                                                </Text>
                                            </View>
                                        </View>
                                        {currentUser &&
                                            currentUser._id ===
                                                item.user?._id && (
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        handleDeleteComment(
                                                            item._id,
                                                        )
                                                    }
                                                    style={styles.deleteButton}
                                                >
                                                    <Ionicons
                                                        name="trash-outline"
                                                        size={18}
                                                        color="#FF3B30"
                                                    />
                                                </TouchableOpacity>
                                            )}
                                    </View>
                                    <Text style={styles.commentText}>
                                        {item.text}
                                    </Text>
                                </View>
                            )}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.noComments}>
                            <Ionicons
                                name="chatbubble-outline"
                                size={50}
                                color="#C7C7CC"
                            />
                            <Text style={styles.noCommentsText}>
                                لا توجد تعليقات بعد
                            </Text>
                            <Text style={styles.noCommentsSubtext}>
                                كن أول من يعلق على هذا المشروع
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
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
        backgroundColor: "#F2F2F7",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#8E8E93",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FF3B30",
        marginTop: 15,
        marginBottom: 30,
    },
    backHomeButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backHomeButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
    },
    backButton: {
        padding: 5,
    },
    refreshButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1D1D1F",
    },
    projectCard: {
        backgroundColor: "#fff",
        margin: 15,
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    projectTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1D1D1F",
        marginBottom: 10,
    },
    projectDescription: {
        fontSize: 15,
        color: "#666",
        lineHeight: 22,
        marginBottom: 20,
    },
    projectInfo: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: "#8E8E93",
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1D1D1F",
        marginBottom: 10,
    },
    technologiesContainer: {
        marginBottom: 20,
    },
    technologiesList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    techBadge: {
        backgroundColor: "#E5E5EA",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    techText: {
        fontSize: 12,
        color: "#1D1D1F",
        fontWeight: "500",
    },
    linksContainer: {
        marginBottom: 10,
    },
    linksList: {
        flexDirection: "row",
        gap: 15,
    },
    linkButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F2F7",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    linkText: {
        color: "#007AFF",
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "500",
    },
    interactionSection: {
        backgroundColor: "#fff",
        margin: 15,
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    likeContainer: {
        alignItems: "center",
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F2F2F7",
    },
    likeButton: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    likeText: {
        fontSize: 16,
        color: "#8E8E93",
        marginLeft: 8,
        fontWeight: "500",
    },
    likedText: {
        color: "#FF3B30",
        fontWeight: "600",
    },
    likesCount: {
        fontSize: 14,
        color: "#8E8E93",
    },
    commentsContainer: {
        marginTop: 10,
    },
    addCommentContainer: {
        marginBottom: 20,
    },
    commentInput: {
        backgroundColor: "#F2F2F7",
        borderWidth: 1,
        borderColor: "#E5E5EA",
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: "top",
        marginBottom: 10,
        color: "#000",
    },
    commentButton: {
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#C7C7CC",
        opacity: 0.7,
    },
    commentButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    commentItem: {
        backgroundColor: "#F2F2F7",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    commentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    commentAuthor: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    commentAvatarText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    commentAuthorInfo: {
        flex: 1,
    },
    commentAuthorName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1D1D1F",
        marginBottom: 2,
    },
    commentDate: {
        fontSize: 12,
        color: "#8E8E93",
    },
    deleteButton: {
        padding: 5,
    },
    commentText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    noComments: {
        alignItems: "center",
        paddingVertical: 40,
    },
    noCommentsText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#8E8E93",
        marginTop: 15,
        marginBottom: 5,
    },
    noCommentsSubtext: {
        fontSize: 14,
        color: "#C7C7CC",
        textAlign: "center",
    },
});

// أضف import RefreshControl في الأعلى
import { RefreshControl } from "react-native";
