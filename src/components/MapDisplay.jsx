import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapDisplay({
  latitude = 5.3599517,
  longitude = -4.0082563,
  title = 'Librairie',
  address = 'Abidjan'
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#e8e0d4]">
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={true}
        style={{
          height: '350px',
          width: '100%',
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[latitude, longitude]}>
          <Popup>
            <div>
              <strong>{title}</strong>
              <br />
              {address}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}