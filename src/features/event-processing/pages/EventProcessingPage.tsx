import { MainLayout } from "@/shared/components/layout/MainLayout";

export default function EventProcessingPage() {
  return (
    <MainLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between border-b pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Event Processing</h1>
            <p className="text-muted-foreground mt-1">Experimental space for real-time event pipeline configuration.</p>
          </div>
        </div>
        
        <div className="min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-primary/10 rounded-2xl bg-card/20 text-muted-foreground ">
          <p>The Event Processing workspace is currently under development.</p>
        </div>
      </div>
    </MainLayout>
  );
}
