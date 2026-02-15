import React, { useState } from "react";

export default function CommentForm({ onSubmit }) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setLoading(true);
        const result = await onSubmit(content.trim());
        setLoading(false);
        if (result?.success) {
            setContent("");
        } else if (result?.message) {
            alert(result.message);
        }
    };

    return (
        <div className="bg-light p-4 rounded-4 mb-4">
            <h6 className="fw-bold mb-3">أضف تعليقك</h6>
            <textarea
                className="form-control rounded-3 border-0 shadow-sm mb-3"
                placeholder="اكتب تعليقك هنا..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
                rows="3"
            />
            <div className="d-flex gap-2 justify-content-end">
                <button
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setContent("")}
                    disabled={loading}
                >
                    إلغاء
                </button>
                <button
                    className="btn btn-primary rounded-pill px-4"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="spinner-border spinner-border-sm ms-2" />
                    ) : (
                        "نشر التعليق"
                    )}
                </button>
            </div>
        </div>
    );
}
