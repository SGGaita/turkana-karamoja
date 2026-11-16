import { Html, Head, Main, NextScript } from 'next/document';
import { headIcons } from '../lib/pwa';
import pwaSnapshot from '../lib/pwa.snapshot.json';
import { cmsFor } from '../lib/locales';

// Icons and colour from Karamoja → Site settings → Installed app, as saved at build time (FE-08).
const head = headIcons(pwaSnapshot);

export default function Document({ locale }) {
  // <html lang> is the address language (en, sw, pko, tuv: the tags Core gives each language), set by Next.js (FE-26).
  const cms = cmsFor(locale);
  return (
    <Html>
      <Head>
        <link rel="manifest" href={cms === 'en' ? '/manifest.webmanifest' : `/manifest.webmanifest?lang=${cms}`} />
        <meta name="theme-color" content={head.themeColor} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {head.favicons.map((href) => {
          const size = (href.match(/-(\d+)\.png$/) || [])[1];
          return <link key={href} rel="icon" type="image/png" href={href} {...(size ? { sizes: `${size}x${size}` } : {})} />;
        })}
        <link rel="apple-touch-icon" href={head.appleTouchIcon} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content={head.shortName} />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
