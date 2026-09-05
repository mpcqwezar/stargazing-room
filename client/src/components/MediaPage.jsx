import { useEffect, useRef, useState, useSyncExternalStore } from "react";
// MediaItem inlined below to reduce component count
import { useTheme } from "../context/ThemeContext.jsx";

const FLICKR_SCRIPT_SRC = "https://embedr.flickr.com/assets/client-code.js";
const FLICKR_PHOTOSTREAM = "https://www.flickr.com/photos/201450998@N08";
const FLICKR_PHOTO = "https://live.staticflickr.com/65535/54985849095_8a7f35ea85.jpg";
const MOBILE_QUERY = "(max-width: 768px)";

// The Flickr script measures the embed once, on insertion. Mounting it while the
// tab is hidden produces a zero-height iframe, so track the breakpoint in JS.
function useIsMobile() {
  return useSyncExternalStore(
    onChange => {
      const query = window.matchMedia(MOBILE_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  );
}

export default function MediaPage({ mediaData, mediaUpdatedAt, onPageChange }) {
  const { theme, setPageTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("letterboxd");
  const isMobile = useIsMobile();
  const flickrVisible = !isMobile || activeTab === "flickr";
  const flickrRef = useRef(null);

  // Force dark theme for this page
  useEffect(() => {
    setPageTheme('dark');
  }, [setPageTheme]);

  // Load initial data (if needed for any client-side init)
  useEffect(() => {
    // media data is now passed from App
  }, []);

  /* звёзды */
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

  // Load Flickr embed script once; it watches the DOM for new embeds itself.
  useEffect(() => {
    if (document.querySelector(`script[src="${FLICKR_SCRIPT_SRC}"]`)) return;
    const script = document.createElement('script');
    script.src = FLICKR_SCRIPT_SRC;
    script.async = true;
    script.charset = 'utf-8';
    document.body.appendChild(script);
  }, []);

  // The embed is built outside React: the Flickr script swaps the anchor for an
  // iframe, so React must not own those nodes. Rebuild it whenever the panel
  // becomes visible, otherwise the script measures a hidden box and renders it
  // with zero height.
  useEffect(() => {
    const container = flickrRef.current;
    if (!container) return;

    container.replaceChildren();
    if (!flickrVisible) return;

    const anchor = document.createElement("a");
    anchor.setAttribute("data-flickr-embed", "true");
    anchor.href = FLICKR_PHOTOSTREAM;

    const photo = document.createElement("img");
    photo.src = FLICKR_PHOTO;
    photo.width = 500;
    photo.height = 375;
    photo.alt = "";

    anchor.appendChild(photo);
    container.appendChild(anchor);
  }, [flickrVisible]);

  return (
    <div className="media-page">
      <div className="media-tabs" role="tablist" aria-label="Lists">
        {["letterboxd", "flickr", "goodreads"].map(tab => (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`${tab}-panel`}
            className={`media-tab ${activeTab === tab ? "active" : ""}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "flickr" ? "Flickr" : tab === "goodreads" ? "Goodreads" : "Letterboxd"}
          </button>
        ))}
      </div>

      <div className="media-columns">
        <div
          className={`media-column mobile-tab-panel ${activeTab === "letterboxd" ? "mobile-active" : ""}`}
          id="letterboxd-panel"
          role="tabpanel"
        >
          <h2 className="column-title">Letterboxd</h2>
          <div className="media-feed">
            {mediaData.letterboxd.length > 0 ? (
              mediaData.letterboxd.map((item, idx) => (
                <div className="media-item" key={`letterboxd-${idx}`}>
                  <div className="media-source">{item.source}</div>

                  <div className="media-content">
                    {item.image && <img src={item.image} className="media-preview" loading="lazy" alt={item.title} />}

                    <div className="media-text">
                      <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
                      {item.filmYear && (
                        <div className="media-meta-info">{item.filmYear}{item.watchedDate && ` • Watched: ${new Date(item.watchedDate).toLocaleDateString()}`}{item.rewatch === 'Yes' && ' • Rewatch'}</div>
                      )}
                      {item.description && <p className="media-description">{(item.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0,200)}</p>}
                      <div className="media-date">{new Date(item.publishedAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-message">No items</div>
            )}
          </div>
        </div>

        <div className={`media-right-section ${activeTab !== "letterboxd" ? "mobile-active" : ""}`}>
          <div
            className={`flickr-embed-container mobile-tab-panel ${activeTab === "flickr" ? "mobile-active" : ""}`}
            id="flickr-panel"
            role="tabpanel"
            ref={flickrRef}
          />

          <div
            className={`media-column mobile-tab-panel ${activeTab === "goodreads" ? "mobile-active" : ""}`}
            id="goodreads-panel"
            role="tabpanel"
          >
            <h2 className="column-title">Goodreads</h2>
            <div className="media-feed">
              {mediaData.goodreads.length > 0 ? (
                mediaData.goodreads.map((item, idx) => (
                  <div className="media-item" key={`goodreads-${idx}`}>
                    <div className="media-source">{item.source}</div>

                    <div className="media-content">
                      {item.image && <img src={item.image} className="media-preview" loading="lazy" alt={item.title} />}

                      <div className="media-text">
                        <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
                        {item.description && <p className="media-description">{(item.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0,200)}</p>}
                        <div className="media-date">{new Date(item.publishedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-message">No items</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
