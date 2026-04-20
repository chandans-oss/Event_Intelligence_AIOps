import { useState, useEffect } from 'react';
import { Copy, Layers, GitBranch, Plus, Edit2, Trash2, GripVertical, ToggleLeft, Clock, Wrench, AlertTriangle, MapPin, Network, Brain, Search, X, Server, RefreshCw, Timer, ListChecks, ArrowRightCircle, Zap, Activity, Shield, Terminal, Snowflake } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { mockDeduplicationRules, mockSuppressionRules, mockCorrelationRules } from '@/data/mock/mockData';
import { DeduplicationRuleForm, SuppressionRuleForm, CorrelationRuleForm, DeleteRuleDialog } from './RuleForms';
import { DeduplicationRule, SuppressionRule, CorrelationRule } from '@/shared/types';
import { useToast } from '@/shared/hooks/use-toast';
import { cn } from '@/shared/lib/utils';
import { useNavigate } from 'react-router-dom';
import { AdminSection } from './AdminSidebar';

// Deduplication rule icons and labels
const dedupRuleConfig: Record<string, { icon: any; label: string }> = {
  hash_based: { icon: Copy, label: 'Hash-Based' },
  signature_based: { icon: ListChecks, label: 'Signature-Based' },
  similarity_based: { icon: Layers, label: 'Similarity-Based' },
  semantic_based: { icon: Brain, label: 'Semantic-Based' },
};

// Suppression rule icons and labels
const suppressionRuleConfig: Record<string, { icon: any; label: string }> = {
  maintenance: { icon: Wrench, label: 'Maintenance Based' },
  business_hours: { icon: Clock, label: 'Business-Hour' },
  tag_policy: { icon: MapPin, label: 'Tag/ Policy-Based' },
  parent_child: { icon: Network, label: 'Topology Based (Parent- Child)' },
  spatial_site: { icon: Layers, label: 'Spatial Based' },
  dedup_noise: { icon: Copy, label: 'Dedup Noise' },
  time_window: { icon: Timer, label: 'Time-Window' },
  flap_detection: { icon: Activity, label: 'Flap Detection' },
  temporal_clustering: { icon: ListChecks, label: 'Temporal Clustering' },
  static_threshold: { icon: AlertTriangle, label: 'Static Threshold' },
  dynamic_threshold: { icon: Brain, label: 'Dynamic Threshold' },
  event_storm: { icon: Zap, label: 'Event Storm Pattern' },
  seasonal: { icon: Snowflake, label: 'Seasonal Suppression' },
};

// Correlation rule icons and labels
const correlationRuleConfig: Record<string, { icon: any; label: string }> = {
  temporal: { icon: Clock, label: 'Temporal' },
  spatial: { icon: MapPin, label: 'Spatial' },
  topological: { icon: Network, label: 'Topological' },
  causal_rule_based: { icon: ArrowRightCircle, label: 'Causal Rule Based' },
  dynamic_rule: { icon: Layers, label: 'Dynamic Rule' },
  ml_gnn_refinement: { icon: Brain, label: 'GNN Refinement' },
  llm_semantic: { icon: Zap, label: 'Semantic Correlation' },
};

interface RulesSectionProps {
  section: 'Suppression' | 'Deduplication' | 'CorrelationTypes';
  onSectionChange?: (section: AdminSection) => void;
}

export function RulesSection({ section, onSectionChange }: RulesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Search and filter state
  const handleStatusChange = (name: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    toast({
      title: `Rule ${nextStatus ? 'Activated' : 'Deactivated'}`,
      description: `"${name}" has been ${nextStatus ? 'enabled' : 'disabled'}.`,
      variant: nextStatus ? 'success' : 'destructive',
    });
  };

  useEffect(() => {
    setTypeFilter('all');
  }, [section]);

  // Form dialog states
  const [showDedupForm, setShowDedupForm] = useState(false);
  const [showSuppressionForm, setShowSuppressionForm] = useState(false);
  const [showCorrelationForm, setShowCorrelationForm] = useState(false);
  const [editingDedupRule, setEditingDedupRule] = useState<DeduplicationRule | undefined>();
  const [editingSuppressionRule, setEditingSuppressionRule] = useState<SuppressionRule | undefined>();
  const [editingCorrelationRule, setEditingCorrelationRule] = useState<CorrelationRule | undefined>();

  // Detail dialog state
  const [selectedRuleDetail, setSelectedRuleDetail] = useState<DeduplicationRule | SuppressionRule | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<{ name: string; id: string } | null>(null);

  // Filter function for rules
  const filterRules = <T extends { name: string; description: string; status: string; type: string }>(rules: T[]) => {
    return rules.filter((rule) => {
      const matchesSearch = searchQuery === '' ||
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
      const matchesType = typeFilter === 'all' || rule.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  };

  // Get type options based on current section
  const getTypeOptions = () => {
    switch (section) {
      case 'Suppression':
        return Object.entries(suppressionRuleConfig).map(([key, value]) => ({ value: key, label: value.label }));
      case 'Deduplication':
        return Object.entries(dedupRuleConfig).map(([key, value]) => ({ value: key, label: value.label }));
      case 'CorrelationTypes':
        return Object.entries(correlationRuleConfig).map(([key, value]) => ({ value: key, label: value.label }));
      default:
        return [];
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || typeFilter !== 'all';

  const filteredSuppressionRules = filterRules(mockSuppressionRules || []);
  const filteredDeduplicationRules = filterRules(mockDeduplicationRules || []);
  const filteredCorrelationRules = filterRules(mockCorrelationRules || []);

  // Handle add button click
  const handleAddRule = () => {
    switch (section) {
      case 'Suppression':
        setEditingSuppressionRule(undefined);
        setShowSuppressionForm(true);
        break;
      case 'Deduplication':
        setEditingDedupRule(undefined);
        setShowDedupForm(true);
        break;
    }
  };

  // Handle edit button click
  const handleEditDedup = (rule: DeduplicationRule) => {
    setEditingDedupRule(rule);
    setShowDedupForm(true);
  };

  const handleEditSuppression = (rule: SuppressionRule) => {
    setEditingSuppressionRule(rule);
    setShowSuppressionForm(true);
  };

  const handleEditCorrelation = (rule: CorrelationRule) => {
    setEditingCorrelationRule(rule);
    setShowCorrelationForm(true);
  };

  // Handle delete
  const handleDeleteClick = (rule: { name: string; id: string }) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // In a real app, this would delete from the database
    console.log('Deleting rule:', ruleToDelete?.id);
    setRuleToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Removed Rules Management Title and Description for cleaner UI */}


      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rules by name, description or type"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {getTypeOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Suppression Rules */}
      {section === 'Suppression' && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Suppression Rules</h2>
            <Button className="gap-2 gradient-primary" onClick={handleAddRule}>
              <Plus className="h-4 w-4" />
              Add Rule
            </Button>
          </div>
          {(filteredSuppressionRules || []).length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Rules Found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(filteredSuppressionRules || []).map((rule) => {
                const config = suppressionRuleConfig[rule.type] || { icon: ToggleLeft, label: rule.type };
                const Icon = config.icon;
                return (
                  <div
                    key={rule.id}
                    onClick={() => setSelectedRuleDetail(rule)}
                    className="glass-card rounded-xl p-5 hover-lift cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-severity-high/20">
                          <Icon className="h-5 w-5 text-severity-high" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm sm:text-base">
                            {rule.name.replace(/\s+(suppression|deduplication)$/i, '')}
                          </h3>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="text-[9px] py-0.5 px-2 border-severity-high/30 text-severity-high font-bold tracking-wider leading-none whitespace-nowrap bg-severity-high/5">
                          {rule.category.replace(/\s+(suppression|deduplication)$/i, '')}
                        </Badge>
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {rule.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-end pt-3 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.status === 'active'}
                          onCheckedChange={() => handleStatusChange(rule.name, rule.status === 'active')}
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditSuppression(rule)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(rule)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Deduplication Rules */}
      {section === 'Deduplication' && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Deduplication Rules</h2>
            <Button className="gap-2 gradient-primary" onClick={handleAddRule}>
              <Plus className="h-4 w-4" />
              Add Rule
            </Button>
          </div>
          {(filteredDeduplicationRules || []).length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Rules Found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(filteredDeduplicationRules || []).map((rule) => {
                const config = dedupRuleConfig[rule.type] || { icon: Copy, label: rule.type };
                const Icon = config.icon;
                return (
                  <div
                    key={rule.id}
                    onClick={() => setSelectedRuleDetail(rule)}
                    className="glass-card rounded-xl p-5 hover-lift cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm sm:text-base">
                            {rule.name.replace(/\s+(suppression|deduplication)$/i, '')}
                          </h3>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="text-[9px] py-0.5 px-2 border-primary/30 text-primary font-bold tracking-wider leading-none whitespace-nowrap bg-primary/5">
                          {rule.category.replace(/\s+(suppression|deduplication)$/i, '')}
                        </Badge>
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {rule.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-end pt-3 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.status === 'active'}
                          onCheckedChange={() => handleStatusChange(rule.name, rule.status === 'active')}
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditDedup(rule)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(rule)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Correlation Rules */}
      {section === 'CorrelationTypes' && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Correlation</h2>
          </div>
          {(filteredCorrelationRules || []).length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No Rules Found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(filteredCorrelationRules || []).map((rule) => {
                const config = correlationRuleConfig[rule.type] || { icon: GitBranch, label: rule.type };
                const Icon = config.icon;
                return (
                  <div
                    key={rule.id}
                    onClick={() => {
                      if (rule.name.toLowerCase().includes('dynamic')) {
                        navigate('/correlation');
                      }
                    }}
                    className="glass-card rounded-lg p-3 hover-lift cursor-pointer group flex flex-col justify-between border border-transparent hover:border-status-success/30 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-success/20">
                            <Icon className="h-4 w-4 text-status-success" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm">{rule.name}</h3>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {rule.description}
                      </p>
                      </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <Switch
                        checked={rule.status === 'active'}
                        onCheckedChange={() => handleStatusChange(rule.name, rule.status === 'active')}
                      />
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCorrelation(rule)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteClick(rule)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Form Dialogs */}
      <DeduplicationRuleForm
        open={showDedupForm}
        onOpenChange={setShowDedupForm}
        rule={editingDedupRule}
        onSave={(data) => console.log('Save dedup rule:', data)}
      />

      <SuppressionRuleForm
        open={showSuppressionForm}
        onOpenChange={setShowSuppressionForm}
        rule={editingSuppressionRule}
        onSave={(data) => console.log('Save suppression rule:', data)}
      />

      <CorrelationRuleForm
        open={showCorrelationForm}
        onOpenChange={setShowCorrelationForm}
        rule={editingCorrelationRule}
        onSave={(data) => console.log('Save correlation rule:', data)}
      />

      {/* Delete Confirmation */}
      <DeleteRuleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        ruleName={ruleToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
      />

      {/* Rule Detail Dialog */}
      <Dialog open={!!selectedRuleDetail} onOpenChange={(open) => !open && setSelectedRuleDetail(null)}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full bg-[#0F172A] border-white/10 shadow-2xl p-0 overflow-hidden font-['Sora'] focus:outline-none">
          {selectedRuleDetail && (
            <div className="relative flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-6 sm:p-8 border-b border-white/5 bg-[#111827]/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn("p-2 rounded-xl border", section === 'Deduplication' ? "bg-primary/10 border-primary/20" : "bg-severity-high/10 border-severity-high/20")}>
                    {section === 'Deduplication' ? <Copy className="w-4 h-4 text-primary" /> : <Shield className="w-4 h-4 text-severity-high" />}
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] font-black tracking-widest px-2.5", section === 'Deduplication' ? "text-primary border-primary/20" : "text-severity-high border-severity-high/20")}>
                    {selectedRuleDetail.category.replace(/\s+(suppression|deduplication)$/i, '')}
                  </Badge>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white  tracking-tight mb-2 break-words">
                  {selectedRuleDetail.name.replace(/\s+(suppression|deduplication)$/i, '')}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">{selectedRuleDetail.description}</p>
              </div>

              {/* Body - Scrollable Area */}
              <div className="p-6 sm:p-8 space-y-8 bg-[#0B0F19] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-6">
                  {/* Operational Identity */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-foreground/60 tracking-[0.2em]  px-1">Operational Identity</p>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex flex-col p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[9px] font-black text-slate-500 tracking-widest mb-1.5">Rule Mechanism</span>
                        <span className="text-sm font-black text-white ">{selectedRuleDetail.mechanism}</span>
                      </div>
                      
                      <div className="flex flex-col p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[9px] font-black text-slate-500 tracking-widest mb-1.5">Strategic Explanation</span>
                        <span className="text-sm font-medium text-slate-300 leading-relaxed">{selectedRuleDetail.explanation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Implementation */}
                  <div className="space-y-4 pt-2">
                    <p className="text-[10px] font-black text-foreground/60 tracking-[0.2em]  px-1">Technical Execution Logic</p>
                    
                    <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 font-mono text-[12px] text-emerald-500/90 leading-relaxed relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-20 hidden sm:block">
                        <Terminal className="w-6 h-6" />
                      </div>
                      <div className="whitespace-pre-wrap break-all">
                        {selectedRuleDetail.implementationLogic}
                      </div>
                    </div>
                  </div>

                  {/* Concrete Context */}
                  <div className="space-y-4 pt-2">
                    <p className="text-[10px] font-black text-foreground/60 tracking-[0.2em]  px-1">Real World Application Example</p>
                    
                    <div className="p-4 rounded-xl bg-amber-500/[0.03] border border-amber-500/10 relative overflow-hidden group">
                      <div className="flex gap-4">
                        <div className="p-2 h-fit rounded-lg bg-amber-500/10 text-amber-500 hidden sm:block">
                          <Search className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-amber-500/70 tracking-widest block mb-2">Contextual Footprint</span>
                          <p className="text-[13px] font-black text-amber-500  leading-relaxed">
                            {selectedRuleDetail.example}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 border-t border-white/5 bg-[#111827]/80 backdrop-blur-md flex justify-end shrink-0">
                <Button variant="outline" className="text-slate-400 hover:text-white border-white/10 hover:bg-white/5" onClick={() => setSelectedRuleDetail(null)}>
                  Close Detailed View
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
