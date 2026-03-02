import React, { useState } from "react";

export default function ProjectImages({ images, title }) {
    const [selectedImage, setSelectedImage] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="bg-light rounded-3 d-flex align-items-center justify-content-center p-5">
                <i
                    className="bi bi-image text-muted"
                    style={{ fontSize: "4rem" }}
                ></i>
            </div>
        );
    }

    return (
        <div className="project-images">
            {/* الصورة الرئيسية */}
            <div className="main-image mb-3">
                <img
                    src={images[selectedImage]}
                    alt={`${title} - صورة رئيسية`}
                    className="img-fluid rounded-3 w-100"
                    style={{ maxHeight: "400px", objectFit: "contain" }}
                />
            </div>

            {/* معرض الصور المصغرة */}
            {images.length > 1 && (
                <div className="thumbnail-grid d-flex flex-wrap gap-2">
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            className={`thumbnail ${idx === selectedImage ? "active" : ""}`}
                            onClick={() => setSelectedImage(idx)}
                            style={{
                                width: "80px",
                                height: "80px",
                                cursor: "pointer",
                                border:
                                    idx === selectedImage
                                        ? "3px solid #0d6efd"
                                        : "1px solid #dee2e6",
                                borderRadius: "8px",
                                overflow: "hidden",
                            }}
                        >
                            <img
                                src={img}
                                alt={`${title} - صورة ${idx + 1}`}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
