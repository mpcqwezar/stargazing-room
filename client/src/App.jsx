import { useEffect, useState } from "react";
import NewsList from "./components/NewsList.jsx";
import Header from "./components/Header.jsx";
import PreferencesBar from "./components/PreferencesBar.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import RetroMedia from "./components/RetroMedia.jsx";
import MediaPage from "./components/MediaPage.jsx";
import Blog from "./components/Blog.jsx";
import { useTheme } from "./context/ThemeContext.jsx";

const DEFAULT_GEEK_SOURCES = ["Shazoo", "StopGame", "DTF", "Wowhead"];

export default function App() {
  const [currentPage, setCurrentPage] = useState("blog");
  const [news, setNews] = useState([]);
  const [sources, setSources] = useState(DEFAULT_GEEK_SOURCES);
  const [newsState, setNewsState] = useState({ updatedAt: null, loading: false });
  const [showSources, setShowSources] = useState(false);
  const [media, setMedia] = useState({ letterboxd: [], goodreads: [], updatedAt: null, loading: false });
  const { effectiveTheme, setRetroAllowed } = useTheme();

  // updatedAt comes from the feed collector (API / news.json), not from the click.
  const loadData = async (endpoint) => {
    const dataUrl = import.meta.env.DEV
      ? `/api/${endpoint}`
      : `${import.meta.env.BASE_URL}data/${endpoint}.json`;
    try {
      const res = await fetch(dataUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (endpoint === "news") {
        setNews(data.news);
        setNewsState({ updatedAt: data.updatedAt, loading: false });
      } else {
        setMedia(prev => ({
          ...prev,
          letterboxd: data.letterboxd || [],
          goodreads: data.goodreads || [],
          updatedAt: data.updatedAt,
          loading: false
        }));
      }
    } catch (e) {
      console.error(`Failed to load ${endpoint}:`, e);
      if (endpoint === "news") setNewsState(prev => ({ ...prev, loading: false }));
      else setMedia(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadData("news");
    loadData("media");
    const newsId = setInterval(() => loadData("news"), 10 * 60 * 1000);
    const mediaId = setInterval(() => loadData("media"), 10 * 60 * 1000);
    return () => { clearInterval(newsId); clearInterval(mediaId); };
  }, []);

  // Retro belongs to the RSS feed only.
  useEffect(() => {
    setRetroAllowed(currentPage === "news");
  }, [currentPage, setRetroAllowed]);

  useEffect(() => {
    if (effectiveTheme !== "dark" && effectiveTheme !== "retro") return;
    const starInterval = effectiveTheme === "retro" ? 150 : 1000;
    const interval = setInterval(() => {
      const star = document.createElement("div");
      star.className = "star";
      if (effectiveTheme === "retro") star.setAttribute("data-retro", "true");
      star.style.left = "-10px";
      star.style.top = `${Math.random() * 40}vh`;
      star.style.animationDuration = `${2 + Math.random() * 2}s`;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 4000);
    }, starInterval);
    return () => clearInterval(interval);
  }, [effectiveTheme]);

  const filtered = sources.length === 0 ? news : news.filter(n => sources.includes(n.source));
  const headerProps = { currentPage, onPageChange: setCurrentPage, showSources, onShowSourcesChange: setShowSources, onRefresh: () => { setNewsState(p => ({ ...p, loading: true })); loadData("news"); }, isRefreshing: newsState.loading, onMediaRefresh: () => { setMedia(p => ({ ...p, loading: true })); loadData("media"); }, isMediaRefreshing: media.loading };

  return (
    <>
      <Header {...headerProps} />
      {currentPage === "news" && (
        <>
          {showSources && <PreferencesBar sources={sources} onSourcesChange={setSources} />}
          <RetroMedia />
          <ScrollToTop />
          <div className={`app ${showSources ? "sources-open" : ""}`}>
            <div className="meta">Новостей: {filtered.length}{newsState.updatedAt && " · обновлено: " + new Date(newsState.updatedAt).toLocaleString()}</div>
            <NewsList news={filtered} />
          </div>
        </>
      )}
      {currentPage === "media" && <MediaPage mediaData={media} mediaUpdatedAt={media.updatedAt} onPageChange={setCurrentPage} />}
      {currentPage === "blog" && <Blog />}
    </>
  );
}
