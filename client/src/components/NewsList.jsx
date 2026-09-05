export default function NewsList({ news }) {
  return (
    <div className="news">
      {news.map(item => (
        <div className="news-item" key={item.link}>
          <div className="source">{item.source}</div>

          <div className="content">
            {item.image && (
              <img src={item.image} className="preview" loading="lazy" />
            )}

            <div className="text">
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
              <div className="date">{new Date(item.publishedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
