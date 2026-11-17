import { useEffect, useState } from 'react';
import { Box, CircularProgress, Drawer, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { useLanguage, useLocalePath } from '../contexts/LanguageContext';
import { cmsLocale } from '../lib/cms';
import { partnerArticles } from '../lib/help-client';

/** The portal's Help panel (FE-14): every Partner Guide article, opening in a new tab. */
export default function PortalHelp({ open, onClose }) {
  const to = useLocalePath();
  const { t, locale } = useLanguage();
  const [articles, setArticles] = useState(null);
  const [failed, setFailed] = useState(false);
  const lang = cmsLocale(locale);

  useEffect(() => {
    if (!open || articles) return;
    partnerArticles(lang).then(setArticles).catch(() => setFailed(true));
  }, [open, articles, lang]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 380 }, p: 2.5 }} role="region" aria-labelledby="kc-portal-help">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography id="kc-portal-help" component="h2" sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#3D2B1F' }}>
            {t('help.portal_title')}
          </Typography>
          <IconButton onClick={onClose} aria-label="Close" size="small"><CloseIcon fontSize="small" /></IconButton>
        </Box>
        <Typography sx={{ fontSize: '0.85rem', color: '#6B4226', mb: 2 }}>{t('help.portal_intro')}</Typography>

        {!articles && !failed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
            <CircularProgress size={18} />
            <Typography sx={{ fontSize: '0.85rem' }}>{t('help.loading')}</Typography>
          </Box>
        )}
        {failed && <Typography sx={{ fontSize: '0.85rem', color: '#6B6B6B', mb: 2 }}>{t('help.unavailable')}</Typography>}

        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {(articles || []).map((a) => (
            <Box component="li" key={a.key} sx={{ borderBottom: '1px solid #F0EBE3' }}>
              <Box
                component="a"
                href={to(`/help/${a.key}`)}
                target="_blank"
                rel="noopener"
                sx={{ display: 'flex', gap: 1.25, py: 1.25, textDecoration: 'none', '&:hover .t': { color: '#C1440E' } }}
              >
                <ArticleOutlinedIcon sx={{ color: '#296D9F', fontSize: 20, mt: 0.25 }} />
                <Box>
                  <Typography className="t" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#3D2B1F' }}>{a.title}</Typography>
                  {a.excerpt && <Typography sx={{ fontSize: '0.8rem', color: '#6B6B6B' }}>{a.excerpt}</Typography>}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Typography sx={{ mt: 2, fontSize: '0.85rem' }}>
          <a href="/help/partner-guide" target="_blank" rel="noopener" style={{ color: '#296D9F', fontWeight: 700 }}>{t('help.partner_guide')} →</a>
        </Typography>
      </Box>
    </Drawer>
  );
}
