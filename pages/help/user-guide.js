import HelpGuidePage from '../../components/HelpGuidePage';
import { helpPageAllLocales, helpStaticProps, topicsAllLocales } from '../../lib/cms-help';

export default function UserGuidePage(props) {
  return <HelpGuidePage slug="user-guide" {...props} />;
}

export async function getStaticProps() {
  return helpStaticProps(async () => {
    const [topicsByLocale, pageByLocale] = await Promise.all([topicsAllLocales(), helpPageAllLocales()]);
    return { topicsByLocale, pageByLocale };
  });
}
