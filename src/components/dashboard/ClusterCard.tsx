import { AlertCircle, Clock, Server, Users, ChevronRight, Eye, BarChart3, Wrench } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Cluster, Severity } from '@/shared/types';
import { formatDistanceToNow } from 'date-fns';
import { SeverityIcon } from '@/shared/components/common/SeverityIcon';

interface ClusterCardProps {
  cluster: Cluster;
  onRCAClick: (cluster: Cluster) => void;
  onImpactClick: (cluster: Cluster) => void;
  onRemediationClick: (cluster: Cluster) => void;
}

const severityConfig: Record<Severity, { className: string; border: string }> = {
  Critical: { className: 'bg-severity-critical text-foreground', border: 'border-l-severity-critical' },
  Major: { className: 'bg-severity-high text-foreground', border: 'border-l-severity-high' },
  Minor: { className: 'bg-severity-low text-foreground', border: 'border-l-severity-low' },
  Low: { className: 'bg-muted text-foreground', border: 'border-l-muted' },
  Info: { className: 'bg-severity-info text-foreground', border: 'border-l-severity-info' },
};

const statusConfig: Record<string, string> = {
  Active: 'bg-severity-critical/20 text-severity-critical border-severity-critical/30',
  Resolved: 'bg-status-success/20 text-status-success border-status-success/30',
  Pending: 'bg-severity-medium/20 text-severity-medium border-severity-medium/30',
};

export function ClusterCard({ cluster, onRCAClick, onImpactClick, onRemediationClick }: ClusterCardProps) {
  const severity = severityConfig[cluster.rootEvent.severity];
  const createdTime = formatDistanceToNow(new Date(cluster.createdAt), { addSuffix: true });

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-5 border-l-4 hover-lift hover-glow transition-all duration-300 group",
        severity.border
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            cluster.rootEvent.severity === 'Critical' && "bg-severity-critical/20",
            cluster.rootEvent.severity === 'Major' && "bg-severity-high/20",
            cluster.rootEvent.severity === 'Minor' && "bg-severity-low/20",
            cluster.rootEvent.severity === 'Low' && "bg-muted/20",
          )}>
            <AlertCircle className={cn(
              "h-5 w-5",
              cluster.rootEvent.severity === 'Critical' && "text-severity-critical",
              cluster.rootEvent.severity === 'Major' && "text-severity-high",
              cluster.rootEvent.severity === 'Minor' && "text-severity-low",
              cluster.rootEvent.severity === 'Low' && "text-muted-foreground",
            )} />
          </div>
          <div>
            <p className="text-sm font-mono text-muted-foreground">{cluster.id}</p>
            <Badge className={cn("gap-1", severity.className)}>
              <SeverityIcon severity={cluster.rootEvent.severity} className="h-3 w-3" />
              {cluster.rootEvent.severity}
            </Badge>
          </div>
        </div>
        <Badge variant="outline" className={statusConfig[cluster.status]}>
          {cluster.status}
        </Badge>
      </div>

      {/* Root Event Summary */}
      <div className="mb-4">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
          {cluster.rootEvent.alertType.replace(/_/g, ' ')}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {cluster.rootEvent.message}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{createdTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Duration:</span>
          <span className="text-foreground font-medium">{cluster.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {cluster.childEvents.length + 1} events
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Server className="h-3 w-3" />
            {cluster.affectedServices.length} services
          </Badge>
        </div>
      </div>

      {/* Impact Indicator */}
      {cluster.affectedUsers > 0 && (
        <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-severity-critical/10 border border-severity-critical/20">
          <Users className="h-4 w-4 text-severity-critical" />
          <span className="text-sm text-severity-critical font-medium">
            ~{cluster.affectedUsers.toLocaleString()} users affected
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-between text-sm hover:bg-primary/10 hover:text-primary group/btn"
          onClick={() => onRCAClick(cluster)}
        >
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Root Cause Analysis
          </span>
          <ChevronRight className="h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-between text-sm hover:bg-severity-high/10 hover:text-severity-high group/btn"
          onClick={() => onImpactClick(cluster)}
        >
          <span className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Impact Analysis
          </span>
          <ChevronRight className="h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-between text-sm hover:bg-status-success/10 hover:text-status-success group/btn"
          onClick={() => onRemediationClick(cluster)}
        >
          <span className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Start Remediation
          </span>
          <ChevronRight className="h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </Button>
      </div>
    </div>
  );
}
