import React, { useState } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import {
  BookOpen,
  Shield,
  Zap,
  Search,
  Activity,
  BarChart3,
  Settings,
  LayoutDashboard,
  BrainCircuit,
  GitBranch,
  FolderArchive,
  ChevronRight,
  BookMarked
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const DOC_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    sections: [
      {
        id: 'overview',
        title: 'Platform Overview',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Enterprise AIOps Platform</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
              Welcome to the Event Analytics platform. This system provides a unified, intelligent layer that aggregates network events, correlates them systematically, and actively reduces noise to present actionable root causes to operators.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-colors shadow-sm">
                <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                  <BrainCircuit className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-[14px] font-black text-slate-900 dark:text-white mb-2">Automated RCA</h3>
                <p className="text-[12px] text-slate-500 dark:text-slate-400">Leverage AI and structural topologies to instantly pinpoint the root cause of network failure conditions.</p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-colors shadow-sm">
                <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Activity className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-[14px] font-black text-slate-900 dark:text-white mb-2">Predictive Diagnostics</h3>
                <p className="text-[12px] text-slate-500 dark:text-slate-400">Transform reactive monitoring into proactive alerts with advanced continuous predictive algorithms.</p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'architecture',
        title: 'System Architecture',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Core Architecture</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px] mb-6">
              Our platform operates through a strict deterministic pipeline consisting of Parsing, Deduplication, Suppression, Machine Learning Correlation, and User Remediation.
            </p>
            <div className="p-6 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Settings size={120} />
              </div>
              <ul className="space-y-4 relative z-10 text-sm font-medium text-slate-700 dark:text-slate-200">
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">1</div>
                  Ingestion & Normalization
                </li>
                <li className="flex items-center gap-3 pl-4 border-l-2 border-blue-500/30 ml-4 py-2">
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">2</div>
                  Event Processing Rules (Deduplication / Suppression)
                </li>
                <li className="flex items-center gap-3 pl-4 border-l-2 border-purple-500/30 ml-4 py-2">
                  <div className="h-8 w-8 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">3</div>
                  Live AI Correlation & Topology Mapping
                </li>
                <li className="flex items-center gap-3 pl-4 border-l-2 border-orange-500/30 ml-4 pt-2 pb-4">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">4</div>
                  Remediation & Escalation Triggering
                </li>
              </ul>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'dashboards',
    title: 'Visual Dashboards',
    icon: LayoutDashboard,
    sections: [
      {
        id: 'aiops',
        title: 'AIOPS Dashboard',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">AIOps Telemetry</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
              The default landing zone. Analyzes holistic fleet health, including critical event volume across infrastructure categories and multi-domain event correlation efficiency.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-full h-48 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
                <span className="text-sm font-bold text-indigo-500 uppercase tracking-widest">Global Aggregation View</span>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'topology',
        title: 'Topology Dashboard',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Network Topology Mapping</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
              Visualize how failing nodes cascade outages across adjacent layers (Access -{'>'} Distribution -{'>'} Core). Interactive nodal mapping automatically overlays SLA impacts based on degraded route paths.
            </p>
          </div>
        )
      },
      {
        id: 'roi',
        title: 'ROI/KPI Dashboard',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Return on Investment (ROI)</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
              Tracks business-layer metrics including total Mean Time To Resolution (MTTR) eliminated via automated orchestration, noise reduction percentages, and total FTE hours saved over periods.
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: 'events',
    title: 'Event Intelligence',
    icon: Search,
    sections: [
      {
        id: 'correlation',
        title: 'Correlation Patterns',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Pattern Library</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px] mb-4">
              The correlation catalog maintains dynamic signature rules generated by the AI system (e.g. tracking BGP flap sequences that inevitably result in a Route Defect event).
            </p>
            <div className="bg-[#111827] text-white p-5 rounded-xl font-mono text-sm border border-white/10">
              {'1. BGP_Peering_Down -> 2. Route_Withdrawal -> 3. Critical_SLA_Breach'}
            </div>
          </div>
        )
      },
      {
        id: 'anomalies',
        title: 'Anomaly Detection',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Anomalous Behavior</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
              Highlights network devices operating systematically outside defined baselines (e.g. Memory leaking slowly over 15 days, or isolated traffic load inconsistencies during expected low-volume periods).
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: 'playground',
    title: 'Policy Management',
    icon: Shield,
    sections: [
      {
        id: 'dedup',
        title: 'Event Deduplication',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Deduplication Pipelines</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
              Configure sliding time-windows, strict-match fields, and fuzzy-logic operators to bundle identical alarms from misconfigured alert managers.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold font-mono">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded">IDENTIFIER</span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded">TIMEFRAME</span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded">SEVERITY CONFLICT RULES</span>
            </div>
          </div>
        )
      },
      {
        id: 'suppression',
        title: 'Event Suppression',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Suppression Mechanisms</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
              Enforce blackouts for scheduled maintenance windows. Automatically discard alarms triggering from devices tagged in "Deployment" or "Maintenance" CMDB states.
            </p>
          </div>
        )
      }
    ]
  }
];

export default function DocsPage() {
  const [activeCategory, setActiveCategory] = useState(DOC_CATEGORIES[0]);
  const [activeSection, setActiveSection] = useState(DOC_CATEGORIES[0].sections[0]);

  return (
    <MainLayout>
      <div className="flex h-full bg-slate-50 dark:bg-[#0B0F19]">
        {/* DOCTREE SIDEBAR */}
        <div className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0B0F19] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
              <BookMarked size={14} className="text-blue-500" />
              Documentation
            </h3>

            <div className="space-y-8">
              {DOC_CATEGORIES.map((cat) => (
                <div key={cat.id} className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <cat.icon size={16} className="text-slate-400" />
                    <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-300">{cat.title}</h4>
                  </div>

                  <div className="space-y-1 ml-4 border-l border-slate-200 dark:border-white/10 pl-3 relative">
                    {cat.sections.map((sec) => {
                      const isActive = activeSection.id === sec.id;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => {
                            setActiveCategory(cat);
                            setActiveSection(sec);
                          }}
                          className={cn(
                            "w-full text-left py-1.5 px-3 rounded-md text-[13px] transition-all relative",
                            isActive
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-medium"
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeDocIndicator"
                              className="absolute left-[-13px] top-[10px] w-[3px] h-3 bg-blue-500 rounded-r-md"
                            />
                          )}
                          {sec.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DOC MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div className="max-w-4xl mx-auto p-12 lg:p-16">
            <div className="mb-6 flex items-center gap-3 text-[12px] font-bold text-slate-400 tracking-wider uppercase">
              <span>{activeCategory.title}</span>
              <ChevronRight size={14} />
              <span className="text-blue-500">{activeSection.title}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection.content}
              </motion.div>
            </AnimatePresence>

            <div className="mt-24 pt-8 border-t border-slate-200 dark:border-white/10 text-center">
              <p className="text-slate-400 text-[12px] font-medium">Have questions? Please consult the administrative documentation panel.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
