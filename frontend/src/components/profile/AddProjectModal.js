import React, { useState, useRef } from "react";

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

export default function AddProjectModal({
    show,
    onClose,
    projForm,
    setProjForm,
    projLoading,
    projError,
    onCreate,
}) {
    const fileInputRef = useRef(null);
    const [imagePreviews, setImagePreviews] = useState([]);

    if (!show) return null;

    // Helper لتحديث الحقول البسيطة
    const handleChange = (field) => (e) => {
        setProjForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    // معالجة المصفوفات (tags, technologies) من نص مفصول بفواصل
    const handleArrayChange = (field) => (e) => {
        const value = e.target.value;
        const array = value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "");
        setProjForm((prev) => ({ ...prev, [field]: array }));
    };

    // معالجة رفع الصور مع معاينة
    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setProjForm((prev) => ({ ...prev, images: files }));

        // إنشاء معاينات
        const previews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    // معالجة checkbox isPublic
    const handleIsPublicChange = (e) => {
        setProjForm((prev) => ({ ...prev, isPublic: e.target.checked }));
    };

    // التحقق من الحقول الإلزامية قبل الإرسال
    const handleCreate = () => {
        if (!projForm.title?.trim()) {
            alert("العنوان مطلوب");
            return;
        }
        if (!projForm.description?.trim()) {
            alert("الوصف الطويل مطلوب");
            return;
        }
        onCreate();
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
                            <i className="bi bi-plus-circle ms-2"></i>
                            إضافة مشروع جديد
                        </h5>
                        <button
                            type="button"
                            className="btn-close me-auto"
                            onClick={onClose}
                        ></button>
                    </div>

                    <div className="modal-body">
                        {/* العنوان (إلزامي) */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                العنوان <span className="text-danger">*</span>
                            </label>
                            <input
                                value={projForm.title || ""}
                                onChange={handleChange("title")}
                                className="form-control rounded-3"
                                placeholder="أدخل عنوان المشروع"
                            />
                        </div>

                        {/* الوصف الطويل (إلزامي) */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                وصف طويل <span className="text-danger">*</span>
                            </label>
                            <textarea
                                value={projForm.description || ""}
                                onChange={handleChange("description")}
                                className="form-control rounded-3"
                                rows="3"
                                placeholder="اشرح المشروع بالتفصيل"
                            />
                        </div>

                        {/* الوصف المختصر (اختياري) */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                وصف مختصر
                            </label>
                            <input
                                value={projForm.shortDescription || ""}
                                onChange={handleChange("shortDescription")}
                                className="form-control rounded-3"
                                placeholder="ملخص سريع (150 حرف كحد أقصى)"
                                maxLength="150"
                            />
                            <small className="text-muted">
                                {projForm.shortDescription?.length || 0}/150
                            </small>
                        </div>

                        {/* الفئة ومستوى المشروع */}
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-medium">
                                    فئة المشروع
                                </label>
                                <select
                                    className="form-select rounded-3"
                                    value={projForm.category || "web"}
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
                                    value={projForm.level || "intermediate"}
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

                        {/* الوسوم (Tags) */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                الوسوم (tags)
                            </label>
                            <input
                                value={(projForm.tags || []).join(", ")}
                                onChange={handleArrayChange("tags")}
                                className="form-control rounded-3"
                                placeholder="أدخل الوسوم مفصولة بفواصل (مثال: react, node, mongodb)"
                            />
                        </div>

                        {/* التقنيات (Technologies) */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                التقنيات المستخدمة
                            </label>
                            <input
                                value={(projForm.technologies || []).join(", ")}
                                onChange={handleArrayChange("technologies")}
                                className="form-control rounded-3"
                                placeholder="أدخل التقنيات مفصولة بفواصل"
                            />
                        </div>

                        {/* الروابط */}
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-medium">
                                    رابط العرض (اختياري)
                                </label>
                                <input
                                    value={projForm.demoUrl || ""}
                                    onChange={handleChange("demoUrl")}
                                    className="form-control rounded-3"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-medium">
                                    رابط GitHub (اختياري)
                                </label>
                                <input
                                    value={projForm.githubUrl || ""}
                                    onChange={handleChange("githubUrl")}
                                    className="form-control rounded-3"
                                    placeholder="https://github.com/username/repo"
                                />
                            </div>
                        </div>

                        {/* رابط فيديو توضيحي */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                رابط فيديو توضيحي (YouTube/Vimeo)
                            </label>
                            <input
                                value={projForm.videoUrl || ""}
                                onChange={handleChange("videoUrl")}
                                className="form-control rounded-3"
                                placeholder="https://youtube.com/watch?v=..."
                            />
                        </div>

                        {/* حالة النشر */}
                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="isPublicCheck"
                                checked={projForm.isPublic !== false}
                                onChange={handleIsPublicChange}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="isPublicCheck"
                            >
                                منشور للجميع (إذا لم تختر، سيكون المشروع خاصاً)
                            </label>
                        </div>

                        {/* صور المشروع مع معاينة */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                صور المشروع (اختياري)
                            </label>
                            <input
                                ref={fileInputRef}
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

                        {/* عرض الخطأ إن وجد */}
                        {projError && (
                            <div className="alert alert-danger rounded-3">
                                <i className="bi bi-exclamation-triangle ms-2"></i>
                                {projError}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-0">
                        <button
                            className="btn btn-outline-secondary rounded-pill px-4"
                            onClick={onClose}
                            disabled={projLoading}
                        >
                            <i className="bi bi-x-lg ms-2"></i>
                            إلغاء
                        </button>
                        <button
                            className="btn btn-primary rounded-pill px-4"
                            onClick={handleCreate}
                            disabled={projLoading}
                        >
                            {projLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm ms-2" />
                                    جاري الإنشاء...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg ms-2"></i>
                                    إنشاء المشروع
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
