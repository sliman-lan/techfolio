import { useState, useEffect } from "react";
import { projectsAPI } from "../services/api";

export default function useProject(id) {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        projectsAPI
            .get(id)
            .then((res) => {
                if (!mounted) return;
                const proj = res.data || res; // تطبيع الاستجابة
                setProject(proj);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err.response?.data?.message || "حدث خطأ");
            })
            .finally(() => mounted && setLoading(false));

        return () => (mounted = false);
    }, [id]);

    return { project, loading, error };
}
