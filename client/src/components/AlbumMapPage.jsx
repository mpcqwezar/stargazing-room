import { useEffect, useRef } from "react";

const LEAFLET_VERSION = "1.9.4";
const LEAFLET_CSS = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.css`;
const LEAFLET_JS = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.js`;
const MARKER_CLUSTER_VERSION = "1.5.3";
const MARKER_CLUSTER_CSS = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/${MARKER_CLUSTER_VERSION}/MarkerCluster.css`;
const MARKER_CLUSTER_JS = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/${MARKER_CLUSTER_VERSION}/leaflet.markercluster.js`;
const FLICKR_SCRIPT_SRC = "https://embedr.flickr.com/assets/client-code.js";
const ALBUMS = Array.isArray(window.ALBUMS) ? window.ALBUMS : [];
let leafletLoadPromise;
let markerClusterLoadPromise;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoadPromise) return leafletLoadPromise;

  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = LEAFLET_CSS;
  document.head.appendChild(css);

  leafletLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Leaflet failed to load"));
    document.body.appendChild(script);
  });
  return leafletLoadPromise;
}

function loadMarkerCluster(L) {
  if (L.markerClusterGroup) return Promise.resolve(L);
  if (markerClusterLoadPromise) return markerClusterLoadPromise;

  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = MARKER_CLUSTER_CSS;
  document.head.appendChild(css);

  markerClusterLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = MARKER_CLUSTER_JS;
    script.async = true;
    script.onload = () => resolve(L);
    script.onerror = () => reject(new Error("Leaflet.markercluster failed to load"));
    document.body.appendChild(script);
  });
  return markerClusterLoadPromise;
}

function textElement(tagName, text, className) {
  const element = document.createElement(tagName);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function formatLocation(album) {
  return album.city?.toLocaleLowerCase() === album.country?.toLocaleLowerCase()
    ? album.country
    : [album.city, album.country].filter(Boolean).join(", ");
}

function groupByCoordinates(albums) {
  const groups = new Map();
  for (const album of albums) {
    if (!Number.isFinite(album.lat) || !Number.isFinite(album.lng)) continue;
    const key = `${album.lat},${album.lng}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(album);
  }
  return [...groups.values()];
}

function createPinIcon(L, count) {
  const pin = textElement("span", undefined, `album-map-pin__shape${count > 1 ? " has-count" : ""}`);
  if (count > 1) pin.appendChild(textElement("span", String(count), "album-map-pin__count"));
  return L.divIcon({ className: "album-map-pin", html: pin, iconSize: [42, 52], iconAnchor: [21, 50] });
}

function createClusterIcon(L, cluster) {
  const albumCount = cluster.getAllChildMarkers()
    .reduce((total, marker) => total + marker.options.albumCount, 0);
  const pin = textElement("span", undefined, "album-map-pin__shape has-count album-map-pin__cluster-shape");
  pin.appendChild(textElement("span", String(albumCount), "album-map-pin__count"));
  return L.divIcon({
    className: "album-map-pin album-map-cluster",
    html: pin,
    iconSize: [46, 46],
    iconAnchor: [23, 23]
  });
}

function createPopup(group) {
  const popup = textElement("div", undefined, "album-map-popup");
  popup.appendChild(textElement("h2", formatLocation(group[0])));
  const list = document.createElement("ul");
  for (const album of group) {
    const item = document.createElement("li");
    const link = textElement("a", `${album.title}${album.year ? ` (${album.year})` : ""}`);
    link.href = album.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    item.appendChild(link);
    list.appendChild(item);
  }
  popup.appendChild(list);
  return popup;
}

function createAlbumPreviewPopup(album) {
  const popup = textElement("div", undefined, "album-map-popup album-map-popup--preview");
  popup.appendChild(textElement("h2", album.title));
  popup.appendChild(textElement("p", `${formatLocation(album)}${album.year ? `, ${album.year}` : ""}`));

  if (album.image) {
    const embed = document.createElement("a");
    embed.className = "album-map-preview";
    embed.setAttribute("data-flickr-embed", "true");
    embed.href = album.url;
    embed.title = album.title;
    embed.target = "_blank";
    embed.rel = "noopener noreferrer";

    const image = document.createElement("img");
    image.src = album.image;
    image.alt = `Открыть альбом ${album.title} на Flickr`;
    image.loading = "lazy";
    embed.appendChild(image);
    popup.appendChild(embed);
  } else {
    const link = textElement("a", "Открыть на Flickr ↗");
    link.href = album.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    popup.appendChild(link);
  }

  return popup;
}

function loadFlickrEmbeds() {
  if (document.querySelector(`script[src="${FLICKR_SCRIPT_SRC}"]`)) return;
  const script = document.createElement("script");
  script.src = FLICKR_SCRIPT_SRC;
  script.async = true;
  script.charset = "utf-8";
  document.body.appendChild(script);
}

export default function AlbumMapPage() {
  const mapElement = useRef(null);

  useEffect(() => {
    let disposed = false;
    let map;

    loadLeaflet().then(loadMarkerCluster).then(L => {
      if (disposed || !mapElement.current) return;
      const minZoom = window.matchMedia("(max-width: 420px)").matches ? 1 : 2;
      map = L.map(mapElement.current, { minZoom, worldCopyJump: true });
      L.tileLayer("https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png", {
        subdomains: "abc",
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      const groups = groupByCoordinates(ALBUMS);
      const markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: zoom => zoom < 5 ? 56 : zoom < 8 ? 44 : 32,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: cluster => createClusterIcon(L, cluster)
      });
      const markers = groups.map(group => {
        const first = group[0];
        const marker = L.marker([first.lat, first.lng], {
          icon: createPinIcon(L, group.length),
          albumCount: group.length,
          keyboard: true,
          title: group.length === 1
            ? `${first.title} — ${formatLocation(first)}`
            : `${formatLocation(first)}: ${group.length} альбома`
        });

        if (group.length === 1) {
          marker.bindTooltip(textElement("span", `${first.title} — ${formatLocation(first)}`));
          marker.bindPopup(createAlbumPreviewPopup(first));
          marker.on("popupopen", loadFlickrEmbeds);
        } else {
          marker.bindPopup(createPopup(group));
        }
        markerClusterGroup.addLayer(marker);
        return marker;
      });
      map.addLayer(markerClusterGroup);

      if (markers.length === 1) {
        map.setView(markers[0].getLatLng(), 5);
      } else if (markers.length > 1) {
        map.fitBounds(L.featureGroup(markers).getBounds(), { padding: [40, 40], maxZoom: 5 });
      } else {
        map.setView([20, 0], 2);
      }
    }).catch(error => {
      if (!disposed) console.error("Unable to initialize album map:", error);
    });

    return () => {
      disposed = true;
      map?.remove();
    };
  }, []);

  return (
    <main className="album-map-page" aria-label="Карта мест съёмки">
      <div className="album-map-canvas" ref={mapElement} />
      {!ALBUMS.length && <p className="album-map-empty">Добавьте альбомы в albums-data.js, чтобы увидеть места съёмки.</p>}
    </main>
  );
}