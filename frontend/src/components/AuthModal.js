import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

export default function AuthModal({ show, mode = "login", onClose }) {
    const { login, register } = useContext(AuthContext);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!show) return null;

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Client-side validation: prevent sending too-short passwords to server
        if (mode !== "login") {
            if (!form.password || form.password.length < 6) {
                setError("كلمة المرور يجب أن تتكون من 6 أحرف على الأقل");
                return;
            }
            if (!form.name || form.name.trim() === "") {
                setError("الاسم مطلوب");
                return;
            }
        }

        setLoading(true);
        try {
            if (mode === "login") {
                await login({ email: form.email, password: form.password });
            } else {
                await register({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                });
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "حدث خطأ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop show" style={{ zIndex: 1050 }}>
            <div
                className="modal d-block"
                tabIndex="-1"
                role="dialog"
                style={{ zIndex: 1060 }}
            >
                <div
                    className="modal-dialog modal-dialog-centered"
                    role="document"
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {mode === "login"
                                    ? "تسجيل الدخول"
                                    : "إنشاء حساب"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={onClose}
                            />
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {mode === "signup" && (
                                    <div className="mb-3">
                                        <label className="form-label">
                                            الاسم
                                        </label>
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label">
                                        البريد الإلكتروني
                                    </label>
                                    <input
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        type="email"
                                        className="form-control"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        كلمة المرور
                                    </label>
                                    <input
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        type="password"
                                        className="form-control"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="alert alert-danger">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    إغلاق
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "جارٍ..."
                                        : mode === "login"
                                        ? "تسجيل الدخول"
                                        : "إنشاء حساب"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
