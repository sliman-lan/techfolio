import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { projectsAPI, usersAPI } from "../services/api";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileProjects from "../components/profile/ProfileProjects";
import AddProjectModal from "../components/profile/AddProjectModal";
import EditProjectModal from "../components/profile/EditProjectModal";

export default function Profile({ navigate, params }) {
    const { user, updateProfile } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: "",
        bio: "",
        skills: "",
        certifications: [],
        socialLinks: { github: "", linkedin: "", twitter: "" },
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [projForm, setProjForm] = useState({
        title: "",
        description: "",
        shortDescription: "",
        category: "web",
        tags: [],
        technologies: [],
        demoUrl: "",
        githubUrl: "",
        isPublic: true,
        images: [],
    });
    const [projLoading, setProjLoading] = useState(false);
    const [projError, setProjError] = useState(null);

    const [viewUser, setViewUser] = useState(null);
    const [userProjects, setUserProjects] = useState([]);
    const [adminStats, setAdminStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        recentPending: [],
    });

    const [editingProject, setEditingProject] = useState(null);
    const [editProjectLoading, setEditProjectLoading] = useState(false);
    const [editProjectError, setEditProjectError] = useState(null);

    // حالات خاصة بالمعلم
    const [ratedProjects, setRatedProjects] = useState([]);
    const [teacherStats, setTeacherStats] = useState({
        totalRatings: 0,
        averageRating: 0,
        userId: user?._id,
    });

    // تعيين المتغيرات العامة للتشخيص
    useEffect(() => {
        if (user) {
            window.currentUserId = user._id;
            window.userRole = user.role;
            console.log("✅ User set in window:", {
                id: user._id,
                role: user.role,
            });
        } else {
            window.currentUserId = undefined;
            window.userRole = undefined;
        }
    }, [user]);

    const handleEditProject = async (projectId) => {
        console.log("🖱️ Edit clicked for project:", projectId);
        try {
            setEditProjectLoading(true);
            const res = await projectsAPI.getForEdit(projectId);
            const projectData = res.data?.data || res.data;
            console.log("📦 Project data loaded:", projectData);
            setEditingProject(projectData);
        } catch (err) {
            console.error("❌ فشل جلب بيانات المشروع للتعديل", err);
            alert("حدث خطأ أثناء تحميل بيانات المشروع");
        } finally {
            setEditProjectLoading(false);
        }
    };

    const handleSaveProject = async (updatedData, imagesToKeep) => {
        setEditProjectError(null);
        setEditProjectLoading(true);

        try {
            const formData = new FormData();

            // إضافة الحقول النصية الأساسية
            formData.append("title", updatedData.title);
            formData.append("description", updatedData.description);
            formData.append(
                "shortDescription",
                updatedData.shortDescription || "",
            );
            formData.append("category", updatedData.category);

            // إضافة الحقول الاختيارية
            if (updatedData.level) formData.append("level", updatedData.level);
            if (updatedData.demoUrl)
                formData.append("demoUrl", updatedData.demoUrl);
            if (updatedData.githubUrl)
                formData.append("githubUrl", updatedData.githubUrl);
            if (updatedData.videoUrl)
                formData.append("videoUrl", updatedData.videoUrl);

            // isPublic
            formData.append(
                "isPublic",
                updatedData.isPublic ? "true" : "false",
            );

            // معالجة الصور الموجودة
            if (imagesToKeep && imagesToKeep.length > 0) {
                formData.append("existingImages", JSON.stringify(imagesToKeep));
            }

            // إضافة الصور الجديدة
            if (updatedData.images && updatedData.images.length > 0) {
                updatedData.images.forEach((file) => {
                    formData.append("images", file);
                });
            }

            // إضافة المصفوفات
            if (updatedData.tags && updatedData.tags.length > 0) {
                formData.append("tags", JSON.stringify(updatedData.tags));
            } else {
                formData.append("tags", JSON.stringify([]));
            }

            if (
                updatedData.technologies &&
                updatedData.technologies.length > 0
            ) {
                formData.append(
                    "technologies",
                    JSON.stringify(updatedData.technologies),
                );
            } else {
                formData.append("technologies", JSON.stringify([]));
            }

            // طباعة محتوى formData للتشخيص
            console.log("📤 Sending FormData:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }

            await projectsAPI.update(editingProject._id, formData);

            // إعادة تحميل المشاريع
            const ownerId = params?.userId || user?._id;
            const projRes = await projectsAPI.list({ userId: ownerId });
            setUserProjects(projRes.data || []);

            setEditingProject(null);
            alert("✅ تم تحديث المشروع بنجاح");
        } catch (err) {
            console.error("❌ فشل تحديث المشروع", err);
            console.error("❌ Error response:", err.response?.data);
            setEditProjectError(
                err.response?.data?.message || "حدث خطأ أثناء التحديث",
            );
        } finally {
            setEditProjectLoading(false);
        }
    };

    const handleAvatarUpload = async (file) => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("avatar", file);

            console.log(
                "📤 Uploading avatar:",
                file.name,
                file.type,
                file.size,
            );

            const res = await usersAPI.updateProfile(formData);
            console.log("📥 Upload response:", res.data);

            // تحديث بيانات المستخدم
            await updateProfile(res.data);

            alert("✅ تم تحديث الصورة بنجاح");
        } catch (err) {
            console.error("❌ فشل تحديث الصورة:", err);
            console.error("❌ Error response:", err.response?.data);
            setError(err.response?.data?.message || "فشل تحديث الصورة");
        } finally {
            setLoading(false);
        }
    };

    // جلب المشاريع التي قيمها المعلم
    const fetchRatedProjects = async () => {
        try {
            console.log("📥 Fetching rated projects for teacher:", user._id);
            const res = await projectsAPI.getRatedByUser(user._id);
            const projects = res.data?.data || res.data || [];
            console.log("✅ Rated projects received:", projects);
            setRatedProjects(projects);

            // حساب الإحصائيات مع معالجة أنواع المعرفات
            let total = 0;
            let sum = 0;
            projects.forEach((p) => {
                const userRating = p.ratings?.find((r) => {
                    const ratingUserId = r.userId?._id || r.userId;
                    return ratingUserId?.toString() === user._id.toString();
                });
                if (userRating) {
                    total++;
                    sum += userRating.value;
                }
            });
            setTeacherStats({
                totalRatings: total,
                averageRating: total > 0 ? sum / total : 0,
                userId: user._id,
            });
        } catch (err) {
            console.error("❌ فشل جلب المشاريع المُقيمة:", err);
        }
    };

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                bio: user.bio || "",
                skills: Array.isArray(user.skills)
                    ? user.skills.join(", ")
                    : user.skills || "",
                certifications: Array.isArray(user.certifications)
                    ? user.certifications
                    : [],
                socialLinks: {
                    github: user.socialLinks?.github || "",
                    linkedin: user.socialLinks?.linkedin || "",
                    twitter: user.socialLinks?.twitter || "",
                },
            });
        }
    }, [user]);

    // تحميل بيانات الملف الشخصي (للمستخدم الحالي أو مستخدم آخر)
    useEffect(() => {
        let mounted = true;

        async function loadData() {
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
                    console.log(
                        "📦 Projects loaded for user:",
                        ownerId,
                        projRes.data,
                    );
                } else {
                    setUserProjects([]);
                }

                if (!params?.userId && user?.role === "admin") {
                    const statsRes = await projectsAPI.adminList();
                    if (!mounted) return;
                    const projects = statsRes.data?.data || statsRes.data || [];
                    const total = projects.length;
                    const approved = projects.filter(
                        (p) => p.status === "approved",
                    ).length;
                    const pending = projects.filter(
                        (p) => p.status === "pending",
                    ).length;
                    const recentPending = projects
                        .filter((p) => p.status === "pending")
                        .slice(0, 5);

                    setAdminStats({
                        total,
                        approved,
                        pending,
                        recentPending,
                    });
                }
            } catch (err) {
                if (!mounted) return;
                setViewUser(null);
                setUserProjects([]);
                console.error("Error loading profile data", err);
            }
        }

        loadData();

        return () => {
            mounted = false;
        };
    }, [params, user]);

    // جلب المشاريع المقيمة للمعلم
  useEffect(() => {
    if (user?.role === "teacher" && !params?.userId) {
        const fetchRatedProjects = async () => {
            try {
                console.log("📥 Fetching rated projects for teacher:", user._id);
                const res = await projectsAPI.getRatedByUser(user._id);
                const projects = res.data?.data || res.data || [];
                console.log("✅ Rated projects received:", projects);
                setRatedProjects(projects);

                // حساب الإحصائيات مع معالجة أنواع المعرفات
                let total = 0;
                let sum = 0;
                projects.forEach((p) => {
                    const userRating = p.ratings?.find((r) => {
                        const ratingUserId = r.userId?._id || r.userId;
                        return ratingUserId?.toString() === user._id.toString();
                    });
                    if (userRating) {
                        total++;
                        sum += userRating.value;
                    }
                });
                setTeacherStats({
                    totalRatings: total,
                    averageRating: total > 0 ? sum / total : 0,
                    userId: user._id,
                });
            } catch (err) {
                console.error("❌ فشل جلب المشاريع المُقيمة:", err);
            }
        };
        fetchRatedProjects();
    }
}, [user, params]);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleDeleteProject = async (projectId) => {
        console.log("🗑️ Delete clicked for project:", projectId);

        if (
            !window.confirm(
                "هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.",
            )
        ) {
            return;
        }

        try {
            setLoading(true);
            console.log("📤 Sending delete request...");
            const res = await projectsAPI.delete(projectId);
            console.log("📥 Delete response:", res);

            const ownerId = params?.userId || user?._id;
            const projRes = await projectsAPI.list({ userId: ownerId });
            setUserProjects(projRes.data || []);

            alert("✅ تم حذف المشروع بنجاح");
        } catch (err) {
            console.error("❌ فشل حذف المشروع:", err);
            console.error("❌ Error response:", err.response?.data);
            const errorMsg =
                err.response?.data?.message ||
                err.message ||
                "حدث خطأ أثناء حذف المشروع";
            alert(`❌ ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setError(null);
        setLoading(true);
        try {
            let payload;
            if (user?.role === "admin") {
                payload = { name: form.name, bio: form.bio };
            } else {
                payload = {
                    name: form.name,
                    bio: form.bio,
                    skills: form.skills
                        ? form.skills
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                        : [],
                    certifications: Array.isArray(form.certifications)
                        ? form.certifications
                        : [],
                    socialLinks: form.socialLinks,
                };
            }

            await updateProfile(payload);
            setEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || "حدث خطأ أثناء الحفظ");
        } finally {
            setLoading(false);
        }
    };

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
                    <ProfileSidebar
                        user={user}
                        viewUser={viewUser}
                        isViewingOther={isViewingOther}
                        editing={editing}
                        form={form}
                        setForm={setForm}
                        loading={loading}
                        error={error}
                        onFieldChange={handleChange}
                        onSave={handleSave}
                        onCancelEdit={() => setEditing(false)}
                        onStartEdit={() => setEditing(true)}
                        onAvatarUpload={handleAvatarUpload}
                        navigate={navigate}
                    />
                </div>
            </div>
            <div className="col-12 col-md-8">
                <ProfileProjects
                    isViewingOther={isViewingOther}
                    user={user}
                    userProjects={userProjects}
                    ratedProjects={ratedProjects}
                    teacherStats={teacherStats}
                    adminStats={adminStats}
                    onAddProject={() => setShowProjectModal(true)}
                    navigate={navigate}
                    onEditProject={handleEditProject}
                    onDeleteProject={handleDeleteProject}
                    onApproveProject={(id) => console.log("Approve", id)}
                    onRejectProject={(id) => console.log("Reject", id)}
                />
            </div>

            {showProjectModal && (
                <AddProjectModal
                    show={showProjectModal}
                    onClose={() => setShowProjectModal(false)}
                    projForm={projForm}
                    setProjForm={setProjForm}
                    projLoading={projLoading}
                    projError={projError}
                    setProjError={setProjError}
                    setProjLoading={setProjLoading}
                    onCreate={async () => {
                        setProjError(null);
                        if (
                            !projForm.title ||
                            projForm.title.trim().length === 0
                        ) {
                            setProjError("العنوان مطلوب");
                            return;
                        }
                        if (
                            !projForm.description ||
                            projForm.description.trim().length === 0
                        ) {
                            setProjError("الوصف الطويل مطلوب");
                            return;
                        }
                        setProjLoading(true);
                        try {
                            const formData = new FormData();
                            formData.append("title", projForm.title);
                            formData.append(
                                "description",
                                projForm.description,
                            );
                            formData.append(
                                "shortDescription",
                                projForm.shortDescription || "",
                            );
                            formData.append("category", projForm.category);
                            if (projForm.demoUrl)
                                formData.append("demoUrl", projForm.demoUrl);
                            if (projForm.githubUrl)
                                formData.append(
                                    "githubUrl",
                                    projForm.githubUrl,
                                );

                            if (projForm.tags && Array.isArray(projForm.tags)) {
                                projForm.tags.forEach((tag) =>
                                    formData.append("tags", tag),
                                );
                            }

                            if (
                                projForm.technologies &&
                                Array.isArray(projForm.technologies)
                            ) {
                                projForm.technologies.forEach((tech) =>
                                    formData.append("technologies", tech),
                                );
                            }

                            formData.append(
                                "isPublic",
                                projForm.isPublic ? "true" : "false",
                            );

                            for (const file of projForm.images || []) {
                                formData.append("images", file);
                            }

                            await projectsAPI.create(formData);

                            setShowProjectModal(false);

                            const ownerId = params?.userId || user?._id;
                            const projRes = await projectsAPI.list({
                                userId: ownerId,
                            });
                            setUserProjects(projRes.data || []);

                            alert("✅ تم إنشاء المشروع بنجاح");
                        } catch (err) {
                            console.error("❌ Error:", err);
                            const errorMsg =
                                err.response?.data?.message ||
                                err.response?.data?.error ||
                                err.message ||
                                "حدث خطأ أثناء إنشاء المشروع";
                            setProjError(errorMsg);
                        } finally {
                            setProjLoading(false);
                        }
                    }}
                />
            )}

            {editingProject && (
                <EditProjectModal
                    show={!!editingProject}
                    onClose={() => setEditingProject(null)}
                    project={editingProject}
                    onSave={handleSaveProject}
                    loading={editProjectLoading}
                    error={editProjectError}
                />
            )}
        </div>
    );
}
