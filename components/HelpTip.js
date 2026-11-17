import { useState } from 'react';
import { Box, CircularProgress, IconButton, Popover, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useLanguage } from '../contexts/LanguageContext';
import { cmsLocale } from '../lib/cms';
import { contextArticles } from '../lib/help-client';

/**
 * (?) next to a form title (FE-14): shows the Partner Guide articles for this place of the website (`contextKey`, as
 * set on the article in Karamoja → Help, e.g. "partner.submit-advisory"). Links open in a new tab, so the form keeps
 * what was typed. Shows nothing if the help can't be loaded.
 */
export default function HelpTip({ contextKey, sx }) {
  const { t, locale } = useLanguage();
  const [anchor, setAnchor] = useState(null);
  const [articles, setArticles] = useState(null);
  const [failed, setFailed] = useState(false);
  const lang = cmsLocale(locale);

  const open = (e) => {
    setAnchor(e.currentTarget);
    if (!articles) {
      contextArticles(contextKey, lang).then(setArticles).catch(() => setFailed(true));
    }
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={open}
        aria-label={t('help.tip')}
        title={t('help.tip')}
        sx={{ color: '#296D9F', p: 0.5, ...sx }}
      >
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 2, maxWidth: 360, borderTop: '3px solid #2E7BB4' } } }}
      >
        {!articles && !failed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography sx={{ fontSize: '0.85rem', color: '#6B4226' }}>{t('help.loading')}</Typography>
          </Box>
        )}
        {(failed || (articles && !articles.length)) && (
          <Typography sx={{ fontSize: '0.85rem' }}>
            <a href="/help/partner-guide" target="_blank" rel="noopener" style={{ color: '#296D9F', fontWeight: 600 }}>{t('help.partner_guide')}</a>
          </Typography>
        )}
        {articles?.map((a) => (
          <Box key={a.key} sx={{ '& + &': { mt: 1.5, pt: 1.5, borderTop: '1px solid #F0EBE3' } }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#3D2B1F' }}>{a.title}</Typography>
            {a.excerpt && <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', mt: 0.5 }}>{a.excerpt}</Typography>}
            <Typography sx={{ mt: 0.75, fontSize: '0.82rem' }}>
              <a href={`/help/${a.key}`} target="_blank" rel="noopener" style={{ color: '#296D9F', fontWeight: 600 }}>{t('help.read_more')} →</a>
            </Typography>
          </Box>
        ))}
      </Popover>
    </>
  );
}
