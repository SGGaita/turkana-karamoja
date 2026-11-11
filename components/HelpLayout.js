import { Box, Typography, List, ListItemButton, ListItemText, Divider, Paper, Button } from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from './Layout';
import PageHero from './PageHero';
import TollFreeLines from './TollFreeLines';
import { useT } from '../contexts/LanguageContext';

/** Article text from Karamoja → Help (cleaned by Core). */
export const helpRichTextSx = {
  fontSize: '0.95rem',
  lineHeight: 1.75,
  color: '#3D2B1F',
  '& p': { m: '0 0 1em' },
  '& h2': { fontSize: { xs: '1.2rem', md: '1.35rem' }, fontWeight: 700, mt: 4, mb: 1.5, scrollMarginTop: 170 },
  '& h3': { fontSize: '1.05rem', fontWeight: 700, mt: 3, mb: 1, scrollMarginTop: 170 },
  '& ul, & ol': { pl: 3, mb: 1.5 },
  '& li': { mb: 0.5 },
  '& a': { color: '#C1440E' },
  '& strong': { color: '#3D2B1F' },
  '& code': { bgcolor: '#F4EDE4', px: 0.5, borderRadius: 0.5, fontSize: '0.85em' },
  '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1, border: '1px solid #E8E0D5' },
  '& table': { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', mb: 2, display: 'block', overflowX: 'auto' },
  '& th': { bgcolor: '#3D2B1F', color: 'white', textAlign: 'left', p: 1.25, fontWeight: 600 },
  '& td': { borderBottom: '1px solid #E8E0D5', p: 1.25, verticalAlign: 'top' },
  '& blockquote': { m: '0 0 1em', p: 2, bgcolor: '#FFF8E7', border: '1px solid #E8D5A0', borderRadius: 2 },
};

const sideHeadingSx = { fontSize: '0.7rem', fontWeight: 700, color: '#9A9A9A', letterSpacing: '0.08em', mb: 1, textTransform: 'uppercase' };

/** Left column: the guides (and the FAQ), then this page's headings. */
function HelpSidebar({ guides = [], active, toc = [], faqLabel }) {
  const t = useT();
  return (
    <Paper
      component="nav"
      aria-label={t('help.guides')}
      elevation={0}
      sx={{ alignSelf: 'start', border: '1px solid #E8E0D5', borderRadius: 2, p: 2, position: { md: 'sticky' }, top: { md: 100 }, maxHeight: { md: 'calc(100vh - 120px)' }, overflowY: { md: 'auto' } }}
    >
      <Typography sx={sideHeadingSx}>{t('help.guides')}</Typography>
      <List dense disablePadding sx={{ mb: toc.length ? 2 : 0 }}>
        {[...guides.map((g) => ({ slug: g.slug, label: g.name, href: `/help/${g.slug}` })), ...(faqLabel ? [{ slug: 'faq', label: faqLabel, href: '/help/faq' }] : [])].map((item) => (
          <ListItemButton
            key={item.slug}
            component={Link}
            href={item.href}
            selected={item.slug === active}
            sx={{ borderRadius: 1, mb: 0.5, '&.Mui-selected': { bgcolor: '#C1440E12', color: '#C1440E' } }}
          >
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
          </ListItemButton>
        ))}
      </List>
      {toc.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography sx={sideHeadingSx}>{t('help.on_this_page')}</Typography>
          <List dense disablePadding>
            {toc.map((h) => (
              <ListItemButton key={h.id} component="a" href={`#${h.id}`} sx={{ borderRadius: 1, py: 0.5, pl: h.level > 2 ? 3 : 1 }}>
                <ListItemText primary={h.text} primaryTypographyProps={{ fontSize: '0.8rem' }} />
              </ListItemButton>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
}

/** "Still need help?": the page's text, the Contact link and the helplines. */
export function HelpContactBox({ copy }) {
  const t = useT();
  if (!copy || (!copy.title && !copy.text)) return null;
  return (
    <Box sx={{ mt: 6, p: { xs: 2.5, md: 3 }, bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2 }}>
      {copy.title && <Typography component="h2" sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#3D2B1F', mb: 1 }}>{copy.title}</Typography>}
      {copy.text && <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A', lineHeight: 1.7, mb: 2 }}>{copy.text}</Typography>}
      <Button component={Link} href="/contact" variant="outlined" sx={{ borderColor: '#C1440E', color: '#C1440E', textTransform: 'none', mb: 2 }}>
        {t('help.contact')}
      </Button>
      <TollFreeLines />
    </Box>
  );
}

/** Shown when the help could not be loaded while the site was built (retried after a minute). */
export function HelpUnavailable() {
  const t = useT();
  return (
    <Typography sx={{ fontSize: '0.95rem', color: '#5A5A5A', lineHeight: 1.7 }}>
      {t('help.unavailable')}
    </Typography>
  );
}

/**
 * A help page: hero, back link, sidebar with the guides and this page's headings, the content, and the contact box.
 */
export default function HelpLayout({ title, subtitle, image, breadcrumbs, guides, active, toc, faqLabel, contact, children }) {
  const t = useT();
  return (
    <Layout title={title}>
      <PageHero title={title} subtitle={subtitle} image={image} breadcrumbs={breadcrumbs} />
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Button component={Link} href="/help" startIcon={<ArrowBackIcon />} sx={{ mb: 3, color: '#5A5A5A', textTransform: 'none' }}>
          {t('help.back')}
        </Button>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px minmax(0, 1fr)' }, gap: 4 }}>
          <HelpSidebar guides={guides} active={active} toc={toc} faqLabel={faqLabel} />
          <Box>
            {children}
            <HelpContactBox copy={contact} />
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
