import { useState } from 'react';
import {
  Target,
  Layers,
  RefreshCw,
  MessageSquare,
  Sliders,
  BrainCircuit,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type Technique =
  | 'exact'
  | 'structured'
  | 'state'
  | 'template'
  | 'similarity'
  | 'semantic';

interface DedupSidebarProps {
  activeTechnique: Technique;
  onTechniqueChange: (technique: Technique) => void;
}

const menuItems = [
  { id: 'exact' as Technique, label: 'Exact Match', icon: Target, desc: "Bit-by-bit comparison" },
  { id: 'structured' as Technique, label: 'Structured Exact', icon: Layers, desc: "Field-based matching" },
  { id: 'state' as Technique, label: 'State Transition', icon: RefreshCw, desc: "State change tracking" },
  { id: 'template' as Technique, label: 'Template-Based', icon: MessageSquare, desc: "Pattern normalization" },
  { id: 'similarity' as Technique, label: 'Similarity-Based', icon: Sliders, desc: "Fuzzy text matching" },
  { id: 'semantic' as Technique, label: 'Semantic-Based', icon: BrainCircuit, desc: "LLM contextual clustering" },
];

export function DedupSidebar({ activeTechnique, onTechniqueChange }: DedupSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "h-full bg-card/40 backdrop-blur-md border-r border-border/50 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "p-4 border-b border-border/50 flex items-center justify-between",
        isCollapsed ? "justify-center" : "items-start"
      )}>
        {!isCollapsed && (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
            <h2 className="text-xl font-bold text-foreground">Deduplication Engine</h2>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1.5 rounded-lg bg-secondary/50 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all duration-200 border border-border/50",
            isCollapsed ? "mt-2" : "mt-1"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-2 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTechnique === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTechniqueChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent",
                isCollapsed && "justify-center px-0"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                isActive && "scale-110"
              )} />
              {!isCollapsed && (
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.label}
                  </span>
                  <span className="text-[10px] opacity-50 font-medium truncate w-full text-left">
                    {item.desc}
                  </span>
                </div>
              )}

              {isCollapsed && isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
              )}
            </button>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-border/30 bg-secondary/5">
        </div>
      )}
    </div>
  );
}
