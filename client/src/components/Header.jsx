import React from "react";
import PageSelector from "./PageSelector.jsx";

export default function Header({ onRefresh, isRefreshing, onMediaRefresh, isMediaRefreshing, showSources, onShowSourcesChange, currentPage, onPageChange }) {
  const isNews = currentPage === "news";
  const isMedia = currentPage === "media";
  const assets = import.meta.env.BASE_URL;

  return (
    <header className="header">
      <h1 className="header-title">
        <picture>
          <source media="(max-width: 768px)" srcSet={`${assets}mobile_logo.png`} />
          <img className="header-logo" src={`${assets}logo.png`} alt="Комната с видом на звёзды" />
        </picture>
      </h1>
      <div className="header-actions">
        {isNews && (
          <>
            <button className={`refresh-button icon-btn${isRefreshing ? " loading" : ""}`} onClick={onRefresh} disabled={isRefreshing} aria-label="Refresh" aria-busy={isRefreshing}>
              {isRefreshing ? <span className="spinner" aria-hidden="true" /> : '⟳'}
            </button>
            <button
              className={`preferences-btn${showSources ? " active" : ""}`}
              onClick={() => onShowSourcesChange?.(!showSources)}
              aria-expanded={showSources}
            >
              ⚙️
            </button>
          </>
        )}
        {isMedia && (
          <button className={`refresh-button icon-btn${isMediaRefreshing ? " loading" : ""}`} onClick={onMediaRefresh} disabled={isMediaRefreshing} aria-label="Refresh" aria-busy={isMediaRefreshing}>
            {isMediaRefreshing ? <span className="spinner" aria-hidden="true" /> : '⟳'}
          </button>
        )}
        <PageSelector currentPage={currentPage} onPageChange={onPageChange} />
      </div>
    </header>
  );
}
