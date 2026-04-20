import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import PredictionDashboard from "@/features/analytics/pages/PredictionDashboard";
import KpiDashboard from "@/features/analytics/pages/KpiDashboard";

import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/shared/components/common/ErrorBoundary";
import AnalyticsDashboard from "@/features/analytics/pages/AnalyticsDashboard";
import Events from "@/features/events/pages/EventsPage";

import Admin from "@/features/admin/pages/AdminPage";
import RCADetailPage from "@/features/rca/pages/RcaDetailPage";
import ImpactDetailPage from "@/features/impact/pages/ImpactDetailPage";
import KBDetailPage from "@/features/admin/pages/KBDetailPage";
import NotFound from "@/shared/components/common/NotFound";
import DocsPage from "@/pages/DocsPage";
import RCAPlaygroundPage from "./features/rca/pages/RCAPlaygroundPage";
import EventProcessingPage from "./features/event-processing/pages/EventProcessingPage";
import DeduplicationPage from "./features/event-processing/pages/DeduplicationPage";
import SuppressionPage from "./features/event-processing/pages/SuppressionPage";
import BulkEventProcessingPage from "./features/event-processing/pages/BulkEventProcessingPage";
import AlgoConfigPage from "./features/algo-training/pages/AlgoConfigPage";
import AlgoTrainingPage from "./features/algo-training/pages/AlgoTrainingPage";
import AlgoResultsPage from "./features/algo-training/pages/AlgoResultsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<AnalyticsDashboard />} />

              {/* Algo Training */}
              <Route path="/algo-training/config" element={<AlgoConfigPage />} />
              <Route path="/algo-training/training" element={<AlgoTrainingPage />} />
              <Route path="/algo-training/results" element={<AlgoResultsPage />} />

              <Route path="/events" element={<Events />} />
              <Route path="/rca/detail/:id" element={<RCADetailPage />} />
              <Route path="/impact/detail/:id" element={<ImpactDetailPage />} />

              <Route path="/admin" element={<Admin />} />
              <Route path="/dashboard/prediction" element={<PredictionDashboard />} />
              <Route path="/dashboard/kpi" element={<KpiDashboard />} />
              <Route path="/admin/kb/:id" element={<KBDetailPage />} />
              <Route path="/playground/rca" element={<RCAPlaygroundPage />} />
              <Route path="/event-processing/deduplication" element={<DeduplicationPage />} />
              <Route path="/event-processing/suppression" element={<SuppressionPage />} />
              <Route path="/event-processing/bulk-processing" element={<BulkEventProcessingPage />} />
              <Route path="/event-processing" element={<EventProcessingPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
