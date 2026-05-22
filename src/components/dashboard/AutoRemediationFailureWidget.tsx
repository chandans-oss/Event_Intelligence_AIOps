import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, ZapOff, CheckCircle2, AlertTriangle, RefreshCw, XCircle, Info, ChevronRight, ServerCrash, Clock, KeyRound, TerminalSquare } from 'lucide-react';

// --- MOCK DATA ---

interface ExecutionFailure {
  id: string;
  incidentId: string;
  asset: string;
  vendor: string;
  rca: string;
  remedy: string;
  automationType: 'SSH' | 'API' | 'Script';
  failureCode: 'AUTH_FAILURE' | 'SSH_TIMEOUT' | 'API_TIMEOUT' | 'COMMAND_FAILURE' | 'SCRIPT_EXCEPTION' | 'PARTIAL_EXECUTION' | 'DEPENDENCY_FAILURE';
  executionStatus: 'Failed' | 'Partial';
  suggestedFix: string;
}

const MOCK_EXECUTION_FAILURES: ExecutionFailure[] = [
  { id: 'ef-1', incidentId: 'INC-99101', asset: 'core-router-dc1', vendor: 'Cisco', rca: 'BGP Flap', remedy: 'Clear BGP Session', automationType: 'SSH', failureCode: 'SSH_TIMEOUT', executionStatus: 'Failed', suggestedFix: 'Verify Management IP Reachability' },
  { id: 'ef-2', incidentId: 'INC-88212', asset: 'fw-edge-us', vendor: 'Palo Alto', rca: 'High CPU', remedy: 'Restart IPS Engine', automationType: 'API', failureCode: 'AUTH_FAILURE', executionStatus: 'Failed', suggestedFix: 'Update Expired API Token' },
  { id: 'ef-3', incidentId: 'INC-77341', asset: 'db-primary-01', vendor: 'PostgreSQL', rca: 'Connection Pool Exhaustion', remedy: 'Scale Max Connections', automationType: 'Script', failureCode: 'PARTIAL_EXECUTION', executionStatus: 'Partial', suggestedFix: 'Step 3 Failed: Manual Rollback Required' },
  { id: 'ef-4', incidentId: 'INC-66129', asset: 'dist-sw-04', vendor: 'Juniper', rca: 'Port Security Violation', remedy: 'Bounce Interface', automationType: 'SSH', failureCode: 'COMMAND_FAILURE', executionStatus: 'Failed', suggestedFix: 'Update Syntax: command not found' },
  { id: 'ef-5', incidentId: 'INC-55100', asset: 'payment-api-prod', vendor: 'Internal', rca: 'Memory Leak', remedy: 'Restart Pods', automationType: 'API', failureCode: 'DEPENDENCY_FAILURE', executionStatus: 'Failed', suggestedFix: 'Kube API Unreachable' }
];

interface ValidationFailure {
  id: string;
  incidentId: string;
  asset: string;
  remedyExecuted: string;
  preMetric: string;
  postMetric: string;
  status: 'VALIDATION_FAILED';
  suggestedAction: string;
}

const MOCK_VALIDATION_FAILURES: ValidationFailure[] = [
  { id: 'vf-1', incidentId: 'INC-99451', asset: 'edge-router-02', remedyExecuted: 'Clear ARP Cache', preMetric: '99% CPU', postMetric: '98% CPU', status: 'VALIDATION_FAILED', suggestedAction: 'Escalate to L3: Issue Persists' },
  { id: 'vf-2', incidentId: 'INC-88111', asset: 'web-node-04', remedyExecuted: 'Restart Nginx', preMetric: '504 Gateway Timeout', postMetric: '502 Bad Gateway', status: 'VALIDATION_FAILED', suggestedAction: 'Investigate Upstream Service' },
];

interface RetryInsight {
  id: string;
  incidentId: string;
  remedy: string;
  retryCount: number;
  fallbackMethod: string;
  finalStatus: 'Success' | 'Failed';
}

const MOCK_RETRY_INSIGHTS: RetryInsight[] = [
  { id: 'ri-1', incidentId: 'INC-44122', remedy: 'Bounce Interface', retryCount: 2, fallbackMethod: 'Switched from SSH to REST API', finalStatus: 'Success' },
  { id: 'ri-2', incidentId: 'INC-33211', remedy: 'Restart Service', retryCount: 3, fallbackMethod: 'Fallback: Server Reboot', finalStatus: 'Failed' },
];

interface VendorIssue {
  id: string;
  asset: string;
  attemptedVendor: string;
  actualVendor: string;
  issue: string;
  recommendation: string;
}

const MOCK_VENDOR_ISSUES: VendorIssue[] = [
  { id: 'vi-1', asset: 'sw-access-01', attemptedVendor: 'Cisco (IOS)', actualVendor: 'Huawei', issue: 'Syntax Mismatch: "write mem" failed', recommendation: 'Map asset to Huawei Remedy Logic' },
  { id: 'vi-2', asset: 'vpn-gw-01', attemptedVendor: 'Juniper (Junos)', actualVendor: 'Juniper (ScreenOS)', issue: 'Firmware Incompatibility', recommendation: 'Update KB to branch by OS version' },
];

// --- COMPONENT ---

export function AutoRemediationFailureWidget() {
  const [activeTab, setActiveTab] = useState<'Execution' | 'Validation' | 'Retry' | 'Vendor'>('Execution');
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate('/admin?section=AutoRemediation');
  };

  const getFailureBadgeStyle = (code: string) => {
    switch (code) {
      case 'AUTH_FAILURE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'SSH_TIMEOUT': 
      case 'API_TIMEOUT': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'COMMAND_FAILURE': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'SCRIPT_EXCEPTION': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'PARTIAL_EXECUTION': return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      case 'DEPENDENCY_FAILURE': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'VALIDATION_FAILED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'VENDOR_MISMATCH': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const totalFailures = MOCK_EXECUTION_FAILURES.length + MOCK_VALIDATION_FAILURES.length + MOCK_VENDOR_ISSUES.length;
  const partialSuccess = MOCK_EXECUTION_FAILURES.filter(f => f.executionStatus === 'Partial').length;
  const totalRetries = MOCK_RETRY_INSIGHTS.length;
  const retrySuccesses = MOCK_RETRY_INSIGHTS.filter(r => r.finalStatus === 'Success').length;
  const retrySuccessPct = totalRetries > 0 ? Math.round((retrySuccesses / totalRetries) * 100) + '%' : '0%';
  const authFailures = MOCK_EXECUTION_FAILURES.filter(f => f.failureCode === 'AUTH_FAILURE').length;
  const scriptErrors = MOCK_EXECUTION_FAILURES.filter(f => f.failureCode === 'SCRIPT_EXCEPTION' || f.failureCode === 'COMMAND_FAILURE').length;
  const timeoutConn = MOCK_EXECUTION_FAILURES.filter(f => ['SSH_TIMEOUT', 'API_TIMEOUT', 'DEPENDENCY_FAILURE'].includes(f.failureCode)).length;

  return (
    <div className="card flex flex-col h-full bg-card border border-border shadow-sm rounded-xl p-5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ZapOff className="h-5 w-5 text-red-500" />
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">Auto Remediation Failure Analysis</h2>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">Self-Healing Reliability Monitor</p>
          </div>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50 overflow-x-auto max-w-[50vw]">
          {(['Execution', 'Validation', 'Retry', 'Vendor'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${activeTab === tab ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab === 'Execution' ? 'Execution Failures' : 
               tab === 'Validation' ? 'Validation Failures' : 
               tab === 'Retry' ? 'Retry Insights' : 'Vendor Compatibility'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6 flex-shrink-0">
        {[
          { label: 'Total Failures', value: totalFailures, icon: ServerCrash, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Partial Success', value: partialSuccess, icon: AlertTriangle, color: 'text-pink-500', bg: 'bg-pink-500/10' },
          { label: 'Retry Success %', value: retrySuccessPct, icon: RefreshCw, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Auth Failures', value: authFailures, icon: KeyRound, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Script Errors', value: scriptErrors, icon: TerminalSquare, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Timeout/Conn', value: timeoutConn, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-muted/20 border border-border/40 rounded-lg p-3 flex flex-col justify-center relative overflow-hidden group">
              <Icon className={`absolute right-[-10px] bottom-[-10px] h-12 w-12 opacity-10 transition-transform group-hover:scale-110 ${kpi.color}`} />
              <div className="flex items-center gap-2 mb-1">
                <div className={`p-1 rounded ${kpi.bg}`}>
                  <Icon className={`h-3 w-3 ${kpi.color}`} />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate">{kpi.label}</span>
              </div>
              <span className={`text-xl font-black ${kpi.color}`}>{kpi.value}</span>
            </div>
          );
        })}
      </div>

      {/* Scrollable Data Table Container */}
      <div className="flex-1 overflow-auto max-h-[400px] rounded-lg border border-border/50">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-xs text-muted-foreground uppercase sticky top-0 backdrop-blur-sm z-10 shadow-sm">
            {activeTab === 'Execution' && (
              <tr>
                <th className="px-4 py-3 font-semibold">Incident / RCA</th>
                <th className="px-4 py-3 font-semibold">Asset / Vendor</th>
                <th className="px-4 py-3 font-semibold">Remedy / Type</th>
                <th className="px-4 py-3 font-semibold">Failure Reason</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Suggested Fix</th>
              </tr>
            )}
            {activeTab === 'Validation' && (
              <tr>
                <th className="px-4 py-3 font-semibold">Incident ID</th>
                <th className="px-4 py-3 font-semibold">Asset</th>
                <th className="px-4 py-3 font-semibold">Remedy Executed</th>
                <th className="px-4 py-3 font-semibold text-center">Pre-Metric</th>
                <th className="px-4 py-3 font-semibold text-center">Post-Metric</th>
                <th className="px-4 py-3 font-semibold">Validation Status</th>
                <th className="px-4 py-3 font-semibold">Suggested Action</th>
              </tr>
            )}
            {activeTab === 'Retry' && (
              <tr>
                <th className="px-4 py-3 font-semibold">Incident ID</th>
                <th className="px-4 py-3 font-semibold">Remedy</th>
                <th className="px-4 py-3 font-semibold text-center">Retries</th>
                <th className="px-4 py-3 font-semibold">Fallback Logic Used</th>
                <th className="px-4 py-3 font-semibold">Final Status</th>
              </tr>
            )}
            {activeTab === 'Vendor' && (
              <tr>
                <th className="px-4 py-3 font-semibold">Target Asset</th>
                <th className="px-4 py-3 font-semibold">Attempted Logic</th>
                <th className="px-4 py-3 font-semibold">Actual Vendor</th>
                <th className="px-4 py-3 font-semibold">Compatibility Issue</th>
                <th className="px-4 py-3 font-semibold">Recommendation</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-border/30">
            {/* EXECUTION TAB */}
            {activeTab === 'Execution' && MOCK_EXECUTION_FAILURES.map((item) => (
              <tr key={item.id} onClick={handleRowClick} className="hover:bg-muted/20 cursor-pointer transition-colors group">
                <td className="px-4 py-3">
                  <div className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 text-red-400" />{item.incidentId}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.rca}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{item.asset}</div>
                  <div className="text-[10px] bg-muted inline-block px-1.5 py-0.5 rounded mt-1 font-bold text-muted-foreground">{item.vendor}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{item.remedy}</div>
                  <div className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase">[{item.automationType}]</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getFailureBadgeStyle(item.failureCode)}`}>
                    {item.failureCode}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${item.executionStatus === 'Failed' ? 'text-red-500' : 'text-pink-500'}`}>
                    {item.executionStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-medium text-foreground flex items-center justify-between gap-2 h-full pt-5">
                  <span className="truncate" title={item.suggestedFix}>{item.suggestedFix}</span>
                  <span className="text-primary font-bold hover:underline flex items-center gap-0.5 whitespace-nowrap">
                    Fix <ChevronRight className="h-3 w-3" />
                  </span>
                </td>
              </tr>
            ))}
            
            {/* VALIDATION TAB */}
            {activeTab === 'Validation' && MOCK_VALIDATION_FAILURES.map((item) => (
              <tr key={item.id} onClick={handleRowClick} className="hover:bg-muted/20 cursor-pointer transition-colors group">
                <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">{item.incidentId}</td>
                <td className="px-4 py-3 font-medium text-foreground">{item.asset}</td>
                <td className="px-4 py-3 font-medium text-foreground">{item.remedyExecuted}</td>
                <td className="px-4 py-3 text-center text-xs font-bold text-muted-foreground">{item.preMetric}</td>
                <td className="px-4 py-3 text-center text-xs font-bold text-red-400">{item.postMetric}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getFailureBadgeStyle(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-medium text-foreground flex items-center justify-between gap-2">
                  <span className="truncate" title={item.suggestedAction}>{item.suggestedAction}</span>
                  <span className="text-primary font-bold hover:underline flex items-center gap-0.5 whitespace-nowrap">
                    Fix <ChevronRight className="h-3 w-3" />
                  </span>
                </td>
              </tr>
            ))}

            {/* RETRY TAB */}
            {activeTab === 'Retry' && MOCK_RETRY_INSIGHTS.map((item) => (
              <tr key={item.id} onClick={handleRowClick} className="hover:bg-muted/20 cursor-pointer transition-colors group">
                <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">{item.incidentId}</td>
                <td className="px-4 py-3 font-medium text-foreground">{item.remedy}</td>
                <td className="px-4 py-3 text-center font-bold text-orange-400">{item.retryCount}</td>
                <td className="px-4 py-3 font-medium text-muted-foreground">{item.fallbackMethod}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${item.finalStatus === 'Success' ? 'text-green-500' : 'text-red-500'}`}>
                    {item.finalStatus === 'Success' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} {item.finalStatus}
                  </span>
                </td>
              </tr>
            ))}

            {/* VENDOR TAB */}
            {activeTab === 'Vendor' && MOCK_VENDOR_ISSUES.map((item) => (
              <tr key={item.id} onClick={handleRowClick} className="hover:bg-muted/20 cursor-pointer transition-colors group">
                <td className="px-4 py-3 font-medium text-foreground">{item.asset}</td>
                <td className="px-4 py-3 text-xs font-medium text-muted-foreground">{item.attemptedVendor}</td>
                <td className="px-4 py-3 text-xs font-bold text-foreground">{item.actualVendor}</td>
                <td className="px-4 py-3 text-xs font-medium text-rose-400">{item.issue}</td>
                <td className="px-4 py-3 text-xs font-medium text-foreground flex items-center justify-between gap-2">
                  <span className="truncate" title={item.recommendation}>{item.recommendation}</span>
                  <span className="text-primary font-bold hover:underline flex items-center gap-0.5 whitespace-nowrap">
                    Fix <ChevronRight className="h-3 w-3" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
