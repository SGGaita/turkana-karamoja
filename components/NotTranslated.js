import { Box, Tooltip, Typography } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { useLanguage, useT } from '../contexts/LanguageContext';

/**
 * "Not yet translated" (FE-26): shown in a language other than English where the CMS had no translation and sent
 * the English text instead (`_untranslated` in karamoja/v1).
 */

/** Fields of an item that matter for the badge (title and main text by default). */
export function isUntranslated(untranslated, fields = ['title', 'content', 'description', 'summary', 'body', 'excerpt']) {
  return Array.isArray(untranslated) && untranslated.some((f) => fields.includes(f));
}

/** Small badge next to an item's title. `untranslated`: the item's field list; nothing in English. */
export function NotTranslatedBadge({ untranslated, fields, dark = false, sx }) {
  const { locale } = useLanguage();
  const t = useT();
  if (locale === 'en' || !isUntranslated(untranslated, fields)) return null;
  return (
    <Tooltip title={t('language.not_translated_hint')} describeChild>
      <Box
        component="span"
        tabIndex={0}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 0.75,
          py: 0.25,
          borderRadius: 1,
          fontSize: '0.7rem',
          fontWeight: 600,
          lineHeight: 1.4,
          verticalAlign: 'middle',
          whiteSpace: 'nowrap',
          color: dark ? '#FFF7E8' : '#7A5A12',
          bgcolor: dark ? 'rgba(255,255,255,0.14)' : '#FBF1D9',
          border: dark ? '1px solid rgba(255,255,255,0.3)' : '1px solid #EBD6A3',
          ...sx,
        }}
      >
        <TranslateIcon sx={{ fontSize: '0.85rem' }} aria-hidden />
        {t('language.not_translated')}
      </Box>
    </Tooltip>
  );
}

/** One line under a page's header when some of the page's text is still in English (Website pages). */
export function PageTranslationNote({ dark = true }) {
  const { pageUntranslated, locale } = useLanguage();
  const t = useT();
  if (!pageUntranslated || locale === 'en') return null;
  return (
    <Typography
      role="note"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        mt: 1.5,
        fontSize: '0.8rem',
        color: dark ? 'rgba(255,255,255,0.85)' : '#7A5A12',
      }}
    >
      <TranslateIcon sx={{ fontSize: '1rem' }} aria-hidden />
      {t('language.page_partly')}
    </Typography>
  );
}
