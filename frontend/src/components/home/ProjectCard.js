import React from "react";

export default function ProjectCard({ project, navigate }) {
    // الحصول على أول حرف من اسم المالك (للصورة الرمزية)
    const ownerInitial = project.userId?.name?.charAt(0) || "U";
    // ألوان عشوائية ثابتة للصورة الرمزية بناءً على الاسم
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

    return (
        <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-hover">
                <div className="position-relative" style={{ height: 180 }}>
                    <img
                        src={project.images?.[0] || "/default-project.svg"}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                        alt="project"
                    />
                    <span className="badge-category">
                        {project.category || "ويب"}
                    </span>
                </div>
                <div className="card-body d-flex flex-column p-3">
                    <h5 className="card-title fw-bold mb-2">
                        {project.title || "مشروع"}
                    </h5>
                    <p className="card-text text-secondary small mb-3 text-truncate">
                        {project.description || ""}
                    </p>
                    <div className="d-flex align-items-center mb-3">
                        <div
                            className="avatar-circle me-2"
                            style={{ backgroundColor: avatarColor }}
                        >
                            {ownerInitial}
                        </div>
                        <span className="small text-muted">
                            {project.userId?.name || "غير معروف"}
                        </span>
                    </div>
                    <div className="mt-auto">
                        <button
                            className="btn btn-outline-primary w-100 rounded-pill fw-medium"
                            onClick={() =>
                                navigate("project", { id: project._id })
                            }
                        >
                            عرض التفاصيل
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
