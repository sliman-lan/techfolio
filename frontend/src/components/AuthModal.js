import React, { useState } from "react";
import AuthContext from "../context/AuthContext";

export default function AuthModal({ show, mode, onClose }) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const auth = React.useContext(AuthContext);

    if (!show) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (mode === "login") {
                await auth.login(form);
            } else {
                await auth.register(form);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "حدث خطأ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="auth-modal-overlay"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
            }}
            onClick={onClose}
        >
            <div
                className="auth-modal-content"
                style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "32px",
                    maxWidth: "400px",
                    width: "90%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    position: "relative",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                    zIndex: 10000,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        background: "none",
                        border: "none",
                        fontSize: "24px",
                        cursor: "pointer",
                        color: "#666",
                    }}
                >
                    &times;
                </button>

                <h2 className="text-center mb-4">
                    {mode === "login" ? "تسجيل دخول" : "إنشاء حساب جديد"}
                </h2>

                {error && (
                    <div className="alert alert-danger mb-3">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    {mode === "signup" && (
                        <div className="mb-3">
                            <label className="form-label">الاسم</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="form-control"
                                required
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label">البريد الإلكتروني</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="form-control"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label">كلمة المرور</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="form-control"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm" />
                        ) : mode === "login" ? (
                            "تسجيل دخول"
                        ) : (
                            "إنشاء حساب"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
