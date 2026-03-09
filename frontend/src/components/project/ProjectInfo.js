import React from "react";

export default function ProjectInfo({ project, navigate }) {
    const openUserProfile = () => {
        if (navigate && project.userId) {
            const userId = project.userId._id || project.userId;
            navigate("profile", { userId });
        }
    };

    // ألوان للصورة الرمزية
    const colors = [
        "#4f46e5",
        "#0891b2",
        "#b45309",
        "#a21caf",
        "#be123c",
        "#15803d",
    ];
    const colorIndex =
        (project.userId?._id?.charCodeAt(0) || 0) % colors.length;
    const avatarColor = colors[colorIndex];
    const ownerInitial = project.userId?.name?.charAt(0) || "U";

    // دالة لعرض النجوم
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={`bi ${
                        i <= Math.round(rating)
                            ? "bi-star-fill text-warning"
                            : "bi-star text-muted"
                    } ms-1`}
                ></i>,
            );
        }
        return stars;
    };

    return (
        <>
            <div className="position-relative" style={{ height: 300 }}>
                <img
                    src={project.images?.[0] || "/default-project.svg"}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                    alt="project"
                />
                <span className="badge-category" style={{ top: 20, right: 20 }}>
                    {project.category || "ويب"}
                </span>
            </div>
            <div className="card-body p-4">
                <h2 className="fw-bold mb-3">{project.title}</h2>

                {/* عرض التقييم */}
                {project.averageRating > 0 ? (
                    <div className="d-flex align-items-center mb-3">
                        <div className="ms-2">
                            {renderStars(project.averageRating)}
                        </div>
                        <span className="text-muted small">
                            ({project.totalRatings} تقييم)
                        </span>
                    </div>
                ) : (
                    <div className="text-muted small mb-3">
                        <i className="bi bi-star me-1"></i>
                        لا توجد تقييمات بعد
                    </div>
                )}

                <div className="d-flex align-items-center mb-3">
                    <div
                        className="avatar-circle me-2"
                        style={{ backgroundColor: avatarColor }}
                    >
                        {ownerInitial}
                    </div>
                    <div>
                        <div className="fw-medium">المالك</div>
                        {project.userId ? (
                            <button
                                className="btn btn-link p-0 text-primary"
                                onClick={openUserProfile}
                            >
                                {project.userId.name}
                            </button>
                        ) : (
                            <span className="text-muted">غير معروف</span>
                        )}
                    </div>
                </div>
                <p className="text-secondary mb-4" style={{ lineHeight: 1.8 }}>
                    {project.description}
                </p>
                <div className="d-flex flex-wrap gap-3 mb-4">
                    {project.demoUrl && (
                        <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary rounded-pill"
                        >
                            <i className="bi bi-eye me-2"></i>عرض التجريبي
                        </a>
                    )}
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-dark rounded-pill"
                        >
                            <i className="bi bi-github me-2"></i>مستودع GitHub
                        </a>
                    )}
                </div>
                <div className="mt-4">
                    <button
                        className="btn btn-light rounded-pill px-4"
                        onClick={() => navigate?.("home")}
                    >
                        <i className="bi bi-arrow-right me-2"></i>العودة
                        للرئيسية
                    </button>
                </div>
            </div>
        </>
    );
}
