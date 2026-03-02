import React from "react";

export default function ProfileProjects({
    isViewingOther,
    user,
    userProjects,
    adminStats,
    onAddProject,
    navigate,
    onEditProject,
    onDeleteProject,
    onApproveProject,
    onRejectProject,
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
                              ? "لوحة تحكم المشرف"
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
                    <EmptyProjects isOwner={!isViewingOther} />
                ) : (
                    <div className="row g-4">
                        {userProjects.map((p) => (
                            <ProjectCard
                                key={p._id}
                                project={p}
                                currentUser={user}
                                isViewingOther={isViewingOther}
                                navigate={navigate}
                                onEdit={onEditProject}
                                onDelete={onDeleteProject}
                                onApprove={onApproveProject}
                                onReject={onRejectProject}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const EmptyProjects = ({ isOwner }) => (
    <div className="alert alert-light rounded-3 text-center py-4">
        <i className="bi bi-folder2-open display-6 text-muted"></i>
        <p className="mt-2">لا توجد مشاريع بعد.</p>
        {isOwner && (
            <p className="small text-muted">
                استخدم الزر أعلاه لإضافة مشروعك الأول.
            </p>
        )}
    </div>
);

const ProjectCard = ({
    project,
    currentUser,
    isViewingOther,
    navigate,
    onEdit,
    onDelete,
    onApprove,
    onReject,
}) => {
    const {
        _id,
        title,
        shortDescription,
        images,
        category,
        level,
        status,
        averageRating,
        userId,
    } = project;

    // تحويل userId إلى نص للمقارنة
    const projectUserId = userId?._id || userId?.toString?.() || userId;
    const currentUserId = currentUser?._id?.toString?.() || currentUser?._id;

    const isOwner =
        !isViewingOther &&
        currentUserId &&
        projectUserId &&
        currentUserId.toString() === projectUserId.toString();

    const isAdmin = currentUser?.role === "admin";

    const getCategoryLabel = (cat) => {
        const categories = {
            web: "ويب",
            mobile: "موبايل",
            ai: "ذكاء اصطناعي",
            design: "تصميم",
            game: "ألعاب",
            other: "أخرى",
        };
        return categories[cat] || cat;
    };

    const getLevelLabel = (lvl) => {
        const levels = {
            beginner: "مبتدئ",
            intermediate: "متوسط",
            advanced: "متقدم",
        };
        return levels[lvl] || lvl;
    };

    // إنشاء ID فريد لكل carousel
    const carouselId = `carousel-${_id}`;

    return (
        <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                {/* قسم الصور - Carousel متطور */}
                {images && images.length > 0 ? (
                    <div
                        className="position-relative"
                        style={{ height: "200px", backgroundColor: "#f8f9fa" }}
                    >
                        <div
                            id={carouselId}
                            className="carousel slide h-100"
                            data-bs-ride="carousel"
                        >
                            {/* مؤشرات الصور (النقاط) */}
                            {images.length > 1 && (
                                <div
                                    className="carousel-indicators"
                                    style={{ marginBottom: "0.5rem" }}
                                >
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            data-bs-target={`#${carouselId}`}
                                            data-bs-slide-to={idx}
                                            className={
                                                idx === 0 ? "active" : ""
                                            }
                                            aria-label={`Slide ${idx + 1}`}
                                            style={{
                                                width: "8px",
                                                height: "8px",
                                                borderRadius: "50%",
                                                backgroundColor: "white",
                                                opacity: idx === 0 ? 1 : 0.5,
                                            }}
                                        ></button>
                                    ))}
                                </div>
                            )}

                            {/* الصور */}
                            <div className="carousel-inner h-100">
                                {images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`carousel-item h-100 ${idx === 0 ? "active" : ""}`}
                                    >
                                        <img
                                            src={img}
                                            className="d-block w-100 h-100"
                                            alt={`${title} - صورة ${idx + 1}`}
                                            style={{ objectFit: "cover" }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    "/default-project.svg";
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* أزرار التنقل */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        className="carousel-control-prev"
                                        type="button"
                                        data-bs-target={`#${carouselId}`}
                                        data-bs-slide="prev"
                                        style={{ width: "15%" }}
                                    >
                                        <span
                                            className="carousel-control-prev-icon"
                                            aria-hidden="true"
                                        ></span>
                                        <span className="visually-hidden">
                                            السابق
                                        </span>
                                    </button>
                                    <button
                                        className="carousel-control-next"
                                        type="button"
                                        data-bs-target={`#${carouselId}`}
                                        data-bs-slide="next"
                                        style={{ width: "15%" }}
                                    >
                                        <span
                                            className="carousel-control-next-icon"
                                            aria-hidden="true"
                                        ></span>
                                        <span className="visually-hidden">
                                            التالي
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* شارة عدد الصور */}
                        {images.length > 1 && (
                            <div className="position-absolute top-0 end-0 m-2 bg-dark bg-opacity-50 text-white rounded-pill px-2 py-1 small">
                                <i className="bi bi-images me-1"></i>
                                {images.length}
                            </div>
                        )}

                        {/* شارة الحالة */}
                        {status && (
                            <div className="position-absolute top-0 start-0 m-2">
                                <span
                                    className={`badge ${
                                        status === "approved"
                                            ? "bg-success"
                                            : status === "rejected"
                                              ? "bg-danger"
                                              : "bg-warning text-dark"
                                    }`}
                                >
                                    {status === "approved"
                                        ? "مقبول"
                                        : status === "rejected"
                                          ? "مرفوض"
                                          : "قيد المراجعة"}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className="bg-light d-flex flex-column align-items-center justify-content-center"
                        style={{ height: "200px" }}
                    >
                        <i
                            className="bi bi-image text-muted"
                            style={{ fontSize: "3rem" }}
                        ></i>
                        <span className="text-muted small mt-2">
                            لا توجد صور
                        </span>
                        {status && (
                            <span
                                className={`badge mt-2 ${
                                    status === "approved"
                                        ? "bg-success"
                                        : status === "rejected"
                                          ? "bg-danger"
                                          : "bg-warning text-dark"
                                }`}
                            >
                                {status === "approved"
                                    ? "مقبول"
                                    : status === "rejected"
                                      ? "مرفوض"
                                      : "قيد المراجعة"}
                            </span>
                        )}
                    </div>
                )}

                {/* محتوى البطاقة */}
                <div className="card-body d-flex flex-column p-3">
                    <h6 className="fw-bold mb-2 text-truncate" title={title}>
                        {title}
                    </h6>

                    <p
                        className="small text-muted mb-2"
                        style={{ minHeight: "40px" }}
                    >
                        {shortDescription || "لا يوجد وصف مختصر"}
                    </p>

                    <div className="d-flex flex-wrap gap-1 mb-2">
                        <span className="badge bg-light text-dark rounded-pill">
                            {getCategoryLabel(category)}
                        </span>
                        {level && (
                            <span className="badge bg-light text-dark rounded-pill">
                                {getLevelLabel(level)}
                            </span>
                        )}
                    </div>

                    {averageRating > 0 && (
                        <div className="small mb-2">
                            {Array.from({ length: 5 }, (_, i) => (
                                <i
                                    key={i}
                                    className={`bi ${
                                        i < Math.round(averageRating)
                                            ? "bi-star-fill text-warning"
                                            : "bi-star text-muted"
                                    } ms-1`}
                                ></i>
                            ))}
                            <span className="text-muted ms-1 small">
                                ({averageRating.toFixed(1)})
                            </span>
                        </div>
                    )}

                    {/* Footer with actions */}
                    <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                        <button
                            className="btn btn-link p-0 fw-medium text-primary text-decoration-none"
                            onClick={() => navigate?.("project", { id: _id })}
                        >
                            <small>عرض التفاصيل</small>
                            <i className="bi bi-arrow-left ms-1"></i>
                        </button>

                        {/* أزرار التحكم */}
                        {(isOwner || isAdmin) && (
                            <div className="d-flex gap-1">
                                {isOwner && (
                                    <button
                                        className="btn btn-sm btn-outline-primary rounded-circle"
                                        onClick={() => onEdit(_id)}
                                        title="تعديل المشروع"
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            padding: 0,
                                        }}
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                )}

                                {isAdmin && status === "pending" && (
                                    <>
                                        <button
                                            className="btn btn-sm btn-outline-success rounded-circle"
                                            onClick={() => onApprove?.(_id)}
                                            title="قبول المشروع"
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                                padding: 0,
                                            }}
                                        >
                                            <i className="bi bi-check-lg"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger rounded-circle"
                                            onClick={() => onReject?.(_id)}
                                            title="رفض المشروع"
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                                padding: 0,
                                            }}
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </>
                                )}

                                {(isOwner || isAdmin) && (
                                    <button
                                        className="btn btn-sm btn-outline-danger rounded-circle"
                                        onClick={() => onDelete?.(_id)}
                                        title="حذف المشروع"
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            padding: 0,
                                        }}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminStats = ({ stats, navigate }) => (
    <div>
        <div className="row g-3 mb-4">
            <div className="col-4">
                <div className="bg-primary bg-opacity-10 rounded-4 p-3 text-center">
                    <div className="h3 fw-bold text-primary mb-0">
                        {stats?.total || 0}
                    </div>
                    <div className="small text-muted">إجمالي المشاريع</div>
                </div>
            </div>
            <div className="col-4">
                <div className="bg-success bg-opacity-10 rounded-4 p-3 text-center">
                    <div className="h3 fw-bold text-success mb-0">
                        {stats?.approved || 0}
                    </div>
                    <div className="small text-muted">مقبولة</div>
                </div>
            </div>
            <div className="col-4">
                <div className="bg-warning bg-opacity-10 rounded-4 p-3 text-center">
                    <div className="h3 fw-bold text-warning mb-0">
                        {stats?.pending || 0}
                    </div>
                    <div className="small text-muted">معلقة</div>
                </div>
            </div>
        </div>
        <h6 className="fw-bold mb-3">أحدث المشاريع المعلقة</h6>
        {!stats?.recentPending || stats.recentPending.length === 0 ? (
            <div className="alert alert-light">لا توجد مشاريع معلقة.</div>
        ) : (
            <div className="list-group list-group-flush">
                {stats.recentPending.map((p) => (
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
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                    navigate?.("approve", { id: p._id })
                                }
                            >
                                قبول
                            </button>
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() =>
                                    navigate?.("reject", { id: p._id })
                                }
                            >
                                رفض
                            </button>
                            <button
                                className="btn btn-link btn-sm"
                                onClick={() =>
                                    navigate?.("project", { id: p._id })
                                }
                            >
                                عرض
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);
