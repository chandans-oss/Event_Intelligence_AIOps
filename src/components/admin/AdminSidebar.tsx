import { useState } from 'react';
import { Shield, Lightbulb, BookOpen, Zap, ChevronRight, ChevronLeft, TrendingUp, ToggleLeft, Copy, GitBranch } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type AdminSection = 'Suppression' | 'Deduplication' | 'CorrelationTypes' | 'CorrelationPatterns' | 'Intents' | 'KB' | 'AutoRemediation';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const menuItems = [
  { id: 'Suppression' as AdminSection, label: 'Suppression', icon: ToggleLeft },
  { id: 'Deduplication' as AdminSection, label: 'Deduplication', icon: Copy },
  { id: 'CorrelationTypes' as AdminSection, label: 'Correlation Types', icon: GitBranch },
  { id: 'Intents' as AdminSection, label: 'Intents Hypothesis', icon: Lightbulb },
  { id: 'KB' as AdminSection, label: 'Knowledge Base', icon: BookOpen },
  { id: 'AutoRemediation' as AdminSection, label: 'Auto Remediation', icon: Zap },
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "h-full bg-card/40 backdrop-blur-md border-r border-border/50 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header with Collapse Toggle - Matching IEP Style */}
      <div className={cn(
        "p-4 border-b border-border/50 flex items-center justify-between",
        isCollapsed ? "justify-center" : "items-start"
      )}>
        {!isCollapsed && (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
            <h2 className="text-xl font-bold text-foreground">Configuration</h2>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1.5 rounded-lg bg-secondary/50 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all duration-200 border border-border/50",
            isCollapsed ? "mt-2" : "mt-1"
          )}
          title={isCollapsed ? "Expand Admin Sidebar" : "Shorten Admin Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-2 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              title={isCollapsed ? item.label : undefined}
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
                <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.label}
                </span>
              )}

              {!isCollapsed && (
                <div className="ml-auto opacity-50 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className={cn("h-4 w-4 transition-transform", isActive && "rotate-90")} />
                </div>
              )}

              {isCollapsed && isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border/30 bg-secondary/5">
          <div className="flex items-center gap-2 px-1">
            <Shield className="h-3 w-3 text-primary/50" />
            <p className="text-[9px] text-muted-foreground leading-tight font-semibold opacity-50">
              System Secure Mode
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
