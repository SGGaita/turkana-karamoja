import { Html, Head, Main, NextScript } from 'next/document';
import { headIcons } from '../lib/pwa';
import pwaSnapshot from '../lib/pwa.snapshot.json';

// Icons and colour from Karamoja → Site settings → Installed app, as saved at build time (FE-08).
const head = headIcons(pwaSnapshot);

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.webmanifest" />
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
