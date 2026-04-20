import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronRight, Search, BookOpen, Link2, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { mockKBCategories, mockKBArticlesEnhanced, mockIntentsFull } from '@/features/admin/data/adminData';
import { KBArticle } from '@/shared/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function escapePlaceholders(md: string): string {
  return md.replace(/<([a-zA-Z][a-zA-Z0-9_-]*)>/g, (_, tag) => `\`<${tag}>\``);
}

type ViewLevel = 'categories' | 'subcategories' | 'articles';

export function KBSection() {
  const navigate = useNavigate();

  const [viewLevel, setViewLevel] = useState<ViewLevel>(() => {
    return (sessionStorage.getItem('kb-viewLevel') as ViewLevel) || 'categories';
  });

  const [selectedCategory, setSelectedCategory] = useState<typeof mockKBCategories[0] | null>(() => {
    const saved = sessionStorage.getItem('kb-selectedCategory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return null;
  });

  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(() => {
    return sessionStorage.getItem('kb-selectedSubcategory') || null;
  });

  useEffect(() => {
    sessionStorage.setItem('kb-viewLevel', viewLevel);
    if (selectedCategory) {
      sessionStorage.setItem('kb-selectedCategory', JSON.stringify(selectedCategory));
    } else {
      sessionStorage.removeItem('kb-selectedCategory');
    }
    if (selectedSubcategory) {
      sessionStorage.setItem('kb-selectedSubcategory', selectedSubcategory);
    } else {
      sessionStorage.removeItem('kb-selectedSubcategory');
    }
  }, [viewLevel, selectedCategory, selectedSubcategory]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [viewingArticle, setViewingArticle] = useState<KBArticle | null>(null);

  const handleCategoryClick = (category: typeof mockKBCategories[0]) => {
    setSelectedCategory(category);
    setViewLevel('subcategories');
  };

  const handleSubcategoryClick = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setViewLevel('articles');
  };

  const handleBack = () => {
    if (viewLevel === 'articles') {
      setViewLevel('subcategories');
      setSelectedSubcategory(null);
    } else if (viewLevel === 'subcategories') {
      setViewLevel('categories');
      setSelectedCategory(null);
    }
  };

  const filteredArticles = mockKBArticlesEnhanced.filter((article) => {
    if (!selectedCategory || !selectedSubcategory) return false;
    // Match either the category or subcategory against the selected subcategory name
    return article.category === selectedSubcategory || article.subcategory === selectedSubcategory;
  });

  const getBreadcrumb = () => {
    const parts = [];
    if (selectedCategory) parts.push(selectedCategory.name);
    if (selectedSubcategory) parts.push(selectedSubcategory);
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
                {viewLevel === 'categories' && 'Knowledge Base'}
                {viewLevel === 'subcategories' && selectedCategory?.name}
                {viewLevel === 'articles' && selectedSubcategory}
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
        {viewLevel === 'articles' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary">
                <Plus className="h-4 w-4" />
                Add Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create KB Article</DialogTitle>
              </DialogHeader>
              <KBArticleForm
                category={selectedCategory?.name}
                subcategory={selectedSubcategory || undefined}
                onClose={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      {viewLevel === 'articles' && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Articles"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Categories View */}
      {viewLevel === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mockKBCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="glass-card rounded-xl p-6 hover-lift cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {mockKBArticlesEnhanced.filter(a =>
                  category.subcategories.includes(a.category) ||
                  category.subcategories.includes(a.subcategory)
                ).length} articles
              </p>
              <div className="flex flex-wrap gap-1">
                {category.subcategories.slice(0, 2).map((sub) => (
                  <Badge key={sub} variant="secondary" className="text-xs">
                    {sub}
                  </Badge>
                ))}
                {category.subcategories.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{category.subcategories.length - 2}
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
          {selectedCategory.subcategories.map((subcategory) => {
            const articleCount = mockKBArticlesEnhanced.filter(
              (a) => a.category === subcategory || a.subcategory === subcategory
            ).length;
            return (
              <div
                key={subcategory}
                onClick={() => handleSubcategoryClick(subcategory)}
                className="glass-card rounded-xl p-6 hover-lift cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-success/20">
                    <BookOpen className="h-6 w-6 text-status-success" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{subcategory}</h3>
                <p className="text-sm text-muted-foreground">
                  {articleCount} articles
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Articles View */}
      {viewLevel === 'articles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.length === 0 ? (
            <div className="col-span-full glass-card rounded-xl p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Articles Found</h3>
              <p className="text-muted-foreground mb-4">Create first KB article for category</p>
              <Button className="gap-2 gradient-primary" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Article
              </Button>
            </div>
          ) : (
            filteredArticles
              .filter((article) =>
                searchQuery
                  ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  article.content.toLowerCase().includes(searchQuery.toLowerCase())
                  : true
              )
              .map((article) => (
                <KBArticleCard
                  key={article.id}
                  article={article}
                  onEdit={() => setSelectedArticle(article)}
                  onView={() => navigate(`/admin/kb/${article.id}`)}
                />
              ))
          )}
        </div>
      )}

      {/* Edit Article Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit KB Article</DialogTitle>
          </DialogHeader>
          {selectedArticle && (
            <KBArticleForm article={selectedArticle} onClose={() => setSelectedArticle(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* View Article Dialog */}
      <Dialog open={!!viewingArticle} onOpenChange={(open) => !open && setViewingArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingArticle?.title}</DialogTitle>
          </DialogHeader>
          {viewingArticle && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge>{viewingArticle.category}</Badge>
                <Badge variant="secondary">{viewingArticle.subcategory}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-severity-medium" />
                <span className="text-sm">{viewingArticle.effectiveness}% effectiveness</span>
              </div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h3: ({ node, ...props }) => <h3 className="text-primary font-bold tracking-widest mt-4 mb-2 text-[10px]" {...props} />,
                  ul: ({ node, ...props }) => <ul className="space-y-1 my-2 list-none pl-0 font-sans" {...props} />,
                  li: ({ node, ...props }) => (
                    <li className="flex items-start gap-2 text-[11px] bg-white/5 p-1.5 rounded-lg border border-white/5" {...props}>
                      <div className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{props.children}</span>
                    </li>
                  ),
                  p: ({ node, ...props }) => <p className="leading-relaxed text-[11px] opacity-80 font-sans" {...props} />,
                  code: ({ node, ...props }) => <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-[10px] text-blue-400" {...props} />
                }}
              >
                {escapePlaceholders(viewingArticle.content)}
              </ReactMarkdown>
              <div>
                <h4 className="text-sm font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {viewingArticle.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Linked Intents</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingArticle.linkedIntents.map((intentId) => {
                    const intent = mockIntentsFull.find((i) => i.id === intentId);
                    return (
                      <div key={intentId} className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-1.5">
                        <Link2 className="h-3 w-3 text-primary" />
                        <code className="text-xs font-mono">{intentId}</code>
                        {intent && (
                          <span className="text-xs text-muted-foreground">- {intent.description}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KBArticleCard({
  article,
  onEdit,
  onView,
}: {
  article: KBArticle;
  onEdit: () => void;
  onView: () => void;
}) {
  return (
    <div className="glass-card rounded-xl p-5 hover-lift cursor-pointer group" onClick={onView}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{article.title}</h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{article.problem}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {article.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Linked Intents */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <Link2 className="h-3 w-3" />
        <span>{article.linkedIntents.length} linked intents</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end pt-3 border-t border-border/50">
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

function KBArticleForm({
  article,
  category,
  subcategory,
  onClose,
}: {
  article?: KBArticle;
  category?: string;
  subcategory?: string;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input placeholder="Article title" defaultValue={article?.title} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select defaultValue={article?.category || category}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {mockKBCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Subcategory</Label>
          <Input placeholder="Subcategory" defaultValue={article?.subcategory || subcategory} />
        </div>
      </div>

      <div>
        <Label>Content</Label>
        <Textarea placeholder="Article content..." defaultValue={article?.content} rows={6} />
      </div>

      <div>
        <Label>Tags (comma-separated)</Label>
        <Input placeholder="tag1, tag2, ..." defaultValue={article?.tags.join(', ')} />
      </div>

      <div>
        <Label>Link to Intents</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select intents to link" />
          </SelectTrigger>
          <SelectContent>
            {mockIntentsFull.map((intent) => (
              <SelectItem key={intent.id} value={intent.id}>
                {intent.id} - {intent.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {article?.linkedIntents && article.linkedIntents.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {article.linkedIntents.map((intentId) => (
              <Badge key={intentId} variant="secondary">
                {intentId}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="gradient-primary" onClick={onClose}>
          {article ? 'Update Article' : 'Create Article'}
        </Button>
      </div>
    </div>
  );
}
