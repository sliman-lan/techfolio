import React from "react";

const getInitials = (name) => name?.charAt(0).toUpperCase() || "U";

const UserAvatar = ({ user }) => {
    const initials = getInitials(user?.name);
    const colors = [
        "#4f46e5",
        "#0891b2",
        "#b45309",
        "#a21caf",
        "#be123c",
        "#15803d",
    ];
    const colorIndex = (user?._id?.charCodeAt(0) || 0) % colors.length;
    const bgColor = colors[colorIndex];

    return (
        <div className="avatar-circle" style={{ backgroundColor: bgColor }}>
            {initials}
        </div>
    );
};

const ReplyItem = ({ reply }) => (
    <div className="d-flex mb-3">
        <UserAvatar user={reply.user} />
        <div className="ms-3 flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
                <span className="fw-bold">{reply.user?.name || "مستخدم"}</span>
                <span className="small text-muted">
                    {new Date(reply.createdAt).toLocaleString()}
                </span>
            </div>
            <div className="bg-light p-3 rounded-3">
                {reply.content || reply.text}
            </div>
        </div>
    </div>
);

const ReplyList = ({ replies }) => {
    if (!replies?.length) return null;
    return (
        <div className="mt-3 ps-4 border-start">
            {replies.map((reply) => (
                <ReplyItem key={reply._id} reply={reply} />
            ))}
        </div>
    );
};

export default function CommentItem({ comment, onToggleLike }) {
    return (
        <div className="mb-4 pb-3 border-bottom">
            <div className="d-flex">
                <UserAvatar user={comment.user} />
                <div className="ms-3 flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                        <span className="fw-bold">
                            {comment.user?.name || "مستخدم"}
                        </span>
                        <span className="small text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {new Date(comment.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <div className="mb-2 fs-6">
                        {comment.content || comment.text}
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1"
                            onClick={() => onToggleLike(comment._id)}
                        >
                            <i className="bi bi-hand-thumbs-up"></i>
                            <span>{comment.likesCount || 0}</span>
                        </button>
                        {/* يمكن إضافة زر الرد لاحقاً */}
                    </div>
                    <ReplyList replies={comment.replies} />
                </div>
            </div>
        </div>
    );
}
