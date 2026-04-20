import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { AdminSidebar, AdminSection } from '@/components/admin/AdminSidebar';
import { RulesSection } from '@/components/admin/RulesSection';
import { IntentsSection } from '@/components/admin/IntentsSection';
import { KBSection } from '@/components/admin/KBSection';
import { AutoRemediationSection } from '@/components/admin/AutoRemediationSection';
import { PatternPredictionContent } from '@/pages/PatternPage';

export default function Admin() {
  const [searchParams] = useSearchParams();
  const initialSection = (searchParams.get('section') as AdminSection) || 'CorrelationTypes';
  const highlightIntent = searchParams.get('highlight') || undefined;
  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection);

  const renderSection = () => {
    switch (activeSection) {
      case 'Suppression':
        return <RulesSection section="Suppression" onSectionChange={setActiveSection} />;
      case 'Deduplication':
        return <RulesSection section="Deduplication" onSectionChange={setActiveSection} />;
      case 'CorrelationTypes':
        return <RulesSection section="CorrelationTypes" onSectionChange={setActiveSection} />;
      case 'Intents':
        return <IntentsSection highlightIntentId={highlightIntent} />;
      case 'KB':
        return <KBSection />;
      case 'AutoRemediation':
        return <AutoRemediationSection />;
      default:
        return <RulesSection section="CorrelationTypes" />;
    }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1 overflow-y-auto p-6">
          {renderSection()}
        </div>
      </div>
    </MainLayout>
  );
}
