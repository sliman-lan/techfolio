import React from "react";
import useProject from "../hooks/useProject";
import useComments from "../hooks/useComments";
import ProjectInfo from "../components/project/ProjectInfo";
import CommentForm from "../components/project/CommentForm";
import CommentList from "../components/project/CommentList";

export default function ProjectDetail({ id, navigate }) {
    const { project, loading, error } = useProject(id);
    const {
        comments,
        loading: commentsLoading,
        addComment,
        toggleLike,
    } = useComments(id);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">جارٍ التحميل...</span>
                </div>
                <p className="mt-2 text-muted">جاري تحميل المشروع...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger rounded-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
            </div>
        );
    }

    if (!project) {
        return (
            <div className="alert alert-warning rounded-3">
                <i className="bi bi-question-circle me-2"></i>
                المشروع غير موجود
            </div>
        );
    }

    return (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <ProjectInfo project={project} navigate={navigate} />
            <div className="card-body p-4 border-top">
                <h5 className="fw-bold mb-4">التعليقات</h5>
                <CommentForm onSubmit={addComment} />
                <CommentList
                    comments={comments}
                    loading={commentsLoading}
                    onToggleLike={toggleLike}
                />
            </div>
        </div>
    );
}
