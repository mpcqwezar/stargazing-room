import React, { useState, useEffect } from "react";
import SourceFilter from "./SourceFilter.jsx";
import PageSelector from "./PageSelector.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Header({ sources, onSourcesChange, onRefresh, isRefreshing, onMediaRefresh, isMediaRefreshing, showSources, onShowSourcesChange, currentPage, onPageChange }) {
  const { theme, toggleTheme, pageTheme } = useTheme();
  const isNews = currentPage === "news";
  const isMedia = currentPage === "media";
  const themeIcon = { dark: "☀️", light: "👾" }[theme] || "🌙";

  return (
    <header className="header">
      <h1 className="header-title">Комната с видом на звёзд</h1>
      {isNews && <SourceFilter value={sources} onChange={onSourcesChange} />}
      <div className="header-actions">
        {isNews && (
          <>
            <button className={`refresh-button icon-btn${isRefreshing ? " loading" : ""}`} onClick={onRefresh} disabled={isRefreshing} aria-label="Refresh" aria-busy={isRefreshing}>
              {isRefreshing ? <span className="spinner" aria-hidden="true" /> : '⟳'}
            </button>
            <button className="preferences-btn" onClick={() => onShowSourcesChange?.(!showSources)}>⚙️</button>
            <button className="theme-toggle icon-btn" onClick={toggleTheme} disabled={pageTheme !== null} aria-label="Toggle theme">{themeIcon}</button>
          </>
        )}
        {isMedia && (
          <button className={`refresh-button icon-btn${isMediaRefreshing ? " loading" : ""}`} onClick={onMediaRefresh} disabled={isMediaRefreshing} aria-label="Refresh" aria-busy={isMediaRefreshing}>
            {isMediaRefreshing ? <span className="spinner" aria-hidden="true" /> : '⟳'}
          </button>
        )}
        <PageSelector currentPage={currentPage} onPageChange={onPageChange} />
        {isNews && theme === "retro" && <RetroMuteButton />}
      </div>
    </header>
  );
}

function RetroMuteButton() {
  const [muted, setMuted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("retro-muted") || "false");
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "retro-muted") {
        try {
          setMuted(JSON.parse(e.newValue || "false"));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem("retro-muted", JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("retro-toggle-mute", { detail: { muted: next } }));
  };

  return <button className={`retro-mute-btn btn ${muted ? "muted" : "playing"}`} onClick={toggle} title={muted ? "Unmute retro" : "Mute retro"}>{muted ? "🔇" : "🔊"}</button>;
}
