import Head from 'next/head';
import { useShell } from '../contexts/LanguageContext';

/**
 * Site-wide <head> defaults from Karamoja → Site settings → SEO. Pages that set their own description win
 * (next/head keeps the last tag with the same key).
 */
export default function ShellHead() {
  const seo = useShell()?.seo;
  if (!seo || (!seo.description && !seo.shareImage)) return null;
  return (
    <Head>
      {seo.description && <meta name="description" content={seo.description} key="description" />}
      {seo.description && <meta property="og:description" content={seo.description} key="og:description" />}
      {seo.shareImage && <meta property="og:image" content={seo.shareImage} key="og:image" />}
      {seo.shareImage && <meta name="twitter:card" content="summary_large_image" key="twitter:card" />}
    </Head>
  );
}
