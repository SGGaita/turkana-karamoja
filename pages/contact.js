import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import CmsUnavailable from '../components/CmsUnavailable';
import ContactForm from '../components/ContactForm';
import TollFreeLines from '../components/TollFreeLines';
import { RegionalOffices, SocialLinks } from '../components/ContactDirectory';
import { cmsStaticProps, getGlobals, getPageAllLocales, isPublishedPage } from '../lib/cms';
import { pageCopy } from '../lib/cms-community';
import { fallbackContactPage } from '../lib/fallback-data';
import { helpBoxFromCms, officesFromGlobals, socialFromGlobals } from '../lib/cms-about-contact';
import { useLanguage } from '../contexts/LanguageContext';

const panelSx = {
  flex: '1 1 40%',
  minWidth: 0,
  bgcolor: '#3D2B1F',
  borderRadius: 3,
  p: { xs: 3, md: 3.5 },
  color: '#F0D9B0',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

/** Contact from Karamoja → Website pages → Contact (built-in title until saved); offices and social accounts from Site settings. */
function CmsContact({ pageByLocale, offices, social }) {
  const { locale, t } = useLanguage();
  const { copy, shown, hero } = pageCopy(pageByLocale, locale, { hero: { title: 'Contact Us', image: fallbackContactPage.featuredImage } });
  const intro = copy('intro');
  const form = copy('form');
  const box = helpBoxFromCms(copy('help_box'));
  const hotlinesTitle = copy('hotlines').title;

  return (
    <Layout title={hero.title || 'Contact Us'}>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} breadcrumbs={[hero.title || 'Contact Us']} />
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        {intro.title && (
          <Typography component="h2" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.4rem', color: '#3D2B1F', mb: 1 }}>{intro.title}</Typography>
        )}
        {intro.text && (
          <Typography sx={{ fontSize: { xs: '1rem', md: '1.08rem' }, color: '#5A5A5A', lineHeight: 1.75, mb: { xs: 4, md: 5 }, maxWidth: 820 }}>{intro.text}</Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 4, md: 5 }, mb: { xs: 5, md: 7 }, alignItems: 'stretch' }}>
          {shown('form') && (
            <Box sx={{ flex: '1 1 55%', minWidth: 0 }}>
              <ContactForm title={form.title} intro={form.intro} />
            </Box>
          )}
          {(box.title || box.items.length > 0 || shown('hotlines') || box.note) && (
            <Box sx={panelSx}>
              {box.title && (
                <Typography component="h2" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#F0D9B0', mb: 1.5 }}>{box.title}</Typography>
              )}
              {box.items.length > 0 && (
                <Box component="ul" sx={{ m: 0, pl: 2.25, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {box.items.map((item) => (
                    <Typography key={item} component="li" sx={{ fontSize: '0.9rem', color: '#D4A96A', lineHeight: 1.6 }}>{item}</Typography>
                  ))}
                </Box>
              )}
              {shown('hotlines') && <TollFreeLines variant="dark" {...(hotlinesTitle ? { title: hotlinesTitle } : {})} />}
              {box.note && <Typography sx={{ mt: 3, fontSize: '0.82rem', color: '#9A9A9A', lineHeight: 1.6 }}>{box.note}</Typography>}
            </Box>
          )}
        </Box>

        {shown('offices') && <RegionalOffices offices={offices} title={copy('offices').title} intro="" />}
        <SocialLinks social={social} title={t('contact.social')} intro="" />
      </Box>
    </Layout>
  );
}

export default function Contact({ unavailable, pageByLocale, offices, social }) {
  if (unavailable) return <CmsUnavailable />;
  return <CmsContact pageByLocale={pageByLocale} offices={offices || []} social={social || []} />;
}

export async function getStaticProps() {
  return cmsStaticProps(async () => {
    const [pageByLocale, globals] = await Promise.all([getPageAllLocales('contact'), getGlobals('en').catch(() => null)]);
    return {
      pageByLocale: isPublishedPage(pageByLocale.en) ? pageByLocale : null,
      offices: officesFromGlobals(globals),
      social: socialFromGlobals(globals),
    };
  }, { revalidate: 3600, name: 'contact' });
}
