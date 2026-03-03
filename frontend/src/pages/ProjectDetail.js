import React, { useEffect, useState, useContext } from "react";
import useComments from "../hooks/useComments";
import ProjectInfo from "../components/project/ProjectInfo";
import ProjectImages from "../components/project/ProjectImages";
import CommentForm from "../components/project/CommentForm";
import CommentList from "../components/project/CommentList";
import { projectsAPI } from "../services/api";
import AuthContext from "../context/AuthContext";

export default function ProjectDetail({ id, navigate, asAdmin = false }) {
    const { user } = useContext(AuthContext);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedProjects, setRelatedProjects] = useState([]);
    const {
        comments,
        loading: commentsLoading,
        addComment,
        toggleLike,
    } = useComments(id);

    console.log("🔍 ProjectDetail props:", {
        id,
        asAdmin,
        userRole: user?.role,
    });

    useEffect(() => {
        fetchProject();
    }, [id, asAdmin]);

    const fetchProject = async () => {
        setLoading(true);
        console.log("📥 Fetching project:", id, "asAdmin:", asAdmin);

        try {
            let res;

            // ✅ إذا كان المشرف وتم تمرير asAdmin = true، استخدم المسار الخاص
            if (asAdmin && user?.role === "admin") {
                console.log("👑 Admin fetching project with admin route");
                res = await projectsAPI.getProjectForAdmin(id);
                setProject(res.data?.data || res.data);
            } else {
                // المسار العادي للمستخدمين
                console.log("👤 Regular user fetching project");
                res = await projectsAPI.get(id);
                setProject(res.data);
            }

            console.log("✅ Project fetched successfully:", res.data);

            // زيادة عدد المشاهدات (اختياري)
            try {
                await projectsAPI.incrementViews(id);
            } catch (viewErr) {
                console.log("👁️ Cannot increment views:", viewErr.message);
            }
        } catch (err) {
            console.error("❌ فشل جلب المشروع:", err);
            console.error("❌ Error details:", err.response?.data);
            setError(err.response?.data?.message || "حدث خطأ في تحميل المشروع");
        } finally {
            setLoading(false);
        }
    };

    // جلب مشاريع مشابهة
    useEffect(() => {
        if (project?.category) {
            projectsAPI
                .list({ category: project.category, limit: 4 })
                .then((res) => {
                    const projectsList = res.data || [];
                    const filtered = projectsList.filter((p) => p._id !== id);
                    setRelatedProjects(filtered.slice(0, 3));
                })
                .catch(() => {});
        }
    }, [project?.category, id]);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">جارٍ التحميل...</span>
                </div>
                <p className="mt-2 text-muted">جاري تحميل المشروع...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger rounded-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
            </div>
        );
    }

    if (!project) {
        return (
            <div className="alert alert-warning rounded-3">
                <i className="bi bi-question-circle me-2"></i>
                المشروع غير موجود
            </div>
        );
    }

    return (
        <div>
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
                {/* معرض الصور */}
                {project.images && project.images.length > 0 && (
                    <ProjectImages
                        images={project.images}
                        title={project.title}
                    />
                )}

                <ProjectInfo project={project} navigate={navigate} />

                {/* قسم التعليقات */}
                <div className="card-body p-4 border-top">
                    <h5 className="fw-bold mb-4">
                        <i className="bi bi-chat-dots me-2"></i>
                        التعليقات
                    </h5>
                    <CommentForm onSubmit={addComment} />
                    <CommentList
                        comments={comments}
                        loading={commentsLoading}
                        onToggleLike={toggleLike}
                    />
                </div>
            </div>

            {/* مشاريع مشابهة */}
            {relatedProjects.length > 0 && (
                <div className="mt-5">
                    <h5 className="fw-bold mb-3">
                        <i className="bi bi-diagram-3 me-2"></i>
                        مشاريع مشابهة
                    </h5>
                    <div className="row g-3">
                        {relatedProjects.map((p) => (
                            <div key={p._id} className="col-md-4">
                                <div
                                    className="card h-100 shadow-sm border-0 rounded-3 cursor-pointer"
                                    onClick={() =>
                                        navigate("project", { id: p._id })
                                    }
                                    style={{ cursor: "pointer" }}
                                >
                                    {p.images?.[0] && (
                                        <img
                                            src={p.images[0]}
                                            className="card-img-top"
                                            alt={p.title}
                                            style={{
                                                height: "150px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    )}
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-2">
                                            {p.title}
                                        </h6>
                                        <p className="small text-muted">
                                            {p.shortDescription ||
                                                p.description?.substring(
                                                    0,
                                                    60,
                                                ) + "..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
