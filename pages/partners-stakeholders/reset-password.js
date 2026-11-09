import { Container } from '@mui/material';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import PasswordSetForm from '../../components/PasswordSetForm';

export default function Page() {
  return (
    <Layout title="Choose a new password">
      <PageHero
        title="Choose a new password"
        subtitle="Choose a new password for your partner account."
        breadcrumbs={['Partners & Stakeholders', 'Choose a new password']}
      />
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <PasswordSetForm kind="reset" />
      </Container>
    </Layout>
  );
}

// Links in emails carry a one-time token: keep these pages out of search engines and caches.
export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Referrer-Policy', 'no-referrer');
  return { props: {} };
}
