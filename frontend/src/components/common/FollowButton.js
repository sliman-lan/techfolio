import React, { useState, useEffect, useContext } from "react";
import { usersAPI } from "../../services/api";
import AuthContext from "../../context/AuthContext";

export default function FollowButton({ userId, username, onFollowChange }) {
    const { user } = useContext(AuthContext);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);

    useEffect(() => {
        const checkFollowStatus = async () => {
            try {
                const res = await usersAPI.checkFollow(userId);
                setIsFollowing(res.data?.isFollowing || false);
            } catch (error) {
                console.error("❌ فشل التحقق من حالة المتابعة:", error);
            }
        };

        const fetchFollowersCount = async () => {
            try {
                const res = await usersAPI.getFollowers(userId);
                setFollowersCount(res.data?.total || 0);
            } catch (error) {
                console.error("❌ فشل جلب عدد المتابعين:", error);
            }
        };

        if (userId) {
            checkFollowStatus();
            fetchFollowersCount();
        }
    }, [userId]);

    const handleFollow = async () => {
        setLoading(true);
        try {
            if (isFollowing) {
                await usersAPI.unfollow(userId);
                setIsFollowing(false);
                setFollowersCount((prev) => prev - 1);
            } else {
                await usersAPI.follow(userId);
                setIsFollowing(true);
                setFollowersCount((prev) => prev + 1);
            }

            if (onFollowChange) {
                onFollowChange(!isFollowing);
            }
        } catch (error) {
            console.error("❌ فشل عملية المتابعة:", error);
            alert("حدث خطأ أثناء محاولة المتابعة");
        } finally {
            setLoading(false);
        }
    };

    // لا تظهر الزر إذا:
    // 1. لا يوجد مستخدم مسجل
    // 2. المستخدم يشاهد ملفه الشخصي
    if (!user || user._id === userId) {
        return (
            <div className="d-flex align-items-center gap-3">
                <div className="text-muted">
                    <strong>{followersCount}</strong> متابع
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex align-items-center gap-3">
            <button
                className={`btn ${
                    isFollowing ? "btn-outline-secondary" : "btn-primary"
                } rounded-pill px-4 d-flex align-items-center gap-2 follow-button`}
                onClick={handleFollow}
                disabled={loading}
                style={{ transition: "all 0.3s ease" }}
            >
                {loading ? (
                    <span className="spinner-border spinner-border-sm" />
                ) : isFollowing ? (
                    <>
                        <i className="bi bi-person-check"></i>
                        <span>أتابع</span>
                    </>
                ) : (
                    <>
                        <i className="bi bi-person-plus"></i>
                        <span>متابعة</span>
                    </>
                )}
            </button>
            <div className="text-muted">
                <strong>{followersCount}</strong> متابع
            </div>
        </div>
    );
}
