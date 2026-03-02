import React, { useState, useEffect } from "react";
import { usersAPI } from "../../services/api";

export default function FollowList({ userId, type, onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, [userId, type, page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res =
                type === "followers"
                    ? await usersAPI.getFollowers(userId, page, 20)
                    : await usersAPI.getFollowing(userId, page, 20);

            const newUsers = res.data?.users || [];
            if (page === 1) {
                setUsers(newUsers);
            } else {
                setUsers((prev) => [...prev, ...newUsers]);
            }

            setHasMore(newUsers.length === 20);
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

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {type === "followers" ? "المتابعون" : "المتابَعون"}
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
                                لا يوجد{" "}
                                {type === "followers" ? "متابعون" : "متابَعون"}{" "}
                                بعد
                            </p>
                        ) : (
                            <div className="list-group list-group-flush">
                                {users.map((u) => (
                                    <div
                                        key={u._id}
                                        className="list-group-item d-flex align-items-center gap-3 border-0"
                                    >
                                        <img
                                            src={
                                                u.avatar ||
                                                "/default-avatar.png"
                                            }
                                            alt={u.name}
                                            className="rounded-circle"
                                            style={{
                                                width: 40,
                                                height: 40,
                                                objectFit: "cover",
                                            }}
                                        />
                                        <div className="flex-grow-1">
                                            <h6 className="mb-0">{u.name}</h6>
                                            <small className="text-muted">
                                                {u.bio || "لا يوجد نبذة"}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className="text-center py-3">
                                <div className="spinner-border spinner-border-sm text-primary" />
                            </div>
                        )}

                        {hasMore && !loading && users.length > 0 && (
                            <button
                                className="btn btn-link w-100 mt-2"
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
