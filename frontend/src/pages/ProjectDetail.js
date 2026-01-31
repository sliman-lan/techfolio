import React, { useEffect, useState } from "react";
import { projectsAPI } from "../services/api";

export default function ProjectDetail({ id, navigate }) {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        projectsAPI
            .get(id)
            .then((res) => {
                if (mounted) setProject(res.data || null);
            })
            .catch((err) => {
                if (mounted) setError(err.response?.data?.message || "حدث خطأ");
            })
            .finally(() => mounted && setLoading(false));
        return () => (mounted = false);
    }, [id]);

    if (loading) return <div className="alert alert-info">جارٍ التحميل...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!project)
        return <div className="alert alert-warning">المشروع غير موجود</div>;

    const openUserProfile = () => {
        if (navigate && project.userId) {
            const userId = project.userId._id || project.userId;
            navigate("profile", { userId });
        }
    };

    return (
        <div className="card shadow-sm">
            <img
                src={
                    (project.images && project.images[0]) ||
                    "/default-project.svg"
                }
                className="card-img-top"
                alt="project"
            />
            <div className="card-body">
                <h4 className="card-title">{project.title}</h4>
                <p className="text-muted">
                    المالك:{" "}
                    {project.userId ? (
                        <button
                            className="btn btn-link p-0"
                            onClick={openUserProfile}
                        >
                            {project.userId.name}
                        </button>
                    ) : (
                        "غير معروف"
                    )}
                </p>
                <p>{project.description}</p>
                {project.demoUrl && (
                    <p>
                        رابط العرض:{" "}
                        <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {project.demoUrl}
                        </a>
                    </p>
                )}
                {project.githubUrl && (
                    <p>
                        GitHub:{" "}
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {project.githubUrl}
                        </a>
                    </p>
                )}
                <div>
                    <button
                        className="btn btn-secondary me-2"
                        onClick={() => navigate && navigate("home")}
                    >
                        رجوع
                    </button>
                </div>
            </div>
        </div>
    );
}
