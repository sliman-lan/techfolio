import React, { useState, useEffect } from "react";

const categoryOptions = [
    { value: "web", label: "ويب" },
    { value: "mobile", label: "موبايل" },
    { value: "ai", label: "ذكاء اصطناعي" },
    { value: "design", label: "تصميم" },
    { value: "game", label: "ألعاب" },
    { value: "other", label: "أخرى" },
];

const projectLevels = [
    { value: "beginner", label: "مبتدئ" },
    { value: "intermediate", label: "متوسط" },
    { value: "advanced", label: "متقدم" },
];

export default function EditProjectModal({
    show,
    onClose,
    project,
    onSave,
    loading,
    error,
}) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        shortDescription: "",
        category: "web",
        level: "intermediate",
        tags: [],
        technologies: [],
        demoUrl: "",
        githubUrl: "",
        videoUrl: "",
        isPublic: true,
        images: [],
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    // تحميل بيانات المشروع عند الفتح
    useEffect(() => {
        if (project) {
            setForm({
                title: project.title || "",
                description: project.description || "",
                shortDescription: project.shortDescription || "",
                category: project.category || "web",
                level: project.level || "intermediate",
                tags: project.tags || [],
                technologies: project.technologies || [],
                demoUrl: project.demoUrl || "",
                githubUrl: project.githubUrl || "",
                videoUrl: project.videoUrl || "",
                isPublic: project.isPublic !== false,
                images: [],
            });
            setExistingImages(project.images || []);
            setImagePreviews([]);
        }
    }, [project]);

    if (!show) return null;

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleArrayChange = (field) => (e) => {
        const value = e.target.value;
        const array = value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "");
        setForm((prev) => ({ ...prev, [field]: array }));
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setForm((prev) => ({ ...prev, images: files }));
        const previews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeExistingImage = (index) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!form.title?.trim()) {
            alert("العنوان مطلوب");
            return;
        }
        if (!form.description?.trim()) {
            alert("الوصف الطويل مطلوب");
            return;
        }
        onSave(form, existingImages);
    };

    return (
        <div
            className="modal show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content rounded-4 shadow-lg border-0">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-pencil-square ms-2"></i>
                            تعديل المشروع
                        </h5>
                        <button
                            type="button"
                            className="btn-close me-auto"
                            onClick={onClose}
                        ></button>
                    </div>

                    <div className="modal-body">
                        {/* العنوان */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                العنوان <span className="text-danger">*</span>
                            </label>
                            <input
                                value={form.title}
                                onChange={handleChange("title")}
                                className="form-control rounded-3"
                                placeholder="أدخل عنوان المشروع"
                            />
                        </div>

                        {/* الوصف الطويل */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                وصف طويل <span className="text-danger">*</span>
                            </label>
                            <textarea
                                value={form.description}
                                onChange={handleChange("description")}
                                className="form-control rounded-3"
                                rows="3"
                                placeholder="اشرح المشروع بالتفصيل"
                            />
                        </div>

                        {/* الوصف المختصر */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                وصف مختصر
                            </label>
                            <input
                                value={form.shortDescription}
                                onChange={handleChange("shortDescription")}
                                className="form-control rounded-3"
                                placeholder="ملخص سريع (150 حرف)"
                                maxLength="150"
                            />
                            <small className="text-muted">
                                {form.shortDescription.length}/150
                            </small>
                        </div>

                        {/* الفئة والمستوى */}
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-medium">
                                    فئة المشروع
                                </label>
                                <select
                                    className="form-select rounded-3"
                                    value={form.category}
                                    onChange={handleChange("category")}
                                >
                                    {categoryOptions.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-medium">
                                    مستوى المشروع
                                </label>
                                <select
                                    className="form-select rounded-3"
                                    value={form.level}
                                    onChange={handleChange("level")}
                                >
                                    {projectLevels.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* الوسوم */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                الوسوم (tags)
                            </label>
                            <input
                                value={form.tags.join(", ")}
                                onChange={handleArrayChange("tags")}
                                className="form-control rounded-3"
                                placeholder="أدخل الوسوم مفصولة بفواصل"
                            />
                        </div>

                        {/* التقنيات */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                التقنيات المستخدمة
                            </label>
                            <input
                                value={form.technologies.join(", ")}
                                onChange={handleArrayChange("technologies")}
                                className="form-control rounded-3"
                                placeholder="أدخل التقنيات مفصولة بفواصل"
                            />
                        </div>

                        {/* الروابط */}
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-medium">
                                    رابط العرض
                                </label>
                                <input
                                    value={form.demoUrl}
                                    onChange={handleChange("demoUrl")}
                                    className="form-control rounded-3"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-medium">
                                    رابط GitHub
                                </label>
                                <input
                                    value={form.githubUrl}
                                    onChange={handleChange("githubUrl")}
                                    className="form-control rounded-3"
                                    placeholder="https://github.com/username/repo"
                                />
                            </div>
                        </div>

                        {/* رابط فيديو */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                رابط فيديو توضيحي
                            </label>
                            <input
                                value={form.videoUrl}
                                onChange={handleChange("videoUrl")}
                                className="form-control rounded-3"
                                placeholder="https://youtube.com/watch?v=..."
                            />
                        </div>

                        {/* الصور الموجودة */}
                        {existingImages.length > 0 && (
                            <div className="mb-3">
                                <label className="form-label fw-medium">
                                    الصور الحالية
                                </label>
                                <div className="d-flex flex-wrap gap-2">
                                    {existingImages.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="position-relative"
                                            style={{ width: 100, height: 100 }}
                                        >
                                            <img
                                                src={img}
                                                alt={`صورة ${idx + 1}`}
                                                className="rounded-2 w-100 h-100"
                                                style={{ objectFit: "cover" }}
                                            />
                                            <button
                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle p-0"
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                }}
                                                onClick={() =>
                                                    removeExistingImage(idx)
                                                }
                                            >
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* إضافة صور جديدة */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                إضافة صور جديدة
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="form-control rounded-3"
                                onChange={handleImagesChange}
                            />
                            {imagePreviews.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {imagePreviews.map((src, idx) => (
                                        <div
                                            key={idx}
                                            className="border rounded-2 overflow-hidden"
                                            style={{ width: 80, height: 80 }}
                                        >
                                            <img
                                                src={src}
                                                alt={`معاينة ${idx + 1}`}
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* حالة النشر */}
                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="isPublicCheck"
                                checked={form.isPublic}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        isPublic: e.target.checked,
                                    }))
                                }
                            />
                            <label
                                className="form-check-label"
                                htmlFor="isPublicCheck"
                            >
                                منشور للجميع
                            </label>
                        </div>

                        {error && (
                            <div className="alert alert-danger rounded-3">
                                <i className="bi bi-exclamation-triangle ms-2"></i>
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-0">
                        <button
                            className="btn btn-outline-secondary rounded-pill px-4"
                            onClick={onClose}
                            disabled={loading}
                        >
                            <i className="bi bi-x-lg ms-2"></i>
                            إلغاء
                        </button>
                        <button
                            className="btn btn-primary rounded-pill px-4"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm ms-2" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg ms-2"></i>
                                    حفظ التغييرات
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
