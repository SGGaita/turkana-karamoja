import StatusPage from './StatusPage';
import { useT } from '../contexts/LanguageContext';

/** Shown only when a page was built while Karamoja Core could not be reached; it is rebuilt a minute later. */
export default function CmsUnavailable() {
  const t = useT();
  return (
    <StatusPage
      pageByLocale={null}
      section=""
      fallback={{ title: t('common.page_unavailable_title'), text: t('common.page_unavailable'), button: { label: '', href: '' } }}
    />
  );
}
