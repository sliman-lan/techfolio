import React from "react";
import CommentItem from "./CommentItem";

export default function CommentList({ comments, loading, onToggleLike }) {
    if (loading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">جارٍ التحميل...</span>
                </div>
                <p className="mt-2 text-muted">جاري تحميل التعليقات...</p>
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="bi bi-chat display-3 text-muted"></i>
                <p className="mt-3 text-muted">
                    لا توجد تعليقات بعد. كن أول من يعلق!
                </p>
            </div>
        );
    }

    return (
        <div className="mt-3">
            {comments.map((comment) => (
                <CommentItem
                    key={comment._id}
                    comment={comment}
                    onToggleLike={onToggleLike}
                />
            ))}
        </div>
    );
}
