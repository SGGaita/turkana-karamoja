import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import StaleContentBanner from '../components/StaleContentBanner';
import ContactForm from '../components/ContactForm';
import { RegionalOffices, KeyContacts, SocialLinks } from '../components/ContactDirectory';
import { getContactPage } from '../lib/wordpress';
import { APP_NAME } from '../lib/branding';

export default function Contact({ page, apiStale }) {
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
  const { data, apiStale } = await getContactPage();
  return {
    props: { page: data, apiStale },
    revalidate: 3600,
  };
}
