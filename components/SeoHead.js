import Head from 'next/head';
import { useRouter } from 'next/router';
import { useShell } from '../contexts/LanguageContext';
import { APP_FULL_NAME } from '../lib/branding';
import { absoluteUrl, canonicalPath, indexingAllowed, NOINDEX_PATHS } from '../lib/seo';

const DEFAULT_IMAGE = '/icons/icon-512.png';

/**
 * Canonical address, Open Graph / Twitter tags, robots and structured data for every page (FE-23).
 * The share image comes from the page, else Site settings → SEO, else the app icon.
 *
 * @param {{type?: string, image?: string, noindex?: boolean, jsonLd?: object|null}} props
 */
export default function SeoHead({ type = 'website', image = '', noindex = false, jsonLd = null }) {
  const router = useRouter();
  const seo = useShell()?.seo;
  const path = canonicalPath(router?.asPath);
  const pagePath = canonicalPath(router?.pathname);
  const url = absoluteUrl(path);
  const share = absoluteUrl(image || seo?.shareImage || DEFAULT_IMAGE);
  const hidden = noindex || !indexingAllowed() || NOINDEX_PATHS.includes(pagePath) || NOINDEX_PATHS.includes(path);
  return (
    <Head>
      {url && !hidden && <link rel="canonical" href={url} key="canonical" />}
      {url && !hidden && <meta property="og:url" content={url} key="og:url" />}
      <meta property="og:type" content={type} key="og:type" />
      <meta property="og:site_name" content={APP_FULL_NAME} key="og:site_name" />
      {share && <meta property="og:image" content={share} key="og:image" />}
      <meta name="twitter:card" content={image || seo?.shareImage ? 'summary_large_image' : 'summary'} key="twitter:card" />
      {hidden && <meta name="robots" content="noindex, nofollow" key="robots" />}
      {jsonLd && (
        <script
          type="application/ld+json"
          key="jsonld"
          // eslint-disable-next-line react/no-danger -- JSON from our own data, escaped below.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
    </Head>
  );
}
