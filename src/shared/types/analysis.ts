
export interface CorrelationRow {
  metricA: string;
  metricB: string;
  lag: string;
  pearson: number;
  spearman: number;
  interpretation: string;
}

export interface CorrelationFinding {
  metricA: string;
  metricB: string;
  lag: string;
  r: number;
}

export interface CorrelationSession {
  deviceType: string;
  results: CorrelationRow[];
  findings: CorrelationFinding[];
}

export interface GrangerRow {
  cause: string;
  effect: string;
  lag: string;
  fStat: number;
  pVal: number;
  significant: boolean;
}

export interface GrangerSession {
  deviceType: string;
  results: GrangerRow[];
  significantPairs: {
    cause: string;
    effect: string;
    p: number;
    lag: string;
  }[];
}

export interface MetricBehavior {
  metric: string;
  normalAvg: number;
  preEventAvg: number;
  change: string;
  changePct: string;
  direction: 'UP' | 'DOWN';
}

export interface BehaviorPattern {
  event: string;
  occurrences: number;
  preEventWindows: number;
  normalWindows: number;
  metrics: MetricBehavior[];
}

export interface AnalysisReports {
  cross_correlation: CorrelationSession[];
  granger_causality: GrangerSession[];
  pre_event_behavior: BehaviorPattern[];
  // ... other types can be added as we structure them
}
