import { useState, useCallback, useEffect } from "react";
import { commentAPI } from "../services/api";

export default function useComments(projectId) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchComments = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const res = await commentAPI.getProjectComments(projectId, 1, 50);
            // تطبيع الاستجابة
            let list = [];
            if (res) {
                if (Array.isArray(res)) list = res;
                else if (res.data) {
                    if (Array.isArray(res.data)) list = res.data;
                    else if (Array.isArray(res.data.data)) list = res.data.data;
                }
            }
            setComments(list);
        } catch (e) {
            // تجاهل الخطأ بصمت
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const addComment = async (content) => {
        try {
            await commentAPI.addComment(projectId, content);
            await fetchComments(); // إعادة جلب التعليقات بعد الإضافة
            return { success: true };
        } catch (e) {
            return {
                success: false,
                message: e.response?.data?.message || "فشل إضافة التعليق",
            };
        }
    };

    const toggleLike = async (commentId) => {
        try {
            await commentAPI.toggleLike(commentId);
            await fetchComments(); // إعادة جلب التعليقات لتحديث الإعجابات
        } catch (e) {
            alert(e.response?.data?.message || "فشل تحديث الإعجاب");
        }
    };

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    return { comments, loading, addComment, toggleLike };
}
