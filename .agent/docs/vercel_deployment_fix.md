# Vercel Deployment & Case Sensitivity Fixes

## Problem Summary
The Vercel deployment (Linux environment) was failing with `ENOENT: no such file or directory` errors. This was caused by case-sensitivity mismatches between the Git repository/Development environment (Windows, case-insensitive) and the Build environment (Linux, case-sensitive).

## Resolution Steps
Refactored import paths across the application to strictly match the **PascalCase** naming convention used by Git for component files.

### 1. Global Import Updates (`src/App.tsx`)
- Updated page component imports to PascalCase:
  - `Topology.tsx`
  - `EventUpload.tsx`
  - `RCAFlow.tsx`
  - `Playground.tsx`
  - `ImpactAnalysis.tsx`
  - `UploadData.tsx`
- Fixed `ErrorBoundary` import.

### 2. Component Import Corrections
corrected imports in various files where they were referenced using camelCase (e.g., `import ... from './clusterCard'`) instead of PascalCase (`./ClusterCard`).

| Modified File | Fixed Import(s) |
| :--- | :--- |
| `src/pages/EventUpload.tsx` | `ProcessingPipelineStepper`, `ClusterCard` |
| `src/components/sidebars/RCASidebar.tsx` | `RCASummary`, `RCACorrelatedEvents`, `RCADataEvidence`, `RCAImpactMap`, `RCADiagnosisPath`, `RCARemediation`, `RCAAnalytics` |
| `src/components/layout/Navbar.tsx` | `ThemeToggle` |
| `src/pages/Dashboard.tsx` | `RCASidebar`, `ImpactSidebar`, `RemediationSidebar`, `ChildEventsSidebar`, `SeverityIcon` |
| `src/pages/Events.tsx` | Sidebar components, `SeverityIcon` |
| `src/pages/Admin.tsx` | `AdminSidebar`, `RulesSection`, `IntentsSection`, `KBSection`, `AutoRemediationSection` |

### 3. File Renaming (Git)
- Renamed `src/pages/topology.tsx` to `src/pages/Topology.tsx` via `git mv` to enforce correct casing in Git index.

## Best Practices Moving Forward
1. **File Naming**: Always use **PascalCase** for React Component files (e.g., `MyComponent.tsx`).
2. **Imports**: Always match the import path **exactly** to the file name casing (e.g., `import MyComponent from './MyComponent'`).
3. **Git Hygiene**: If you change the case of a filename, use `git mv oldName newName` to ensure Git tracks the case change.

## Verification
- Vercel Build Status: **Success** ✅
- Application Logic: Verified all modified components load correctly.
