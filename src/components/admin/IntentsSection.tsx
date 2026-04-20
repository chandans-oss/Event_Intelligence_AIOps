import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronRight, Search, X, Lightbulb, Target } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { mockIntentCategories, mockIntentsFull } from '@/features/admin/data/adminData';
import { IntentFull, IntentCategory, IntentSubcategory } from '@/shared/types';

type ViewLevel = 'categories' | 'subcategories' | 'intents';

export function IntentsSection({ highlightIntentId }: { highlightIntentId?: string } = {}) {
  const [viewLevel, setViewLevel] = useState<ViewLevel>(() => highlightIntentId ? 'intents' : 'categories');
  const [selectedCategory, setSelectedCategory] = useState<IntentCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<IntentSubcategory | null>(null);
  const [searchQuery, setSearchQuery] = useState(highlightIntentId || '');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<IntentFull | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // When highlightIntentId is set, scroll to the highlighted intent
  useEffect(() => {
    if (highlightIntentId && highlightRef.current) {
      setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }
  }, [highlightIntentId]);

  // Global search mode: search across all intents when highlightIntentId is set or searchQuery is active at category level
  const isGlobalSearch = !!(highlightIntentId && viewLevel === 'intents' && !selectedSubcategory);

  const globalFilteredIntents = mockIntentsFull.filter(intent =>
    searchQuery
      ? intent.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intent.description.toLowerCase().includes(searchQuery.toLowerCase())
      : false
  );


  const handleCategoryClick = (category: IntentCategory) => {
    setSelectedCategory(category);
    setViewLevel('subcategories');
  };

  const handleSubcategoryClick = (subcategory: IntentSubcategory) => {
    setSelectedSubcategory(subcategory);
    setViewLevel('intents');
  };

  const handleBack = () => {
    if (viewLevel === 'intents') {
      if (selectedSubcategory) {
        setViewLevel('subcategories');
        setSelectedSubcategory(null);
      } else {
        setViewLevel('categories');
        setSelectedCategory(null);
      }
    } else if (viewLevel === 'subcategories') {
      setViewLevel('categories');
      setSelectedCategory(null);
    }
  };

  const filteredIntents = isGlobalSearch
    ? globalFilteredIntents
    : mockIntentsFull.filter((intent) => {
        if (!selectedCategory || !selectedSubcategory) return false;
        return intent.intent === selectedSubcategory.id;
      });

  const getBreadcrumb = () => {
    const parts = [];
    if (selectedCategory) parts.push(selectedCategory.name);
    if (selectedSubcategory) parts.push(selectedSubcategory.name);
    return parts;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {viewLevel !== 'categories' && (
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {viewLevel === 'categories' && 'Intents Hypothesis'}
                {viewLevel === 'subcategories' && selectedCategory?.name}
                {viewLevel === 'intents' && selectedSubcategory?.name}
              </h1>
            </div>
            {viewLevel !== 'categories' && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                {getBreadcrumb().map((part, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3 w-3" />}
                    {part}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {viewLevel === 'intents' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary">
                <Plus className="h-4 w-4" />
                Add Intent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Intent</DialogTitle>
              </DialogHeader>
              <IntentForm onClose={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      {viewLevel === 'intents' && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Intents"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Categories View */}
      {viewLevel === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mockIntentCategories.filter(category => {
            const count = mockIntentsFull.filter(i => category.subcategories.some(s => i.intent === s.id)).length;
            return count > 0;
          }).map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="glass-card rounded-xl p-6 hover-lift cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {mockIntentsFull.filter(i => category.subcategories.some(s => i.intent === s.id)).length} intents across {category.subcategories.length} modules
              </p>
              <div className="flex flex-wrap gap-1">
                {category.subcategories.slice(0, 3).map((sub) => (
                  <Badge key={sub.id} variant="secondary" className="text-xs">
                    {sub.name}
                  </Badge>
                ))}
                {category.subcategories.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{category.subcategories.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subcategories View */}
      {viewLevel === 'subcategories' && selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {selectedCategory.subcategories.filter(subcategory => {
            const count = mockIntentsFull.filter(i => i.intent === subcategory.id).length;
            return count > 0;
          }).map((subcategory) => (
            <div
              key={subcategory.id}
              onClick={() => handleSubcategoryClick(subcategory)}
              className="glass-card rounded-xl p-6 hover-lift cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-success/20">
                  <Target className="h-6 w-6 text-status-success" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{subcategory.name}</h3>
              <p className="text-sm text-muted-foreground">
                {mockIntentsFull.filter(i => i.intent === subcategory.id).length} intents
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Intents List View */}
      {viewLevel === 'intents' && (
        <div className="space-y-4">
          {isGlobalSearch && (
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2 text-sm">
                <span className="text-primary font-mono font-bold">{highlightIntentId}</span>
                <span className="text-muted-foreground">— linked from KB article</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setViewLevel('categories'); setSearchQuery(''); }}>
                Browse All Intents
              </Button>
            </div>
          )}
          {filteredIntents.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Intents Found</h3>
              <p className="text-muted-foreground mb-4">Create first intent for category</p>
              <Button className="gap-2 gradient-primary" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Intent
              </Button>
            </div>
          ) : (
            filteredIntents
              .filter((intent) =>
                !isGlobalSearch && searchQuery
                  ? intent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  intent.id.toLowerCase().includes(searchQuery.toLowerCase())
                  : true
              )
              .map((intent) => (
                <IntentCard
                  key={intent.id}
                  intent={intent}
                  onEdit={() => setSelectedIntent(intent)}
                  highlighted={intent.id === highlightIntentId}
                  highlightRef={intent.id === highlightIntentId ? highlightRef : undefined}
                />
              ))
          )}
        </div>
      )}

      {/* Edit Intent Dialog */}
      <Dialog open={!!selectedIntent} onOpenChange={(open) => !open && setSelectedIntent(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Intent</DialogTitle>
          </DialogHeader>
          {selectedIntent && (
            <IntentForm intent={selectedIntent} onClose={() => setSelectedIntent(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IntentCard({ intent, onEdit, highlighted, highlightRef }: { intent: IntentFull; onEdit: () => void; highlighted?: boolean; highlightRef?: React.RefObject<HTMLDivElement> }) {
  const [expanded, setExpanded] = useState(!!highlighted);

  return (
    <div
      ref={highlightRef}
      className={`glass-card rounded-xl p-5 transition-all duration-500 ${
        highlighted ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg shadow-primary/20' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <code className="text-xs bg-secondary/50 px-2 py-1 rounded font-mono">{intent.id}</code>
            <Badge variant="secondary">{intent.domain}</Badge>
            <Badge variant="outline">{intent.function}</Badge>
          </div>
          <p className="text-foreground font-medium mb-2">{intent.description}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {intent.keywords.map((keyword, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>

          {/* Signals & Hypotheses Summary */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{intent.signals.length} signals</span>
            <span>•</span>
            <span>{intent.hypotheses.length} hypotheses</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expandable Details */}
      <Button
        variant="ghost"
        size="sm"
        className="mt-3"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide Details' : 'Show Details'}
        <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </Button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
          {/* Signals */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Signals</h4>
            <div className="space-y-2">
              {intent.signals.map((signal, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-secondary/30 rounded-lg px-3 py-2">
                  <code className="font-mono text-primary">{signal.metric}</code>
                  <span className="text-muted-foreground">{signal.op}</span>
                  <span className="text-foreground">{signal.value}</span>
                  <Badge variant="outline" className="ml-auto">weight: {signal.weight}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Hypotheses */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Hypotheses</h4>
            <div className="space-y-3">
              {intent.hypotheses.map((hypothesis) => (
                <div key={hypothesis.id} className="bg-secondary/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs font-mono text-status-success">{hypothesis.id}</code>
                  </div>
                  <p className="text-sm text-foreground mb-3">{hypothesis.description}</p>

                  {hypothesis.signals.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-muted-foreground">Signals:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {hypothesis.signals.map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-mono">
                            {s.metric} {s.op} {s.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {hypothesis.logPatterns.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">Log Patterns:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {hypothesis.logPatterns.map((lp, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            "{lp.keyword}" (w: {lp.weight})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Situation Description */}
          {intent.situationDesc && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Situation Template</h4>
              <div className="bg-secondary/30 rounded-lg p-3 text-sm text-muted-foreground font-mono">
                {intent.situationDesc}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IntentForm({ intent, onClose }: { intent?: IntentFull; onClose: () => void }) {
  const [signalCount, setSignalCount] = useState(intent?.signals.length || 1);
  const [hypothesisCount, setHypothesisCount] = useState(intent?.hypotheses.length || 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Intent ID</Label>
          <Input placeholder="e.g., link.unidirectional" defaultValue={intent?.id} />
        </div>
        <div>
          <Label>Domain</Label>
          <Select defaultValue={intent?.domain}>
            <SelectTrigger>
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Network">Network</SelectItem>
              <SelectItem value="Database">Database</SelectItem>
              <SelectItem value="Compute">Compute</SelectItem>
              <SelectItem value="Storage">Storage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Intent</Label>
          <Input placeholder="e.g., link" defaultValue={intent?.intent} />
        </div>
        <div>
          <Label>Sub-Intent</Label>
          <Input placeholder="e.g., unidirectional" defaultValue={intent?.subIntent} />
        </div>
      </div>

      <div>
        <Label>Function</Label>
        <Input placeholder="e.g., Link Layer" defaultValue={intent?.function} />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea placeholder="Describe the intent..." defaultValue={intent?.description} />
      </div>

      <div>
        <Label>Keywords (comma-separated)</Label>
        <Input placeholder="keyword1, keyword2, ..." defaultValue={intent?.keywords.join(', ')} />
      </div>

      {/* Signals */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Signals ({signalCount})</Label>
          <Button variant="outline" size="sm" onClick={() => setSignalCount((c) => c + 1)}>
            <Plus className="h-3 w-3 mr-1" /> Add Signal
          </Button>
        </div>
        <div className="space-y-2">
          {Array.from({ length: signalCount }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 items-end">
              <Input placeholder="metric" defaultValue={intent?.signals[i]?.metric} />
              <Select defaultValue={intent?.signals[i]?.op || '>'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=">">&gt;</SelectItem>
                  <SelectItem value="<">&lt;</SelectItem>
                  <SelectItem value="==">==</SelectItem>
                  <SelectItem value=">=">&gt;=</SelectItem>
                  <SelectItem value="<=">&lt;=</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="value" defaultValue={intent?.signals[i]?.value} />
              <Input type="number" step="0.1" placeholder="weight" defaultValue={intent?.signals[i]?.weight} />
              {i > 0 && (
                <Button variant="ghost" size="icon" onClick={() => setSignalCount((c) => c - 1)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hypotheses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Hypotheses ({hypothesisCount})</Label>
          <Button variant="outline" size="sm" onClick={() => setHypothesisCount((c) => c + 1)}>
            <Plus className="h-3 w-3 mr-1" /> Add Hypothesis
          </Button>
        </div>
        <div className="space-y-4">
          {Array.from({ length: hypothesisCount }).map((_, i) => (
            <div key={i} className="border border-border/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Hypothesis #{i + 1}</Label>
                {i > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setHypothesisCount((c) => c - 1)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Input placeholder="Hypothesis ID (e.g., H_FIBER_BROKEN)" defaultValue={intent?.hypotheses[i]?.id} />
              <Textarea placeholder="Description" defaultValue={intent?.hypotheses[i]?.description} rows={2} />
              <p className="text-xs text-muted-foreground">Add signals and log patterns after creation</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Situation Description Template</Label>
        <Textarea
          placeholder="Use {variable} placeholders..."
          defaultValue={intent?.situationDesc}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="gradient-primary" onClick={onClose}>
          {intent ? 'Update Intent' : 'Create Intent'}
        </Button>
      </div>
    </div>
  );
}
