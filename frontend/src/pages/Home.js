import React, { useEffect, useState, useMemo, useContext } from "react";
import { projectsAPI } from "../services/api";
import AuthContext from "../context/AuthContext";
import SearchBar from "../components/home/SearchBar";
import ProjectGrid from "../components/home/ProjectGrid";

export default function Home({ navigate }) {
    const [projects, setProjects] = useState([]);
    const [featuredProjects, setFeaturedProjects] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [loading, setLoading] = useState(false);
    const auth = useContext(AuthContext);

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        const params = {};
        if (category && category !== "all") params.category = category;
        if (search && search.trim().length > 0) params.q = search.trim();

        Promise.all([projectsAPI.list(params), projectsAPI.getFeatured(4)])
            .then(([projectsRes, featuredRes]) => {
                if (mounted) {
                    setProjects(projectsRes.data || []);
                    setFeaturedProjects(featuredRes.data || []);
                }
            })
            .catch(() => {})
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [search, category]);

    const categories = useMemo(() => {
        const set = new Set(projects.map((p) => p.category || "web"));
        return ["all", ...Array.from(set)];
    }, [projects]);

    return (
        <div className="container py-4">
            {/* المشاريع المميزة */}
            {featuredProjects.length > 0 && (
                <div className="mb-5">
                    <h3 className="fw-bold mb-3">
                        <i className="bi bi-star-fill text-warning me-2"></i>
                        مشاريع مميزة
                    </h3>
                    <ProjectGrid
                        projects={featuredProjects}
                        navigate={navigate}
                        featured={true}
                    />
                </div>
            )}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
                <div className="mb-3 mb-md-0">
                    <h2 className="fw-bold mb-1">جميع المشاريع</h2>
                    <p className="text-muted small">
                        استكشف مشاريع الطلاب المميزة
                    </p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <SearchBar
                        search={search}
                        setSearch={setSearch}
                        category={category}
                        setCategory={setCategory}
                        categories={categories}
                    />
                    {auth?.isStudent && (
                        <button
                            className="btn btn-success rounded-pill d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                            onClick={() =>
                                navigate("profile", { openAddProject: true })
                            }
                        >
                            <i className="bi bi-plus-lg"></i>
                            <span>إضافة مشروع</span>
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">جاري التحميل...</span>
                    </div>
                </div>
            ) : (
                <ProjectGrid projects={projects} navigate={navigate} />
            )}
        </div>
    );
}
