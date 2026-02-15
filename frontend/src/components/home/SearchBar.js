import React from "react";

export default function SearchBar({
    search,
    setSearch,
    category,
    setCategory,
    categories,
}) {
    return (
        <div className="d-flex gap-2">
            <div className="input-group input-group-sm" style={{ width: 280 }}>
                <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search"></i>
                </span>
                <input
                    className="form-control border-start-0 ps-0"
                    placeholder="ابحث عن مشروع..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <select
                className="form-select form-select-sm"
                style={{ width: 150 }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                {categories.map((c) => (
                    <option value={c} key={c}>
                        {c === "all" ? "كل الفئات" : c}
                    </option>
                ))}
            </select>
        </div>
    );
}
