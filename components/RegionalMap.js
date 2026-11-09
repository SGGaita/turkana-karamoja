import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { HUB_MAP_LOCATIONS } from '../lib/hub-locations';
import { getCartoTileUrl } from '../lib/map-tiles';

const ALERT_COLORS = {
  severe:   '#D63030',
  moderate: '#E87010',
  watch:    '#D4A20E',
  normal:   '#2E8B57',
};

const ALERT_LABELS = {
  severe:   'Severe Alert',
  moderate: 'Moderate Alert',
  watch:    'Advisory / Watch',
  normal:   'Normal',
};

const communityMarkers = HUB_MAP_LOCATIONS.map((loc) => ({
  name: loc.name,
  lat: loc.lat,
  lng: loc.lng,
  region: loc.region,
  type: 'Community',
}));

// Weather stations removed: their readings were hardcoded, not live (audit v3 E7).

const ALERT_RADII = { severe: 55000, moderate: 45000, watch: 35000 };

function makeCommunityIcon() {
  return L.divIcon({
    html: '<div style="width:12px;height:12px;background:#2E8B57;border:2px solid white;border-radius:50%;box-shadow:0 1px 6px rgba(0,0,0,0.25);opacity:0.85;"></div>',
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10],
  });
}

function makeAdvisoryIcon(color) {
  return L.divIcon({
    html: `<div style="width:24px;height:24px;background:${color};border:2.5px solid white;border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:800;line-height:1;">!</div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

const LAYERS = [
  { key: 'all',     label: 'All' },
  { key: 'alerts',  label: 'Alerts' },
];

const filterBtn = (active) => ({
  px: 1.75,
  py: 0.6,
  bgcolor: active ? '#C1440E' : 'rgba(255,255,255,0.95)',
  color: active ? 'white' : '#3D2B1F',
  borderRadius: 1.5,
  cursor: 'pointer',
  fontSize: '0.73rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
  boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
  transition: 'background 0.18s, color 0.18s',
  userSelect: 'none',
  '&:hover': { bgcolor: active ? '#A83B0C' : 'white' },
});

export default function RegionalMap({ liveAdvisories = [], apiStale = false }) {
  const [activeLayer, setActiveLayer] = useState('all');
  const [selected, setSelected] = useState(null);

  const hasLiveAdvisories = liveAdvisories.length > 0;
  const showAlerts = activeLayer === 'all' || activeLayer === 'alerts';
  const showCommunities = activeLayer === 'all';

  return (
    <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', boxShadow: '0 16px 48px rgba(61,43,31,0.15)', border: '3px solid #C1440E' }}>

      <Box sx={{ position: 'absolute', top: 14, left: 14, zIndex: 1000, display: 'flex', gap: 0.8 }}>
        {LAYERS.map(({ key, label }) => (
          <Box key={key} onClick={() => setActiveLayer(key)} sx={filterBtn(activeLayer === key)}>
            {label}
          </Box>
        ))}
      </Box>

      {!hasLiveAdvisories && showAlerts && (
        <Box sx={{
          position: 'absolute', top: 14, right: 56, zIndex: 1000,
          bgcolor: 'rgba(255,255,255,0.96)', px: 1.5, py: 1, borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)', maxWidth: 220,
        }}>
          <Typography sx={{ fontSize: '0.7rem', color: '#5A5A5A', lineHeight: 1.45 }}>
            {apiStale
              ? 'Showing cached data — connect WordPress for live advisories.'
              : 'No published advisories on the map yet. Approve advisories with a pinned location in wp-admin.'}
          </Typography>
        </Box>
      )}

      <Box sx={{
        position: 'absolute', bottom: 38, left: 14, zIndex: 1000,
        bgcolor: 'rgba(255,255,255,0.96)',
        p: 1.5, borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        minWidth: 158,
      }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3D2B1F', mb: 1 }}>
          Legend
        </Typography>
        {Object.entries(ALERT_LABELS).filter(([k]) => k !== 'normal').map(([level, label]) => (
          <Box key={level} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.65 }}>
            <Box sx={{ width: 10, height: 10, bgcolor: ALERT_COLORS[level], borderRadius: '50%', border: '1.5px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#5A5A5A' }}>{label}</Typography>
          </Box>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.65 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#C1440E', borderRadius: '3px', border: '1.5px solid white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '8px', fontWeight: 800 }}>!</Box>
          <Typography sx={{ fontSize: '0.7rem', color: '#5A5A5A' }}>Published advisory</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.65, pt: 0.75, borderTop: '1px solid #E8E0D5' }}>
          <Box sx={{ width: 10, height: 10, bgcolor: '#2E8B57', borderRadius: '50%', border: '1.5px solid white', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.7rem', color: '#5A5A5A' }}>Community</Typography>
        </Box>
      </Box>

      {selected && (
        <Box sx={{
          position: 'absolute', bottom: 38, right: 14, zIndex: 1000,
          bgcolor: 'rgba(255,255,255,0.97)',
          p: 2, borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          maxWidth: 260,
          borderLeft: `4px solid ${selected.type === 'station' ? '#2E7BB4' : selected.type === 'advisory' ? (selected.data.color || '#C1440E') : '#2E8B57'}`,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
            <Typography sx={{ fontWeight: 700, color: '#3D2B1F', fontSize: '0.85rem', lineHeight: 1.25, pr: 1 }}>
              {selected.data.name}
            </Typography>
            <Box onClick={() => setSelected(null)} sx={{ cursor: 'pointer', color: '#9A9A9A', fontSize: '1.1rem', lineHeight: 1, '&:hover': { color: '#3D2B1F' } }}>×</Box>
          </Box>

          {selected.type === 'advisory' ? (
            <>
              <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A', mb: 1 }}>
                {selected.data.region}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
                <Box sx={{ px: 1, py: 0.25, bgcolor: `${selected.data.color || '#C1440E'}18`, borderRadius: 1 }}>
                  <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: selected.data.color || '#C1440E' }}>
                    {ALERT_LABELS[selected.data.alertLevel] || 'Advisory'}
                  </Typography>
                </Box>
                {selected.data.alertType && (
                  <Box sx={{ px: 1, py: 0.25, bgcolor: '#FDF6EC', borderRadius: 1 }}>
                    <Typography sx={{ fontSize: '0.67rem', color: '#5A5A5A' }}>{selected.data.alertType}</Typography>
                  </Box>
                )}
              </Box>
              {selected.data.summary && (
                <Typography sx={{ fontSize: '0.72rem', color: '#5A5A5A', lineHeight: 1.5, mb: 1 }}>{selected.data.summary}</Typography>
              )}
              {selected.data.valid && (
                <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', mb: 1 }}>Valid until: {selected.data.valid}</Typography>
              )}
              {selected.data.source && (
                <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', mb: 1 }}>Source: {selected.data.source}</Typography>
              )}
              <Typography
                component="a"
                href={selected.data.href || '/early-warnings'}
                sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#C1440E', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                View full advisory →
              </Typography>
            </>
          ) : selected.type === 'community' ? (
            <>
              <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A', mb: 1 }}>
                {selected.data.region}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#5A5A5A' }}>Reference community on the regional map.</Typography>
            </>
          ) : (
            <>
              <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A', mb: 1.25 }}>Meteorological Station</Typography>
              {[
                { label: 'Temperature', value: `${selected.data.temp}°C` },
                { label: 'Humidity',    value: `${selected.data.humidity}%` },
                { label: 'Rainfall 24h',value: selected.data.rainfall },
                { label: 'Wind',        value: selected.data.wind },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A' }}>{label}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#3D2B1F' }}>{value}</Typography>
                </Box>
              ))}
            </>
          )}
        </Box>
      )}

      <Box sx={{ height: { xs: 380, md: 560 } }}>
        <MapContainer
          center={[3.0, 34.8]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          scrollWheelZoom={false}
        >
          <ZoomControl position="topright" />
          <TileLayer
            url={getCartoTileUrl()}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />

          {showAlerts && liveAdvisories.map((adv) => (
            <Circle
              key={`live-zone-${adv.id}`}
              center={[adv.lat, adv.lng]}
              radius={ALERT_RADII[adv.alertLevel] || 40000}
              pathOptions={{
                fillColor: adv.color || ALERT_COLORS[adv.alertLevel],
                fillOpacity: 0.14,
                color: adv.color || ALERT_COLORS[adv.alertLevel],
                weight: 3.5,
                opacity: 0.7,
              }}
            />
          ))}

          {showAlerts && liveAdvisories.map((adv) => (
            <Marker
              key={`live-${adv.id}`}
              position={[adv.lat, adv.lng]}
              icon={makeAdvisoryIcon(adv.color || ALERT_COLORS[adv.alertLevel])}
              zIndexOffset={1000}
              eventHandlers={{ click: () => setSelected({ type: 'advisory', data: adv }) }}
            >
              <Popup>
                <strong>{adv.name}</strong><br />
                {adv.region}<br />
                {adv.alertType ? `⚠ ${adv.alertType}` : 'Published advisory'}
              </Popup>
            </Marker>
          ))}

          {showCommunities && communityMarkers.map((loc) => (
            <Marker
              key={loc.name}
              position={[loc.lat, loc.lng]}
              icon={makeCommunityIcon()}
              zIndexOffset={100}
              eventHandlers={{ click: () => setSelected({ type: 'community', data: loc }) }}
            >
              <Popup>
                <strong>{loc.name}</strong><br />
                {loc.region}
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </Box>
    </Box>
  );
}
