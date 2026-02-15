import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { projectsAPI, usersAPI } from "../services/api";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileProjects from "../components/profile/ProfileProjects";
import AddProjectModal from "../components/profile/AddProjectModal";

export default function Profile({ navigate, params }) {
    const { user, updateProfile } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: "",
        bio: "",
        skills: "",
        certifications: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [projForm, setProjForm] = useState({
        title: "",
        description: "",
        shortDescription: "",
        category: "web",
        demoUrl: "",
        githubUrl: "",
        images: [],
    });
    const [projLoading, setProjLoading] = useState(false);
    const [projError, setProjError] = useState(null);

    const [viewUser, setViewUser] = useState(null);
    const [userProjects, setUserProjects] = useState([]);
    const [adminStats, setAdminStats] = useState({
        total: 0,
        rated: 0,
        unrated: 0,
        recent: [],
    });

    // Populate form when logged-in user changes
    useEffect(() => {
        setForm({
            name: user?.name || "",
            bio: user?.bio || "",
            skills: Array.isArray(user?.skills)
                ? user.skills.join(", ")
                : user?.skills || "",
            certifications: Array.isArray(user?.certifications)
                ? user.certifications
                : [],
        });
    }, [user]);

    // Load profile data (other user) and projects
    useEffect(() => {
        let mounted = true;

        async function loadData() {
            try {
                // 1. Load other user's profile if userId param exists
                if (params?.userId) {
                    const res = await usersAPI.getProfile(params.userId);
                    if (!mounted) return;
                    setViewUser(res.data);
                } else {
                    setViewUser(null);
                }

                // 2. Load projects of the profile owner
                const ownerId = params?.userId || user?._id;
                if (ownerId) {
                    const projRes = await projectsAPI.list({ userId: ownerId });
                    if (!mounted) return;
                    setUserProjects(projRes.data || []);
                } else {
                    setUserProjects([]);
                }

                // 3. If admin is viewing own profile, fetch overall stats
                if (!params?.userId && user?.role === "admin") {
                    const statsRes = await projectsAPI.adminList();
                    if (!mounted) return;
                    const projects = statsRes.data?.data || statsRes.data || [];
                    const total = projects.length;
                    const rated = projects.filter(
                        (p) => Array.isArray(p.ratings) && p.ratings.length > 0,
                    ).length;
                    const unrated = total - rated;
                    const recent = projects.slice(0, 10);
                    setAdminStats({ total, rated, unrated, recent });
                }
            } catch (err) {
                if (!mounted) return;
                // On error, reset viewUser and userProjects
                setViewUser(null);
                setUserProjects([]);
                console.error("Error loading profile data", err);
            }
        }

        loadData();

        return () => {
            mounted = false;
        };
    }, [params, user]);

    // Open project modal if requested
    useEffect(() => {
        if (params?.openAddProject) {
            setShowProjectModal(true);
        }
    }, [params]);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        setError(null);
        setLoading(true);
        try {
            // Admins can only update name and bio
            let payload;
            if (user?.role === "admin") {
                payload = { name: form.name, bio: form.bio };
            } else {
                payload = {
                    name: form.name,
                    bio: form.bio,
                    skills: form.skills
                        ? form.skills
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                        : [],
                    certifications: Array.isArray(form.certifications)
                        ? form.certifications
                        : [],
                };
            }

            await updateProfile(payload);
            setEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || "حدث خطأ أثناء الحفظ");
        } finally {
            setLoading(false);
        }
    };

    const isViewingOther = params?.userId && params.userId !== user?._id;
    if (!user && !isViewingOther) {
        return (
            <div className="alert alert-info">
                يرجى تسجيل الدخول لعرض الملف الشخصي
            </div>
        );
    }

    return (
        <div className="row">
            <div className="col-12 col-md-4">
                <div className="card mb-3 shadow-sm">
                    <ProfileSidebar
                        user={user}
                        viewUser={viewUser}
                        isViewingOther={isViewingOther}
                        editing={editing}
                        form={form}
                        setForm={setForm}
                        loading={loading}
                        error={error}
                        onFieldChange={handleChange}
                        onSave={handleSave}
                        onCancelEdit={() => setEditing(false)}
                        onStartEdit={() => setEditing(true)}
                    />
                </div>
            </div>
            <div className="col-12 col-md-8">
                <ProfileProjects
                    isViewingOther={isViewingOther}
                    user={user}
                    userProjects={userProjects}
                    adminStats={adminStats}
                    onAddProject={() => setShowProjectModal(true)}
                    navigate={navigate}
                />
            </div>

            {showProjectModal && (
                <AddProjectModal
                    show={showProjectModal}
                    onClose={() => setShowProjectModal(false)}
                    projForm={projForm}
                    setProjForm={setProjForm}
                    projLoading={projLoading}
                    projError={projError}
                    setProjError={setProjError}
                    setProjLoading={setProjLoading}
                    onCreate={async () => {
                        setProjError(null);
                        if (
                            !projForm.title ||
                            projForm.title.trim().length === 0
                        ) {
                            setProjError("العنوان مطلوب");
                            return;
                        }
                        setProjLoading(true);
                        try {
                            const formData = new FormData();
                            formData.append("title", projForm.title);
                            formData.append(
                                "description",
                                projForm.description || "",
                            );
                            formData.append(
                                "shortDescription",
                                projForm.shortDescription || "",
                            );
                            formData.append("category", projForm.category);
                            if (projForm.demoUrl)
                                formData.append("demoUrl", projForm.demoUrl);
                            if (projForm.githubUrl)
                                formData.append(
                                    "githubUrl",
                                    projForm.githubUrl,
                                );
                            for (const file of projForm.images || []) {
                                formData.append("images", file);
                            }
                            const res = await projectsAPI.create(formData);
                            const created = res.data || res;
                            setShowProjectModal(false);
                            if (created && created._id) {
                                navigate &&
                                    navigate("project", { id: created._id });
                            } else {
                                alert("تم إنشاء المشروع بنجاح");
                            }
                        } catch (err) {
                            setProjError(
                                err.response?.data?.message ||
                                    "حدث خطأ أثناء إنشاء المشروع",
                            );
                        } finally {
                            setProjLoading(false);
                        }
                    }}
                />
            )}
        </div>
    );
}
