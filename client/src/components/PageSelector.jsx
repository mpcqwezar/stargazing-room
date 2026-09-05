import React, { useState, useRef, useEffect } from "react";

export default function PageSelector({ currentPage, onPageChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const pages = [
    { id: "news", label: "� RSS feed", title: "RSS feed" },
    { id: "media", label: "📚 My lists", title: "My lists" },
    { id: "blog", label: "✍️ Blog", title: "Blog" },
  ];

  const currentPageLabel = pages.find(p => p.id === currentPage)?.label || "Pages";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (pageId) => {
    if (pageId === "cv") {
      window.open("https://mpcqwezar.github.io/pmolchanov-website/", "_blank", "noopener");
    } else {
      onPageChange?.(pageId);
    }
    setIsOpen(false);
  };

  return (
    <div className="page-selector" ref={menuRef}>
      <button
        className="page-selector-btn icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Select page"
        aria-label="Select page"
        aria-expanded={isOpen}
      >
        ☰
      </button>

      {isOpen && (
        <div className="page-selector-menu">
          {pages.map((page) => (
            <button
              key={page.id}
              className={`page-selector-item ${currentPage === page.id ? "active" : ""}`}
              onClick={() => handleSelect(page.id)}
              title={page.title}
            >
              {page.label}
            </button>
          ))}
          <div className="page-selector-divider"></div>
          <button
            className="page-selector-item"
            onClick={() => handleSelect("cv")}
            title="Open CV"
          >
            📄 CV
          </button>
        </div>
      )}
    </div>
  );
}
