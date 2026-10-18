import "./albums-data.js";
import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import MediaPage from "./components/MediaPage.jsx";
import Blog from "./components/Blog.jsx";
import AlbumsPage from "./components/AlbumsPage.jsx";
import AlbumMapPage from "./components/AlbumMapPage.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
import { LIVE_API_BASE } from "./config.js";

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function dataUrl(endpoint) {
  if (import.meta.env.DEV) return `/api/${endpoint}`;
  if (LIVE_API_BASE) return `${LIVE_API_BASE}/api/${endpoint}`;
  return `${import.meta.env.BASE_URL}data/${endpoint}.json`;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("blog");
  const [media, setMedia] = useState({ letterboxd: [], goodreads: [], updatedAt: null, loading: false });
  const { effectiveTheme } = useTheme();

  // Prefer the live Worker; fall back to static JSON if it is down.
  const loadData = async (endpoint) => {
    const primary = dataUrl(endpoint);
    const fallback =
      !import.meta.env.DEV && LIVE_API_BASE
        ? `${import.meta.env.BASE_URL}data/${endpoint}.json`
        : null;

    try {
      const data = await fetchJson(primary);
      applyData(data);
    } catch (e) {
      console.error(`Failed to load ${endpoint} from ${primary}:`, e);
      if (fallback) {
        try {
          const data = await fetchJson(fallback);
          applyData(data);
          return;
        } catch (fallbackError) {
          console.error(`Fallback failed for ${endpoint}:`, fallbackError);
        }
      }
      setMedia(prev => ({ ...prev, loading: false }));
    }
  };

  const applyData = (data) => {
    setMedia(prev => ({
      ...prev,
      letterboxd: data.letterboxd || [],
      goodreads: data.goodreads || [],
      updatedAt: data.updatedAt,
      loading: false
    }));
  };

  useEffect(() => {
    loadData("media");
    const mediaId = setInterval(() => loadData("media"), 10 * 60 * 1000);
    return () => clearInterval(mediaId);
  }, []);

  useEffect(() => {
    if (effectiveTheme !== "dark") return;
    const interval = setInterval(() => {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = "-10px";
      star.style.top = `${Math.random() * 40}vh`;
      star.style.animationDuration = `${2 + Math.random() * 2}s`;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 4000);
    }, 1000);
    return () => clearInterval(interval);
  }, [effectiveTheme]);

  const headerProps = {
    currentPage,
    onPageChange: setCurrentPage,
    onMediaRefresh: () => {
      setMedia(p => ({ ...p, loading: true }));
      loadData("media");
    },
    isMediaRefreshing: media.loading
  };

  return (
    <>
      <Header {...headerProps} />
      {currentPage === "media" && <MediaPage mediaData={media} mediaUpdatedAt={media.updatedAt} onPageChange={setCurrentPage} />}
      {currentPage === "blog" && <Blog />}
      {currentPage === "albums" && <AlbumsPage />}
      {currentPage === "map" && <AlbumMapPage />}
    </>
  );
}
