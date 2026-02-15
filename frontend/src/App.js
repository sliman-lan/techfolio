import React, { useState, useContext } from "react";
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

    const navigate = (name, params = {}) => setRoute({ name, params });

    const isActive = (page) => (route.name === page ? "active" : "");

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
                            {auth?.user && auth.user.role === "admin" && (
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
                            {!auth?.user ? (
                                <>
                                    <button
                                        className="btn btn-outline-light rounded-pill px-4 d-flex align-items-center gap-2 transition-hover"
                                        onClick={() =>
                                            setAuthModal({
                                                show: true,
                                                mode: "login",
                                            })
                                        }
                                    >
                                        <i className="bi bi-box-arrow-in-right"></i>
                                        <span>تسجيل دخول</span>
                                    </button>
                                    <button
                                        className="btn btn-light rounded-pill px-4 d-flex align-items-center gap-2 transition-hover"
                                        onClick={() =>
                                            setAuthModal({
                                                show: true,
                                                mode: "signup",
                                            })
                                        }
                                    >
                                        <i className="bi bi-person-plus"></i>
                                        <span>إنشاء حساب</span>
                                    </button>
                                </>
                            ) : (
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-white-50 d-none d-md-inline">
                                        مرحباً،
                                    </span>

                                    <div className="dropdown">
                                        <button
                                            className="btn btn-light rounded-pill dropdown-toggle d-flex align-items-center gap-2"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                            data-bs-auto-close="true"
                                            aria-expanded="false"
                                        >
                                            <i className="bi bi-person-circle"></i>
                                            <span>{auth.user.name}</span>
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
                                                    onClick={() =>
                                                        auth.logout()
                                                    }
                                                >
                                                    <i className="bi bi-box-arrow-right"></i>
                                                    تسجيل خروج
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
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
                    <ProjectDetail id={route.params.id} navigate={navigate} />
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
