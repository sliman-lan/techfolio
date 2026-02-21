import React, { useEffect, useState, useContext } from "react";
import { projectsAPI } from "../services/api";
import AuthContext from "../context/AuthContext";

export default function AdminDashboard() {
    const auth = useContext(AuthContext);
    const [pendingProjects, setPendingProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState({});

    const fetchPendingProjects = async () => {
        setLoading(true);
        try {
            // حاول جلب المشاريع المعلقة مباشرة
            let data = [];
            try {
                const res = await projectsAPI.getPendingProjects();
                console.log("استجابة getPendingProjects:", res);
                data = res?.data?.data || res?.data || [];
            } catch (pendingError) {
                console.warn(
                    "فشل getPendingProjects، نجرب adminList:",
                    pendingError,
                );
                // إذا فشل، استخدم adminList ثم صفي حسب الحالة
                const adminRes = await projectsAPI.adminList();
                console.log("استجابة adminList:", adminRes);
                const allProjects =
                    adminRes?.data?.data || adminRes?.data || [];
                data = allProjects.filter((p) => p.status === "pending");
            }
            setPendingProjects(data);
        } catch (e) {
            console.error("فشل جلب المشاريع المعلقة", e);
            alert("حدث خطأ أثناء تحميل المشاريع المعلقة");
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
            await projectsAPI.reviewProject(projectId, "approve");
            alert("تم قبول المشروع");
            setPendingProjects((prev) =>
                prev.filter((p) => p._id !== projectId),
            );
        } catch (e) {
            console.error(e);
            alert("فشل قبول المشروع");
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
            await projectsAPI.reviewProject(projectId, "reject", reason);
            alert("تم رفض المشروع");
            setPendingProjects((prev) =>
                prev.filter((p) => p._id !== projectId),
            );
            setRejectionReason((prev) => {
                const newState = { ...prev };
                delete newState[projectId];
                return newState;
            });
        } catch (e) {
            console.error(e);
            alert("فشل رفض المشروع");
        }
    };

    const updateRejectionReason = (projectId, value) => {
        setRejectionReason((prev) => ({ ...prev, [projectId]: value }));
    };

    if (!auth?.user || auth.user.role !== "admin") {
        return (
            <div className="alert alert-warning">
                غير مصرح. هذه الصفحة للمشرفين فقط.
            </div>
        );
    }

    if (loading) {
        return <div>جاري تحميل المشاريع المعلقة...</div>;
    }

    return (
        <div className="container mt-4">
            <h2>مراجعة المشاريع</h2>
            <p className="text-muted">
                المشاريع المعلقة بانتظار قبول أو رفض المشرف
            </p>

            {pendingProjects.length === 0 ? (
                <div className="alert alert-info">لا توجد مشاريع معلقة</div>
            ) : (
                <div className="row">
                    {pendingProjects.map((project) => (
                        <div key={project._id} className="col-12 mb-4">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {project.title}
                                    </h5>
                                    <h6 className="card-subtitle mb-2 text-muted">
                                        بواسطة:{" "}
                                        {project.userId?.name || "غير معروف"}
                                    </h6>
                                    <p className="card-text">
                                        {project.description}
                                    </p>
                                    {project.images &&
                                        project.images.length > 0 && (
                                            <div className="mb-2">
                                                <strong>الصور:</strong>
                                                <div className="d-flex flex-wrap">
                                                    {project.images.map(
                                                        (img, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={img}
                                                                alt="project"
                                                                style={{
                                                                    width: 100,
                                                                    height: 100,
                                                                    objectFit:
                                                                        "cover",
                                                                    marginRight: 5,
                                                                    marginBottom: 5,
                                                                }}
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    <div className="mt-3">
                                        <strong>رابط العرض:</strong>{" "}
                                        {project.demoUrl ? (
                                            <a
                                                href={project.demoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {project.demoUrl}
                                            </a>
                                        ) : (
                                            "لا يوجد"
                                        )}
                                    </div>
                                    <div>
                                        <strong>رابط GitHub:</strong>{" "}
                                        {project.githubUrl ? (
                                            <a
                                                href={project.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {project.githubUrl}
                                            </a>
                                        ) : (
                                            "لا يوجد"
                                        )}
                                    </div>
                                    <div className="mt-3 d-flex align-items-center">
                                        <button
                                            className="btn btn-success me-2"
                                            onClick={() =>
                                                handleApprove(project._id)
                                            }
                                        >
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
                                            className="btn btn-danger"
                                            onClick={() =>
                                                handleReject(project._id)
                                            }
                                        >
                                            رفض
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
