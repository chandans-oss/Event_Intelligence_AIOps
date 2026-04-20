# Import Path Mappings

## Old Path -> New Path

### Pages
- `@/pages/events` -> `@/features/events/pages/EventsPage`
- `@/pages/eventUpload` -> `@/features/events/pages/EventUploadPage`
- `@/pages/eventCorrelationClustersPage` -> `@/features/events/pages/EventCorrelationPage`
- `@/pages/rcaDetailPage` -> `@/features/rca/pages/RcaDetailPage`
- `@/pages/rcaImpact` -> `@/features/rca/pages/RcaImpactPage`
- `@/pages/impactDetailPage` -> `@/features/impact/pages/ImpactDetailPage`
- `@/pages/remediation` -> `@/features/remediation/pages/RemediationPage`
- `@/pages/Topology` -> `@/features/topology/pages/TopologyPage`
- `@/pages/analyticsDashboard` -> `@/features/analytics/pages/AnalyticsDashboard`
- `@/pages/preprocessing` -> `@/features/analytics/pages/PreprocessingPage`
- `@/pages/clustering` -> `@/features/analytics/pages/ClusteringPage`
- `@/pages/dashboard` -> `@/features/dashboard/pages/DashboardPage`
- `@/pages/admin` -> `@/features/admin/pages/AdminPage`
- `@/pages/notFound` -> `@/shared/components/common/NotFound`

### RCA Components
- `@/components/rca/rcaAnalytics` -> `@/features/rca/components/RcaAnalytics`
- `@/components/rca/rcaCorrelatedEvents` -> `@/features/rca/components/RcaCorrelatedEvents`
- `@/components/rca/rcaDataEvidence` -> `@/features/rca/components/RcaDataEvidence`
- `@/components/rca/rcaDiagnosisPath` -> `@/features/rca/components/RcaDiagnosisPath`
- `@/components/rca/rcaImpactMap` -> `@/features/rca/components/RcaImpactMap`
- `@/components/rca/rcaRemediation` -> `@/features/rca/components/RcaRemediation`
- `@/components/rca/rcaSummary` -> `@/features/rca/components/RcaSummary`

### Sidebars
- `@/components/sidebars/eventInfoSidebar` -> `@/shared/components/sidebars/EventInfoSidebar`
- `@/components/sidebars/childEventsSidebar` -> `@/shared/components/sidebars/ChildEventsSidebar`
- `@/components/sidebars/rcaSidebar` -> `@/features/rca/sidebars/RcaSidebar`
- `@/components/sidebars/probableCauseSidebar` -> `@/features/rca/sidebars/ProbableCauseSidebar`
- `@/components/sidebars/impactSidebar` -> `@/features/impact/sidebars/ImpactSidebar`
- `@/components/sidebars/remediationSidebar` -> `@/features/remediation/sidebars/RemediationSidebar`

### Layout Components
- `@/components/layout/` -> `@/shared/components/layout/`

### Common Components
- `@/components/errorBoundary` -> `@/shared/components/common/ErrorBoundary`
- `@/components/severityIcon` -> `@/shared/components/common/SeverityIcon`
- `@/components/SeverityIcon` -> `@/shared/components/common/SeverityIcon`
- `@/components/themeToggle` -> `@/shared/components/common/ThemeToggle`
- `@/components/navLink` -> `@/shared/components/common/NavLink`

### UI Components
- `@/components/ui/` -> `@/shared/components/ui/`

### Data
- `@/data/eventsData` -> `@/features/events/data/eventsData`
- `@/data/clusterSpecificData` -> `@/features/rca/data/clusterData`
- `@/data/rcaPipelineData` -> `@/features/rca/data/rcaPipelineData`
- `@/data/adminMockData` -> `@/features/admin/data/adminData`
- `@/data/mockData` -> `@/data/mock/mockData`
- `@/data/correlationDemoData` -> `@/data/mock/correlationDemoData`

### Shared
- `@/lib/` -> `@/shared/lib/`
- `@/hooks/` -> `@/shared/hooks/`
- `@/types` -> `@/shared/types`
