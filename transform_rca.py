import re
import os

filepath = 'src/components/admin/RcaKBSection.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace('RemedyKBEntry', 'KBEntry')

# Remove JSON imports
content = re.sub(r'// ─── Static JSON Imports ───.*?// ─── Types ───', '// ─── Types ───', content, flags=re.DOTALL)

# 2. Type KBEntry
kb_entry_type = """
export interface KBEntry {
    _id: string;
    doc_id?: string;
    rca_id: string;
    title: string;
    description: string;
    root_cause_analysis: string;
    situation: {
        symptoms: string[];
        negative_indicators: string[];
        log_patterns: string[];
        metrics: { metric: string; op: string; value: string | number; weight: number }[];
        affected_components: string[];
    };
    hypotheses: { id: string; description: string; weight: number; log_patterns: string[] }[];
    keywords: string[];
    render_template: string;
    metadata: {
        domain: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
        version: number;
        is_latest: boolean;
        status: string;
        created_at: string;
        updated_at: string;
        created_by: string;
    };
    category_hierarchy: { domain: string; category: string; subcategory: string };
}
"""

content = re.sub(r'export interface KBEntry \{.*?\n\}', kb_entry_type, content, flags=re.DOTALL)

# 3. DOMAIN_COLORS instead of VENDOR_COLORS
content = content.replace('const VENDOR_COLORS', 'const DOMAIN_COLORS')
content = content.replace('VENDOR_COLORS', 'DOMAIN_COLORS')
content = content.replace("cisco:", "Network:")
content = content.replace("juniper:", "Compute:")
content = content.replace("'palo alto':", "Storage:")
content = content.replace("arista:", "Application:")
content = content.replace("generic:", "Security:")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
