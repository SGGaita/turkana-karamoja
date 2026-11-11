import { Box } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useT } from '../contexts/LanguageContext';

/**
 * "Help with this step": opens the matching Partner Guide article (Karamoja → Help) in a new tab, so a half-filled
 * form is not lost. `article` is the article's key (e.g. "partner-register"); the website's /help/<key> finds it even
 * if staff change its address.
 */
export default function HelpStepLink({ article, sx }) {
  const t = useT();
  return (
    <Box
      component="a"
      href={`/help/${article}`}
      target="_blank"
      rel="noopener"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem', color: '#2E7BB4', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, ...sx }}
    >
      <HelpOutlineIcon sx={{ fontSize: 16 }} aria-hidden />
      {t('help.step_help')}
    </Box>
  );
}
