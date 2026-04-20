import { X, AlertCircle, Clock, Server, Network, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Cluster, Severity } from '@/shared/types';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { SeverityIcon } from '@/shared/components/common/SeverityIcon';

interface ChildEventsSidebarProps {
  cluster: Cluster;
  onClose: () => void;
}

const severityConfig: Record<Severity, { className: string }> = {
  Critical: { className: 'bg-severity-critical text-foreground' },
  Major: { className: 'bg-severity-high text-foreground' },
  Minor: { className: 'bg-severity-low text-foreground' },
  Low: { className: 'bg-muted text-foreground' },
  Info: { className: 'bg-severity-info text-foreground' },
};

// Mock child events with more detail
const getMockChildEvents = (cluster: Cluster) => {
  const baseEvents = cluster.childEvents.map((event, index) => ({
    id: event.id,
    alertType: event.alertType.replace(/_/g, ' '),
    severity: event.severity,
    source: event.source,
    message: event.message,
    timestamp: new Date(Date.now() - (index + 1) * 300000).toISOString(),
    correlationScore: event.correlationScore || 0.85,
    node: `node-${index + 1}.example.com`,
    resource: `resource-${index + 1}`,
  }));

  // Add some additional mock events if there aren't many
  if (baseEvents.length < 5) {
    const additionalEvents = [
      {
        id: `EVT-${Date.now()}-1`,
        alertType: 'Port Operational State Down',
        severity: 'Critical' as Severity,
        source: 'switch0db7ce',
        message: 'Port gi24 operational state is down',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        correlationScore: 0.92,
        node: '192.168.50.22',
        resource: 'gigabitethernet24',
      },
      {
        id: `EVT-${Date.now()}-2`,
        alertType: 'Link Down',
        severity: 'Critical' as Severity,
        source: 'CHANDEESH',
        message: 'Port Operational State is Down',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        correlationScore: 0.88,
        node: '192.168.51.171',
        resource: 'fab1.0',
      },
      {
        id: `EVT-${Date.now()}-3`,
        alertType: 'Interface Flapping',
        severity: 'Major' as Severity,
        source: 'switch0db7ce',
        message: 'Interface gi26 is flapping',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        correlationScore: 0.79,
        node: '192.168.50.22',
        resource: 'gigabitethernet26',
      },
      {
        id: `EVT-${Date.now()}-4`,
        alertType: 'High CPU Usage',
        severity: 'Minor' as Severity,
        source: 'core-router-01',
        message: 'CPU usage exceeded 85% threshold',
        timestamp: new Date(Date.now() - 1500000).toISOString(),
        correlationScore: 0.72,
        node: '192.168.1.1',
        resource: 'cpu-0',
      },
      {
        id: `EVT-${Date.now()}-5`,
        alertType: 'Memory Pressure',
        severity: 'Minor' as Severity,
        source: 'app-server-03',
        message: 'Memory usage at 78%',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        correlationScore: 0.68,
        node: '10.0.0.15',
        resource: 'memory',
      },
    ];
    return [...baseEvents, ...additionalEvents.slice(0, 5 - baseEvents.length)];
  }

  return baseEvents;
};

export function ChildEventsSidebar({ cluster, onClose }: ChildEventsSidebarProps) {
  const childEvents = getMockChildEvents(cluster);
  const severity = severityConfig[cluster.rootEvent.severity];

  return (
    <div className="fixed top-0 right-0 h-full w-[80%] bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg",
            cluster.rootEvent.severity === 'Critical' && "bg-severity-critical/20",
            cluster.rootEvent.severity === 'Major' && "bg-severity-high/20",
            cluster.rootEvent.severity === 'Minor' && "bg-severity-low/20",
            cluster.rootEvent.severity === 'Low' && "bg-muted/20",
          )}>
            <Network className={cn(
              "h-6 w-6",
              cluster.rootEvent.severity === 'Critical' && "text-severity-critical",
              cluster.rootEvent.severity === 'Major' && "text-severity-high",
              cluster.rootEvent.severity === 'Minor' && "text-severity-low",
              cluster.rootEvent.severity === 'Low' && "text-muted-foreground",
            )} />
          </div>
          <div>
            <p className="font-mono text-sm text-muted-foreground">{cluster.id}</p>
            <h2 className="text-xl font-bold text-foreground">Cluster Child Events</h2>
            <p className="text-sm text-muted-foreground">
              {childEvents.length + 1} total events in this cluster
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Root Event */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Root Event
            </h3>
            <div className="glass-card rounded-lg p-4 border-l-4 border-l-primary">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge className={cn("gap-1", severity.className)}>
                    <SeverityIcon severity={cluster.rootEvent.severity} className="h-3 w-3" />
                    {cluster.rootEvent.severity}
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    ROOT
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(cluster.createdAt), { addSuffix: true })}
                </span>
              </div>
              <h4 className="font-semibold text-foreground mb-1">
                {cluster.rootEvent.alertType.replace(/_/g, ' ')}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">{cluster.rootEvent.message}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Server className="h-3 w-3" />
                  {cluster.rootEvent.source}
                </span>
              </div>
            </div>
          </div>

          {/* Child Events Table View */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Correlated Events ({childEvents.length})
            </h3>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-secondary/50 rounded-t-lg border border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <div className="col-span-3">Issue</div>
              <div className="col-span-1">Severity</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Node</div>
              <div className="col-span-2">Resource</div>
              <div className="col-span-2">Score</div>
            </div>

            {/* Table Body */}
            <div className="border-x border-b border-border rounded-b-lg divide-y divide-border">
              {childEvents.map((event, index) => {
                const eventSeverity = severityConfig[event.severity];
                return (
                  <div
                    key={event.id}
                    className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-secondary/30 transition-colors items-center"
                  >
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-md",
                          event.severity === 'Critical' && "bg-severity-critical/20",
                          event.severity === 'Major' && "bg-severity-high/20",
                          event.severity === 'Minor' && "bg-severity-low/20",
                          event.severity === 'Low' && "bg-muted/20",
                        )}>
                          <AlertCircle className={cn(
                            "h-4 w-4",
                            event.severity === 'Critical' && "text-severity-critical",
                            event.severity === 'Major' && "text-severity-high",
                            event.severity === 'Minor' && "text-severity-low",
                            event.severity === 'Low' && "text-muted-foreground",
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{event.alertType}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{event.message}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Badge className={cn("text-xs gap-1", eventSeverity.className)}>
                        <SeverityIcon severity={event.severity} className="h-2.5 w-2.5" />
                        {event.severity}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-foreground">
                        {new Date(event.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-foreground">{event.source}</p>
                      <p className="text-xs text-muted-foreground">{event.node}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-foreground">{event.resource}</p>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${event.correlationScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          {Math.round(event.correlationScore * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total events: <span className="font-semibold text-foreground">{childEvents.length + 1}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="gradient-primary">
              View Full Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
