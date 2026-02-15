import React from "react";

export default function CertificationFields({ cert, idx, onChange, onRemove }) {
    return (
        <div className="border rounded-3 p-3 mb-2 bg-light">
            <div className="mb-2">
                <input
                    className="form-control form-control-sm"
                    placeholder="العنوان"
                    value={cert.title || ""}
                    onChange={(e) => onChange(idx, "title", e.target.value)}
                />
            </div>
            <div className="mb-2">
                <input
                    className="form-control form-control-sm"
                    placeholder="الجهة المانحة"
                    value={cert.issuer || ""}
                    onChange={(e) => onChange(idx, "issuer", e.target.value)}
                />
            </div>
            <div className="d-flex gap-2 align-items-center">
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
                <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onRemove(idx)}
                >
                    <i className="bi bi-trash"></i>
                </button>
            </div>
        </div>
    );
}
