import DocLayout from '../../components/DocLayout';
import { userGuideBackendSections } from '../../lib/docs/user-guide-backend';

export default function AdminGuidePage() {
  return (
    <DocLayout
      title="Backend & Admin Guide"
      subtitle="WordPress CMS administration, content publishing, organisation approval, and partner portal management"
      activeSlug="admin-guide"
      breadcrumbs={['Help', 'Backend & Admin Guide']}
      sections={userGuideBackendSections}
    />
  );
}
