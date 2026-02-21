import React from "react";

const categoryOptions = [
    { value: "web", label: "ويب" },
    { value: "mobile", label: "موبايل" },
    { value: "ai", label: "ذكاء اصطناعي" },
    { value: "design", label: "تصميم" },
    { value: "other", label: "أخرى" },
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

    // معالجة رفع الصور
    const handleImagesChange = (e) => {
        setProjForm((prev) => ({
            ...prev,
            images: Array.from(e.target.files),
        }));
    };

    // معالجة checkbox isPublic
    const handleIsPublicChange = (e) => {
        setProjForm((prev) => ({ ...prev, isPublic: e.target.checked }));
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

                        {/* الفئة */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                فئة المشروع
                            </label>
                            <select
                                className="form-select rounded-3"
                                value={projForm.category || "web"}
                                onChange={handleChange("category")}
                            >
                                {categoryOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
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

                        {/* حالة النشر */}
                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="isPublicCheck"
                                checked={projForm.isPublic !== false} // افتراضي true
                                onChange={handleIsPublicChange}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="isPublicCheck"
                            >
                                منشور للجميع (إذا لم تختر، سيكون المشروع خاصاً)
                            </label>
                        </div>

                        {/* صور المشروع */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                صور المشروع (اختياري)
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="form-control rounded-3"
                                onChange={handleImagesChange}
                            />
                            {projForm.images?.length > 0 && (
                                <small className="text-muted d-block mt-1">
                                    تم اختيار {projForm.images.length} صورة
                                </small>
                            )}
                        </div>

                        {/* عرض الخطأ إن وجد */}
                        {projError && (
                            <div className="alert alert-danger rounded-3">
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
                            إلغاء
                        </button>
                        <button
                            className="btn btn-primary rounded-pill px-4"
                            onClick={onCreate}
                            disabled={projLoading}
                        >
                            {projLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm ms-2" />
                                    جاري الإنشاء...
                                </>
                            ) : (
                                "إنشاء المشروع"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
