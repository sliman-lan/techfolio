import React, { useEffect, useState, useMemo } from "react";
import { projectsAPI } from "../services/api";

export default function Home({ navigate }) {
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");

    useEffect(() => {
        let mounted = true;
        const params = {};
        if (category && category !== "all") params.category = category;
        if (search && search.trim().length > 0) params.q = search.trim();

        projectsAPI
            .list(params)
            .then((res) => {
                if (mounted) setProjects(res.data || []);
            })
            .catch(() => {});
        return () => (mounted = false);
    }, [search, category]);

    const categories = useMemo(() => {
        const set = new Set(projects.map((p) => p.category || "web"));
        return ["all", ...Array.from(set)];
    }, [projects]);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="mb-0">المشروعات</h2>
                    <small className="text-muted">
                        صفحة تعرض المشاريع المضافة
                    </small>
                </div>

                <div className="d-flex gap-2 align-items-center">
                    <input
                        className="form-control form-control-sm"
                        placeholder="بحث عن مشروع أو صاحب المشروع"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ minWidth: 220 }}
                    />
                    <select
                        className="form-select form-select-sm"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map((c) => (
                            <option value={c} key={c}>
                                {c === "all" ? "الكل" : c}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn btn-success btn-sm d-flex align-items-center"
                        style={{
                            borderRadius: "0.5rem",
                            padding: "0.35rem 0.6rem",
                        }}
                        onClick={() =>
                            navigate("profile", { openAddProject: true })
                        }
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                        >
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span style={{ marginInlineStart: 8 }}>
                            إضافة مشروع جديد
                        </span>
                    </button>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="alert alert-info">لا توجد مشاريع للعرض.</div>
            ) : (
                <div className="row g-3">
                    {projects.map((p) => (
                        <div className="col-12 col-md-6 col-lg-4" key={p._id}>
                            <div className="card h-100 shadow-sm">
                                <img
                                    src={
                                        (p.images && p.images[0]) ||
                                        "/default-project.svg"
                                    }
                                    className="card-img-top"
                                    alt="project"
                                />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">
                                        {p.title || "مشروع"}
                                    </h5>
                                    <p className="card-text text-truncate">
                                        {p.description || ""}
                                    </p>
                                    <p className="mb-2 small text-muted">
                                        المالك: {p.userId?.name || "غير معروف"}
                                    </p>
                                    <p className="mb-2 small text-muted">
                                        الفئة: {p.category || "web"}
                                    </p>
                                    <div className="mt-auto">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() =>
                                                navigate("project", {
                                                    id: p._id,
                                                })
                                            }
                                        >
                                            عرض التفاصيل
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
