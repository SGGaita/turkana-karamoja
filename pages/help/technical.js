import DocLayout from '../../components/DocLayout';
import { technicalSections } from '../../lib/docs/technical';

export default function TechnicalDocPage() {
  return (
    <DocLayout
      title="Technical Documentation"
      subtitle="System architecture, API reference, environment setup, deployment, and troubleshooting"
      activeSlug="technical"
      breadcrumbs={['Help', 'Technical Documentation']}
      sections={technicalSections}
    />
  );
}
