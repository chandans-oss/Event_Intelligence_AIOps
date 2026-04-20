const fs = require('fs');

const path = 'd:/Rnd files/event-analytics-main/src/features/analytics/pages/KpiDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
    [/bg-\[\#0B0F19\]/g, 'bg-slate-50 dark:bg-[#0B0F19]'],
    [/bg-\[\#111827\]\/50/g, 'bg-white dark:bg-[#111827]/50'],
    [/bg-\[\#111827\](?!\/)/g, 'bg-white dark:bg-[#111827]'],
    [/bg-\[\#0F172A\]/g, 'bg-slate-50 dark:bg-[#0F172A]'],
    [/bg-white\/\[0\.02\]/g, 'bg-slate-100 dark:bg-white/[0.02]'],
    [/border-white\/5(?!0)/g, 'border-slate-200 dark:border-white/5'],
    [/border-white\/10/g, 'border-slate-300 dark:border-white/10'],
    [/border-white\/20/g, 'border-slate-300 dark:border-white/20'],
    [/border-\[\#1E293B\]/g, 'border-slate-200 dark:border-[#1E293B]'],
    [/(?<!dark:)text-white(?![A-Za-z0-9\-\/])/g, 'text-slate-900 dark:text-white'],
    [/(?<!dark:)text-slate-200(?![A-Za-z0-9\-\/])/g, 'text-slate-700 dark:text-slate-200'],
    [/(?<!dark:)text-slate-300(?![A-Za-z0-9\-\/])/g, 'text-slate-600 dark:text-slate-300'],
    [/(?<!dark:)text-slate-400(?![A-Za-z0-9\-\/])/g, 'text-slate-500 dark:text-slate-400']
];

for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
}

// Special fixes for node properties which take an explicit stroke/fill which don't support tailwind dark mode:
// Recharts doesn't natively support classNames nicely for all SVG colors without explicitly passing CSS variables.
// A simpler robust way? Leave Recharts node stroke as '#0F172A'. Wait, what if the chart is on white bg? 
// The stroke is `#0F172A` (dark blue). On a light background, a dark border is actually perfect!
// The tooltip background can be dynamic but for now let's leave it as is.
// Let's write the content back.
fs.writeFileSync(path, content, 'utf8');
console.log('Saved properly!');
