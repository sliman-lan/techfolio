import React from "react";

const categoryOptions = [
    { value: "web", label: "ويب" },
    { value: "mobile", label: "موبايل" },
    { value: "ai", label: "ذكاء اصطناعي" },
    { value: "arduino", label: "أردوينو" },
    { value: "game", label: "ألعاب" },
    { value: "desktop", label: "تطبيقات سطح مكتب" },
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
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                العنوان <span className="text-danger">*</span>
                            </label>
                            <input
                                value={projForm.title}
                                onChange={(e) =>
                                    setProjForm((f) => ({
                                        ...f,
                                        title: e.target.value,
                                    }))
                                }
                                className="form-control rounded-3"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                وصف طويل
                            </label>
                            <textarea
                                value={projForm.description}
                                onChange={(e) =>
                                    setProjForm((f) => ({
                                        ...f,
                                        description: e.target.value,
                                    }))
                                }
                                className="form-control rounded-3"
                                rows="3"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                وصف مختصر
                            </label>
                            <input
                                value={projForm.shortDescription}
                                onChange={(e) =>
                                    setProjForm((f) => ({
                                        ...f,
                                        shortDescription: e.target.value,
                                    }))
                                }
                                className="form-control rounded-3"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                فئة المشروع
                            </label>
                            <select
                                className="form-select rounded-3"
                                value={projForm.category}
                                onChange={(e) =>
                                    setProjForm((f) => ({
                                        ...f,
                                        category: e.target.value,
                                    }))
                                }
                            >
                                {categoryOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-medium">
                                    رابط العرض (اختياري)
                                </label>
                                <input
                                    value={projForm.demoUrl}
                                    onChange={(e) =>
                                        setProjForm((f) => ({
                                            ...f,
                                            demoUrl: e.target.value,
                                        }))
                                    }
                                    className="form-control rounded-3"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-medium">
                                    رابط GitHub (اختياري)
                                </label>
                                <input
                                    value={projForm.githubUrl}
                                    onChange={(e) =>
                                        setProjForm((f) => ({
                                            ...f,
                                            githubUrl: e.target.value,
                                        }))
                                    }
                                    className="form-control rounded-3"
                                />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-medium">
                                صور المشروع (اختياري)
                            </label>
                            <input
                                type="file"
                                multiple
                                className="form-control rounded-3"
                                onChange={(e) =>
                                    setProjForm((f) => ({
                                        ...f,
                                        images: Array.from(e.target.files),
                                    }))
                                }
                            />
                        </div>
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
                                <span className="spinner-border spinner-border-sm ms-2" />
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
