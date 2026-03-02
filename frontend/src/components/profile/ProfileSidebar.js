import React, { useState } from "react";
import CertificationFields from "./CertificationFields";
import FollowButton from "../common/FollowButton";
import FollowersModal from "./FollowersModal";

export default function ProfileSidebar({
    user,
    viewUser,
    isViewingOther,
    editing,
    form,
    setForm,
    loading,
    error,
    onFieldChange,
    onSave,
    onCancelEdit,
    onStartEdit,
    onAvatarUpload,
    navigate,
}) {
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [imageError, setImageError] = useState({});

    // ألوان للصورة الرمزية
    const avatarColors = [
        "#4f46e5",
        "#0891b2",
        "#b45309",
        "#a21caf",
        "#be123c",
        "#15803d",
    ];

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("الرجاء اختيار ملف صورة فقط");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت");
                return;
            }

            setAvatarPreview(URL.createObjectURL(file));
            setUploadLoading(true);
            try {
                await onAvatarUpload(file);
                setAvatarPreview(null);
            } catch (error) {
                console.error("فشل رفع الصورة:", error);
                setAvatarPreview(null);
            } finally {
                setUploadLoading(false);
                e.target.value = "";
            }
        }
    };

    const getInitial = (name) => name?.charAt(0) || "U";

    const getAvatarColor = (id) => {
        const index = (id?.charCodeAt(0) || 0) % avatarColors.length;
        return avatarColors[index];
    };

    const getAvatarUrl = (userData) => {
        if (!userData) return "/default-avatar.png";

        if (imageError[userData._id]) {
            return "/default-avatar.png";
        }

        if (userData.avatar && userData.avatar !== "default-avatar.png") {
            return `${userData.avatar}?t=${Date.now()}`;
        }

        return "/default-avatar.png";
    };

    const handleImageError = (userId) => {
        setImageError((prev) => ({ ...prev, [userId]: true }));
    };

    const displayUser = isViewingOther ? viewUser : user;
    if (!displayUser) return null;

    const isOwnProfile = !isViewingOther;

    // عرض المستخدم الآخر
    if (isViewingOther) {
        const other = viewUser;
        const otherColor = getAvatarColor(other._id);
        const otherInitial = getInitial(other.name);
        const avatarUrl = getAvatarUrl(other);

        return (
            <div
                className="card-body text-center p-4"
                style={{ textAlign: "right" }}
            >
                {" "}
                {/* إضافة textAlign: right */}
                <div className="mb-3 position-relative">
                    {imageError[other._id] ? (
                        <div
                            className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{
                                width: 100,
                                height: 100,
                                backgroundColor: otherColor,
                                fontSize: 36,
                            }}
                        >
                            {otherInitial}
                        </div>
                    ) : avatarUrl && avatarUrl !== "/default-avatar.png" ? (
                        <img
                            src={avatarUrl}
                            alt={other.name}
                            className="rounded-circle"
                            style={{
                                width: 100,
                                height: 100,
                                objectFit: "cover",
                            }}
                            onError={() => handleImageError(other._id)}
                        />
                    ) : (
                        <div
                            className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{
                                width: 100,
                                height: 100,
                                backgroundColor: otherColor,
                                fontSize: 36,
                            }}
                        >
                            {otherInitial}
                        </div>
                    )}
                </div>
                <h4 className="fw-bold mb-1">{other.name || "مستخدم"}</h4>
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3">
                    {other.role === "admin"
                        ? "مشرف"
                        : other.role === "teacher"
                          ? "معلم"
                          : "طالب"}
                </span>
                {other.bio && (
                    <p className="text-muted small px-3">{other.bio}</p>
                )}
                {/* إحصائيات المتابعة */}
                <div className="d-flex justify-content-around my-3 py-2 border-top border-bottom">
                    <div
                        className="text-center follow-stats"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowFollowers(true)}
                    >
                        <div className="h5 mb-0">
                            {other.followersCount || 0}
                        </div>
                        <small className="text-muted">متابعون</small>
                    </div>
                    <div
                        className="text-center follow-stats"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowFollowing(true)}
                    >
                        <div className="h5 mb-0">
                            {other.followingCount || 0}
                        </div>
                        <small className="text-muted">يتابع</small>
                    </div>
                </div>
                {/* زر المتابعة */}
                {!isOwnProfile && (
                    <div className="mt-2 mb-3">
                        <FollowButton
                            userId={other._id}
                            username={other.name}
                            onFollowChange={(following) => {
                                if (following) {
                                    other.followersCount =
                                        (other.followersCount || 0) + 1;
                                } else {
                                    other.followersCount =
                                        (other.followersCount || 0) - 1;
                                }
                            }}
                        />
                    </div>
                )}
                {/* معلومات التواصل */}
                <div
                    className="mt-3 text-start bg-light p-3 rounded-3"
                    style={{ textAlign: "right" }}
                >
                    <h6 className="fw-bold mb-2">معلومات التواصل</h6>
                    <div className="small mb-1 d-flex align-items-center">
                        <i className="bi bi-envelope ms-2"></i>{" "}
                        {other.email || "غير متاح"}
                    </div>
                    {other.socialLinks?.github && (
                        <div className="small mb-1 d-flex align-items-center">
                            <i className="bi bi-github ms-2"></i>{" "}
                            <a
                                href={other.socialLinks.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none"
                            >
                                GitHub
                            </a>
                        </div>
                    )}
                    {other.socialLinks?.linkedin && (
                        <div className="small mb-1 d-flex align-items-center">
                            <i className="bi bi-linkedin ms-2"></i>{" "}
                            <a
                                href={other.socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none"
                            >
                                LinkedIn
                            </a>
                        </div>
                    )}
                </div>
                {/* مودالات المتابعة */}
                {showFollowers && (
                    <FollowersModal
                        userId={other._id}
                        type="followers"
                        onClose={() => setShowFollowers(false)}
                        navigate={navigate}
                    />
                )}
                {showFollowing && (
                    <FollowersModal
                        userId={other._id}
                        type="following"
                        onClose={() => setShowFollowing(false)}
                        navigate={navigate}
                    />
                )}
            </div>
        );
    }

    // وضع التعديل
    if (editing) {
        return (
            <div className="card-body p-4" style={{ textAlign: "right" }}>
                {" "}
                {/* إضافة textAlign: right */}
                {/* رفع الصورة الشخصية */}
                <div className="text-center mb-3">
                    <div className="position-relative d-inline-block">
                        {uploadLoading ? (
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center mx-auto bg-light"
                                style={{
                                    width: 100,
                                    height: 100,
                                }}
                            >
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        جاري الرفع...
                                    </span>
                                </div>
                            </div>
                        ) : avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="الصورة الشخصية"
                                className="rounded-circle"
                                style={{
                                    width: 100,
                                    height: 100,
                                    objectFit: "cover",
                                }}
                            />
                        ) : imageError[user?._id] ? (
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mx-auto"
                                style={{
                                    width: 100,
                                    height: 100,
                                    backgroundColor: getAvatarColor(user?._id),
                                    fontSize: 36,
                                }}
                            >
                                {getInitial(user?.name)}
                            </div>
                        ) : user?.avatar &&
                          user.avatar !== "default-avatar.png" ? (
                            <img
                                src={`${user.avatar}?t=${Date.now()}`}
                                alt="الصورة الشخصية"
                                className="rounded-circle"
                                style={{
                                    width: 100,
                                    height: 100,
                                    objectFit: "cover",
                                }}
                                onError={() => handleImageError(user._id)}
                            />
                        ) : (
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mx-auto"
                                style={{
                                    width: 100,
                                    height: 100,
                                    backgroundColor: getAvatarColor(user?._id),
                                    fontSize: 36,
                                }}
                            >
                                {getInitial(user?.name)}
                            </div>
                        )}
                        <label
                            htmlFor="avatarUpload"
                            className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1"
                            style={{ cursor: "pointer" }}
                        >
                            <i className="bi bi-camera text-white"></i>
                        </label>
                        <input
                            type="file"
                            id="avatarUpload"
                            accept="image/*"
                            className="d-none"
                            onChange={handleAvatarChange}
                            disabled={uploadLoading}
                        />
                    </div>
                    <small className="text-muted d-block mt-2">
                        اضغط على الكاميرا لتغيير الصورة
                    </small>
                </div>
                {/* حقول التعديل */}
                <div className="mb-2">
                    <label className="form-label fw-medium">الاسم</label>
                    <input
                        name="name"
                        value={form.name || ""}
                        onChange={onFieldChange}
                        className="form-control rounded-3"
                    />
                </div>
                <div className="mb-2">
                    <label className="form-label fw-medium">نبذة شخصية</label>
                    <textarea
                        name="bio"
                        value={form.bio || ""}
                        onChange={onFieldChange}
                        className="form-control rounded-3"
                        rows="3"
                    />
                </div>
                {/* روابط التواصل الاجتماعي */}
                <div className="mb-2">
                    <label className="form-label fw-medium">GitHub</label>
                    <input
                        name="github"
                        value={form.socialLinks?.github || ""}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                socialLinks: {
                                    ...prev.socialLinks,
                                    github: e.target.value,
                                },
                            }))
                        }
                        className="form-control rounded-3"
                        placeholder="https://github.com/username"
                    />
                </div>
                <div className="mb-2">
                    <label className="form-label fw-medium">LinkedIn</label>
                    <input
                        name="linkedin"
                        value={form.socialLinks?.linkedin || ""}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                socialLinks: {
                                    ...prev.socialLinks,
                                    linkedin: e.target.value,
                                },
                            }))
                        }
                        className="form-control rounded-3"
                        placeholder="https://linkedin.com/in/username"
                    />
                </div>
                {/* للطلاب فقط: مهارات وشهادات */}
                {user?.role !== "admin" && (
                    <>
                        <div className="mb-2">
                            <label className="form-label fw-medium">
                                المهارات (مفصولة بفواصل)
                            </label>
                            <input
                                name="skills"
                                value={form.skills || ""}
                                onChange={onFieldChange}
                                className="form-control rounded-3"
                                placeholder="مثال: React, Node.js, UX"
                            />
                        </div>

                        <div className="mb-2">
                            <label className="form-label fw-medium">
                                الشهادات
                            </label>
                            {(form.certifications || []).map((cert, idx) => (
                                <CertificationFields
                                    key={idx}
                                    cert={cert}
                                    idx={idx}
                                    onChange={(idx, field, value) => {
                                        const updated = [
                                            ...form.certifications,
                                        ];
                                        updated[idx] = {
                                            ...updated[idx],
                                            [field]: value,
                                        };
                                        setForm((prev) => ({
                                            ...prev,
                                            certifications: updated,
                                        }));
                                    }}
                                    onRemove={(idx) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            certifications:
                                                prev.certifications.filter(
                                                    (_, i) => i !== idx,
                                                ),
                                        }));
                                    }}
                                />
                            ))}
                            <button
                                className="btn btn-outline-primary btn-sm w-100 rounded-pill mt-2"
                                onClick={() => {
                                    setForm((prev) => ({
                                        ...prev,
                                        certifications: [
                                            ...(prev.certifications || []),
                                            {
                                                title: "",
                                                issuer: "",
                                                date: "",
                                                credentialId: "",
                                                credentialUrl: "",
                                            },
                                        ],
                                    }));
                                }}
                            >
                                <i className="bi bi-plus-circle ms-1"></i> إضافة
                                شهادة
                            </button>
                        </div>
                    </>
                )}
                {error && (
                    <div className="alert alert-danger rounded-3">
                        <i className="bi bi-exclamation-triangle ms-2"></i>
                        {error}
                    </div>
                )}
                <div className="d-flex gap-2 mt-3">
                    <button
                        className="btn btn-primary flex-grow-1 rounded-pill"
                        onClick={onSave}
                        disabled={loading || uploadLoading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm ms-2" />
                        ) : (
                            <>
                                <i className="bi bi-check-lg ms-2"></i> حفظ
                            </>
                        )}
                    </button>
                    <button
                        className="btn btn-outline-secondary rounded-pill"
                        onClick={onCancelEdit}
                        disabled={loading || uploadLoading}
                    >
                        <i className="bi bi-x-lg ms-2"></i> إلغاء
                    </button>
                </div>
            </div>
        );
    }

    // العرض العادي للمستخدم نفسه
    const userColor = getAvatarColor(user?._id);
    const userInitial = getInitial(user?.name);
    const avatarUrl = getAvatarUrl(user);
    // للتأكد من أن navigate موجود
    console.log("🧭 ProfileSidebar received navigate:", !!navigate);
    return (
        <div
            className="card-body text-center p-4"
            style={{ textAlign: "right" }}
        >
            {" "}
            {/* إضافة textAlign: right */}
            <div className="mb-3">
                {imageError[user?._id] ? (
                    <div
                        className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                            width: 100,
                            height: 100,
                            backgroundColor: userColor,
                            fontSize: 36,
                        }}
                    >
                        {userInitial}
                    </div>
                ) : avatarUrl && avatarUrl !== "/default-avatar.png" ? (
                    <img
                        src={avatarUrl}
                        alt={user?.name}
                        className="rounded-circle"
                        style={{ width: 100, height: 100, objectFit: "cover" }}
                        onError={() => handleImageError(user?._id)}
                    />
                ) : (
                    <div
                        className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                            width: 100,
                            height: 100,
                            backgroundColor: userColor,
                            fontSize: 36,
                        }}
                    >
                        {userInitial}
                    </div>
                )}
            </div>
            <h4 className="fw-bold mb-1">{user?.name}</h4>
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3">
                {user?.role === "admin"
                    ? "مشرف"
                    : user?.role === "teacher"
                      ? "معلم"
                      : "طالب"}
            </span>
            {user?.bio && <p className="text-muted small px-3">{user.bio}</p>}
            {/* إحصائيات المتابعة */}
            <div className="d-flex justify-content-around my-3 py-2 border-top border-bottom">
                <div
                    className="text-center follow-stats"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowFollowers(true)}
                >
                    <div className="h5 mb-0">{user?.followersCount || 0}</div>
                    <small className="text-muted">متابعون</small>
                </div>
                <div
                    className="text-center follow-stats"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowFollowing(true)}
                >
                    <div className="h5 mb-0">{user?.followingCount || 0}</div>
                    <small className="text-muted">يتابع</small>
                </div>
                <div className="text-center">
                    <div className="h5 mb-0">{user?.projectsCount || 0}</div>
                    <small className="text-muted">مشاريع</small>
                </div>
            </div>
            {/* روابط التواصل الاجتماعي - مع محاذاة لليمين */}
            {(user?.socialLinks?.github ||
                user?.socialLinks?.linkedin ||
                user?.socialLinks?.twitter) && (
                <div
                    className="mt-3 text-start bg-light p-3 rounded-3"
                    style={{ textAlign: "right" }}
                >
                    {" "}
                    {/* إضافة textAlign: right */}
                    <h6 className="fw-bold mb-2">تواصل معي</h6>
                    {user.socialLinks?.github && (
                        <div className="small mb-1 d-flex align-items-center">
                            <i className="bi bi-github ms-2"></i>{" "}
                            <a
                                href={user.socialLinks.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none"
                            >
                                GitHub
                            </a>
                        </div>
                    )}
                    {user.socialLinks?.linkedin && (
                        <div className="small mb-1 d-flex align-items-center">
                            <i className="bi bi-linkedin ms-2"></i>{" "}
                            <a
                                href={user.socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none"
                            >
                                LinkedIn
                            </a>
                        </div>
                    )}
                    {user.socialLinks?.twitter && (
                        <div className="small mb-1 d-flex align-items-center">
                            <i className="bi bi-twitter ms-2"></i>{" "}
                            <a
                                href={user.socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none"
                            >
                                Twitter
                            </a>
                        </div>
                    )}
                </div>
            )}
            {/* المهارات والشهادات - في الجهة اليمنى */}
            {user?.role !== "admin" && (
                <div className="d-flex flex-column align-items-end mt-3">
                    {" "}
                    {/* ← هذا هو المهم */}
                    <h6 className="fw-bold mb-2 d-flex align-items-center">
                        <i className="bi bi-code-square ms-2"></i>
                        المهارات
                    </h6>
                    <div className="d-flex flex-wrap gap-2 mb-3 justify-content-end">
                        {" "}
                        {/* ← هذا أيضاً */}
                        {(user?.skills || []).map((s, i) => (
                            <span
                                key={i}
                                className="badge bg-light text-dark px-3 py-2 rounded-pill"
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                    <h6 className="fw-bold mb-2 d-flex align-items-center">
                        <i className="bi bi-award ms-2"></i>
                        الشهادات
                    </h6>
                    <div className="w-100">
                        {" "}
                        {/* لجعل العناصر بعرض كامل مع محاذاة يمنى */}
                        {(user?.certifications || []).map((c, i) => (
                            <div
                                key={i}
                                className="mb-2 d-flex justify-content-end"
                            >
                                {" "}
                                {/* محاذاة يمنى */}
                                <div className="text-end">
                                    {" "}
                                    {/* نص بمحاذاة يمنى */}
                                    <span className="fw-bold">
                                        {c.title}
                                    </span> — {c.issuer}
                                    {c.date &&
                                        ` (${new Date(c.date).getFullYear()})`}
                                    {c.credentialUrl && (
                                        <a
                                            href={c.credentialUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary me-2"
                                        >
                                            <i className="bi bi-box-arrow-up-right"></i>
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <button
                className="btn btn-outline-primary rounded-pill px-4 mt-3"
                onClick={onStartEdit}
            >
                <i className="bi bi-pencil ms-2"></i> تعديل الملف
            </button>
            {/* مودالات المتابعة */}
            {showFollowers && (
                <FollowersModal
                    userId={user._id}
                    type="followers"
                    onClose={() => setShowFollowers(false)}
                />
            )}
            {showFollowing && (
                <FollowersModal
                    userId={user._id}
                    type="following"
                    onClose={() => setShowFollowing(false)}
                />
            )}
        </div>
    );
}
