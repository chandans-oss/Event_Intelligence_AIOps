import { ClusterSpecificData } from '@/features/rca/data/clusterData';
import { RemediationSidebar } from './RemediationSidebar';

interface RCARemediationProps {
    data?: ClusterSpecificData;
    cluster?: ClusterSpecificData;
    causeId?: string;
}

/**
 * RCARemediation component that embeds the high-fidelity RemediationSidebar 
 * UI (with Steps, Terminal, and Knowledge Base sub-tabs) directly into the dashboard.
 */
export function RCARemediation({ data, cluster, causeId }: RCARemediationProps) {
    const finalData = cluster || data;
    
    if (!finalData) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                No remediation data available for this selection.
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-320px)] min-h-[650px] -mx-6 -mb-6">
            <RemediationSidebar
                cluster={finalData}
                causeId={causeId}
                isEmbedded={true}
            />
        </div>
    );
}
