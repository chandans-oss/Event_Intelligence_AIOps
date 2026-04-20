import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { useToast } from '@/shared/hooks/use-toast';
import { DeduplicationRule, SuppressionRule, CorrelationRule } from '@/shared/types';

// Base rule schema
const baseRuleSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().trim().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  status: z.enum(['active', 'inactive']),
});

// Deduplication rule schema
const deduplicationRuleSchema = baseRuleSchema.extend({
  type: z.enum([
    'exact_match', 
    'structured_exact', 
    'temporal_sliding', 
    'temporal_bucket', 
    'state_flap', 
    'state_transition', 
    'template_based', 
    'similarity_fuzzy'
  ]),
  category: z.string().min(1, 'Category is required'),
  mechanism: z.string().min(1, 'Mechanism is required'),
  explanation: z.string().min(1, 'Explanation is required'),
  example: z.string().min(1, 'Example is required'),
  implementationLogic: z.string().min(1, 'Implementation Logic is required'),
  matchCriteria: z.string().optional(),
});

// Suppression rule schema
const suppressionRuleSchema = baseRuleSchema.extend({
  type: z.enum([
    'maintenance', 
    'business_hours', 
    'tag_policy', 
    'parent_child', 
    'spatial_site', 
    'dedup_noise', 
    'time_window', 
    'flap_detection', 
    'temporal_clustering', 
    'static_threshold', 
    'dynamic_threshold', 
    'event_storm'
  ]),
  category: z.string().min(1, 'Category is required'),
  mechanism: z.string().min(1, 'Mechanism is required'),
  explanation: z.string().min(1, 'Explanation is required'),
  example: z.string().min(1, 'Example is required'),
  implementationLogic: z.string().min(1, 'Implementation Logic is required'),
  affectedDevices: z.string().optional(),
  scheduleStart: z.string().optional(),
  scheduleEnd: z.string().optional(),
  businessDays: z.string().optional(),
  businessStartTime: z.string().optional(),
  businessEndTime: z.string().optional(),
});

// Correlation rule schema
const correlationRuleSchema = baseRuleSchema.extend({
  type: z.enum(['temporal', 'spatial', 'topological', 'causal_rule_based', 'ml_gnn_refinement', 'llm_semantic', 'dynamic_rule']),
  mlEnabled: z.boolean(),
  gnnEnabled: z.boolean(),
  // Temporal
  windowMode: z.enum(['fixed', 'sliding']).optional(),
  timeWindowSeconds: z.coerce.number().optional(),
  minEvents: z.coerce.number().optional(),
  maxGapSeconds: z.coerce.number().optional(),
  sequenceConstraint: z.enum(['any_order', 'ordered']).optional(),
  retriggerCooldownMin: z.coerce.number().optional(),
  dedupWindowMin: z.coerce.number().optional(),
  // Spatial
  groupingCriteria: z.string().optional(),
  correlationScope: z.enum(['same_entity', 'same_parent', 'same_group', 'same_tag']).optional(),
  relationshipRadius: z.coerce.number().optional(),
  minDistinctEntities: z.coerce.number().optional(),
  groupingPriority: z.string().optional(),
  // Topological
  traceDepth: z.coerce.number().min(1).max(10).optional(),
  directionality: z.enum(['upstream', 'downstream', 'both']).optional(),
  rootStrategy: z.enum(['first_event', 'highest_severity', 'most_upstream']).optional(),
  suppressChildren: z.boolean().optional(),
  propagationWindowMin: z.coerce.number().optional(),
  maxGraphBreadth: z.coerce.number().optional(),
  // Causal
  timeLagMin: z.coerce.number().optional(),
  confidenceThreshold: z.coerce.number().optional(),
  rulePriority: z.enum(['low', 'medium', 'high']).optional(),
  repetitionThreshold: z.coerce.number().optional(),
  ruleExpiryDays: z.coerce.number().optional(),
  // Dynamic
  learningWindowDays: z.coerce.number().optional(),
  stabilityThreshold: z.coerce.number().optional(),
  similarityThreshold: z.coerce.number().optional(),
  activationMode: z.enum(['auto', 'manual']).optional(),
  driftSensitivity: z.enum(['low', 'medium', 'high']).optional(),
  maxLearnedPatterns: z.coerce.number().optional(),
  // ML/GNN
  modelVersion: z.string().optional(),
  trainingWindowDays: z.coerce.number().optional(),
  retrainingFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  explainabilityEnabled: z.boolean().optional(),
  fallbackPolicy: z.enum(['rule_based', 'suppress', 'pass_through']).optional(),
  // Semantic
  crossDomainEnabled: z.boolean().optional(),
  vocabularyScope: z.enum(['infra', 'infra_app', 'infra_app_cloud']).optional(),
  normalizationEnabled: z.boolean().optional(),
  summaryLength: z.enum(['short', 'medium', 'detailed']).optional(),
  feedbackWeight: z.enum(['low', 'medium', 'high']).optional(),
});

type DeduplicationFormData = z.infer<typeof deduplicationRuleSchema>;
type SuppressionFormData = z.infer<typeof suppressionRuleSchema>;
type CorrelationFormData = z.infer<typeof correlationRuleSchema>;

// Deduplication Rule Form
interface DeduplicationRuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: DeduplicationRule;
  onSave: (data: DeduplicationFormData) => void;
}

export function DeduplicationRuleForm({ open, onOpenChange, rule, onSave }: DeduplicationRuleFormProps) {
  const { toast } = useToast();
  const isEditing = !!rule;

  const form = useForm<DeduplicationFormData>({
    resolver: zodResolver(deduplicationRuleSchema),
    defaultValues: {
      name: rule?.name || '',
      description: rule?.description || '',
      status: rule?.status || 'active',
      type: rule?.type || 'exact_match',
      category: rule?.category || '',
      mechanism: rule?.mechanism || '',
      explanation: rule?.explanation || '',
      example: rule?.example || '',
      implementationLogic: rule?.implementationLogic || '',
      matchCriteria: rule?.fields?.join(', ') || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: rule?.name || '',
        description: rule?.description || '',
        status: rule?.status || 'active',
        type: rule?.type || 'exact_match',
        category: rule?.category || '',
        mechanism: rule?.mechanism || '',
        explanation: rule?.explanation || '',
        example: rule?.example || '',
        implementationLogic: rule?.implementationLogic || '',
        matchCriteria: rule?.fields?.join(', ') || '',
      });
    }
  }, [rule, open]);

  const handleSubmit = (data: DeduplicationFormData) => {
    onSave(data);
    toast({
      title: isEditing ? 'Rule updated' : 'Rule created',
      description: `Deduplication rule "${data.name}" has been ${isEditing ? 'updated' : 'created'} successfully.`,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Create'} Deduplication Rule</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Same Alert Type Dedup" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="exact_match">Exact Match</SelectItem>
                      <SelectItem value="structured_exact">Structured Exact</SelectItem>
                      <SelectItem value="temporal_sliding">Temporal (Sliding Window)</SelectItem>
                      <SelectItem value="temporal_bucket">Temporal (Time-Bucket)</SelectItem>
                      <SelectItem value="state_flap">State-Based (Flap-Aware)</SelectItem>
                      <SelectItem value="state_transition">State-Based (Transition)</SelectItem>
                      <SelectItem value="template_based">Template-Based</SelectItem>
                      <SelectItem value="similarity_fuzzy">Similarity-Based (Fuzzy)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dedup Category *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Temporal Deduplication" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mechanism"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dedup Mechanism *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sliding window deduplication" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation (Why deduped) *</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe the reason..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="example"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Example (Exact & Concrete) *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 50 LINK_DOWN events within 30s" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="implementationLogic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How to Achieve (Implementation Logic) *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the technical implementation..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what this rule does..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="matchCriteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Match Criteria (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., alertType, source, severity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                {isEditing ? 'Update Rule' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Suppression Rule Form
interface SuppressionRuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: SuppressionRule;
  onSave: (data: SuppressionFormData) => void;
}

export function SuppressionRuleForm({ open, onOpenChange, rule, onSave }: SuppressionRuleFormProps) {
  const { toast } = useToast();
  const isEditing = !!rule;

  const form = useForm<SuppressionFormData>({
    resolver: zodResolver(suppressionRuleSchema),
    defaultValues: {
      name: rule?.name || '',
      description: rule?.description || '',
      status: rule?.status || 'active',
      type: rule?.type || 'business_hours',
      category: rule?.category || '',
      mechanism: rule?.mechanism || '',
      explanation: rule?.explanation || '',
      example: rule?.example || '',
      implementationLogic: rule?.implementationLogic || '',
      affectedDevices: rule?.affectedDevices?.join(', ') || '',
      scheduleStart: rule?.config?.schedule?.start || '',
      scheduleEnd: rule?.config?.schedule?.end || '',
      businessDays: rule?.config?.businessHours?.days?.join(', ') || 'Mon, Tue, Wed, Thu, Fri',
      businessStartTime: rule?.config?.businessHours?.startTime || '09:00',
      businessEndTime: rule?.config?.businessHours?.endTime || '18:00',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: rule?.name || '',
        description: rule?.description || '',
        status: rule?.status || 'active',
        type: rule?.type || 'business_hours',
        category: rule?.category || '',
        mechanism: rule?.mechanism || '',
        explanation: rule?.explanation || '',
        example: rule?.example || '',
        implementationLogic: rule?.implementationLogic || '',
        affectedDevices: rule?.affectedDevices?.join(', ') || '',
        scheduleStart: rule?.config?.schedule?.start || '',
        scheduleEnd: rule?.config?.schedule?.end || '',
        businessDays: rule?.config?.businessHours?.days?.join(', ') || 'Mon, Tue, Wed, Thu, Fri',
        businessStartTime: rule?.config?.businessHours?.startTime || '09:00',
        businessEndTime: rule?.config?.businessHours?.endTime || '18:00',
      });
    }
  }, [rule, open]);

  const ruleType = form.watch('type');

  const handleSubmit = (data: SuppressionFormData) => {
    onSave(data);
    toast({
      title: isEditing ? 'Rule updated' : 'Rule created',
      description: `Suppression rule "${data.name}" has been ${isEditing ? 'updated' : 'created'} successfully.`,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Create'} Suppression Rule</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Business Hours Suppression" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                     <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="business_hours">Business Hours</SelectItem>
                      <SelectItem value="tag_policy">Tag / Policy Based</SelectItem>
                      <SelectItem value="parent_child">Topology: Parent-Child</SelectItem>
                      <SelectItem value="spatial_site">Topology: Spatial Site</SelectItem>
                      <SelectItem value="dedup_noise">Noise: Dedup Based</SelectItem>
                      <SelectItem value="time_window">Noise: Time-Window</SelectItem>
                      <SelectItem value="flap_detection">Noise: Flap Detection</SelectItem>
                      <SelectItem value="temporal_clustering">Noise: Temporal Cluster</SelectItem>
                      <SelectItem value="static_threshold">Threshold: Static</SelectItem>
                      <SelectItem value="dynamic_threshold">Threshold: Dynamic</SelectItem>
                      <SelectItem value="event_storm">Pattern: Event Storm</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suppression Category *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Topology-Based Suppression" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mechanism"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suppression Mechanism *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Parent-child suppression" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation (Why suppressed) *</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe the operational reason..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="example"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Example (Exact & Concrete) *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Core-R1 LINK_DOWN → symptom suppression" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="implementationLogic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How to Achieve (Implementation Logic) *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the BFS tree traversal or threshold logic..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what this rule does..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Business Hours Fields */}
            {ruleType === 'business_hours' && (
              <>
                <FormField
                  control={form.control}
                  name="businessDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Days</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mon, Tue, Wed, Thu, Fri" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="businessStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessEndTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* User Defined Time / Maintenance Fields */}
            {(ruleType === 'time_based' || ruleType === 'maintenance') && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduleStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Start</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scheduleEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule End</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Affected Devices */}
            {ruleType === 'maintenance' && (
              <FormField
                control={form.control}
                name="affectedDevices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affected Devices (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., db-server-01, db-server-02" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                {isEditing ? 'Update Rule' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Correlation Rule Form
interface CorrelationRuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: CorrelationRule;
  onSave: (data: CorrelationFormData) => void;
}

const typeLabels: Record<string, string> = {
  temporal: 'Temporal Correlation',
  spatial: 'Spatial Correlation',
  topological: 'Topological Correlation',
  causal_rule_based: 'Causal / Rule-based Correlation',
  dynamic_rule: 'Dynamic Rule Correlation',
  ml_gnn_refinement: 'ML / GNN Refinement',
  llm_semantic: 'LLM Semantic Synthesis',
};

export function CorrelationRuleForm({ open, onOpenChange, rule, onSave }: CorrelationRuleFormProps) {
  const isEditing = !!rule;
  const { toast } = useToast();
  const ruleType = rule?.type || 'temporal';

  const form = useForm<CorrelationFormData>({
    resolver: zodResolver(correlationRuleSchema),
    defaultValues: {
      name: rule?.name || '',
      description: rule?.description || '',
      status: rule?.status || 'active',
      type: ruleType,
      mlEnabled: rule?.mlEnabled || false,
      gnnEnabled: rule?.gnnEnabled || false,
      // Temporal
      windowMode: rule?.config?.windowMode || 'sliding',
      timeWindowSeconds: rule?.config?.timeWindowSeconds || 600,
      minEvents: rule?.config?.minEvents || 2,
      maxGapSeconds: rule?.config?.maxGapSeconds || 180,
      sequenceConstraint: rule?.config?.sequenceConstraint || 'any_order',
      retriggerCooldownMin: rule?.config?.retriggerCooldownMin || 10,
      dedupWindowMin: rule?.config?.dedupWindowMin || 2,
      // Spatial
      groupingCriteria: rule?.config?.groupingCriteria?.join(', ') || '',
      correlationScope: rule?.config?.correlationScope || 'same_parent',
      relationshipRadius: rule?.config?.relationshipRadius || 1,
      minDistinctEntities: rule?.config?.minDistinctEntities || 2,
      groupingPriority: rule?.config?.groupingPriority || 'entity',
      // Topological
      traceDepth: rule?.config?.traceDepth || 2,
      directionality: rule?.config?.directionality || 'upstream',
      rootStrategy: rule?.config?.rootStrategy || 'most_upstream',
      suppressChildren: rule?.config?.suppressChildren !== undefined ? rule.config.suppressChildren : true,
      propagationWindowMin: rule?.config?.propagationWindowMin || 10,
      maxGraphBreadth: rule?.config?.maxGraphBreadth || 25,
      // Causal
      timeLagMin: rule?.config?.timeLagMin || 10,
      confidenceThreshold: rule?.config?.confidenceThreshold || 0.7,
      rulePriority: rule?.config?.rulePriority || 'medium',
      repetitionThreshold: rule?.config?.repetitionThreshold || 3,
      ruleExpiryDays: rule?.config?.ruleExpiryDays || 90,
      // Dynamic
      learningWindowDays: rule?.config?.learningWindowDays || 30,
      stabilityThreshold: rule?.config?.stabilityThreshold || 3,
      similarityThreshold: rule?.config?.similarityThreshold || 0.8,
      activationMode: rule?.config?.activationMode || 'manual',
      driftSensitivity: rule?.config?.driftSensitivity || 'medium',
      maxLearnedPatterns: rule?.config?.maxLearnedPatterns || 100,
      // ML/GNN
      modelVersion: rule?.config?.modelVersion || 'v2.4',
      trainingWindowDays: rule?.config?.trainingWindowDays || 60,
      retrainingFrequency: rule?.config?.retrainingFrequency || 'weekly',
      explainabilityEnabled: rule?.config?.explainabilityEnabled !== undefined ? rule.config.explainabilityEnabled : true,
      fallbackPolicy: rule?.config?.fallbackPolicy || 'rule_based',
      // Semantic
      crossDomainEnabled: rule?.config?.crossDomainEnabled || false,
      vocabularyScope: rule?.config?.vocabularyScope || 'infra',
      normalizationEnabled: rule?.config?.normalizationEnabled !== undefined ? rule.config.normalizationEnabled : true,
      summaryLength: rule?.config?.summaryLength || 'short',
      feedbackWeight: rule?.config?.feedbackWeight || 'medium',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: rule?.name || '',
        description: rule?.description || '',
        status: rule?.status || 'active',
        type: ruleType,
        mlEnabled: rule?.mlEnabled || false,
        gnnEnabled: rule?.gnnEnabled || false,
        windowMode: rule?.config?.windowMode || 'sliding',
        timeWindowSeconds: rule?.config?.timeWindowSeconds || 600,
        minEvents: rule?.config?.minEvents || 2,
        maxGapSeconds: rule?.config?.maxGapSeconds || 180,
        sequenceConstraint: rule?.config?.sequenceConstraint || 'any_order',
        retriggerCooldownMin: rule?.config?.retriggerCooldownMin || 10,
        dedupWindowMin: rule?.config?.dedupWindowMin || 2,
        groupingCriteria: rule?.config?.groupingCriteria?.join(', ') || '',
        correlationScope: rule?.config?.correlationScope || 'same_parent',
        relationshipRadius: rule?.config?.relationshipRadius || 1,
        minDistinctEntities: rule?.config?.minDistinctEntities || 2,
        groupingPriority: rule?.config?.groupingPriority || 'entity',
        traceDepth: rule?.config?.traceDepth || 2,
        directionality: rule?.config?.directionality || 'upstream',
        rootStrategy: rule?.config?.rootStrategy || 'most_upstream',
        suppressChildren: rule?.config?.suppressChildren !== undefined ? rule.config.suppressChildren : true,
        propagationWindowMin: rule?.config?.propagationWindowMin || 10,
        maxGraphBreadth: rule?.config?.maxGraphBreadth || 25,
        timeLagMin: rule?.config?.timeLagMin || 10,
        confidenceThreshold: rule?.config?.confidenceThreshold || 0.7,
        rulePriority: rule?.config?.rulePriority || 'medium',
        repetitionThreshold: rule?.config?.repetitionThreshold || 3,
        ruleExpiryDays: rule?.config?.ruleExpiryDays || 90,
        learningWindowDays: rule?.config?.learningWindowDays || 30,
        stabilityThreshold: rule?.config?.stabilityThreshold || 3,
        similarityThreshold: rule?.config?.similarityThreshold || 0.8,
        activationMode: rule?.config?.activationMode || 'manual',
        driftSensitivity: rule?.config?.driftSensitivity || 'medium',
        maxLearnedPatterns: rule?.config?.maxLearnedPatterns || 100,
        modelVersion: rule?.config?.modelVersion || 'v2.4',
        trainingWindowDays: rule?.config?.trainingWindowDays || 60,
        retrainingFrequency: rule?.config?.retrainingFrequency || 'weekly',
        explainabilityEnabled: rule?.config?.explainabilityEnabled !== undefined ? rule.config.explainabilityEnabled : true,
        fallbackPolicy: rule?.config?.fallbackPolicy || 'rule_based',
        crossDomainEnabled: rule?.config?.crossDomainEnabled || false,
        vocabularyScope: rule?.config?.vocabularyScope || 'infra',
        normalizationEnabled: rule?.config?.normalizationEnabled !== undefined ? rule.config.normalizationEnabled : true,
        summaryLength: rule?.config?.summaryLength || 'short',
        feedbackWeight: rule?.config?.feedbackWeight || 'medium',
      });
    }
  }, [rule, open]);

  const handleSubmit = (data: CorrelationFormData) => {
    onSave(data);
    toast({
      title: isEditing ? 'Configuration updated' : 'Rule created',
      description: `"${data.name}" has been ${isEditing ? 'updated' : 'created'} successfully.`,
    });
    onOpenChange(false);
    form.reset();
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2 pb-1 border-b border-border/40">{children}</p>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? 'Configure' : 'Create'}: {typeLabels[ruleType] || ruleType}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

            {/* Base fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rule Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Temporal Window 10m" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what this configuration does..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── TEMPORAL ────────────────────────────── */}
            {ruleType === 'temporal' && (
              <>
                <SectionTitle>Temporal Parameters</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="windowMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Window Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="sliding">Sliding</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="timeWindowSeconds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Window Size (sec)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="minEvents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Events to Correlate</FormLabel>
                        <FormControl><Input type="number" min={2} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="maxGapSeconds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Gap Between Events (sec)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="sequenceConstraint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sequence Constraint</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="any_order">Any Order</SelectItem>
                            <SelectItem value="ordered">Ordered Sequence</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="retriggerCooldownMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Re-trigger Cooldown (min)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="dedupWindowMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Deduplication Window (min)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* ── SPATIAL ─────────────────────────────── */}
            {ruleType === 'spatial' && (
              <>
                <SectionTitle>Spatial Parameters</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="groupingCriteria"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Entity Matching Keys (comma-separated)</FormLabel>
                        <FormControl><Input placeholder="device_id, node_id, interface_id, link_id, service_id" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="correlationScope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correlation Scope</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="same_entity">Same Entity</SelectItem>
                            <SelectItem value="same_parent">Same Parent</SelectItem>
                            <SelectItem value="same_group">Same Group</SelectItem>
                            <SelectItem value="same_tag">Same Tag</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="relationshipRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship Radius (hops)</FormLabel>
                        <FormControl><Input type="number" min={0} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="minDistinctEntities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Distinct Entities</FormLabel>
                        <FormControl><Input type="number" min={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="groupingPriority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grouping Attribute Priority</FormLabel>
                        <FormControl><Input placeholder="entity, parent, group" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* ── TOPOLOGICAL ─────────────────────────── */}
            {ruleType === 'topological' && (
              <>
                <SectionTitle>Topological Parameters</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="traceDepth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dependency Depth (hops)</FormLabel>
                        <FormControl><Input type="number" min={1} max={10} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="directionality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Directionality</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="upstream">Upstream</SelectItem>
                            <SelectItem value="downstream">Downstream</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="rootStrategy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Root Candidate Strategy</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="first_event">First Event</SelectItem>
                            <SelectItem value="highest_severity">Highest Severity</SelectItem>
                            <SelectItem value="most_upstream">Most Upstream</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="propagationWindowMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Propagation Window (min)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="maxGraphBreadth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Graph Breadth (entities)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="suppressChildren"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                        <FormLabel className="text-sm font-medium">Suppress Child Events</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              toast({
                                title: checked ? 'Child Suppression Enabled' : 'Child Suppression Disabled',
                                description: `Child event suppression is now ${checked ? 'active' : 'inactive'}.`,
                                variant: checked ? 'success' : 'destructive',
                              });
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* ── CAUSAL ──────────────────────────────── */}
            {ruleType === 'causal_rule_based' && (
              <>
                <SectionTitle>Causal / Rule-based Parameters</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="timeLagMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allowed Time Lag (min)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="confidenceThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Match Confidence Threshold</FormLabel>
                        <FormControl><Input type="number" step="0.01" min={0} max={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="rulePriority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rule Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="repetitionThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rule Repetition Threshold</FormLabel>
                        <FormControl><Input type="number" min={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="ruleExpiryDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rule Expiry (days)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* ── DYNAMIC ─────────────────────────────── */}
            {ruleType === 'dynamic_rule' && (
              <>
                <SectionTitle>Dynamic Rule Parameters</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="learningWindowDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Window (days)</FormLabel>
                        <FormControl><Input type="number" min={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="stabilityThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pattern Stability (min repeat count)</FormLabel>
                        <FormControl><Input type="number" min={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="similarityThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Similarity Threshold</FormLabel>
                        <FormControl><Input type="number" step="0.01" min={0} max={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="activationMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pattern Activation Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="auto">Auto</SelectItem>
                            <SelectItem value="manual">Manual Approval</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="driftSensitivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drift Detection Sensitivity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="maxLearnedPatterns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Active Learned Patterns</FormLabel>
                        <FormControl><Input type="number" min={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* ── ML / GNN ────────────────────────────── */}
            {ruleType === 'ml_gnn_refinement' && (
              <>
                <SectionTitle>ML / GNN Parameters</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="confidenceThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confidence Threshold</FormLabel>
                        <FormControl><Input type="number" step="0.01" min={0} max={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="modelVersion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Version</FormLabel>
                        <FormControl><Input placeholder="e.g., v2.4" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="trainingWindowDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Data Window (days)</FormLabel>
                        <FormControl><Input type="number" min={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="retrainingFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retraining Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="fallbackPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fallback Policy</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="rule_based">Rule-based</SelectItem>
                            <SelectItem value="suppress">Suppress</SelectItem>
                            <SelectItem value="pass_through">Pass Through</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="explainabilityEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                        <FormLabel className="text-sm font-medium">Explainability Mode</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              toast({
                                title: checked ? 'Explainability Enabled' : 'Explainability Disabled',
                                description: `Model explainability is now ${checked ? 'active' : 'inactive'}.`,
                                variant: checked ? 'success' : 'destructive',
                              });
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* ── LLM SEMANTIC ────────────────────────── */}
            {ruleType === 'llm_semantic' && (
              <>
                <SectionTitle>Semantic Synthesis Parameters</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="confidenceThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semantic Similarity Threshold</FormLabel>
                        <FormControl><Input type="number" step="0.01" min={0} max={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="vocabularyScope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vocabulary Scope</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="infra">Infra Only</SelectItem>
                            <SelectItem value="infra_app">Infra + App</SelectItem>
                            <SelectItem value="infra_app_cloud">Infra + App + Cloud</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="summaryLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auto-summary Length</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="feedbackWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feedback Loop Weight</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="crossDomainEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                        <FormLabel className="text-sm font-medium">Cross-domain Correlation</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              toast({
                                title: checked ? 'Cross-domain Enabled' : 'Cross-domain Disabled',
                                description: `Cross-domain correlation is now ${checked ? 'active' : 'inactive'}.`,
                                variant: checked ? 'success' : 'destructive',
                              });
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="normalizationEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                        <FormLabel className="text-sm font-medium">Message Normalization</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              toast({
                                title: checked ? 'Normalization Enabled' : 'Normalization Disabled',
                                description: `Message normalization is now ${checked ? 'active' : 'inactive'}.`,
                                variant: checked ? 'success' : 'destructive',
                              });
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                {isEditing ? 'Save Configuration' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Dialog
interface DeleteRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ruleName: string;
  onConfirm: () => void;
}

export function DeleteRuleDialog({ open, onOpenChange, ruleName, onConfirm }: DeleteRuleDialogProps) {
  const { toast } = useToast();

  const handleConfirm = () => {
    onConfirm();
    toast({
      title: 'Rule deleted',
      description: `Rule "${ruleName}" has been deleted successfully.`,
      variant: 'destructive',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Rule</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete the rule <strong className="text-foreground">"{ruleName}"</strong>? This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
