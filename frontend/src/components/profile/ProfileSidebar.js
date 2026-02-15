import React from "react";
import CertificationFields from "./CertificationFields";

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
}) {
    const handleAddCertification = () => {
        setForm((f) => ({
            ...f,
            certifications: [
                ...(f.certifications || []),
                { title: "", issuer: "", date: "", credentialId: "" },
            ],
        }));
    };
    const handleRemoveCertification = (idx) => {
        setForm((f) => ({
            ...f,
            certifications: f.certifications.filter((_, i) => i !== idx),
        }));
    };
    const handleCertificationChange = (idx, field, value) => {
        setForm((f) => {
            const updated = [...f.certifications];
            updated[idx] = { ...updated[idx], [field]: value };
            return { ...f, certifications: updated };
        });
    };

    // ألوان للصورة الرمزية
    const avatarColors = [
        "#4f46e5",
        "#0891b2",
        "#b45309",
        "#a21caf",
        "#be123c",
        "#15803d",
    ];
    const colorIndex = (user?._id?.charCodeAt(0) || 0) % avatarColors.length;
    const avatarBg = avatarColors[colorIndex];
    const userInitial = user?.name?.charAt(0) || "U";

    if (isViewingOther) {
        const otherInitial = viewUser?.name?.charAt(0) || "U";
        const otherColorIndex =
            (viewUser?._id?.charCodeAt(0) || 0) % avatarColors.length;
        const otherAvatarBg = avatarColors[otherColorIndex];
        return (
            <div className="card-body text-center p-4">
                <div className="mb-3">
                    <div
                        className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                            width: 100,
                            height: 100,
                            backgroundColor: otherAvatarBg,
                            fontSize: 36,
                        }}
                    >
                        {otherInitial}
                    </div>
                </div>
                <h4 className="fw-bold mb-1">{viewUser?.name || "مستخدم"}</h4>
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3">
                    {viewUser?.role || ""}
                </span>
                {viewUser?.bio && (
                    <p className="text-muted small px-3">{viewUser.bio}</p>
                )}
                <div className="mt-3 text-start bg-light p-3 rounded-3">
                    <h6 className="fw-bold mb-2">اتصل بالمستخدم</h6>
                    <div className="small mb-1">
                        <i className="bi bi-envelope ms-2"></i>{" "}
                        {viewUser?.email || "غير متاح"}
                    </div>
                    <div className="small mb-1">
                        <i className="bi bi-github ms-2"></i>{" "}
                        {viewUser?.socialLinks?.github || "-"}
                    </div>
                    <div className="small">
                        <i className="bi bi-linkedin ms-2"></i>{" "}
                        {viewUser?.socialLinks?.linkedin || "-"}
                    </div>
                </div>
            </div>
        );
    }

    if (editing) {
        return (
            <div className="card-body p-4">
                <div className="mb-2">
                    <label className="form-label fw-medium">الاسم</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={onFieldChange}
                        className="form-control rounded-3"
                    />
                </div>
                <div className="mb-2">
                    <label className="form-label fw-medium">نبذة</label>
                    <textarea
                        name="bio"
                        value={form.bio}
                        onChange={onFieldChange}
                        className="form-control rounded-3"
                        rows="3"
                    />
                </div>
                {user?.role !== "admin" && (
                    <>
                        <div className="mb-2">
                            <label className="form-label fw-medium">
                                المهارات (مفصولة بفواصل)
                            </label>
                            <input
                                name="skills"
                                value={form.skills}
                                onChange={onFieldChange}
                                className="form-control rounded-3"
                                placeholder="مثال: React, Node.js, UX"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="form-label fw-medium">
                                الشهادات
                            </label>
                            {form.certifications.map((cert, idx) => (
                                <CertificationFields
                                    key={idx}
                                    cert={cert}
                                    idx={idx}
                                    onChange={handleCertificationChange}
                                    onRemove={handleRemoveCertification}
                                />
                            ))}
                            <button
                                className="btn btn-outline-primary btn-sm w-100 rounded-pill mt-2"
                                onClick={handleAddCertification}
                            >
                                <i className="bi bi-plus-circle ms-1"></i> إضافة
                                شهادة
                            </button>
                        </div>
                    </>
                )}
                {error && (
                    <div className="alert alert-danger rounded-3">{error}</div>
                )}
                <div className="d-flex gap-2 mt-3">
                    <button
                        className="btn btn-primary flex-grow-1 rounded-pill"
                        onClick={onSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm ms-2" />
                        ) : (
                            "حفظ"
                        )}
                    </button>
                    <button
                        className="btn btn-outline-secondary rounded-pill"
                        onClick={onCancelEdit}
                        disabled={loading}
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        );
    }

    // العرض العادي
    return (
        <div className="card-body text-center p-4">
            <div className="mb-3">
                <div
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                        width: 100,
                        height: 100,
                        backgroundColor: avatarBg,
                        fontSize: 36,
                    }}
                >
                    {userInitial}
                </div>
            </div>
            <h4 className="fw-bold mb-1">{user.name}</h4>
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3">
                {user.role}
            </span>
            {user?.bio && <p className="text-muted small px-3">{user.bio}</p>}
            {user?.role !== "admin" && (
                <>
                    <div className="text-start mt-3">
                        <h6 className="fw-bold mb-2">المهارات</h6>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {(user.skills || []).map((s, i) => (
                                <span
                                    key={i}
                                    className="badge bg-light text-dark px-3 py-2 rounded-pill"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                        <h6 className="fw-bold mb-2">الشهادات</h6>
                        <ul className="list-unstyled small">
                            {(user.certifications || []).map((c, i) => (
                                <li key={i} className="mb-2">
                                    <i className="bi bi-award ms-2 text-primary"></i>{" "}
                                    {c.title} — {c.issuer}{" "}
                                    {c.date
                                        ? `(${new Date(c.date).getFullYear()})`
                                        : ""}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
            <button
                className="btn btn-outline-primary rounded-pill px-4 mt-3"
                onClick={onStartEdit}
            >
                <i className="bi bi-pencil ms-2"></i> تعديل الملف
            </button>
        </div>
    );
}
