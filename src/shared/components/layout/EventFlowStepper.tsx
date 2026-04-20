import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { mockFlowStages } from '@/data/mock/mockData';

export function EventFlowStepper() {
  const location = useLocation();

  const getStageStatus = (stage: typeof mockFlowStages[0]) => {
    // Check if we're on this stage's page
    const isCurrentPath = location.pathname === stage.path ||
      (stage.path === '/preprocessing' && location.pathname === '/') ||
      location.pathname.startsWith(stage.path);

    if (isCurrentPath) return 'active';
    return stage.status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-status-success" />;
      case 'active':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-status-success/20 text-status-success">Complete</span>;
      case 'active':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary animate-pulse">Active</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Pending</span>;
    }
  };

  return (
    <div className="w-full border-b border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {mockFlowStages.map((stage, index) => {
            const status = getStageStatus(stage);
            return (
              <div key={stage.id} className="flex items-center flex-1">
                <Link
                  to={stage.path}
                  className={cn(
                    "flex-1 group cursor-pointer transition-all duration-300",
                    status === 'active' && "scale-105"
                  )}
                >
                  <div className={cn(
                    "glass-card rounded-xl p-4 mx-2 hover-lift hover-glow",
                    status === 'active' && "border-primary/50 glow-primary",
                    status === 'complete' && "border-status-success/30"
                  )}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        status === 'complete' && "bg-status-success/20",
                        status === 'active' && "bg-primary/20",
                        status === 'pending' && "bg-muted"
                      )}>
                        {getStatusIcon(status)}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {index + 1}. {stage.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(status)}
                      <span className="text-lg font-bold text-foreground">
                        {stage.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
                {index < mockFlowStages.length - 1 && (
                  <div className={cn(
                    "h-0.5 w-8 transition-colors duration-300",
                    index < mockFlowStages.findIndex(s => s.status === 'active')
                      ? "bg-status-success"
                      : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
