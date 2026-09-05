import { useEffect, useRef, useState } from "react";
import SourceFilter from "./SourceFilter.jsx";
import SourceBar from "./SourceBar.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function PreferencesBar({ sources, onSourcesChange }) {
  const { effectiveTheme } = useTheme();
  const barRef = useRef(null);

  // The bar is fixed, so the feed below needs to know how tall it currently is.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty("--preferences-height", `${entry.target.offsetHeight}px`);
    });
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--preferences-height");
    };
  }, []);

  return (
    <div className="preferences-bar" ref={barRef}>
      <SourceFilter value={sources} onChange={onSourcesChange} />
      {effectiveTheme === "retro" && (
        <div className="preferences-toggles">
          <RetroMuteButton />
        </div>
      )}
      <SourceBar value={sources} onChange={onSourcesChange} showSources />
    </div>
  );
}

function RetroMuteButton() {
  const [muted, setMuted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("retro-muted") || "false");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== "retro-muted") return;
      try {
        setMuted(JSON.parse(event.newValue || "false"));
      } catch {
        setMuted(false);
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

  return (
    <button
      className={`retro-mute-btn btn ${muted ? "muted" : "playing"}`}
      onClick={toggle}
      title={muted ? "Unmute retro" : "Mute retro"}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
