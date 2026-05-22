import { useState } from 'react';
import { Shield, Search, Plus, Edit2, Trash2, Link } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

interface RemedyKBEntry {
  id: string;
  incidentType: string;
  vendor: string;
  assetType: string;
  rcaPattern: string;
  remedySteps: string[];
  confidence: number;
  author: string;
  status: 'Active' | 'Draft' | 'Review Needed';
}

const MOCK_REMEDIES: RemedyKBEntry[] = [
  {
    id: 'R-1001', incidentType: 'BGP Route Flap', vendor: 'Cisco', assetType: 'Core Router',
    rcaPattern: 'BGP Peer Reset -> Interface Flap', remedySteps: ['Verify BGP config', 'Clear IP BGP * soft'],
    confidence: 95, author: 'NetOps AI', status: 'Active'
  },
  {
    id: 'R-1002', incidentType: 'High CPU', vendor: 'Palo Alto', assetType: 'Firewall',
    rcaPattern: 'IPS Engine overload', remedySteps: ['Restart IPS Module', 'Failover to HA peer'],
    confidence: 88, author: 'SecOps Team', status: 'Active'
  },
  {
    id: 'R-1003', incidentType: 'SIP Timeout', vendor: 'Generic', assetType: 'SBC',
    rcaPattern: 'High Latency -> SIP 408', remedySteps: ['Investigate WAN link', 'Apply QoS shaping'],
    confidence: 45, author: 'Voice Eng', status: 'Review Needed'
  }
];

export function RemedyKBSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [remedies] = useState<RemedyKBEntry[]>(MOCK_REMEDIES);

  const filtered = remedies.filter(r => r.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) || r.vendor.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Remedy Knowledge Base</h1>
          <p className="text-muted-foreground">Manage and refine automated remediation playbooks and mappings.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Remedy
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by incident type or vendor..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-xs text-muted-foreground uppercase border-b border-border/50">
            <tr>
              <th className="px-6 py-4 font-semibold">Incident / Pattern</th>
              <th className="px-6 py-4 font-semibold">Asset Mapping</th>
              <th className="px-6 py-4 font-semibold">Remedy Content</th>
              <th className="px-6 py-4 font-semibold">Confidence</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filtered.map(remedy => (
              <tr key={remedy.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-foreground">{remedy.incidentType}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Link className="h-3 w-3" /> {remedy.rcaPattern}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-foreground">{remedy.assetType}</div>
                  <div className="text-xs font-bold text-muted-foreground bg-muted inline-block px-1.5 py-0.5 rounded mt-1">{remedy.vendor}</div>
                </td>
                <td className="px-6 py-4">
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                    {remedy.remedySteps.map((step, idx) => (
                      <li key={idx} className="line-clamp-1 max-w-[250px]" title={step}>{step}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${remedy.confidence > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${remedy.confidence}%` }} />
                    </div>
                    <span className="text-xs font-bold">{remedy.confidence}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    remedy.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-600'
                  }`}>
                    {remedy.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No remedies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
