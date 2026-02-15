import React, { useEffect, useState, useContext } from "react";
import { projectsAPI } from "../services/api";
import AuthContext from "../context/AuthContext";
import AdminProjectList from "../components/admin/AdminProjectList";

export default function AdminDashboard() {
    const auth = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await projectsAPI.adminList();
            // Handle different response structures
            const data = res?.data?.data || res?.data || [];
            setProjects(data);
        } catch (e) {
            console.error("Failed to fetch admin projects", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("هل أنت متأكد من حذف المشروع؟")) return;
        try {
            await projectsAPI.delete(id);
            setProjects((p) => p.filter((x) => x._id !== id));
        } catch (e) {
            alert("فشل الحذف");
        }
    };

    const handleRate = async (id) => {
        const value = parseInt(
            document.getElementById(`rating-${id}`).value,
            10,
        );
        const comment = document.getElementById(`rating-comment-${id}`).value;
        if (!value || value < 1 || value > 5) {
            return alert("الرجاء إدخال تقييم صالح من 1 إلى 5");
        }
        try {
            await projectsAPI.rate(id, { value, comment });
            alert("تم إضافة التقييم");
            // Refresh list to show updated ratings
            fetchProjects();
        } catch (e) {
            console.error(e);
            alert("فشل إضافة التقييم");
        }
    };

    if (!auth?.user || auth.user.role !== "admin") {
        return (
            <div className="alert alert-warning">
                غير مصرح. هذه الصفحة للمشرفين فقط.
            </div>
        );
    }

    return (
        <div>
            <h2>لوحة المشرف</h2>
            <p className="text-muted">عرض وتقييم وحذف مشاريع الطلاب</p>

            <AdminProjectList
                projects={projects}
                loading={loading}
                onDelete={handleDelete}
                onRate={handleRate}
            />
        </div>
    );
}
