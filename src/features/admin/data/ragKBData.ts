// RAG KB Interfaces based on User Design Prompt
export interface RAGKBSignal {
  metric: string;
  op: '==' | '!=' | '<' | '>' | '<=' | '>=';
  value: string | number;
  weight: number;
}

export interface RAGKBHypothesis {
  id: string;
  description: string;
  log_patterns: {
    pattern: string;
    weight: number;
  }[];
}

export interface RAGKBEntry {
  doc_id: string;
  intent_id: string;
  category: string;
  sub_category: string;
  issue_group: string;
  metric_family: string;
  description: string;
  keywords: string[];
  distinguishing_clues: string[];
  negative_clues: string[];
  signals: RAGKBSignal[];
  hypotheses: RAGKBHypothesis[];
  metadata: {
    domain: string;
    severity: string;
    created_by: string;
    created_at: string;
    version: number;
    is_latest: boolean;
    status: string;
  };
}

export interface CategoryStats {
  name: string;
  count: number;
  description: string;
  icon: string; // 2-letter abbreviation
  metricFamilies: string[];
  colorScheme: {
    bg: string;
    text: string;
    accent: string;
  };
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; accent: string; icon: string; description: string }> = {
  link: {
    icon: 'LK',
    description: 'Physical and logical link state intents',
    bg: '#E6F1FB', text: '#0C447C', accent: '#185FA5'
  },
  optical: {
    icon: 'OP',
    description: 'Optical layer and transceiver diagnostics',
    bg: '#E1F5EE', text: '#085041', accent: '#1D9E75'
  },
  bgp: {
    icon: 'BG',
    description: 'BGP peering and adjacency monitoring',
    bg: '#EEEDFE', text: '#26215C', accent: '#534AB7'
  },
  hardware: {
    icon: 'HW',
    description: 'Chassis, fan, and power supply health',
    bg: '#FAECE7', text: '#4A1B0C', accent: '#D85A30'
  },
  mpls: {
    icon: 'MP',
    description: 'MPLS label switching and LSP diagnostics',
    bg: '#FAEEDA', text: '#633806', accent: '#BA7517'
  },
  interface: {
    icon: 'IF',
    description: 'Generic interface throughput and error stats',
    bg: '#F1EFE8', text: '#2C2C2A', accent: '#5F5E5A'
  }
};
