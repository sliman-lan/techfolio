import React from "react";

export default function AdminProjectRow({ project, onDelete, onRate }) {
    return (
        <div className="card">
            <div className="card-body d-flex gap-3 align-items-start">
                <img
                    src={
                        (project.images && project.images[0]) ||
                        "/default-project.svg"
                    }
                    alt="project"
                    style={{
                        width: 120,
                        height: 80,
                        objectFit: "cover",
                    }}
                />
                <div style={{ flex: 1 }}>
                    <h5>{project.title}</h5>
                    <div className="small text-muted mb-2">
                        المالك:{" "}
                        {project.user?.name ||
                            project.userId?.name ||
                            "غير معروف"}
                    </div>
                    <div className="mb-2">
                        {project.shortDescription || project.description}
                    </div>

                    <div className="d-flex gap-2 align-items-center">
                        <select
                            id={`rating-${project._id}`}
                            className="form-select form-select-sm"
                            style={{ width: 120 }}
                            defaultValue={5}
                        >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                        </select>
                        <input
                            id={`rating-comment-${project._id}`}
                            className="form-control form-control-sm"
                            placeholder="تعليق (اختياري)"
                        />
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => onRate(project._id)}
                        >
                            تقييم
                        </button>
                        <button
                            className="btn btn-sm btn-danger"
                            onClick={() => onDelete(project._id)}
                        >
                            حذف
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
