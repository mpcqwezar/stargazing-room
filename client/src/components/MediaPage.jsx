import { useEffect, useState } from "react";
// MediaItem inlined below to reduce component count
import { useTheme } from "../context/ThemeContext.jsx";

export default function MediaPage({ mediaData, mediaUpdatedAt, onPageChange }) {
  const { theme, setPageTheme } = useTheme();

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

  // Load Flickr embed script
  useEffect(() => {
    if (window.flickrEmbed) {
      window.flickrEmbed.polite();
    } else {
      const script = document.createElement('script');
      script.src = '//embedr.flickr.com/assets/client-code.js';
      script.async = true;
      script.charset = 'utf-8';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="media-page">
      <div className="media-columns">
        <div className="media-column">
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

        <div className="media-right-section">
          <div className="flickr-embed-container">
            <a data-flickr-embed="true" href="https://www.flickr.com/photos/201450998@N08" title="">
              <img src="https://live.staticflickr.com/65535/54985849095_8a7f35ea85.jpg" width="500" height="375" alt=""/>
            </a>
          </div>

          <div className="media-column">
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
