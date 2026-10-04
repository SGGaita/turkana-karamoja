import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CLUSTER_REGIONS, CLUSTER_MAP_CENTER, CLUSTER_MAP_ZOOM, MAP_LEGEND, getRegionShapeNames } from '../lib/cluster-coverage';
import { getCartoTileUrl } from '../lib/map-tiles';

function getFeatureCenter(feature) {
  const layer = L.geoJSON(feature);
  return layer.getBounds().getCenter();
}

function makeNumberIcon(num, color) {
  return L.divIcon({
    html: `<div style="width:30px;height:30px;background:${color};color:#fff;border:2.5px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;box-shadow:0 3px 10px rgba(61,43,31,0.35);font-family:Montserrat,Arial,sans-serif;line-height:1;">${num}</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function FitClusterBounds({ layers }) {
  const map = useMap();

  useEffect(() => {
    if (!layers.length) return;
    const group = L.featureGroup(layers);
    map.fitBounds(group.getBounds(), { padding: [28, 28], maxZoom: 8 });
  }, [layers, map]);

  return null;
}

function regionStyle(color) {
  return {
    fillColor: color,
    fillOpacity: 0.28,
    color,
    weight: 2.5,
    opacity: 0.9,
  };
}

export default function ClusterCoverageMap() {
  const [regionFeatures, setRegionFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadBoundaries() {
      try {
        const [kenRes, ugaRes] = await Promise.all([
          fetch('/geoBoundaries-KEN-ADM1_simplified.geojson'),
          fetch('/geoBoundaries-UGA-ADM2_simplified.geojson'),
        ]);

        const [ken, uga] = await Promise.all([kenRes.json(), ugaRes.json()]);
        if (!active) return;

        const loaded = CLUSTER_REGIONS.map((region) => {
          const collection = region.source === 'ken' ? ken : uga;
          const features = getRegionShapeNames(region)
            .map((name) => collection.features.find((f) => f.properties?.shapeName === name))
            .filter(Boolean);

          if (!features.length) return null;

          const feature = features.length === 1
            ? features[0]
            : { type: 'FeatureCollection', features };

          return { region, feature };
        }).filter(Boolean);

        setRegionFeatures(loaded);
      } catch {
        if (active) setRegionFeatures([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBoundaries();
    return () => {
      active = false;
    };
  }, []);

  const fitLayers = useMemo(
    () => regionFeatures.map(({ feature }) => L.geoJSON(feature)),
    [regionFeatures],
  );

  const styles = useMemo(
    () => Object.fromEntries(
      CLUSTER_REGIONS.map((r) => [r.id, regionStyle(r.fill)]),
    ),
    [],
  );

  const regionLabels = useMemo(
    () => regionFeatures.map(({ region, feature }) => ({
      region,
      center: getFeatureCenter(feature),
    })),
    [regionFeatures],
  );

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(61, 43, 31, 0.14)',
        border: '2px solid #E8E0D5',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 1000,
          bgcolor: 'rgba(255,255,255,0.96)',
          p: 1.5,
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        }}
      >
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3D2B1F', mb: 1 }}>
          Cluster regions
        </Typography>
        {MAP_LEGEND.map((group) => (
          <Box key={group.country} sx={{ mb: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.35 }}>
              <Box sx={{ width: 14, height: 14, bgcolor: group.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#3D2B1F' }}>
                {group.country}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.7rem', color: '#5A5A5A', pl: 2.75, mb: 0.25 }}>
              {group.areas}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#9A9A9A', pl: 2.75 }}>
              {group.numbers.map((n) => `#${n}`).join(' · ')}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ height: { xs: 320, md: 440 } }}>
        {loading ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F5F0E8' }}>
            <Typography sx={{ color: '#9A9A9A', fontSize: '0.85rem' }}>Loading cluster map…</Typography>
          </Box>
        ) : (
          <MapContainer
            center={CLUSTER_MAP_CENTER}
            zoom={CLUSTER_MAP_ZOOM}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            scrollWheelZoom={false}
          >
            <ZoomControl position="topright" />
            <TileLayer
              url={getCartoTileUrl()}
              attribution='&copy; OpenStreetMap &copy; CARTO'
              subdomains="abcd"
              maxZoom={19}
            />
            {regionFeatures.map(({ region, feature }) => (
              <GeoJSON key={region.id} data={feature} style={styles[region.id]} />
            ))}
            {regionLabels.map(({ region, center }) => (
              <Marker
                key={`label-${region.id}`}
                position={[center.lat, center.lng]}
                icon={makeNumberIcon(region.number, region.color)}
                zIndexOffset={500}
              />
            ))}
            <FitClusterBounds layers={fitLayers} />
          </MapContainer>
        )}
      </Box>
    </Box>
  );
}
