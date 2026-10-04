import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HUB_MAP_CENTER, HUB_MAP_ZOOM } from '../lib/hub-locations';

const markerIcon = L.divIcon({
  html: '<div style="width:18px;height:18px;background:#C1440E;border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>',
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapClickHandler({ onPick, disabled }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center?.lat != null && center?.lng != null) {
      map.setView([center.lat, center.lng], Math.max(map.getZoom(), 9));
    }
  }, [center?.lat, center?.lng, map]);
  return null;
}

/** Leaflet needs invalidateSize after the map becomes visible (tabs, dialogs). */
function MapInvalidateSize({ active }) {
  const map = useMap();
  useEffect(() => {
    if (!active) return undefined;
    const run = () => {
      map.invalidateSize({ animate: false });
    };
    run();
    const t1 = setTimeout(run, 80);
    const t2 = setTimeout(run, 320);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, map]);
  return null;
}

export default function AdvisoryLocationMapInner({
  location,
  onPick,
  disabled,
  mapKey = 'default',
  active = true,
}) {
  const hasPoint = location?.lat != null && location?.lng != null;
  const center = hasPoint ? [location.lat, location.lng] : [HUB_MAP_CENTER.lat, HUB_MAP_CENTER.lng];

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={hasPoint ? 9 : HUB_MAP_ZOOM}
      style={{ height: '100%', width: '100%', minHeight: 200 }}
      scrollWheelZoom={!disabled}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapInvalidateSize active={active} />
      <MapClickHandler onPick={onPick} disabled={disabled} />
      {hasPoint && <MapRecenter center={location} />}
      {hasPoint && (
        <>
          <Marker position={[location.lat, location.lng]} icon={markerIcon} />
          <Circle
            center={[location.lat, location.lng]}
            radius={25000}
            pathOptions={{ color: '#C1440E', fillColor: '#C1440E', fillOpacity: 0.08, weight: 2 }}
          />
        </>
      )}
    </MapContainer>
  );
}
