import { AnalysisReports, CorrelationSession, GrangerSession, BehaviorPattern } from "@/types/analysis";

export function renderCorrelationSession(session: CorrelationSession): string[] {
  const lines: string[] = [];
  lines.push(`==============================================================================`);
  lines.push(` SECTION 1 — CROSS-CORRELATION [${session.deviceType}]`);
  lines.push(`==============================================================================`);
  lines.push(``);
  lines.push(`  Metric A               Metric B                 Best Lag  Pearson r  Spearman r  Interpretation`);
  lines.push(`  ------------------------------------------------------------------------------`);
  
  session.results.forEach(row => {
    lines.push(`  ${row.metricA.padEnd(22)} ${row.metricB.padEnd(24)} ${row.lag.padEnd(10)} ${row.pearson.toFixed(4).padStart(10)} ${row.spearman.toFixed(4).padStart(10)}  ${row.interpretation}`);
  });
  
  lines.push(``);
  lines.push(`  ------------------------------------------------------------------------------`);
  lines.push(`  DEVICE TYPE: ${session.deviceType}`);
  lines.push(`  ------------------------------------------------------------------------------`);
  lines.push(``);
  lines.push(`  ------------------------------------------------------------------------------`);
  lines.push(`  Cross-Correlation Key Findings`);
  lines.push(`  ------------------------------------------------------------------------------`);
  
  session.findings.forEach(f => {
    lines.push(`  ${f.metricB} LEADS ${f.metricA} by ${f.lag} (r=${f.r})`);
  });
  
  lines.push(``);
  return lines;
}

export function renderGrangerSession(session: GrangerSession): string[] {
  const lines: string[] = [];
  lines.push(`==============================================================================`);
  lines.push(` SECTION 2 — GRANGER CAUSALITY [${session.deviceType}]`);
  lines.push(`==============================================================================`);
  lines.push(``);
  lines.push(`  Cause                  Effect                   Best Lag   F-stat      p-value  Result`);
  lines.push(`  ------------------------------------------------------------------------------`);
  
  session.results.forEach(row => {
    const resultStr = row.significant ? "*** SIGNIFICANT ***" : "not significant";
    lines.push(`  ${row.cause.padEnd(22)} ${row.effect.padEnd(24)} ${row.lag.padEnd(10)} ${row.fStat.toFixed(3).padStart(8)} ${row.pVal.toFixed(6).padStart(12)}  ${resultStr}`);
  });

  lines.push(``);
  lines.push(`  ------------------------------------------------------------------------------`);
  lines.push(`  Granger Causality Significant Pairs`);
  lines.push(`  ------------------------------------------------------------------------------`);
  
  session.significantPairs.forEach(p => {
    lines.push(`  ${p.cause}->${p.effect}  p=${p.p}  lag=${p.lag}  *** SIGNIFICANT`);
  });

  lines.push(``);
  return lines;
}

// Add more renderers as needed for other sections...
