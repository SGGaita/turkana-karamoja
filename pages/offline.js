import Head from 'next/head';
import StatusPage, { statusPageProps } from '../components/StatusPage';

const FALLBACK = {
  title: 'You are offline',
  text: 'This page is not saved on this device yet. Pages you opened before still work without a connection. Try again when you are back online.',
  button: { label: 'Go to the home page', href: '/' },
};

/** Shown by the app (service worker) when a page isn't saved on the device and there is no connection. */
export default function Offline({ pageByLocale }) {
  return (
    <>
      <Head><meta name="robots" content="noindex" /></Head>
      <StatusPage pageByLocale={pageByLocale} section="message" fallback={FALLBACK} />
    </>
  );
}

export async function getStaticProps() {
  return { props: { pageByLocale: await statusPageProps('offline') }, revalidate: 3600 };
}
