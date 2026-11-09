import { Container } from '@mui/material';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import PasswordSetForm from '../../components/PasswordSetForm';

export default function Page() {
  return (
    <Layout title="Set your password">
      <PageHero
        title="Set your password"
        subtitle="Your organisation has been approved. Choose a password to sign in to the partner portal."
        breadcrumbs={['Partners & Stakeholders', 'Set your password']}
      />
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <PasswordSetForm kind="setup" />
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
