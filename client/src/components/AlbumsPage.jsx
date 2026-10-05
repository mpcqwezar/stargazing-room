import { useEffect, useMemo, useRef, useState } from "react";

const FLICKR_SCRIPT_SRC = "https://embedr.flickr.com/assets/client-code.js";
const ALBUMS = Array.isArray(window.ALBUMS) ? window.ALBUMS : [];

function formatLocation(album) {
  return album.city?.toLocaleLowerCase() === album.country?.toLocaleLowerCase()
    ? album.country
    : [album.city, album.country].filter(Boolean).join(", ");
}

function loadFlickrEmbeds() {
  if (document.querySelector(`script[src="${FLICKR_SCRIPT_SRC}"]`)) return;
  const script = document.createElement("script");
  script.src = FLICKR_SCRIPT_SRC;
  script.async = true;
  script.charset = "utf-8";
  document.body.appendChild(script);
}

function FlickrEmbed({ album }) {
  const embedRef = useRef(null);

  useEffect(() => {
    const container = embedRef.current;
    if (!container || !album.image) return;

    container.replaceChildren();
    const anchor = document.createElement("a");
    anchor.setAttribute("data-flickr-embed", "true");
    anchor.href = album.url;
    anchor.title = album.title;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";

    const image = document.createElement("img");
    image.src = album.image;
    image.alt = "";
    image.loading = "lazy";
    anchor.appendChild(image);
    container.appendChild(anchor);
    loadFlickrEmbeds();

    return () => container.replaceChildren();
  }, [album]);

  return album.image ? <div className="album-embed" ref={embedRef} /> : null;
}

function sortAlbums(albums) {
  return [...albums].sort((first, second) => {
    const latestYear = year => Number(String(year ?? "").match(/\d{4}/g)?.at(-1) ?? -Infinity);
    const yearDifference = latestYear(second.year) - latestYear(first.year);
    return yearDifference || first.title.localeCompare(second.title);
  });
}

export default function AlbumsPage() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");

  const countries = useMemo(
    () => [...new Set(ALBUMS.map(album => album.country))].sort((a, b) => a.localeCompare(b)),
    []
  );
  const groups = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const filtered = ALBUMS.filter(album => {
      const matchesSearch = !query || [album.title, album.country, album.city]
        .some(value => value.toLocaleLowerCase().includes(query));
      return matchesSearch && (!country || album.country === country);
    });
    const grouped = new Map();
    for (const album of filtered) {
      if (!grouped.has(album.country)) grouped.set(album.country, []);
      grouped.get(album.country).push(album);
    }
    return [...grouped.entries()]
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([name, albums]) => [name, sortAlbums(albums)]);
  }, [country, search]);

  return (
    <main className="albums-page">
      <div className="albums-shell">
        <header className="albums-heading">
          <p className="albums-eyebrow">Flickr albums</p>
          <h2>Альбомы</h2>
        </header>

        <div className="album-filters" role="search">
          <label htmlFor="album-search">Поиск</label>
          <input
            id="album-search"
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Название, страна или город"
          />
          <label htmlFor="album-country">Страна</label>
          <select id="album-country" value={country} onChange={event => setCountry(event.target.value)}>
            <option value="">Все страны</option>
            {countries.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>

        {groups.length ? (
          <div className="album-country-groups">
            {groups.map(([name, albums]) => (
              <section className="album-country-group" key={name}>
                <h3>{name}<span>{albums.length}</span></h3>
                <div className="album-grid">
                  {albums.map((album, index) => (
                    <article className="album-card" key={`${album.url}-${index}`}>
                      <FlickrEmbed album={album} />
                      <div className="album-card-content">
                        <h4><a href={album.url} target="_blank" rel="noopener noreferrer">{album.title}</a></h4>
                        <p>{[formatLocation(album), album.year].filter(Boolean).join(", ")}</p>
                        <a className="album-open-link" href={album.url} target="_blank" rel="noopener noreferrer">
                          Открыть на Flickr <span aria-hidden="true">↗</span>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="albums-empty" role="status">Альбомы не найдены. Измените запрос или выберите другую страну.</p>
        )}
      </div>
    </main>
  );
}