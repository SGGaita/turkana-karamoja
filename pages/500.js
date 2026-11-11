import StatusPage, { statusPageProps } from '../components/StatusPage';

const FALLBACK = {
  title: 'Something went wrong',
  text: 'The hub could not show this page just now. Please try again in a minute.',
  button: { label: 'Go to the home page', href: '/' },
};

export default function ServerError({ pageByLocale }) {
  return <StatusPage pageByLocale={pageByLocale} section="server_error" fallback={FALLBACK} code="500" />;
}

// Built once with the site (a server-error page can't depend on the server): changes show after the next build.
export async function getStaticProps() {
  return { props: { pageByLocale: await statusPageProps('errors') } };
}
