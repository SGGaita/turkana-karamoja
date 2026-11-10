import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { fallbackHero } from '../lib/fallback-data';
import { useLanguage, useLocalizedHero } from '../contexts/LanguageContext';
import { overviewHasContent } from '../lib/cms-home';

const LEVELS = [
  { key: 'red', color: '#D63030' },
  { key: 'orange', color: '#E87010' },
  { key: 'yellow', color: '#B8860B' },
];

/** Date in the reader's language where the browser knows it (Pokoot and Turkana fall back to English). */
function formatDate(iso, locale) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  for (const tag of [locale === 'sw' ? 'sw-KE' : null, 'en-GB']) {
    if (!tag) continue;
    try {
      return new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
    } catch {
      /* try the next one */
    }
  }
  return iso;
}

function Tile({ color, value, label, note, href, children }) {
  const body = (
    <Box
      sx={{
        height: '100%',
        bgcolor: 'white',
        border: '1px solid #E8E0D5',
        borderLeft: `4px solid ${color}`,
        borderRadius: 2,
        p: 2.25,
        transition: 'box-shadow 0.2s',
        '&:hover': href ? { boxShadow: '0 8px 24px rgba(61,43,31,0.12)' } : undefined,
      }}
    >
      <Typography sx={{ fontSize: { xs: '1.7rem', md: '2rem' }, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</Typography>
      <Typography sx={{ fontWeight: 700, color: '#3D2B1F', mt: 0.5 }}>{label}</Typography>
      {note && <Typography sx={{ fontSize: '0.8rem', color: '#6B5E52', mt: 0.5 }}>{note}</Typography>}
      {children}
    </Box>
  );
  return (
    <Box sx={{ flex: '1 1 200px', minWidth: { xs: '100%', sm: 200 } }}>
      {href ? (
        <Box component={Link} href={href} sx={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
          {body}
        </Box>
      ) : body}
    </Box>
  );
}

/**
 * "What's happening now": the live number of active warnings and the editors' dated figures.
 * Content from Karamoja → Website pages → Home → "What's happening now" panel.
 */
export default function HomeOverview() {
  const { locale } = useLanguage();
  const ov = useLocalizedHero(fallbackHero).overview;
  if (!overviewHasContent(ov)) return null;
  const w = ov.warnings || {};
  const showCount = Boolean(w.label);

  return (
    <Box component="section" aria-labelledby="home-overview-title" sx={{ bgcolor: '#FDF6EC', py: { xs: 5, md: 6 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
        {(ov.title || ov.subtitle) && (
          <Box sx={{ mb: 2.5 }}>
            {ov.title && (
              <Typography id="home-overview-title" variant="h2" sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, color: '#3D2B1F' }}>
                {ov.title}
              </Typography>
            )}
            {ov.subtitle && <Typography sx={{ color: '#6B5E52', mt: 0.5 }}>{ov.subtitle}</Typography>}
          </Box>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {showCount && (
            <Tile color={w.red ? '#D63030' : w.orange ? '#E87010' : '#2E8B57'} value={w.total} label={w.label} href="/early-warnings">
              {w.total > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }} aria-hidden="true">
                  {LEVELS.filter((l) => w[l.key] > 0).map((l) => (
                    <Box key={l.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem', fontWeight: 700, color: '#3D2B1F' }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: l.color }} />
                      {w[l.key]}
                    </Box>
                  ))}
                </Box>
              )}
            </Tile>
          )}
          {(ov.metrics || []).map((m, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Tile key={i} color={m.color} value={m.val} label={m.label} note={m.sub} />
          ))}
        </Box>
        {(ov.footer || (ov.asOf && ov.metrics?.length > 0)) && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mt: 2, color: '#6B5E52', fontSize: '0.85rem' }}>
            {ov.asOf && ov.metrics?.length > 0 && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <EventOutlinedIcon sx={{ fontSize: 16 }} aria-hidden="true" />
                <time dateTime={ov.asOf}>{formatDate(ov.asOf, locale)}</time>
              </Box>
            )}
            {ov.footer && <Typography component="p" sx={{ fontSize: '0.85rem', m: 0 }}>{ov.footer}</Typography>}
          </Box>
        )}
      </Box>
    </Box>
  );
}
