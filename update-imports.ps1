# PowerShell script to update all import paths

$replacements = @(
    # UI Components
    @{Old = "from '@/components/ui/"; New = "from '@/shared/components/ui/"}
    @{Old = "from `"@/components/ui/"; New = "from `"@/shared/components/ui/"}
    
    # Layout Components
    @{Old = "from '@/components/layout/"; New = "from '@/shared/components/layout/"}
    @{Old = "from `"@/components/layout/"; New = "from `"@/shared/components/layout/"}
    
    # Shared hooks and libs
    @{Old = "from '@/lib/"; New = "from '@/shared/lib/"}
    @{Old = "from `"@/lib/"; New = "from `"@/shared/lib/"}
    @{Old = "from '@/hooks/"; New = "from '@/shared/hooks/"}
    @{Old = "from `"@/hooks/"; New = "from `"@/shared/hooks/"}
    @{Old = "from '@/types"; New = "from '@/shared/types"}
    @{Old = "from `"@/types"; New = "from `"@/shared/types"}
    
    # Common Components
    @{Old = "from '@/components/ErrorBoundary'"; New = "from '@/shared/components/common/ErrorBoundary'"}
    @{Old = "from `"@/components/ErrorBoundary`""; New = "from `"@/shared/components/common/ErrorBoundary`""}
    @{Old = "from '@/components/SeverityIcon'"; New = "from '@/shared/components/common/SeverityIcon'"}
    @{Old = "from `"@/components/SeverityIcon`""; New = "from `"@/shared/components/common/SeverityIcon`""}
    @{Old = "from '@/components/severityIcon'"; New = "from '@/shared/components/common/SeverityIcon'"}
    @{Old = "from `"@/components/severityIcon`""; New = "from `"@/shared/components/common/SeverityIcon`""}
    @{Old = "from '@/components/ThemeToggle'"; New = "from '@/shared/components/common/ThemeToggle'"}
    @{Old = "from `"@/components/ThemeToggle`""; New = "from `"@/shared/components/common/ThemeToggle`""}
    @{Old = "from '@/components/themeToggle'"; New = "from '@/shared/components/common/ThemeToggle'"}
    @{Old = "from `"@/components/themeToggle`""; New = "from `"@/shared/components/common/ThemeToggle`""}
    
    # RCA Components
    @{Old = "from '@/components/rca/rcaAnalytics'"; New = "from '@/features/rca/components/RcaAnalytics'"}
    @{Old = "from `"@/components/rca/rcaAnalytics`""; New = "from `"@/features/rca/components/RcaAnalytics`""}
    @{Old = "from '@/components/rca/RCACorrelatedEvents'"; New = "from '@/features/rca/components/RcaCorrelatedEvents'"}
    @{Old = "from `"@/components/rca/RCACorrelatedEvents`""; New = "from `"@/features/rca/components/RcaCorrelatedEvents`""}
    @{Old = "from '@/components/rca/rcaDataEvidence'"; New = "from '@/features/rca/components/RcaDataEvidence'"}
    @{Old = "from `"@/components/rca/rcaDataEvidence`""; New = "from `"@/features/rca/components/RcaDataEvidence`""}
    @{Old = "from '@/components/rca/rcaDiagnosisPath'"; New = "from '@/features/rca/components/RcaDiagnosisPath'"}
    @{Old = "from `"@/components/rca/rcaDiagnosisPath`""; New = "from `"@/features/rca/components/RcaDiagnosisPath`""}
    @{Old = "from '@/components/rca/rcaImpactMap'"; New = "from '@/features/rca/components/RcaImpactMap'"}
    @{Old = "from `"@/components/rca/rcaImpactMap`""; New = "from `"@/features/rca/components/RcaImpactMap`""}
    @{Old = "from '@/components/rca/rcaRemediation'"; New = "from '@/features/rca/components/RcaRemediation'"}
    @{Old = "from `"@/components/rca/rcaRemediation`""; New = "from `"@/features/rca/components/RcaRemediation`""}
    @{Old = "from '@/components/rca/rcaSummary'"; New = "from '@/features/rca/components/RcaSummary'"}
    @{Old = "from `"@/components/rca/rcaSummary`""; New = "from `"@/features/rca/components/RcaSummary`""}
    
    # Sidebars
    @{Old = "from '@/components/sidebars/eventInfoSidebar'"; New = "from '@/shared/components/sidebars/EventInfoSidebar'"}
    @{Old = "from `"@/components/sidebars/eventInfoSidebar`""; New = "from `"@/shared/components/sidebars/EventInfoSidebar`""}
    @{Old = "from '@/components/sidebars/childEventsSidebar'"; New = "from '@/shared/components/sidebars/ChildEventsSidebar'"}
    @{Old = "from `"@/components/sidebars/childEventsSidebar`""; New = "from `"@/shared/components/sidebars/ChildEventsSidebar`""}
    @{Old = "from '@/components/sidebars/rcaSidebar'"; New = "from '@/features/rca/sidebars/RcaSidebar'"}
    @{Old = "from `"@/components/sidebars/rcaSidebar`""; New = "from `"@/features/rca/sidebars/RcaSidebar`""}
    @{Old = "from '@/components/sidebars/probableCauseSidebar'"; New = "from '@/features/rca/sidebars/ProbableCauseSidebar'"}
    @{Old = "from `"@/components/sidebars/probableCauseSidebar`""; New = "from `"@/features/rca/sidebars/ProbableCauseSidebar`""}
    @{Old = "from '@/components/sidebars/impactSidebar'"; New = "from '@/features/impact/sidebars/ImpactSidebar'"}
    @{Old = "from `"@/components/sidebars/impactSidebar`""; New = "from `"@/features/impact/sidebars/ImpactSidebar`""}
    @{Old = "from '@/components/sidebars/remediationSidebar'"; New = "from '@/features/remediation/sidebars/RemediationSidebar'"}
    @{Old = "from `"@/components/sidebars/remediationSidebar`""; New = "from `"@/features/remediation/sidebars/RemediationSidebar`""}
    
    # Data files
    @{Old = "from '@/data/eventsData'"; New = "from '@/features/events/data/eventsData'"}
    @{Old = "from `"@/data/eventsData`""; New = "from `"@/features/events/data/eventsData`""}
    @{Old = "from '@/data/clusterSpecificData'"; New = "from '@/features/rca/data/clusterData'"}
    @{Old = "from `"@/data/clusterSpecificData`""; New = "from `"@/features/rca/data/clusterData`""}
    @{Old = "from '@/data/rcaPipelineData'"; New = "from '@/features/rca/data/rcaPipelineData'"}
    @{Old = "from `"@/data/rcaPipelineData`""; New = "from `"@/features/rca/data/rcaPipelineData`""}
    @{Old = "from '@/data/adminMockData'"; New = "from '@/features/admin/data/adminData'"}
    @{Old = "from `"@/data/adminMockData`""; New = "from `"@/features/admin/data/adminData`""}
    @{Old = "from '@/data/mockData'"; New = "from '@/data/mock/mockData'"}
    @{Old = "from `"@/data/mockData`""; New = "from `"@/data/mock/mockData`""}
    @{Old = "from '@/data/correlationDemoData'"; New = "from '@/data/mock/correlationDemoData'"}
    @{Old = "from `"@/data/correlationDemoData`""; New = "from `"@/data/mock/correlationDemoData`""}
)

# Find all TypeScript/TSX files
$files = Get-ChildItem -Path "src" -Include *.ts,*.tsx -Recurse -File

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    foreach ($replacement in $replacements) {
        $content = $content -replace [regex]::Escape($replacement.Old), $replacement.New
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "Import path updates complete!"
