import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { projectsAPI, usersAPI } from "../services/api";

export default function Profile({ navigate, params }) {
    const { user, updateProfile } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: "", bio: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [projForm, setProjForm] = useState({
        title: "",
        description: "",
        shortDescription: "",
        category: "web",
        demoUrl: "",
        githubUrl: "",
        images: [],
    });
    const [projLoading, setProjLoading] = useState(false);
    const [projError, setProjError] = useState(null);

    const [viewUser, setViewUser] = useState(null); // the profile being viewed (could be other user)
    const [userProjects, setUserProjects] = useState([]);

    useEffect(() => {
        setForm({ name: user?.name || "", bio: user?.bio || "" });
    }, [user]);

    // Load profile (other user) and projects for the profile owner (params.userId || logged-in user)
    useEffect(() => {
        let mounted = true;
        async function loadUserViewAndProjects() {
            try {
                if (params?.userId) {
                    const res = await usersAPI.getProfile(params.userId);
                    if (!mounted) return;
                    setViewUser(res.data);
                } else {
                    setViewUser(null);
                }

                const ownerId = params?.userId || user?._id;
                if (ownerId) {
                    const projRes = await projectsAPI.list({ userId: ownerId });
                    if (!mounted) return;
                    setUserProjects(projRes.data || []);
                } else {
                    setUserProjects([]);
                }
            } catch (err) {
                if (!mounted) return;
                setViewUser(null);
                setUserProjects([]);
            }
        }
        loadUserViewAndProjects();
        return () => (mounted = false);
    }, [params, user]);

    useEffect(() => {
        if (params?.openAddProject) {
            setShowProjectModal(true);
        }
    }, [params]);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        setError(null);
        setLoading(true);
        try {
            await updateProfile(form);
            setEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || "حدث خطأ أثناء الحفظ");
        } finally {
            setLoading(false);
        }
    };

    // If viewing another user's profile, show that user's public data
    const isViewingOther = params?.userId && params.userId !== user?._id;
    if (!user && !isViewingOther) {
        return (
            <div className="alert alert-info">
                يرجى تسجيل الدخول لعرض الملف الشخصي
            </div>
        );
    }

    return (
        <div className="row">
            <div className="col-12 col-md-4">
                <div className="card mb-3 shadow-sm">
                    <div className="card-body text-center">
                        <div className="mb-2">
                            <div
                                className="rounded-circle bg-secondary"
                                style={{
                                    width: 96,
                                    height: 96,
                                    display: "inline-block",
                                }}
                            />
                        </div>

                        {isViewingOther ? (
                            <>
                                <h5 className="card-title">
                                    {viewUser?.name || "مستخدم"}
                                </h5>
                                <p className="text-muted">
                                    {viewUser?.role || ""}
                                </p>
                                <p className="small">{viewUser?.bio}</p>
                                <div className="mt-2 text-start">
                                    <strong>اتصل بالمستخدم:</strong>
                                    <div className="small">
                                        البريد: {viewUser?.email || "غير متاح"}
                                    </div>
                                    <div className="small">
                                        GitHub:{" "}
                                        {viewUser?.socialLinks?.github || "-"}
                                    </div>
                                    <div className="small">
                                        LinkedIn:{" "}
                                        {viewUser?.socialLinks?.linkedin || "-"}
                                    </div>
                                </div>
                            </>
                        ) : !editing ? (
                            <>
                                <h5 className="card-title">{user.name}</h5>
                                <p className="text-muted">{user.role}</p>
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => setEditing(true)}
                                >
                                    تعديل الملف
                                </button>
                            </>
                        ) : (
                            <div>
                                <div className="mb-2">
                                    <label className="form-label">الاسم</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">نبذة</label>
                                    <textarea
                                        name="bio"
                                        value={form.bio}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                                {error && (
                                    <div className="alert alert-danger">
                                        {error}
                                    </div>
                                )}
                                <div className="d-flex justify-content-center">
                                    <button
                                        className="btn btn-primary btn-sm me-2"
                                        onClick={handleSave}
                                        disabled={loading}
                                    >
                                        {loading ? "جارٍ الحفظ..." : "حفظ"}
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setEditing(false)}
                                        disabled={loading}
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="col-12 col-md-8">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">
                                {isViewingOther ? "مشاريع المستخدم" : "مشاريعك"}
                            </h5>
                            {!isViewingOther && (
                                <button
                                    className="btn btn-success btn-sm d-flex align-items-center"
                                    style={{
                                        borderRadius: "0.5rem",
                                        padding: "0.35rem 0.6rem",
                                    }}
                                    onClick={() => setShowProjectModal(true)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden
                                    >
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                    <span style={{ marginInlineStart: 8 }}>
                                        إضافة مشروع جديد
                                    </span>
                                </button>
                            )}
                        </div>

                        {userProjects.length === 0 ? (
                            <div className="alert alert-info">
                                لا توجد مشاريع.
                                {!isViewingOther && (
                                    <div className="mt-2 text-muted">
                                        استخدم زر إضافة مشروع لإنشاء مشروع جديد.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="row g-3">
                                {userProjects.map((p) => (
                                    <div
                                        className="col-12 col-md-6"
                                        key={p._id}
                                    >
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h6>{p.title}</h6>
                                                <p className="small text-muted">
                                                    {p.shortDescription}
                                                </p>
                                                <button
                                                    className="btn btn-link"
                                                    onClick={() =>
                                                        navigate &&
                                                        navigate("project", {
                                                            id: p._id,
                                                        })
                                                    }
                                                >
                                                    عرض التفاصيل
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showProjectModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.65)",
                        zIndex: 1050,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        className="modal d-block"
                        tabIndex="-1"
                        role="dialog"
                        style={{ zIndex: 1060 }}
                    >
                        <div
                            className="modal-dialog modal-dialog-centered"
                            role="document"
                        >
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        إضافة مشروع جديد
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={() =>
                                            setShowProjectModal(false)
                                        }
                                    />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-2">
                                        <label className="form-label">
                                            العنوان
                                        </label>
                                        <input
                                            name="title"
                                            value={projForm.title}
                                            onChange={(e) =>
                                                setProjForm((f) => ({
                                                    ...f,
                                                    title: e.target.value,
                                                }))
                                            }
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">
                                            وصف طويل
                                        </label>
                                        <textarea
                                            name="description"
                                            value={projForm.description}
                                            onChange={(e) =>
                                                setProjForm((f) => ({
                                                    ...f,
                                                    description: e.target.value,
                                                }))
                                            }
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">
                                            وصف مختصر
                                        </label>
                                        <input
                                            name="shortDescription"
                                            value={projForm.shortDescription}
                                            onChange={(e) =>
                                                setProjForm((f) => ({
                                                    ...f,
                                                    shortDescription:
                                                        e.target.value,
                                                }))
                                            }
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">
                                            رابط العرض (اختياري)
                                        </label>
                                        <input
                                            name="demoUrl"
                                            value={projForm.demoUrl}
                                            onChange={(e) =>
                                                setProjForm((f) => ({
                                                    ...f,
                                                    demoUrl: e.target.value,
                                                }))
                                            }
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">
                                            رابط GitHub (اختياري)
                                        </label>
                                        <input
                                            name="githubUrl"
                                            value={projForm.githubUrl}
                                            onChange={(e) =>
                                                setProjForm((f) => ({
                                                    ...f,
                                                    githubUrl: e.target.value,
                                                }))
                                            }
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">
                                            صور المشروع (اختياري)
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) =>
                                                setProjForm((f) => ({
                                                    ...f,
                                                    images: Array.from(
                                                        e.target.files
                                                    ),
                                                }))
                                            }
                                            className="form-control"
                                        />
                                    </div>
                                    {projError && (
                                        <div className="alert alert-danger">
                                            {projError}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            setShowProjectModal(false)
                                        }
                                        disabled={projLoading}
                                    >
                                        إغلاق
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={async () => {
                                            setProjError(null);
                                            if (
                                                !projForm.title ||
                                                projForm.title.trim().length ===
                                                    0
                                            ) {
                                                setProjError("العنوان مطلوب");
                                                return;
                                            }
                                            setProjLoading(true);
                                            try {
                                                const formData = new FormData();
                                                formData.append(
                                                    "title",
                                                    projForm.title
                                                );
                                                formData.append(
                                                    "description",
                                                    projForm.description || ""
                                                );
                                                formData.append(
                                                    "shortDescription",
                                                    projForm.shortDescription ||
                                                        ""
                                                );
                                                formData.append(
                                                    "category",
                                                    projForm.category || "web"
                                                );
                                                if (projForm.demoUrl)
                                                    formData.append(
                                                        "demoUrl",
                                                        projForm.demoUrl
                                                    );
                                                if (projForm.githubUrl)
                                                    formData.append(
                                                        "githubUrl",
                                                        projForm.githubUrl
                                                    );
                                                for (const file of projForm.images ||
                                                    []) {
                                                    formData.append(
                                                        "images",
                                                        file
                                                    );
                                                }
                                                const res =
                                                    await projectsAPI.create(
                                                        formData
                                                    );
                                                const created = res.data;
                                                setShowProjectModal(false);
                                                // navigate to the newly created project's detail
                                                if (created && created._id) {
                                                    navigate &&
                                                        navigate("project", {
                                                            id: created._id,
                                                        });
                                                } else {
                                                    alert(
                                                        "تم إنشاء المشروع بنجاح"
                                                    );
                                                }
                                            } catch (err) {
                                                setProjError(
                                                    err.response?.data
                                                        ?.message ||
                                                        "حدث خطأ أثناء إنشاء المشروع"
                                                );
                                            } finally {
                                                setProjLoading(false);
                                            }
                                        }}
                                        disabled={projLoading}
                                    >
                                        {projLoading
                                            ? "جارٍ الإنشاء..."
                                            : "إنشاء"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
