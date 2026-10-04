import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  WATER_POINT_STATUS,
  WATER_POINT_TYPES,
  ASSISTANCE_SITE_TYPES,
} from '../lib/community-services';
import { getCartoTileUrl } from '../lib/map-tiles';

function makeMarkerIcon(color) {
  return L.divIcon({
    html: `<div style="width:18px;height:18px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

function markerColor(marker) {
  if (marker.kind === 'water') {
    return WATER_POINT_STATUS[marker.status]?.color || '#2E7BB4';
  }
  return '#E87010';
}

function markerSubtitle(marker) {
  if (marker.kind === 'water') {
    const type = WATER_POINT_TYPES[marker.pointType] || marker.pointType;
    const status = WATER_POINT_STATUS[marker.status]?.label || marker.status;
    return `${type} · ${status}`;
  }
  const type = ASSISTANCE_SITE_TYPES[marker.siteType] || marker.siteType;
  return marker.agency ? `${type} · ${marker.agency}` : type;
}

export default function CommunityServiceMap({ markers = [], apiStale = false, emptyMessage }) {
  const [selected, setSelected] = useState(null);
  const mappable = useMemo(() => markers.filter((m) => m.lat != null && m.lng != null), [markers]);

  return (
    <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', boxShadow: '0 16px 48px rgba(61,43,31,0.15)', border: '2px solid #2E7BB4' }}>
      {!mappable.length && (
        <Box sx={{
          position: 'absolute', top: 14, left: 14, zIndex: 1000,
          bgcolor: 'rgba(255,255,255,0.96)', px: 1.5, py: 1, borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)', maxWidth: 280,
        }}>
          <Typography sx={{ fontSize: '0.72rem', color: '#5A5A5A', lineHeight: 1.45 }}>
            {apiStale
              ? 'Showing cached data — connect WordPress for live locations.'
              : emptyMessage || 'No mapped locations published yet.'}
          </Typography>
        </Box>
      )}

      {selected && (
        <Box sx={{
          position: 'absolute', bottom: 38, right: 14, zIndex: 1000,
          bgcolor: 'rgba(255,255,255,0.97)', p: 2, borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxWidth: 280,
          borderLeft: `4px solid ${markerColor(selected)}`,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
            <Typography sx={{ fontWeight: 700, color: '#3D2B1F', fontSize: '0.85rem', lineHeight: 1.25, pr: 1 }}>
              {selected.name}
            </Typography>
            <Box onClick={() => setSelected(null)} sx={{ cursor: 'pointer', color: '#9A9A9A', fontSize: '1.1rem', lineHeight: 1 }}>×</Box>
          </Box>
          <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A', mb: 0.75 }}>{selected.region}</Typography>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: markerColor(selected), mb: 1 }}>
            {markerSubtitle(selected)}
          </Typography>
          {selected.desc && (
            <Typography sx={{ fontSize: '0.72rem', color: '#5A5A5A', lineHeight: 1.5, mb: 1 }}>{selected.desc}</Typography>
          )}
          {selected.schedule && (
            <Typography sx={{ fontSize: '0.68rem', color: '#5A5A5A' }}><strong>Schedule:</strong> {selected.schedule}</Typography>
          )}
          {selected.contact && (
            <Typography sx={{ fontSize: '0.68rem', color: '#5A5A5A', mt: 0.5 }}><strong>Contact:</strong> {selected.contact}</Typography>
          )}
          {selected.lastUpdated && (
            <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', mt: 0.5 }}>Updated: {selected.lastUpdated}</Typography>
          )}
        </Box>
      )}

      <Box sx={{ height: { xs: 380, md: 520 } }}>
        <MapContainer center={[3.0, 34.8]} zoom={7} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false}>
          <ZoomControl position="topright" />
          <TileLayer
            url={getCartoTileUrl()}
            attribution='&copy; OpenStreetMap &copy; CARTO'
            subdomains="abcd"
            maxZoom={19}
          />
          {mappable.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={makeMarkerIcon(markerColor(marker))}
              eventHandlers={{ click: () => setSelected(marker) }}
            >
              <Popup>
                <strong>{marker.name}</strong><br />
                {markerSubtitle(marker)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
}
