import React from 'react';
import { X, ArrowLeft, BrainCircuit, Activity, Target } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import RCADetailPage from '@/features/rca/pages/RcaDetailPage';

interface RcaFlowSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export function RcaFlowSidebar({ isOpen, onClose, eventId }: RcaFlowSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full max-w-[90vw] lg:max-w-[85vw] bg-background border-l-2 border-border shadow-2xl z-[101] flex flex-col transition-transform duration-500 ease-in-out",
        isOpen ? "translate-x-0 shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.3)]" : "translate-x-full pointer-events-none"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border bg-card/30 backdrop-blur shadow-sm shrink-0">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="group h-12 w-12 rounded-full border-2 border-border hover:bg-primary hover:border-primary hover:text-white transition-all"
            >
              <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <div className="h-10 w-0.5 bg-border rounded-full" />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/30 shadow-inner group overflow-hidden relative">
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
              <BrainCircuit className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-black text-foreground">Detailed RCA Investigation</h2>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-primary" />
                Root Cause Flow • Incident ID: {eventId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 pr-6 border-r border-border">

            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50/30 dark:bg-zinc-950/30">
          {isOpen && <RCADetailPage isEmbedded={true} eventId={eventId} />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-border bg-card/30 backdrop-blur flex justify-between items-center">
          <div className="flex items-center gap-4">
          </div>
        </div>
      </div>
    </>
  );

}
