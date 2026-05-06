import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatMetricLabel = (str: string) => {
    if (!str) return '';
    const map: Record<string, string> = {
        'cpu_pct': 'CPU Util',
        'cpu_util': 'CPU Util',
        'cpu_percent': 'CPU Util',
        'cpu': 'CPU Util',
        'crc_errors': 'CRC Errors',
        'crc_error': 'CRC Errors',
        'crc': 'CRC Errors',
        'queue_depth': 'Buffer Util',
        'buffer_util': 'Buffer Util',
        'latency_ms': 'Latency',
        'latency': 'Latency',
        'lat_ms': 'Latency',
        'lat': 'Latency',
        'util_pct': 'B/W Util',
        'utilization_percent': 'B/W Util',
        'util': 'B/W Util',
        'mem_util_pct': 'Mem Util',
        'mem_util': 'Mem Util',
        'mem_percent': 'Mem Util',
        'men_util_pct': 'Mem Util',
        'bw_util': 'B/W Util'
    };

    const lower = str.toLowerCase();
    if (map[lower]) return map[lower];

    return str
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/(^|[^a-zA-Z0-9])([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase())
        .replace(/Cpu/g, 'CPU')
        .replace(/Crc/g, 'CRC')
        .replace(/Queue Depth/g, 'Buffer Util')
        .replace(/Latency Ms/g, 'Latency')
        .replace(/Util Pct/g, 'B/W Util')
        .replace(/Cpu Pct/g, 'CPU Util')
        .replace(/Mem Util Pct/g, 'Mem Util')
        .replace(/Men Util Pct/g, 'Mem Util');
};

export function getPunchyTitle(title: string, tags?: string[]) {
    const ACRONYMS = [
        'CPU', 'RCA', 'CRC', 'SLA', 'BGP', 'DNS', 'IP', 'NFS', 'QOS', 'TCP', 'UDP', 
        'LOS', 'PSU', 'RMA', 'STP', 'VLAN', 'AIOPS', 'ML', 'AI', 'WAN', 'LAN', 'OSPF', 
        'DSCP', 'EF', 'LLQ', 'MTU', 'MSS', 'ACL', 'BFD', 'SPF', 'NSF', 'EWMA', 'STL'
    ];

    const smartCapitalize = (word: string) => {
        if (!word) return '';
        const upper = word.toUpperCase();
        // Handle plural acronyms like CRCs
        const singularUpper = upper.endsWith('S') ? upper.slice(0, -1) : upper;
        
        if (ACRONYMS.includes(upper) || ACRONYMS.includes(singularUpper)) {
            return upper;
        }
        
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    };

    // Use first tag if available as it's usually punchy, but only if it's not a single tiny word
    if (tags && tags.length > 0) {
        const tag = tags[0];
        const tagWords = tag.split(/[-_]/).filter(w => w.length >= 2);
        // If tag is long enough or has multiple words, use it
        if (tagWords.length >= 2 || (tagWords.length === 1 && tagWords[0].length > 4)) {
            return tagWords.map(smartCapitalize).join(' ');
        }
    }

    // Fallback: Extract from title by removing question junk
    let res = title
        .replace(/^Why (is|does|are|do|has|can|should) an? /i, '')
        .replace(/^How (to|do I|can I) /i, '')
        .replace(/^Is (there|an?) /i, '')
        .replace(/^Resolving /i, '')
        .replace(/^Handling /i, '')
        .replace(/^Troubleshooting /i, '')
        .replace(/^Investigating /i, '')
        .replace(/ — (what|how|is|could|is| triage) .*$/i, '')
        .replace(/\?$/, '')
        .trim();

    const words = res.split(/\s+/).filter(w => w.length > 0);
    
    // Ensure 2-3 words
    let selectedWords;
    if (words.length <= 2) {
        selectedWords = words;
    } else {
        selectedWords = words.slice(0, 3);
    }
    
    // If only one word remains, try to add back some context or keep it
    if (selectedWords.length === 1 && words.length > 1) {
        selectedWords = words.slice(0, 2);
    }
    
    return selectedWords.map(smartCapitalize).join(' ');
}
