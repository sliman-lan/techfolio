import React from "react";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ projects, navigate }) {
    if (projects.length === 0) {
        return <div className="alert alert-info">لا توجد مشاريع للعرض.</div>;
    }

    return (
        <div className="row g-3">
            {projects.map((p) => (
                <ProjectCard key={p._id} project={p} navigate={navigate} />
            ))}
        </div>
    );
}
