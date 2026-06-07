import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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

const locations = [
  { name: 'Lodwar',         lat: 3.119, lng: 35.597, type: 'County HQ',        region: 'Turkana, Kenya',   pop: '36,000',   alertType: 'Drought',       alertLevel: 'moderate' },
  { name: 'Lokichogio',     lat: 4.207, lng: 34.348, type: 'Admin Centre',      region: 'Turkana, Kenya',   pop: '12,000',   alertType: 'Severe Drought',alertLevel: 'severe'   },
  { name: 'Kakuma',         lat: 3.717, lng: 34.875, type: 'Humanitarian Hub',  region: 'Turkana, Kenya',   pop: '200,000+', alertType: 'Flood Risk',     alertLevel: 'watch'    },
  { name: 'Kalokol',        lat: 3.532, lng: 35.831, type: 'Fishing Community', region: 'Turkana, Kenya',   pop: '5,200',    alertType: null,             alertLevel: 'normal'   },
  { name: 'Todonyang',      lat: 4.460, lng: 35.920, type: 'Border Community',  region: 'Turkana, Kenya',   pop: '3,000',    alertType: null,             alertLevel: 'normal'   },
  { name: 'Moroto',         lat: 2.534, lng: 34.667, type: 'District HQ',       region: 'Karamoja, Uganda', pop: '45,000',   alertType: 'Drought',        alertLevel: 'moderate' },
  { name: 'Kotido',         lat: 3.000, lng: 34.133, type: 'District HQ',       region: 'Karamoja, Uganda', pop: '15,000',   alertType: 'Locust Swarm',   alertLevel: 'watch'    },
  { name: 'Kaabong',        lat: 3.517, lng: 34.133, type: 'District HQ',       region: 'Karamoja, Uganda', pop: '8,000',    alertType: 'Drought',        alertLevel: 'moderate' },
  { name: 'Nakapiripirit',  lat: 1.908, lng: 34.972, type: 'District HQ',       region: 'Karamoja, Uganda', pop: '7,000',    alertType: null,             alertLevel: 'normal'   },
  { name: 'Abim',           lat: 2.703, lng: 33.668, type: 'District HQ',       region: 'Karamoja, Uganda', pop: '6,500',    alertType: null,             alertLevel: 'normal'   },
];

const weatherStations = [
  { name: 'Lodwar Met Station',  lat: 3.12, lng: 35.61, temp: 38, humidity: 18, rainfall: '0.2 mm', wind: 'NE 12 km/h' },
  { name: 'Lokichogio Station',  lat: 4.22, lng: 34.35, temp: 35, humidity: 22, rainfall: '0 mm',   wind: 'N 8 km/h'   },
  { name: 'Moroto Station',      lat: 2.54, lng: 34.68, temp: 32, humidity: 28, rainfall: '1.5 mm', wind: 'SE 6 km/h'  },
  { name: 'Kakuma Station',      lat: 3.73, lng: 34.88, temp: 36, humidity: 20, rainfall: '0 mm',   wind: 'NE 10 km/h' },
  { name: 'Kotido Station',      lat: 3.01, lng: 34.14, temp: 31, humidity: 30, rainfall: '2.1 mm', wind: 'E 5 km/h'   },
];

const ALERT_RADII = { severe: 55000, moderate: 45000, watch: 35000 };

function makeCircleIcon(color) {
  return L.divIcon({
    html: `<div style="width:16px;height:16px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
}

function makeStationIcon() {
  return L.divIcon({
    html: `<div style="width:20px;height:20px;background:#2E7BB4;border:2.5px solid white;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  });
}

const LAYERS = [
  { key: 'all',     label: 'All' },
  { key: 'alerts',  label: 'Alerts' },
  { key: 'weather', label: 'Weather' },
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

export default function RegionalMap() {
  const [activeLayer, setActiveLayer] = useState('all');
  const [selected, setSelected] = useState(null);

  const showLocations = activeLayer === 'all' || activeLayer === 'alerts';
  const showStations  = activeLayer === 'all' || activeLayer === 'weather';

  return (
    <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', boxShadow: '0 16px 48px rgba(61,43,31,0.15)', border: '1px solid #E8E0D5' }}>

      {/* ── Layer filter tabs ── */}
      <Box sx={{ position: 'absolute', top: 14, left: 14, zIndex: 1000, display: 'flex', gap: 0.8 }}>
        {LAYERS.map(({ key, label }) => (
          <Box key={key} onClick={() => setActiveLayer(key)} sx={filterBtn(activeLayer === key)}>
            {label}
          </Box>
        ))}
      </Box>

      {/* ── Legend ── */}
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
        {Object.entries(ALERT_LABELS).map(([level, label]) => (
          <Box key={level} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.65 }}>
            <Box sx={{ width: 10, height: 10, bgcolor: ALERT_COLORS[level], borderRadius: '50%', border: '1.5px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#5A5A5A' }}>{label}</Typography>
          </Box>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75, pt: 0.75, borderTop: '1px solid #E8E0D5' }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#2E7BB4', borderRadius: '3px', border: '1.5px solid white', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.7rem', color: '#5A5A5A' }}>Met Station</Typography>
        </Box>
      </Box>

      {/* ── Selected info panel ── */}
      {selected && (
        <Box sx={{
          position: 'absolute', bottom: 38, right: 14, zIndex: 1000,
          bgcolor: 'rgba(255,255,255,0.97)',
          p: 2, borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          maxWidth: 224,
          borderLeft: `4px solid ${selected.type === 'station' ? '#2E7BB4' : ALERT_COLORS[selected.data.alertLevel]}`,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
            <Typography sx={{ fontWeight: 700, color: '#3D2B1F', fontSize: '0.85rem', lineHeight: 1.25, pr: 1 }}>
              {selected.data.name}
            </Typography>
            <Box onClick={() => setSelected(null)} sx={{ cursor: 'pointer', color: '#9A9A9A', fontSize: '1.1rem', lineHeight: 1, '&:hover': { color: '#3D2B1F' } }}>×</Box>
          </Box>

          {selected.type === 'location' ? (
            <>
              <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A', mb: 1 }}>
                {selected.data.region} · {selected.data.type}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
                <Box sx={{ px: 1, py: 0.25, bgcolor: `${ALERT_COLORS[selected.data.alertLevel]}18`, borderRadius: 1 }}>
                  <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: ALERT_COLORS[selected.data.alertLevel] }}>
                    {ALERT_LABELS[selected.data.alertLevel]}
                  </Typography>
                </Box>
                {selected.data.alertType && (
                  <Box sx={{ px: 1, py: 0.25, bgcolor: '#FDF6EC', borderRadius: 1 }}>
                    <Typography sx={{ fontSize: '0.67rem', color: '#5A5A5A' }}>{selected.data.alertType}</Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A' }}>Population:</Typography>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#3D2B1F' }}>{selected.data.pop}</Typography>
              </Box>
            </>
          ) : (
            <>
              <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A', mb: 1.25 }}>Meteorological Station · Active</Typography>
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
              <Box sx={{ mt: 0.75, pt: 0.75, borderTop: '1px solid #E8E0D5', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, bgcolor: '#2E8B57', borderRadius: '50%' }} />
                <Typography sx={{ fontSize: '0.67rem', color: '#2E8B57', fontWeight: 600 }}>Live data</Typography>
              </Box>
            </>
          )}
        </Box>
      )}

      {/* ── Leaflet map ── */}
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
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />

          {/* Alert radius circles */}
          {showLocations && locations
            .filter((loc) => loc.alertLevel !== 'normal')
            .map((loc) => (
              <Circle
                key={`zone-${loc.name}`}
                center={[loc.lat, loc.lng]}
                radius={ALERT_RADII[loc.alertLevel] || 40000}
                pathOptions={{
                  fillColor: ALERT_COLORS[loc.alertLevel],
                  fillOpacity: 0.08,
                  color: ALERT_COLORS[loc.alertLevel],
                  weight: 1,
                  opacity: 0.35,
                }}
              />
            ))}

          {/* Location markers */}
          {showLocations && locations.map((loc) => (
            <Marker
              key={loc.name}
              position={[loc.lat, loc.lng]}
              icon={makeCircleIcon(ALERT_COLORS[loc.alertLevel])}
              eventHandlers={{ click: () => setSelected({ type: 'location', data: loc }) }}
            >
              <Popup>
                <strong>{loc.name}</strong><br />
                {loc.region}<br />
                {loc.alertType ? `⚠ ${loc.alertType}` : '✓ No active alerts'}
              </Popup>
            </Marker>
          ))}

          {/* Weather station markers */}
          {showStations && weatherStations.map((ws) => (
            <Marker
              key={ws.name}
              position={[ws.lat, ws.lng]}
              icon={makeStationIcon()}
              eventHandlers={{ click: () => setSelected({ type: 'station', data: ws }) }}
            >
              <Popup>
                <strong>{ws.name}</strong><br />
                {ws.temp}°C · {ws.humidity}% RH · {ws.rainfall}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
}
