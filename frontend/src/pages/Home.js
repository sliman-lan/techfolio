import React, { useEffect, useState, useMemo, useContext } from "react";
import { projectsAPI } from "../services/api";
import AuthContext from "../context/AuthContext";
import SearchBar from "../components/home/SearchBar";
import ProjectGrid from "../components/home/ProjectGrid";

export default function Home({ navigate }) {
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const auth = useContext(AuthContext);

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
        <div className="container py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
                <div className="mb-3 mb-md-0">
                    <h2 className="fw-bold mb-1">المشروعات</h2>
                    <p className="text-muted small">
                        استكشف مشاريع الطلاب المميزة
                    </p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <SearchBar
                        {...{
                            search,
                            setSearch,
                            category,
                            setCategory,
                            categories,
                        }}
                    />
                    {auth?.user?.role !== "admin" && (
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
            <ProjectGrid projects={projects} navigate={navigate} />
        </div>
    );
}
