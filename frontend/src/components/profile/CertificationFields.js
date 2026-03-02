import React from "react";

export default function CertificationFields({ cert, idx, onChange, onRemove }) {
    return (
        <div className="border rounded-3 p-3 mb-2 bg-light position-relative">
            <div className="mb-2">
                <label className="form-label fw-medium small">
                    عنوان الشهادة
                </label>
                <input
                    className="form-control form-control-sm"
                    placeholder="مثال: شهادة في React"
                    value={cert.title || ""}
                    onChange={(e) => onChange(idx, "title", e.target.value)}
                />
            </div>
            <div className="mb-2">
                <label className="form-label fw-medium small">
                    الجهة المانحة
                </label>
                <input
                    className="form-control form-control-sm"
                    placeholder="مثال: Coursera"
                    value={cert.issuer || ""}
                    onChange={(e) => onChange(idx, "issuer", e.target.value)}
                />
            </div>
            <div className="row g-2">
                <div className="col">
                    <label className="form-label fw-medium small">
                        تاريخ الإصدار
                    </label>
                    <input
                        type="date"
                        className="form-control form-control-sm"
                        value={
                            cert.date
                                ? new Date(cert.date).toISOString().slice(0, 10)
                                : ""
                        }
                        onChange={(e) => onChange(idx, "date", e.target.value)}
                    />
                </div>
                <div className="col">
                    <label className="form-label fw-medium small">
                        رقم الاعتماد (اختياري)
                    </label>
                    <input
                        className="form-control form-control-sm"
                        placeholder="Credential ID"
                        value={cert.credentialId || ""}
                        onChange={(e) =>
                            onChange(idx, "credentialId", e.target.value)
                        }
                    />
                </div>
            </div>
            <div className="mt-2">
                <label className="form-label fw-medium small">
                    رابط التحقق (اختياري)
                </label>
                <input
                    className="form-control form-control-sm"
                    placeholder="https://example.com/verify"
                    value={cert.credentialUrl || ""}
                    onChange={(e) =>
                        onChange(idx, "credentialUrl", e.target.value)
                    }
                />
            </div>
            <button
                className="btn btn-outline-danger btn-sm position-absolute top-0 start-0 m-2"
                onClick={() => onRemove(idx)}
                title="حذف الشهادة"
            >
                <i className="bi bi-trash"></i>
            </button>
        </div>
    );
}
