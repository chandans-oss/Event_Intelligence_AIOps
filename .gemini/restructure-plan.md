# Project Restructuring Plan

## Current Structure Issues
1. Mixed naming conventions (camelCase, PascalCase, kebab-case)
2. Monolithic data files
3. Components not grouped by feature
4. Pages scattered without feature grouping
5. Generic names that don't indicate purpose

## Proposed Structure

```
src/
├── features/
│   ├── events/
│   │   ├── components/
│   │   │   ├── EventsTable.tsx
│   │   │   ├── EventFilters.tsx
│   │   │   └── EventCard.tsx
│   │   ├── pages/
│   │   │   ├── EventsPage.tsx
│   │   │   ├── EventUploadPage.tsx
│   │   │   └── EventCorrelationPage.tsx
│   │   ├── data/
│   │   │   └── eventsData.ts
│   │   └── types/
│   │       └── event.types.ts
│   │
│   ├── rca/
│   │   ├── components/
│   │   │   ├── RcaSummary.tsx
│   │   │   ├── RcaCorrelatedEvents.tsx
│   │   │   ├── RcaDataEvidence.tsx
│   │   │   ├── RcaDiagnosisPath.tsx
│   │   │   ├── RcaImpactMap.tsx
│   │   │   ├── RcaRemediation.tsx
│   │   │   └── RcaAnalytics.tsx
│   │   ├── sidebars/
│   │   │   ├── RcaSidebar.tsx
│   │   │   └── ProbableCauseSidebar.tsx
│   │   ├── pages/
│   │   │   ├── RcaDetailPage.tsx
│   │   │   └── RcaImpactPage.tsx
│   │   ├── data/
│   │   │   ├── clusterData.ts
│   │   │   └── rcaPipelineData.ts
│   │   └── types/
│   │       └── rca.types.ts
│   │
│   ├── impact/
│   │   ├── components/
│   │   ├── sidebars/
│   │   │   └── ImpactSidebar.tsx
│   │   └── pages/
│   │       └── ImpactDetailPage.tsx
│   │
│   ├── remediation/
│   │   ├── components/
│   │   ├── sidebars/
│   │   │   └── RemediationSidebar.tsx
│   │   └── pages/
│   │       └── RemediationPage.tsx
│   │
│   ├── topology/
│   │   ├── components/
│   │   │   └── TopologyGraph.tsx
│   │   └── pages/
│   │       └── TopologyPage.tsx
│   │
│   ├── analytics/
│   │   ├── components/
│   │   └── pages/
│   │       ├── AnalyticsDashboard.tsx
│   │       ├── PreprocessingPage.tsx
│   │       └── ClusteringPage.tsx
│   │
│   ├── admin/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── AdminPage.tsx
│   │   │   └── ...
│   │   └── data/
│   │       └── adminData.ts
│   │
│   └── dashboard/
│       ├── components/
│       └── pages/
│           └── DashboardPage.tsx
│
├── shared/
│   ├── components/
│   │   ├── ui/              # Shadcn/ui components
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── common/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── SeverityIcon.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── NavLink.tsx
│   │   └── sidebars/
│   │       ├── EventInfoSidebar.tsx
│   │       └── ChildEventsSidebar.tsx
│   │
│   ├── hooks/
│   │   └── useSidebar.ts
│   │
│   ├── lib/
│   │   └── utils.ts
│   │
│   └── types/
│       └── index.ts
│
├── data/
│   ├── mock/
│   │   ├── mockData.ts
│   │   └── correlationDemoData.ts
│   └── constants/
│
├── app.tsx
├── main.tsx
├── app.css
├── index.css
└── vite-env.d.ts
```

## File Naming Conventions
- **Components**: PascalCase (e.g., `EventsTable.tsx`)
- **Pages**: PascalCase with `Page` suffix (e.g., `EventsPage.tsx`)
- **Data files**: camelCase (e.g., `eventsData.ts`)
- **Types**: camelCase with `.types.ts` suffix (e.g., `event.types.ts`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useSidebar.ts`)

## Migration Steps
1. Create new feature directories
2. Move and rename files systematically
3. Update all imports across the project
4. Verify no broken imports
5. Test functionality
6. Remove old empty directories

## Benefits
- Clear feature boundaries
- Easier to find related files
- Scalable structure
- Consistent naming
- Better IDE navigation
- Easier onboarding for new developers
