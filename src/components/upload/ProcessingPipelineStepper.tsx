import { CheckCircle2, Circle, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface PipelineStage {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
  count: number;
}

interface ProcessingPipelineStepperProps {
  stages: PipelineStage[];
}

export function ProcessingPipelineStepper({ stages }: ProcessingPipelineStepperProps) {
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
    <div className="glass-card rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Processing Pipeline</h2>
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center flex-1">
            <div
              className={cn(
                "flex-1 transition-all duration-300",
                stage.status === 'active' && "scale-105"
              )}
            >
              <div className={cn(
                "rounded-xl p-4 mx-1 border transition-all",
                stage.status === 'active' && "border-primary/50 bg-primary/5",
                stage.status === 'complete' && "border-status-success/30 bg-status-success/5",
                stage.status === 'pending' && "border-border bg-secondary/30"
              )}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    stage.status === 'complete' && "bg-status-success/20",
                    stage.status === 'active' && "bg-primary/20",
                    stage.status === 'pending' && "bg-muted"
                  )}>
                    {getStatusIcon(stage.status)}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {index + 1}. {stage.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  {getStatusBadge(stage.status)}
                  <span className="text-lg font-bold text-foreground">
                    {stage.count.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            {index < stages.length - 1 && (
              <ArrowRight className={cn(
                "h-5 w-5 flex-shrink-0 mx-1 transition-colors duration-300",
                index < stages.findIndex(s => s.status === 'active') || stages[index].status === 'complete'
                  ? "text-status-success" 
                  : "text-border"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
