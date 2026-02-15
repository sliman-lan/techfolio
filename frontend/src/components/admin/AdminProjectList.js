import React from "react";
import AdminProjectRow from "./AdminProjectRow";

export default function AdminProjectList({
    projects,
    loading,
    onDelete,
    onRate,
}) {
    if (loading) {
        return <div>جارٍ التحميل...</div>;
    }

    if (projects.length === 0) {
        return <div className="alert alert-info">لا توجد مشاريع.</div>;
    }

    return (
        <div className="row g-3">
            {projects.map((p) => (
                <div className="col-12" key={p._id}>
                    <AdminProjectRow
                        project={p}
                        onDelete={onDelete}
                        onRate={onRate}
                    />
                </div>
            ))}
        </div>
    );
}
