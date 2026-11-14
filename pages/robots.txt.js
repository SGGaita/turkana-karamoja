import { robotsTxt } from '../lib/seo';

/** /robots.txt: blocks everything unless NEXT_PUBLIC_ALLOW_INDEXING is "true" (production only) (FE-23). */
export default function Robots() {
  return null;
}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.end(robotsTxt());
  return { props: {} };
}
