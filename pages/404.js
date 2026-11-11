import StatusPage, { statusPageProps } from '../components/StatusPage';

const FALLBACK = {
  title: 'Page not found',
  text: 'The page you were looking for has moved or no longer exists.',
  button: { label: 'Go to the home page', href: '/' },
};

export default function NotFound({ pageByLocale }) {
  return <StatusPage pageByLocale={pageByLocale} section="not_found" fallback={FALLBACK} code="404" />;
}

// Text from Karamoja → Website pages → Error pages; refreshed hourly and when the page is saved.
export async function getStaticProps() {
  return { props: { pageByLocale: await statusPageProps('errors') }, revalidate: 3600 };
}
