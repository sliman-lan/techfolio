import React from "react";

export default function ProfileProjects({
    isViewingOther,
    user,
    userProjects,
    adminStats,
    onAddProject,
    navigate,
}) {
    const isAdminView = user?.role === "admin" && !isViewingOther;

    return (
        <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">
                        {isViewingOther
                            ? "مشاريع المستخدم"
                            : isAdminView
                              ? "إحصائيات المشرف"
                              : "مشاريعي"}
                    </h5>
                    {!isViewingOther && user?.role !== "admin" && (
                        <button
                            className="btn btn-success rounded-pill d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                            onClick={onAddProject}
                        >
                            <i className="bi bi-plus-lg"></i> مشروع جديد
                        </button>
                    )}
                </div>

                {isAdminView ? (
                    <AdminStats stats={adminStats} navigate={navigate} />
                ) : userProjects.length === 0 ? (
                    <div className="alert alert-light rounded-3 text-center py-4">
                        <i className="bi bi-folder2-open display-6 text-muted"></i>
                        <p className="mt-2">لا توجد مشاريع بعد.</p>
                        {!isViewingOther && (
                            <p className="small text-muted">
                                استخدم الزر أعلاه لإضافة مشروعك الأول.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="row g-3">
                        {userProjects.map((p) => (
                            <div className="col-12 col-md-6" key={p._id}>
                                <div className="card h-100 border-0 shadow-sm rounded-3 transition-hover">
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-2">
                                            {p.title}
                                        </h6>
                                        <p className="small text-muted mb-3">
                                            {p.shortDescription}
                                        </p>
                                        <button
                                            className="btn btn-link p-0 fw-medium text-primary"
                                            onClick={() =>
                                                navigate?.("project", {
                                                    id: p._id,
                                                })
                                            }
                                        >
                                            عرض التفاصيل{" "}
                                            <i className="bi bi-arrow-left ms-1"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const AdminStats = ({ stats, navigate }) => (
    <div>
        <div className="row g-3 mb-4">
            <div className="col-4">
                <div className="bg-primary bg-opacity-10 rounded-4 p-3 text-center">
                    <div className="h3 fw-bold text-primary mb-0">
                        {stats.total}
                    </div>
                    <div className="small text-muted">إجمالي المشاريع</div>
                </div>
            </div>
            <div className="col-4">
                <div className="bg-success bg-opacity-10 rounded-4 p-3 text-center">
                    <div className="h3 fw-bold text-success mb-0">
                        {stats.rated}
                    </div>
                    <div className="small text-muted">مقيمة</div>
                </div>
            </div>
            <div className="col-4">
                <div className="bg-warning bg-opacity-10 rounded-4 p-3 text-center">
                    <div className="h3 fw-bold text-warning mb-0">
                        {stats.unrated}
                    </div>
                    <div className="small text-muted">غير مقيمة</div>
                </div>
            </div>
        </div>
        <h6 className="fw-bold mb-3">أحدث المشاريع</h6>
        {stats.recent.length === 0 ? (
            <div className="alert alert-light">لا توجد مشاريع للعرض.</div>
        ) : (
            <div className="list-group list-group-flush">
                {stats.recent.map((p) => (
                    <div
                        key={p._id}
                        className="list-group-item d-flex justify-content-between align-items-center px-0 border-0 border-bottom"
                    >
                        <div>
                            <div className="fw-medium">{p.title}</div>
                            <div className="small text-muted">
                                بواسطة{" "}
                                {p.user?.name || p.userId?.name || "غير معروف"}
                            </div>
                        </div>
                        <button
                            className="btn btn-link btn-sm"
                            onClick={() => navigate?.("project", { id: p._id })}
                        >
                            عرض
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
);
