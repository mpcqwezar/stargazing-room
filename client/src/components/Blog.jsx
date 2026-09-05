import React from "react";
import posts from "../data/posts.json";

export default function Blog() {
  return (
    <div className="app blog-page">
      <h2 className="column-title">Бложик</h2>
      <div className="blog-list">
        {posts.map(({ id, title, date, blocks }) => {
          const img = blocks.find(b => b.type === "image");
          const paras = blocks.filter(b => b.type === "paragraph");
          return (
            <article key={id} className="blog-post">
              <div className="post-header">
                <h3 className="post-title">{title}</h3>
                <div className="post-date">{new Date(date).toLocaleDateString()}</div>
              </div>
              <div className={`post-body ${img ? "with-image" : ""}`}>
                {img && <img className="post-image" src={img.src} alt={img.alt || ""} />}
                {paras.length > 0 && (
                  <div className="post-paragraphs">
                    {paras.map((p, i) => <p key={i} className="post-paragraph">{p.text}</p>)}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
