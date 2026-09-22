import { useEffect, useRef, useState } from 'react';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

// Icône personnalisée pour les marqueurs
const MARKER_SVG = (color = '#c9933a') => `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
  <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 16 26 16 26s16-15.5 16-26C32 7.163 24.837 0 16 0z"
    fill="${color}" stroke="white" stroke-width="2"/>
  <circle cx="16" cy="16" r="7" fill="white"/>
  <text x="16" y="20" text-anchor="middle" font-size="9" font-weight="bold" fill="${color}">📚</text>
</svg>`;

let leafletLoaded = false;
let loadPromise   = null;

function loadLeaflet() {
  if (leafletLoaded) return Promise.resolve();
  if (loadPromise)   return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // CSS
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel  = 'stylesheet'; link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    // JS
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.onload  = () => { leafletLoaded = true; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return loadPromise;
}

/* ════════════════════════════════════════════════════════════════════════════
 * MapView — affichage simple d'une ou plusieurs librairies
 * Props: stores=[{name, address, latitude, longitude, phone?}]
 *        center=[lat, lng]   height="380px"
 * ════════════════════════════════════════════════════════════════════════════ */
export function MapView({ stores = [], center, height = '380px', zoom = 13 }) {
  const mapRef   = useRef(null);
  const mapObj   = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadLeaflet().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || stores.length === 0) return;
    const L = window.L;

    if (mapObj.current) {
      mapObj.current.remove();
    }

    const defaultCenter = center ||
      (stores.length === 1
        ? [stores[0].latitude, stores[0].longitude]
        : [5.3595, -3.9981]);

    const map = L.map(mapRef.current, { zoomControl: true }).setView(defaultCenter, zoom);
    mapObj.current = map;

    // Tuiles OpenStreetMap fiables
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Marqueurs pour chaque librairie
    stores.forEach((store, i) => {
      if (!store.latitude || !store.longitude) return;

      const icon = L.divIcon({
        html:      MARKER_SVG(i === 0 ? '#c9933a' : '#2d7a4f'),
        iconSize:  [32, 42],
        iconAnchor:[16, 42],
        popupAnchor:[0, -44],
        className: 'leaflet-custom-marker',
      });

      const popup = `
        <div style="min-width:180px;font-family:sans-serif">
          <p style="font-weight:700;font-size:14px;margin:0 0 4px;color:#0f1923">📚 ${store.name}</p>
          ${store.address ? `<p style="font-size:12px;color:#555;margin:0 0 3px">📍 ${store.address}</p>` : ''}
          ${store.phone   ? `<p style="font-size:12px;color:#555;margin:0 0 6px">📞 ${store.phone}</p>`   : ''}
          <a href="https://maps.google.com/?q=${store.latitude},${store.longitude}"
             target="_blank"
             style="display:inline-block;background:#c9933a;color:white;font-size:11px;
                    font-weight:700;padding:4px 10px;border-radius:8px;text-decoration:none">
            🗺️ Ouvrir dans Google Maps
          </a>
        </div>`;

      L.marker([store.latitude, store.longitude], { icon })
        .addTo(map)
        .bindPopup(popup);
    });

    // Ajuster la vue si plusieurs markers
    if (stores.length > 1) {
      const bounds = L.latLngBounds(stores.map(s => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => { map.remove(); mapObj.current = null; };
  }, [ready, stores, center, zoom]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#e8e0d4] shadow-sm"
      style={{ height }}>
      {!ready && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#c9933a] border-t-transparent rounded-full animate-spin mx-auto mb-2"/>
            <p className="text-xs text-gray-500">Chargement de la carte…</p>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 * MapPicker — carte interactive avec pin draggable pour choisir une position
 * Props: defaultLat, defaultLng, onSelect(lat, lng, displayName)
 * ════════════════════════════════════════════════════════════════════════════ */
export function MapPicker({ defaultLat = 5.3595, defaultLng = -3.9981, onSelect }) {
  const mapRef    = useRef(null);
  const mapObj    = useRef(null);
  const markerRef = useRef(null);
  const [ready,    setReady]    = useState(false);
  const [coords,   setCoords]   = useState({ lat: defaultLat, lng: defaultLng });
  const [address,  setAddress]  = useState('');
  const [searching,setSearching]= useState(false);
  const [query,    setQuery]    = useState('');

  useEffect(() => {
    loadLeaflet().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const L = window.L;

    if (mapObj.current) return;

    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 14);
    mapObj.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const icon = L.divIcon({
      html: MARKER_SVG('#c9933a'),
      iconSize: [32, 42], iconAnchor: [16, 42],
      className: 'leaflet-custom-marker',
    });

    const marker = L.marker([defaultLat, defaultLng], { icon, draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      setCoords({ lat: pos.lat, lng: pos.lng });
      const name = await reverseGeocode(pos.lat, pos.lng);
      setAddress(name);
      onSelect?.(pos.lat, pos.lng, name);
    });

    map.on('click', async (e) => {
      marker.setLatLng(e.latlng);
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      const name = await reverseGeocode(e.latlng.lat, e.latlng.lng);
      setAddress(name);
      onSelect?.(e.latlng.lat, e.latlng.lng, name);
    });
  }, [ready]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const d = await r.json();
      return d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}`; }
  };

  const searchAddress = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' Côte d\'Ivoire')}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const results = await r.json();
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const L = window.L;
        const latN = parseFloat(lat), lngN = parseFloat(lon);
        mapObj.current?.setView([latN, lngN], 16);
        markerRef.current?.setLatLng([latN, lngN]);
        setCoords({ lat: latN, lng: lngN });
        setAddress(display_name);
        onSelect?.(latN, lngN, display_name);
      }
    } catch { /* ignore */ }
    finally { setSearching(false); }
  };

  return (
    <div className="space-y-3">
      {/* Barre de recherche */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchAddress()}
          placeholder="Rechercher une adresse… Ex: Cocody Riviera 3"
          className="flex-1 px-3 py-2.5 border border-[#e8e0d4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] transition"
        />
        <button onClick={searchAddress} disabled={searching}
          className="bg-[#c9933a] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#b8832d] transition disabled:opacity-60 shrink-0">
          {searching ? '⏳' : '🔍'}
        </button>
      </div>

      {/* Carte */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-[#e8e0d4]"
        style={{ height: '320px' }}>
        {!ready && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#c9933a] border-t-transparent rounded-full animate-spin"/>
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs text-gray-500 pointer-events-none">
          📌 Cliquez sur la carte ou glissez le marqueur pour placer votre librairie
        </div>
      </div>

      {/* Coordonnées confirmées */}
      {address && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-start gap-2">
          <span className="text-green-600 mt-0.5">✅</span>
          <div>
            <p className="text-xs font-bold text-green-800">Position enregistrée</p>
            <p className="text-xs text-green-600 mt-0.5 line-clamp-2">{address}</p>
            <p className="text-[10px] text-green-400 font-mono mt-0.5">
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;
