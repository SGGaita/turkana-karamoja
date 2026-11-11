import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import StaleContentBanner from '../components/StaleContentBanner';
import ContactForm from '../components/ContactForm';
import TollFreeLines from '../components/TollFreeLines';
import { RegionalOffices, KeyContacts, SocialLinks } from '../components/ContactDirectory';
import { getContactPage } from '../lib/wordpress';
import { getGlobals, getPageAllLocales, isPublishedPage } from '../lib/cms';
import { pageCopy } from '../lib/cms-community';
import { fallbackContactPage } from '../lib/fallback-data';
import { helpBoxFromCms, officesFromGlobals, socialFromGlobals } from '../lib/cms-about-contact';
import { useLanguage } from '../contexts/LanguageContext';
import { APP_NAME } from '../lib/branding';

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

/** Contact from Karamoja → Website pages → Contact (once saved); offices and social accounts from Site settings. */
function CmsContact({ pageByLocale, offices, social }) {
  const { locale, t } = useLanguage();
  const { copy, shown, hero } = pageCopy(pageByLocale, locale, { hero: { image: fallbackContactPage.featuredImage } });
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

export default function Contact({ source = 'legacy', pageByLocale, offices, social, page, apiStale }) {
  if (source === 'cms') return <CmsContact pageByLocale={pageByLocale} offices={offices || []} social={social || []} />;
  return <LegacyContact page={page} apiStale={apiStale} />;
}

function LegacyContact({ page, apiStale }) {
  return (
    <Layout title="Contact Us">
      <PageHero
        title={page.title}
        subtitle={page.subtitle}
        image={page.featuredImage}
        breadcrumbs={['Contact Us']}
      />

      <StaleContentBanner show={apiStale} />

      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          py: { xs: 4, md: 6 },
        }}
      >
        {page.intro && (
          <Typography
            sx={{
              fontSize: { xs: '1rem', md: '1.08rem' },
              color: '#5A5A5A',
              lineHeight: 1.75,
              mb: { xs: 4, md: 5 },
              maxWidth: 820,
            }}
          >
            {page.intro}
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 5 },
            mb: { xs: 5, md: 7 },
            alignItems: 'stretch',
          }}
        >
          <Box sx={{ flex: '1 1 55%', minWidth: 0 }}>
            <ContactForm title={page.formTitle} intro={page.formIntro} />
          </Box>
          <Box
            sx={{
              flex: '1 1 40%',
              minWidth: 0,
              bgcolor: '#3D2B1F',
              borderRadius: 3,
              p: { xs: 3, md: 3.5 },
              color: '#F0D9B0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700,
                fontSize: '1.15rem',
                color: '#F0D9B0',
                mb: 1.5,
              }}
            >
              How we can help
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.25, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {[
                `General enquiries about ${APP_NAME}`,
                'Partnership and data-sharing requests',
                'Regional office referrals (Turkana, North Pokot, Moroto, Amudat, Napak)',
                'Media and communications contacts',
              ].map((item) => (
                <Typography
                  key={item}
                  component="li"
                  sx={{ fontSize: '0.9rem', color: '#D4A96A', lineHeight: 1.6 }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
            <TollFreeLines variant="dark" />
            <Typography sx={{ mt: 3, fontSize: '0.82rem', color: '#9A9A9A', lineHeight: 1.6 }}>
              For life-threatening emergencies, contact your local disaster management office or the
              national emergency hotline — do not rely on this web form alone.
            </Typography>
          </Box>
        </Box>

        <RegionalOffices offices={page.offices} />
        <KeyContacts contacts={page.contacts} />
        <SocialLinks social={page.social} />
      </Box>
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const [pageByLocale, globals] = await Promise.all([getPageAllLocales('contact'), getGlobals('en').catch(() => null)]);
    if (isPublishedPage(pageByLocale.en)) {
      return {
        props: { source: 'cms', pageByLocale, offices: officesFromGlobals(globals), social: socialFromGlobals(globals) },
        revalidate: 3600,
      };
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.warn('[cms] contact:', err.message);
  }
  // Until Website pages → Contact is saved (or Karamoja Core can't be reached): the old contact settings.
  const { data, apiStale } = await getContactPage();
  return {
    props: { page: data, apiStale },
    revalidate: 3600,
  };
}
