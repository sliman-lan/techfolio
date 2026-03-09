import { useState, useCallback, useEffect } from "react";
import { commentAPI } from "../services/api";

export default function useComments(projectId) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchComments = useCallback(async () => {
        if (!projectId) {
            console.error("❌ useComments: projectId is required");
            setError("معرف المشروع مطلوب");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log("📥 Fetching comments for project:", projectId);
            const res = await commentAPI.getProjectComments(projectId, 1, 50);

            // تطبيع الاستجابة
            let list = [];
            if (res) {
                if (Array.isArray(res)) {
                    list = res;
                } else if (res.data) {
                    if (Array.isArray(res.data)) {
                        list = res.data;
                    } else if (Array.isArray(res.data.data)) {
                        list = res.data.data;
                    } else if (res.data.comments) {
                        list = res.data.comments;
                    }
                }
            }

            console.log("✅ Comments fetched:", list.length);
            setComments(list);
        } catch (e) {
            console.error("❌ Failed to fetch comments:", e);
            console.error("❌ Error response:", e.response?.data);
            setError(e.response?.data?.message || "فشل تحميل التعليقات");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const addComment = async (content) => {
        if (!content?.trim()) {
            return {
                success: false,
                message: "التعليق لا يمكن أن يكون فارغاً",
            };
        }

        if (!projectId) {
            console.error("❌ addComment: projectId is required");
            return { success: false, message: "معرف المشروع مطلوب" };
        }

        try {
            console.log("📝 Adding comment for project:", projectId);
            console.log("📝 Comment content:", content);

            const res = await commentAPI.addComment(projectId, content);
            console.log("✅ Comment added successfully:", res.data);

            // إعادة جلب التعليقات بعد الإضافة
            await fetchComments();
            return { success: true };
        } catch (e) {
            console.error("❌ Failed to add comment:", e);
            console.error("❌ Error response:", e.response?.data);
            return {
                success: false,
                message: e.response?.data?.message || "فشل إضافة التعليق",
            };
        }
    };

    const toggleLike = async (commentId) => {
        if (!commentId) {
            alert("معرف التعليق مطلوب");
            return;
        }

        try {
            console.log("❤️ Toggling like for comment:", commentId);
            const res = await commentAPI.toggleLike(commentId);

            // تحديث التعليق محلياً بناءً على الاستجابة
            setComments((prev) =>
                prev.map((comment) => {
                    if (comment._id === commentId) {
                        return {
                            ...comment,
                            likesCount: res.data.data.likesCount,
                            isLiked: res.data.data.isLiked,
                        };
                    }

                    // تحديث الردود أيضاً
                    if (comment.replies) {
                        return {
                            ...comment,
                            replies: comment.replies.map((reply) =>
                                reply._id === commentId
                                    ? {
                                          ...reply,
                                          likesCount: res.data.data.likesCount,
                                          isLiked: res.data.data.isLiked,
                                      }
                                    : reply,
                            ),
                        };
                    }

                    return comment;
                }),
            );
        } catch (e) {
            console.error("❌ Failed to toggle like:", e);
            alert(e.response?.data?.message || "فشل تحديث الإعجاب");
        }
    };

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    return {
        comments,
        loading,
        error,
        addComment,
        toggleLike,
        refresh: fetchComments,
    };
}
