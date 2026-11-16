import HelpGuidePage from '../../components/HelpGuidePage';
import { helpPageAllLocales, helpStaticProps, topicsAllLocales } from '../../lib/cms-help';
import { withPageLocale } from '../../lib/cms';

export default function UserGuidePage(props) {
  return <HelpGuidePage slug="user-guide" {...props} />;
}

export async function getStaticProps({ locale }) {
  return withPageLocale(locale, () => helpStaticProps(async () => {
    const [topicsByLocale, pageByLocale] = await Promise.all([topicsAllLocales(), helpPageAllLocales()]);
    return { topicsByLocale, pageByLocale };
  }));
}
