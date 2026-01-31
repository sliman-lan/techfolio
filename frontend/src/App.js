import React, { useState, useContext } from "react";
// AuthProvider is provided at the root in index.js
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ProjectDetail from "./pages/ProjectDetail";
import AuthContext from "./context/AuthContext";
import AuthModal from "./components/AuthModal";

export default function App() {
    const [route, setRoute] = useState({ name: "home", params: {} });
    const [authModal, setAuthModal] = useState({ show: false, mode: "login" });
    const auth = useContext(AuthContext);

    const navigate = (name, params = {}) => setRoute({ name, params });

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container-fluid">
                    <button
                        type="button"
                        className="navbar-brand btn btn-link p-0 text-white"
                        onClick={() => navigate("home")}
                    >
                        TechFolio
                    </button>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navmenu"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navmenu">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <button
                                    type="button"
                                    className="nav-link btn btn-link p-0 text-white"
                                    onClick={() => navigate("home")}
                                >
                                    الرئيسية
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    type="button"
                                    className="nav-link btn btn-link p-0 text-white"
                                    onClick={() => navigate("profile")}
                                >
                                    الملف الشخصي
                                </button>
                            </li>
                        </ul>

                        <div className="d-flex">
                            {!auth?.user ? (
                                <>
                                    <button
                                        className="btn btn-outline-light me-2"
                                        onClick={() =>
                                            setAuthModal({
                                                show: true,
                                                mode: "login",
                                            })
                                        }
                                    >
                                        تسجيل دخول
                                    </button>
                                    <button
                                        className="btn btn-light"
                                        onClick={() =>
                                            setAuthModal({
                                                show: true,
                                                mode: "signup",
                                            })
                                        }
                                    >
                                        إنشاء حساب
                                    </button>
                                </>
                            ) : (
                                <div className="btn-group">
                                    <button className="btn btn-light">
                                        {auth.user.name}
                                    </button>
                                    <button
                                        className="btn btn-outline-light"
                                        onClick={() => auth.logout()}
                                    >
                                        تسجيل خروج
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container my-4">
                {route.name === "home" && <Home navigate={navigate} />}
                {route.name === "profile" && (
                    <Profile navigate={navigate} params={route.params} />
                )}
                {route.name === "project" && (
                    <ProjectDetail id={route.params.id} navigate={navigate} />
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
