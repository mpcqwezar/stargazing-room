import { useEffect, useState } from "react";
import NewsList from "./components/NewsList.jsx";
import Header from "./components/Header.jsx";
import SourceBar from "./components/SourceBar.jsx";
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
  const { theme, setPageTheme } = useTheme();

  const loadData = async (endpoint) => {
    try {
      const dataUrl = import.meta.env.DEV
        ? `/api/${endpoint}`
        : `${import.meta.env.BASE_URL}data/${endpoint}.json`;
      const res = await fetch(dataUrl);
      const data = await res.json();
      if (endpoint === "news") {
        setNews(data.news);
        setNewsState({ updatedAt: data.updatedAt, loading: false });
      } else {
        setMedia(prev => ({ ...prev, letterboxd: data.letterboxd || [], goodreads: data.goodreads || [], updatedAt: data.updatedAt, loading: false }));
      }
    } catch (e) {
      console.error(`Failed to load ${endpoint}:`, e);
    }
  };

  useEffect(() => {
    loadData("news");
    loadData("media");
    const newsId = setInterval(() => loadData("news"), 10 * 60 * 1000);
    const mediaId = setInterval(() => loadData("media"), 10 * 60 * 1000);
    return () => { clearInterval(newsId); clearInterval(mediaId); };
  }, []);

  useEffect(() => {
    if (currentPage === "news") setPageTheme(null);
  }, [currentPage, setPageTheme]);

  useEffect(() => {
    if (theme !== "dark" && theme !== "retro") return;
    const starInterval = theme === "retro" ? 150 : 1000;
    const interval = setInterval(() => {
      const star = document.createElement("div");
      star.className = "star";
      if (theme === "retro") star.setAttribute("data-retro", "true");
      star.style.left = "-10px";
      star.style.top = `${Math.random() * 40}vh`;
      star.style.animationDuration = `${2 + Math.random() * 2}s`;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 4000);
    }, starInterval);
    return () => clearInterval(interval);
  }, [theme]);

  const filtered = sources.length === 0 ? news : news.filter(n => sources.includes(n.source));
  const headerProps = { sources, onSourcesChange: setSources, currentPage, onPageChange: setCurrentPage, showSources, onShowSourcesChange: setShowSources, onRefresh: () => { setNewsState(p => ({ ...p, loading: true })); loadData("news"); }, isRefreshing: newsState.loading, onMediaRefresh: () => { setMedia(p => ({ ...p, loading: true })); loadData("media"); }, isMediaRefreshing: media.loading };

  return (
    <>
      <Header {...headerProps} />
      {currentPage === "news" && (
        <>
          {showSources && <div className="preferences-bar"><SourceBar value={sources} onChange={setSources} showSources /></div>}
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
