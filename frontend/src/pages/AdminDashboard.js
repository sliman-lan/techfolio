import React, { useEffect, useState, useContext } from "react";
import { projectsAPI, notificationAPI } from "../services/api";
import AuthContext from "../context/AuthContext";

export default function AdminDashboard({ navigate }) {
    const auth = useContext(AuthContext);
    const [pendingProjects, setPendingProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
    });

    const fetchPendingProjects = async () => {
        setLoading(true);
        try {
            const res = await projectsAPI.getPendingProjects();
            const data = res?.data?.data || res?.data || [];
            setPendingProjects(data);

            const statsRes = await projectsAPI.adminList();
            const allProjects = statsRes?.data?.data || statsRes?.data || [];
            setStats({
                total: allProjects.length,
                approved: allProjects.filter((p) => p.status === "approved")
                    .length,
                pending: allProjects.filter((p) => p.status === "pending")
                    .length,
                rejected: allProjects.filter((p) => p.status === "rejected")
                    .length,
            });
        } catch (e) {
            console.error("❌ فشل جلب المشاريع المعلقة", e);
            try {
                const adminRes = await projectsAPI.adminList();
                const allProjects =
                    adminRes?.data?.data || adminRes?.data || [];
                setPendingProjects(
                    allProjects.filter((p) => p.status === "pending"),
                );
            } catch (err) {
                alert("حدث خطأ أثناء تحميل المشاريع المعلقة");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingProjects();
    }, []);

    const handleApprove = async (projectId) => {
        if (!window.confirm("هل أنت متأكد من قبول هذا المشروع؟")) return;

        try {
            const res = await projectsAPI.reviewProject(projectId, "approve");
            console.log("✅ Approve response:", res.data);

            const project = pendingProjects.find((p) => p._id === projectId);
            if (project?.userId) {
                try {
                    await notificationAPI.createNotification({
                        userId: project.userId,
                        type: "project_approved",
                        title: "تم قبول مشروعك",
                        message: `تم قبول مشروعك "${project.title}" بنجاح`,
                        relatedId: projectId,
                        relatedModel: "Project",
                    });
                } catch (notifError) {
                    console.error("❌ فشل إنشاء إشعار:", notifError);
                }
            }

            alert("✅ تم قبول المشروع بنجاح");
            setPendingProjects((prev) =>
                prev.filter((p) => p._id !== projectId),
            );
            setStats((prev) => ({
                ...prev,
                approved: prev.approved + 1,
                pending: prev.pending - 1,
            }));
        } catch (e) {
            console.error("❌ فشل قبول المشروع:", e);
            console.error("❌ Error details:", e.response?.data);

            if (e.response?.status === 200 || e.response?.status === 201) {
                alert("✅ تم قبول المشروع بنجاح (مع تحذير بسيط)");
                setPendingProjects((prev) =>
                    prev.filter((p) => p._id !== projectId),
                );
            } else {
                alert(e.response?.data?.message || "❌ فشل قبول المشروع");
            }
        }
    };

    const handleReject = async (projectId) => {
        const reason = rejectionReason[projectId];
        if (!reason || reason.trim() === "") {
            alert("الرجاء إدخال سبب الرفض");
            return;
        }
        if (!window.confirm("هل أنت متأكد من رفض هذا المشروع؟")) return;

        try {
            const res = await projectsAPI.reviewProject(
                projectId,
                "reject",
                reason,
            );
            console.log("✅ Reject response:", res.data);

            const project = pendingProjects.find((p) => p._id === projectId);
            if (project?.userId) {
                try {
                    await notificationAPI.createNotification({
                        userId: project.userId,
                        type: "project_rejected",
                        title: "تم رفض مشروعك",
                        message: `تم رفض مشروعك "${project.title}" بسبب: ${reason}`,
                        relatedId: projectId,
                        relatedModel: "Project",
                    });
                } catch (notifError) {
                    console.error("❌ فشل إنشاء إشعار:", notifError);
                }
            }

            alert("✅ تم رفض المشروع");
            setPendingProjects((prev) =>
                prev.filter((p) => p._id !== projectId),
            );
            setRejectionReason((prev) => {
                const newState = { ...prev };
                delete newState[projectId];
                return newState;
            });

            setStats((prev) => ({
                ...prev,
                rejected: prev.rejected + 1,
                pending: prev.pending - 1,
            }));
        } catch (e) {
            console.error("❌ فشل رفض المشروع:", e);
            console.error("❌ Error details:", e.response?.data);

            if (e.response?.status === 200 || e.response?.status === 201) {
                alert("✅ تم رفض المشروع بنجاح (مع تحذير بسيط)");
                setPendingProjects((prev) =>
                    prev.filter((p) => p._id !== projectId),
                );
            } else {
                alert(e.response?.data?.message || "❌ فشل رفض المشروع");
            }
        }
    };

    // ✅ دالة عرض المشروع المعدلة - الأهم هنا
    const handleViewProject = (projectId) => {
        console.log("👁️ Admin viewing project:", projectId);
        // تمرير asAdmin: true للإشارة إلى أن المشرف يشاهد المشروع
        navigate("project", { id: projectId, asAdmin: true });
    };

    const updateRejectionReason = (projectId, value) => {
        setRejectionReason((prev) => ({ ...prev, [projectId]: value }));
    };

    if (!auth?.isAdmin) {
        return (
            <div className="alert alert-warning">
                غير مصرح. هذه الصفحة للمشرفين فقط.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">جاري التحميل...</span>
                </div>
                <p className="mt-2 text-muted">
                    جاري تحميل المشاريع المعلقة...
                </p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>لوحة تحكم المشرف</h2>
                <button
                    className="btn btn-outline-primary"
                    onClick={fetchPendingProjects}
                >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    تحديث
                </button>
            </div>

            {/* إحصائيات سريعة */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <h5 className="card-title">إجمالي المشاريع</h5>
                            <h2>{stats.total}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <h5 className="card-title">مقبولة</h5>
                            <h2>{stats.approved}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <h5 className="card-title">معلقة</h5>
                            <h2>{stats.pending}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-danger text-white">
                        <div className="card-body">
                            <h5 className="card-title">مرفوضة</h5>
                            <h2>{stats.rejected}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-muted">
                المشاريع المعلقة بانتظار قبول أو رفض المشرف
            </p>

            {pendingProjects.length === 0 ? (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    لا توجد مشاريع معلقة حالياً
                </div>
            ) : (
                <div className="row">
                    {pendingProjects.map((project) => (
                        <div key={project._id} className="col-12 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h5 className="card-title">
                                            {project.title}
                                        </h5>
                                        <span className="badge bg-warning text-dark">
                                            معلق
                                        </span>
                                    </div>
                                    <h6 className="card-subtitle mb-2 text-muted">
                                        بواسطة:{" "}
                                        {project.userId?.name || "غير معروف"}
                                    </h6>
                                    <p className="card-text">
                                        {project.description}
                                    </p>

                                    {project.images?.length > 0 && (
                                        <div className="mb-2">
                                            <strong>الصور:</strong>
                                            <div className="d-flex flex-wrap gap-2 mt-1">
                                                {project.images
                                                    .slice(0, 3)
                                                    .map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt="project"
                                                            style={{
                                                                width: 80,
                                                                height: 80,
                                                                objectFit:
                                                                    "cover",
                                                                borderRadius:
                                                                    "8px",
                                                            }}
                                                        />
                                                    ))}
                                                {project.images.length > 3 && (
                                                    <div
                                                        className="bg-light d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: 80,
                                                            height: 80,
                                                            borderRadius: "8px",
                                                        }}
                                                    >
                                                        <span className="text-muted">
                                                            +
                                                            {project.images
                                                                .length - 3}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="row mt-3">
                                        {project.demoUrl && (
                                            <div className="col-md-6">
                                                <strong>رابط العرض:</strong>{" "}
                                                <a
                                                    href={project.demoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {project.demoUrl}
                                                </a>
                                            </div>
                                        )}
                                        {project.githubUrl && (
                                            <div className="col-md-6">
                                                <strong>رابط GitHub:</strong>{" "}
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {project.githubUrl}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 d-flex align-items-center">
                                        <button
                                            className="btn btn-success me-2"
                                            onClick={() =>
                                                handleApprove(project._id)
                                            }
                                        >
                                            <i className="bi bi-check-circle me-1"></i>
                                            قبول
                                        </button>
                                        <div className="flex-grow-1 me-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="سبب الرفض (مطلوب)"
                                                value={
                                                    rejectionReason[
                                                        project._id
                                                    ] || ""
                                                }
                                                onChange={(e) =>
                                                    updateRejectionReason(
                                                        project._id,
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <button
                                            className="btn btn-danger me-2"
                                            onClick={() =>
                                                handleReject(project._id)
                                            }
                                        >
                                            <i className="bi bi-x-circle me-1"></i>
                                            رفض
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() =>
                                                handleViewProject(project._id)
                                            }
                                        >
                                            <i className="bi bi-eye me-1"></i>
                                            عرض
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
