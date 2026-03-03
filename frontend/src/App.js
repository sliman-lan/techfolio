import React, { useState, useContext, useEffect } from "react";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ProjectDetail from "./pages/ProjectDetail";
import AuthContext from "./context/AuthContext";
import AuthModal from "./components/AuthModal";

export default function App() {
    const [route, setRoute] = useState({ name: "home", params: {} });
    const [authModal, setAuthModal] = useState({ show: false, mode: "login" });
    const auth = useContext(AuthContext);

    // منع التمرير عند فتح المودال
    useEffect(() => {
        if (authModal.show) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => document.body.classList.remove("modal-open");
    }, [authModal.show]);

    const navigate = (name, params = {}) => {
        console.log("🔀 Navigating to:", name, params);
        setRoute({ name, params });
    };

    const isActive = (page) => (route.name === page ? "active" : "");

    // استخدام الخاصية المحسنة isAuthenticated من AuthContext
    // إذا لم يكن المستخدم مصادقاً، نعرض شاشة الترحيب المحسنة
    if (!auth?.isAuthenticated) {
        return (
            <div className="min-vh-100 bg-light">
                {/* Hero Section */}
                <div className="bg-primary text-white py-5">
                    <div className="container text-center py-5">
                        <i className="bi bi-code-square display-1 mb-3"></i>
                        <h1 className="display-3 fw-bold mb-3">TechFolio</h1>
                        <p className="lead fs-3 mb-4">
                            منصة عرض المشاريع التقنية للطلاب
                        </p>
                        <p className="fs-5 mb-5 opacity-75">
                            أنشئ ملفك التقني الاحترافي وشارك مشاريعك مع المجتمع
                        </p>

                        <div className="d-flex gap-3 justify-content-center">
                            <button
                                className="btn btn-light btn-lg rounded-pill px-5 py-3 fw-bold"
                                onClick={() =>
                                    setAuthModal({ show: true, mode: "signup" })
                                }
                            >
                                <i className="bi bi-person-plus me-2"></i>
                                ابدأ الآن - مجاناً
                            </button>
                            <button
                                className="btn btn-outline-light btn-lg rounded-pill px-5 py-3"
                                onClick={() =>
                                    setAuthModal({ show: true, mode: "login" })
                                }
                            >
                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                تسجيل دخول
                            </button>
                        </div>
                    </div>
                </div>

                {/* المميزات - Features */}
                <div className="container py-5">
                    <h2 className="text-center fw-bold mb-5">
                        لماذا TechFolio؟
                    </h2>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center">
                                <div
                                    className="bg-primary bg-opacity-10 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                                    style={{ width: 80, height: 80 }}
                                >
                                    <i className="bi bi-folder-check text-primary fs-1"></i>
                                </div>
                                <h5 className="fw-bold mb-3">
                                    ملف تقني متكامل
                                </h5>
                                <p className="text-muted">
                                    أنشئ ملفك الشخصي وعرض مشاريعك، مهاراتك،
                                    وشهاداتك في مكان واحد بتصميم احترافي
                                </p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center">
                                <div
                                    className="bg-primary bg-opacity-10 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                                    style={{ width: 80, height: 80 }}
                                >
                                    <i className="bi bi-chat-dots text-primary fs-1"></i>
                                </div>
                                <h5 className="fw-bold mb-3">تفاعل وتعاون</h5>
                                <p className="text-muted">
                                    تبادل الخبرات مع زملائك، تابع مشاريعهم،
                                    وشاركهم آراءك وتعليقاتك
                                </p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center">
                                <div
                                    className="bg-primary bg-opacity-10 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                                    style={{ width: 80, height: 80 }}
                                >
                                    <i className="bi bi-star text-primary fs-1"></i>
                                </div>
                                <h5 className="fw-bold mb-3">تقييم وتعليقات</h5>
                                <p className="text-muted">
                                    احصل على تقييمات وتعليقات من الأساتذة
                                    والمختصين لتطوير مشاريعك
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* إحصائيات (يمكن إضافتها لاحقاً من الـ API) */}
                <div className="bg-white py-5 border-top">
                    <div className="container">
                        <div className="row text-center">
                            <div className="col-md-4">
                                <div className="display-4 fw-bold text-primary mb-2">
                                    +500
                                </div>
                                <div className="text-muted">مشروع منشور</div>
                            </div>
                            <div className="col-md-4">
                                <div className="display-4 fw-bold text-primary mb-2">
                                    +200
                                </div>
                                <div className="text-muted">طالب مسجل</div>
                            </div>
                            <div className="col-md-4">
                                <div className="display-4 fw-bold text-primary mb-2">
                                    +50
                                </div>
                                <div className="text-muted">أستاذ ومشرف</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* كيف يعمل الموقع */}
                <div className="container py-5">
                    <h2 className="text-center fw-bold mb-5">
                        كيف يعمل TechFolio؟
                    </h2>

                    <div className="row align-items-center">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <img
                                src="https://via.placeholder.com/500x400/4f46e5/ffffff?text=TechFolio"
                                alt="TechFolio Demo"
                                className="img-fluid rounded-4 shadow-lg"
                            />
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex gap-3 mb-4">
                                <div
                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{ width: 40, height: 40 }}
                                >
                                    1
                                </div>
                                <div>
                                    <h5 className="fw-bold">أنشئ حسابك</h5>
                                    <p className="text-muted">
                                        سجل دخولك بسهولة باستخدام بريدك
                                        الإلكتروني
                                    </p>
                                </div>
                            </div>

                            <div className="d-flex gap-3 mb-4">
                                <div
                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{ width: 40, height: 40 }}
                                >
                                    2
                                </div>
                                <div>
                                    <h5 className="fw-bold">أضف مشاريعك</h5>
                                    <p className="text-muted">
                                        شارك مشاريعك مع الصور والروابط والتقنيات
                                        المستخدمة
                                    </p>
                                </div>
                            </div>

                            <div className="d-flex gap-3 mb-4">
                                <div
                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{ width: 40, height: 40 }}
                                >
                                    3
                                </div>
                                <div>
                                    <h5 className="fw-bold">
                                        ابنِ ملفك التقني
                                    </h5>
                                    <p className="text-muted">
                                        أضف مهاراتك وشهاداتك لتكوين ملف شخصي
                                        متكامل
                                    </p>
                                </div>
                            </div>

                            <div className="d-flex gap-3">
                                <div
                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{ width: 40, height: 40 }}
                                >
                                    4
                                </div>
                                <div>
                                    <h5 className="fw-bold">تواصل وشارك</h5>
                                    <p className="text-muted">
                                        تفاعل مع زملائك، تابع مشاريعهم، واستفد
                                        من خبراتهم
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* دعوة للتسجيل - Call to Action */}
                <div className="bg-primary text-white py-5">
                    <div className="container text-center py-4">
                        <h2 className="fw-bold mb-3">
                            انضم إلى مجتمع TechFolio اليوم
                        </h2>
                        <p className="fs-5 mb-4 opacity-75">
                            أنشئ ملفك التقني وشارك مشاريعك مع آلاف الطلاب
                        </p>
                        <button
                            className="btn btn-light btn-lg rounded-pill px-5 py-3 fw-bold"
                            onClick={() =>
                                setAuthModal({ show: true, mode: "signup" })
                            }
                        >
                            <i className="bi bi-person-plus me-2"></i>
                            أنشئ حسابك مجاناً
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-dark text-white-50 py-4">
                    <div className="container text-center">
                        <p className="mb-0">
                            © 2024 TechFolio - منصة عرض المشاريع التقنية للطلاب
                        </p>
                    </div>
                </footer>

                {/* Modal */}
                <AuthModal
                    show={authModal.show}
                    mode={authModal.mode}
                    onClose={() => setAuthModal({ show: false, mode: "login" })}
                />
            </div>
        );
    }

    // إذا كان المستخدم مصادقاً، نعرض المحتوى الكامل
    return (
        <div className="app-wrapper">
            <nav className="navbar navbar-expand-lg sticky-top navbar-dark py-3 px-4 glass-nav">
                <div className="container-fluid px-0">
                    <button
                        type="button"
                        className="navbar-brand btn btn-link p-0 text-white fs-4 fw-bold d-flex align-items-center gap-2"
                        onClick={() => navigate("home")}
                    >
                        <i className="bi bi-code-square"></i>
                        <span>TechFolio</span>
                    </button>
                    <button
                        className="navbar-toggler border-0"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navmenu"
                        aria-controls="navmenu"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navmenu">
                        <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-3">
                            <li className="nav-item">
                                <button
                                    type="button"
                                    className={`nav-link btn btn-link px-3 py-2 rounded-pill text-white d-flex align-items-center gap-2 transition-hover ${isActive("home")}`}
                                    onClick={() => navigate("home")}
                                >
                                    <i className="bi bi-house-door"></i>
                                    <span>الرئيسية</span>
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    type="button"
                                    className={`nav-link btn btn-link px-3 py-2 rounded-pill text-white d-flex align-items-center gap-2 transition-hover ${isActive("profile")}`}
                                    onClick={() => navigate("profile")}
                                >
                                    <i className="bi bi-person-circle"></i>
                                    <span>الملف الشخصي</span>
                                </button>
                            </li>
                            {auth.isAdmin && (
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link btn btn-link px-3 py-2 rounded-pill text-white d-flex align-items-center gap-2 transition-hover ${isActive("admin")}`}
                                        onClick={() => navigate("admin")}
                                    >
                                        <i className="bi bi-shield-lock"></i>
                                        <span>لوحة المشرف</span>
                                    </button>
                                </li>
                            )}
                        </ul>

                        <div className="d-flex align-items-center gap-2">
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-white-50 d-none d-md-inline">
                                    مرحباً،
                                </span>
                                <div className="dropdown">
                                    <button
                                        className="btn btn-light rounded-pill dropdown-toggle d-flex align-items-center gap-2"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <i className="bi bi-person-circle"></i>
                                        <span>{auth.user?.name}</span>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-start rounded-3 shadow-sm border-0 mt-2">
                                        <li>
                                            <button
                                                className="dropdown-item d-flex align-items-center gap-2 py-2"
                                                onClick={() =>
                                                    navigate("profile")
                                                }
                                            >
                                                <i className="bi bi-person"></i>
                                                الملف الشخصي
                                            </button>
                                        </li>
                                        <li>
                                            <hr className="dropdown-divider" />
                                        </li>
                                        <li>
                                            <button
                                                className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                                                onClick={() => auth.logout()}
                                            >
                                                <i className="bi bi-box-arrow-right"></i>
                                                تسجيل خروج
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container my-5 page-transition">
                {route.name === "home" && <Home navigate={navigate} />}
                {route.name === "profile" && (
                    <Profile navigate={navigate} params={route.params} />
                )}
                {route.name === "project" && (
                    <ProjectDetail
                        id={route.params.id}
                        navigate={navigate}
                        asAdmin={route.params.asAdmin} // ✅ هذا السطر المضاف
                    />
                )}
                {route.name === "admin" && (
                    <AdminDashboard navigate={navigate} />
                )}
            </div>

            <AuthModal
                show={authModal.show}
                mode={authModal.mode}
                onClose={() => setAuthModal({ show: false, mode: "login" })}
            />
        </div>
    );
}
