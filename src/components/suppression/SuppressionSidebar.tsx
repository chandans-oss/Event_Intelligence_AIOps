import { useState } from 'react';
import {
  Calendar,
  Clock,
  Tag,
  GitMerge,
  MapPin,
  Layers,
  Activity,
  Zap,
  History,
  TrendingUp,
  Snowflake,
  ChevronRight,
  ChevronLeft,
  Filter,
  ShieldCheck,
  Network
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type SuppressionTechnique =
  | 'maintenance'
  | 'business_hours'
  | 'tag_based'
  | 'parent_child'
  | 'spatial'
  | 'dedup_suppress'
  | 'time_window'
  | 'flap_detection'
  | 'temporal_cluster'
  | 'dynamic_threshold'
  | 'event_storm'
  | 'seasonal';

interface SuppressionSidebarProps {
  activeTechnique: SuppressionTechnique;
  onTechniqueChange: (technique: SuppressionTechnique) => void;
}

const groups = [
  {
    label: "Policy-Based",
    items: [
      { id: 'maintenance' as SuppressionTechnique, label: 'Maintenance Window', icon: Calendar, desc: "Scheduled downtime" },
      { id: 'business_hours' as SuppressionTechnique, label: 'Business Hours', icon: Clock, desc: "Operating hours logic" },
      { id: 'tag_based' as SuppressionTechnique, label: 'Tag-Based', icon: Tag, desc: "Metadata filtering" },
    ]
  },
  {
    label: "Topology-Based",
    items: [
      { id: 'parent_child' as SuppressionTechnique, label: 'Parent-Child', icon: Network, desc: "Downstream impact" },
      { id: 'spatial' as SuppressionTechnique, label: 'Spatial', icon: MapPin, desc: "Location aggregation" },
    ]
  },
  {
    label: "Noise Reduction",
    items: [
      { id: 'dedup_suppress' as SuppressionTechnique, label: 'Dedup-Based', icon: Layers, desc: "Sub-second noise" },
      { id: 'time_window' as SuppressionTechnique, label: 'Time-Window', icon: History, desc: "Sliding window" },
      { id: 'flap_detection' as SuppressionTechnique, label: 'Flap Detection', icon: Activity, desc: "Interface instability" },
      { id: 'temporal_cluster' as SuppressionTechnique, label: 'Temporal Cluster', icon: GitMerge, desc: "Burst grouping" },
    ]
  },
  {
    label: "Threshold & Pattern",
    items: [
      { id: 'dynamic_threshold' as SuppressionTechnique, label: 'Dynamic Threshold', icon: TrendingUp, desc: "Baseline deviation" },
      { id: 'event_storm' as SuppressionTechnique, label: 'Event Storm', icon: Zap, desc: "Pattern matching" },
    ]
  },
  {
    label: "Advanced",
    items: [
      { id: 'seasonal' as SuppressionTechnique, label: 'Seasonal', icon: Snowflake, desc: "Recurring patterns" },
    ]
  }
];

export function SuppressionSidebar({ activeTechnique, onTechniqueChange }: SuppressionSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "h-full bg-card/40 backdrop-blur-md border-r border-border/50 flex flex-col transition-all duration-300 overflow-hidden",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "p-4 border-b border-border/50 flex items-center justify-between",
        isCollapsed ? "justify-center" : "items-start"
      )}>
        {!isCollapsed && (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
            <h2 className="text-xl font-bold text-foreground">Suppression Lab</h2>
            <p className="text-[10px] text-muted-foreground font-medium tracking-tight opacity-70">
              Noise Extraction Engine
            </p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1.5 rounded-lg bg-secondary/50 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all duration-200 border border-border/50",
            isCollapsed ? "mt-2" : "mt-1"
          )}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed && (
              <p className="text-[9px] font-black text-muted-foreground tracking-widest px-3 mb-2 opacity-50">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTechnique === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTechniqueChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110",
                      isActive && "scale-110"
                    )} />
                    {!isCollapsed && (
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.label}
                        </span>
                        <span className="text-[9px] opacity-50 font-medium truncate w-full text-left">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
