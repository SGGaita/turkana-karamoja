import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Chip, FormControl, InputLabel, Select, MenuItem,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { HUB_MAP_LOCATIONS } from '../lib/hub-locations';

function MapShell({ height, children }) {
  return (
    <Box
      sx={{
        height,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #E8E0D5',
        position: 'relative',
        bgcolor: '#F5F0E8',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0 }}>{children}</Box>
    </Box>
  );
}

function MapLoading({ height = 280 }) {
  return (
    <MapShell height={height}>
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A9A9A', fontSize: '0.85rem' }}>
        Loading map…
      </Box>
    </MapShell>
  );
}

function MapError({ message, onRetry, height = 280 }) {
  return (
    <MapShell height={height}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, p: 2 }}>
        <Typography sx={{ fontSize: '0.82rem', color: '#b91c1c', textAlign: 'center' }}>{message}</Typography>
        {onRetry && (
          <Button size="small" variant="outlined" onClick={onRetry} sx={{ borderColor: '#C1440E', color: '#C1440E' }}>
            Retry
          </Button>
        )}
      </Box>
    </MapShell>
  );
}

export default function AdvisoryLocationPicker({
  location,
  region,
  onLocationChange,
  onRegionChange,
  disabled,
  inputSx,
  regions = [],
}) {
  const [MapInner, setMapInner] = useState(null);
  const [mapError, setMapError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftLocation, setDraftLocation] = useState(location);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return undefined;
    let cancelled = false;
    setMapError('');
    import('./AdvisoryLocationMapInner')
      .then((mod) => {
        if (!cancelled) setMapInner(() => mod.default);
      })
      .catch((err) => {
        if (!cancelled) setMapError(err?.message || 'Could not load map');
      });
    return () => { cancelled = true; };
  }, [mounted, loadAttempt]);

  useEffect(() => {
    if (dialogOpen) {
      setDraftLocation(location);
    }
  }, [dialogOpen, location]);

  const pickPreset = useCallback((preset) => {
    const next = { lat: preset.lat, lng: preset.lng, label: preset.name };
    onLocationChange(next);
    if (preset.region && onRegionChange) {
      onRegionChange(preset.region);
    }
  }, [onLocationChange, onRegionChange]);

  const handlePick = useCallback((coords) => {
    onLocationChange({ ...location, ...coords });
  }, [location, onLocationChange]);

  const handleDialogPick = useCallback((coords) => {
    setDraftLocation((prev) => ({ ...prev, ...coords }));
  }, []);

  const confirmDialog = () => {
    onLocationChange(draftLocation);
    setDialogOpen(false);
  };

  const renderMap = (opts) => {
    const {
      loc,
      onPick,
      height = 280,
      mapKey,
      active = true,
    } = opts;

    if (!mounted) return <MapLoading height={height} />;
    if (mapError) {
      return <MapError height={height} message={mapError} onRetry={() => setLoadAttempt((n) => n + 1)} />;
    }
    if (!MapInner) return <MapLoading height={height} />;

    return (
      <MapShell height={height}>
        <MapInner
          location={loc}
          onPick={onPick}
          disabled={disabled}
          mapKey={mapKey}
          active={active}
        />
      </MapShell>
    );
  };

  const hasPin = location?.lat != null && location?.lng != null;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', mb: 0.5, color: '#3D2B1F' }}>
        Affected location *
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mb: 1.5, lineHeight: 1.5 }}>
        Pin where this advisory applies. Use the expanded map for a wider view, or pick a known place below.
      </Typography>

      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-end', pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? 0.65 : 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FullscreenIcon />}
          disabled={disabled || !MapInner}
          onClick={() => setDialogOpen(true)}
          sx={{ textTransform: 'none', fontSize: '0.78rem', borderColor: '#2E7BB4', color: '#2E7BB4' }}
        >
          Open wide map
        </Button>
      </Box>

      <Box sx={{ mb: 1.5, pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? 0.65 : 1 }}>
        {renderMap({
          loc: location,
          onPick: handlePick,
          height: 240,
          mapKey: `inline-${loadAttempt}`,
          active: !dialogOpen,
        })}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
        {HUB_MAP_LOCATIONS.map((loc) => (
          <Chip
            key={loc.name}
            icon={<PlaceIcon sx={{ fontSize: '14px !important' }} />}
            label={loc.name}
            size="small"
            disabled={disabled}
            onClick={() => pickPreset(loc)}
            sx={{
              fontSize: '0.68rem',
              cursor: disabled ? 'default' : 'pointer',
              bgcolor: location?.label === loc.name ? '#FFF0EC' : '#FDF9F4',
              border: location?.label === loc.name ? '1px solid #C1440E' : '1px solid #E8E0D5',
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Location label"
          size="small"
          disabled={disabled}
          value={location?.label || ''}
          onChange={(e) => onLocationChange({ ...location, label: e.target.value })}
          placeholder="e.g. Lodwar town, Turkana North"
          sx={{ ...inputSx, flex: '1 1 220px' }}
        />
        {regions.length > 0 && (
          <FormControl size="small" sx={{ ...inputSx, flex: '1 1 220px' }} required disabled={disabled}>
            <InputLabel>Administrative area *</InputLabel>
            <Select
              value={region || ''}
              label="Administrative area *"
              onChange={(e) => onRegionChange?.(e.target.value)}
            >
              {regions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
        )}
      </Box>

      {hasPin && (
        <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', mt: 1 }}>
          Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </Typography>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '92vh',
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#3D2B1F', pb: 1 }}>
          Pick advisory location
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
            Click anywhere on the map to place the pin. Zoom and pan for precision, then confirm.
          </Alert>
          {renderMap({
            loc: draftLocation,
            onPick: handleDialogPick,
            height: { xs: '52vh', sm: '62vh', md: '68vh' },
            mapKey: `dialog-${loadAttempt}-${dialogOpen ? 'open' : 'closed'}`,
            active: dialogOpen,
          })}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mt: 2 }}>
            {HUB_MAP_LOCATIONS.map((loc) => (
              <Chip
                key={`dlg-${loc.name}`}
                icon={<PlaceIcon sx={{ fontSize: '14px !important' }} />}
                label={loc.name}
                size="small"
                onClick={() => setDraftLocation({ lat: loc.lat, lng: loc.lng, label: loc.name })}
                sx={{ fontSize: '0.68rem', cursor: 'pointer' }}
              />
            ))}
          </Box>
          {draftLocation?.lat != null && draftLocation?.lng != null && (
            <Typography sx={{ fontSize: '0.72rem', color: '#5A5A5A', mt: 1.5 }}>
              Selected: {draftLocation.label || 'Custom pin'} · {draftLocation.lat.toFixed(4)}, {draftLocation.lng.toFixed(4)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={confirmDialog}
            disabled={draftLocation?.lat == null || draftLocation?.lng == null}
            sx={{ bgcolor: '#C1440E' }}
          >
            Use this location
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
