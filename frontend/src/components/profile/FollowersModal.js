import React, { useState, useEffect } from "react";
import { usersAPI } from "../../services/api";

export default function FollowersModal({ userId, type, onClose, navigate }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchUsers();
    }, [userId, type, page, fetchUsers]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res =
                type === "followers"
                    ? await usersAPI.getFollowers(userId, page, 20)
                    : await usersAPI.getFollowing(userId, page, 20);

            const newUsers = res.data?.users || [];
            const totalCount = res.data?.total || 0;

            if (page === 1) {
                setUsers(newUsers);
            } else {
                setUsers((prev) => [...prev, ...newUsers]);
            }

            setTotal(totalCount);
            setHasMore(
                newUsers.length === 20 &&
                    users.length + newUsers.length < totalCount,
            );
        } catch (error) {
            console.error(`❌ فشل جلب ${type}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage((prev) => prev + 1);
        }
    };

    // ✅ الحل المضمون - استخدام window.location مباشرة
    const handleUserClick = (clickedUserId) => {
        console.log("👤 Clicked user:", clickedUserId);

        // إغلاق المودال أولاً
        onClose();

        // ✅ استخدام window.location - يعمل في 100% من الحالات
        window.location.href = `/profile?userId=${clickedUserId}`;
    };

    // دالة مساعدة للصورة الافتراضية
    const getAvatarUrl = (avatar, name) => {
        if (!avatar || avatar === "default-avatar.png") {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&length=1&font-size=0.4&size=128`;
        }
        return avatar;
    };

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content rounded-4">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {type === "followers" ? "المتابعون" : "المتابَعون"}
                            {total > 0 && (
                                <span className="text-muted me-2 small">
                                    ({total})
                                </span>
                            )}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>

                    <div
                        className="modal-body"
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                    >
                        {users.length === 0 && !loading ? (
                            <p className="text-center text-muted py-4">
                                {type === "followers"
                                    ? "لا يوجد متابعون بعد"
                                    : "لا يتابع أحداً بعد"}
                            </p>
                        ) : (
                            <div className="list-group list-group-flush">
                                {users.map((user) => (
                                    <div
                                        key={user._id}
                                        className="list-group-item d-flex align-items-center gap-3 border-0 py-3"
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                            handleUserClick(user._id)
                                        }
                                    >
                                        <img
                                            src={getAvatarUrl(
                                                user.avatar,
                                                user.name,
                                            )}
                                            alt={user.name}
                                            className="rounded-circle"
                                            style={{
                                                width: 50,
                                                height: 50,
                                                objectFit: "cover",
                                            }}
                                        />
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1 fw-bold">
                                                {user.name}
                                            </h6>
                                            <small className="text-muted d-block">
                                                {user.bio?.substring(0, 60) ||
                                                    "لا يوجد نبذة"}
                                                {user.bio?.length > 60
                                                    ? "..."
                                                    : ""}
                                            </small>
                                        </div>
                                        <i className="bi bi-chevron-left text-muted"></i>
                                    </div>
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className="text-center py-3">
                                <div className="spinner-border spinner-border-sm text-primary" />
                                <span className="ms-2 text-muted">
                                    جاري التحميل...
                                </span>
                            </div>
                        )}

                        {hasMore && !loading && users.length > 0 && (
                            <button
                                className="btn btn-link w-100 mt-2 text-primary"
                                onClick={loadMore}
                            >
                                تحميل المزيد
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
