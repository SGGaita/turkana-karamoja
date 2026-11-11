import HelpGuidePage from '../../components/HelpGuidePage';
import { helpPageAllLocales, helpStaticProps, topicsAllLocales } from '../../lib/cms-help';

export default function PartnerGuidePage(props) {
  return <HelpGuidePage slug="partner-guide" {...props} />;
}

export async function getStaticProps() {
  return helpStaticProps(async () => {
    const [topicsByLocale, pageByLocale] = await Promise.all([topicsAllLocales(), helpPageAllLocales()]);
    return { topicsByLocale, pageByLocale };
  });
}
