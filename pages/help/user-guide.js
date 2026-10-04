import DocLayout from '../../components/DocLayout';
import { userGuideFrontendSections } from '../../lib/docs/user-guide-frontend';
import { APP_NAME } from '../../lib/branding';

export default function UserGuidePage() {
  return (
    <DocLayout
      title="Frontend User Guide"
      subtitle={`How to use the public ${APP_NAME} website — early warnings, reports, community services, and more`}
      activeSlug="user-guide"
      breadcrumbs={['Help', 'Frontend User Guide']}
      sections={userGuideFrontendSections}
    />
  );
}
