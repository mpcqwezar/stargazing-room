import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import gif from "../assets/giphy.gif";
import music from "../assets/music.mp3";

export default function RetroMedia() {
  const { effectiveTheme } = useTheme();
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("retro-muted")) || false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem("retro-muted", JSON.stringify(muted));
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (effectiveTheme !== "retro") return;
    const a = audioRef.current;
    if (!a) return;
    const p = a.play();
    if (p && p.catch) p.catch(() => {
      a.muted = true;
      setMuted(true);
    });
  }, [effectiveTheme]);

  useEffect(() => {
    const onToggle = (e) => {
      const value = e?.detail?.muted ?? JSON.parse(localStorage.getItem("retro-muted") || "false");
      setMuted(!!value);
    };

    const onStorage = (e) => {
      if (e.key === "retro-muted") {
        try {
          setMuted(JSON.parse(e.newValue || "false"));
        } catch (err) {}
      }
    };

    window.addEventListener("retro-toggle-mute", onToggle);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("retro-toggle-mute", onToggle);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (effectiveTheme !== "retro") return null;

  return (
  <div className="retro-media" aria-hidden={true}>
    <img src={gif} alt="retro" className="retro-gif" />

    <audio
      ref={audioRef}
      src={music}
      loop
      autoPlay
      muted={muted}
    />
  </div>
);
}
