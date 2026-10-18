import React from "react";
import PageSelector from "./PageSelector.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

// The button shows where the next click leads, not the current theme.
const THEME_ICONS = { dark: "🌙", light: "☀️" };

export default function Header({ onMediaRefresh, isMediaRefreshing, currentPage, onPageChange }) {
  const isMedia = currentPage === "media";
  const assets = import.meta.env.BASE_URL;
  const { nextTheme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <h1 className="header-title">
        <picture>
          <source media="(max-width: 768px)" srcSet={`${assets}mobile_logo.png`} />
          <img className="header-logo" src={`${assets}logo.png`} alt="Комната с видом на звёзды" />
        </picture>
      </h1>
      <div className="header-actions">
        <span className="header-copyright">© 2025–2026 Pavel Molchanov. All rights reserved.</span>
        {isMedia && (
          <button className={`refresh-button icon-btn${isMediaRefreshing ? " loading" : ""}`} onClick={onMediaRefresh} disabled={isMediaRefreshing} aria-label="Refresh" aria-busy={isMediaRefreshing}>
            {isMediaRefreshing ? <span className="spinner" aria-hidden="true" /> : '⟳'}
          </button>
        )}
        <button
          className="theme-toggle icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${nextTheme} theme`}
        >
          {THEME_ICONS[nextTheme]}
        </button>
        <PageSelector currentPage={currentPage} onPageChange={onPageChange} />
      </div>
    </header>
  );
}
