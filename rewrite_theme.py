import re

path = r"d:\Rnd files\event-analytics-main\src\features\analytics\pages\KpiDashboard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    (r"bg-\[\#0B0F19\]", "bg-slate-50 dark:bg-[#0B0F19]"),
    (r"bg-\[\#111827\]/50", "bg-white dark:bg-[#111827]/50"),
    (r"bg-\[\#111827\](?!\/)", "bg-white dark:bg-[#111827]"),
    (r"bg-\[\#0F172A\]", "bg-slate-50 dark:bg-[#0F172A]"),
    (r"bg-white/\[0\.02\]", "bg-slate-100/50 dark:bg-white/[0.02]"),
    (r"border-white/5(?!0)", "border-slate-200 dark:border-white/5"),
    (r"border-white/10", "border-slate-300 dark:border-white/10"),
    (r"border-white/20", "border-slate-300 dark:border-white/20"),
    (r"border-\[\#1E293B\]", "border-slate-200 dark:border-[#1E293B]"),
    (r"(?<!dark:)text-white(?![A-Za-z0-9\-\/])", "text-slate-900 dark:text-white"),
    (r"(?<!dark:)text-slate-200(?![A-Za-z0-9\-\/])", "text-slate-700 dark:text-slate-200"),
    (r"(?<!dark:)text-slate-300(?![A-Za-z0-9\-\/])", "text-slate-600 dark:text-slate-300"),
    (r"(?<!dark:)text-slate-400(?![A-Za-z0-9\-\/])", "text-slate-500 dark:text-slate-400"),
    (r"(?<!dark:)text-slate-500(?![A-Za-z0-9\-\/])", "text-slate-400 dark:text-slate-500"),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print('Success')
