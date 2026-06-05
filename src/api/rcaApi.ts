import axios from 'axios';

// Use environment variables for API base URL and endpoint to avoid hardcoding
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL || API_BASE_URL === 'undefined') API_BASE_URL = 'http://localhost:8001';

let RAG_API_ENDPOINT = import.meta.env.VITE_RAG_API_ENDPOINT;
if (!RAG_API_ENDPOINT || RAG_API_ENDPOINT === 'undefined') RAG_API_ENDPOINT = '/api/rag/analyze';

let RCA_API_ENDPOINT = import.meta.env.VITE_RCA_API_ENDPOINT;
if (!RCA_API_ENDPOINT || RCA_API_ENDPOINT === 'undefined') RCA_API_ENDPOINT = '/api/rca/run-flow';

export const runRcaFlow = async (file: File) => {
    if (!API_BASE_URL || !RCA_API_ENDPOINT) {
        throw new Error('RCA API configurations are missing in the .env file.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}${RCA_API_ENDPOINT}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const updateRcaConfig = async (configData: any) => {
    const response = await axios.post('/rag-api/config', configData, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const runRagAnalysis = async (payload: any) => {
    if (!API_BASE_URL || !RAG_API_ENDPOINT) {
        throw new Error('RAG API configurations are missing in the .env file.');
    }

    const response = await axios.post(`${API_BASE_URL}${RAG_API_ENDPOINT}`, payload, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};

export const runRagV6Analysis = async (payload: any, runConfig?: any) => {
    // Use the Vite dev-server proxy (/rag-api → http://10.0.4.161:8000)
    const requestBody = {
        ...payload,
        run_config: runConfig || {}
    };

    const response = await axios.post(`/rag-api/rca`, requestBody, {
        headers: { 'Content-Type': 'application/json' },
    });

    const raw = response.data;

    // ─── Response Adapter ──────────────────────────────────────────────────────
    // Actual API response shape (confirmed from /rca endpoint):
    // {
    //   success, elapsed_time,
    //   rca_results: [{ doc, final_score, confidence, cross_encoder_score,
    //                   prerank_score, log_features, query_metrics, reranker_used }],
    //   remedy_results: [],
    //   ui_response: { incident_summary, total_rca_count, target_vendors, diagnoses },
    //   rag_query: { semantic_text, keyword_string, log_features, entities, ... }
    // }

    const rcaResults: any[] = raw.rca_results || [];
    const uiResponse = raw.ui_response || {};
    const ragQuery = raw.rag_query || {};

    // Collect all log_features/templates across all rca_results for the Drain3 panel
    // Use the first result's log_features (they come from the same input logs)
    const allLogFeatures: any[] = rcaResults.length > 0
        ? (rcaResults[0].log_features || ragQuery.log_features || [])
        : (ragQuery.log_features || []);

    // Build diagnoses — prefer ui_response.diagnoses if present, otherwise build from rca_results
    const uiDiagnoses = uiResponse.diagnoses || [];
    const diagnoses = uiDiagnoses.length > 0
        ? uiDiagnoses.map((d: any, idx: number) => {
            // Match ui_response diagnosis back to its rca_result for log_features
            const matchingResult = rcaResults[idx] || rcaResults[0] || {};
            return {
                ...d,
                rank: idx + 1,
                confidence: matchingResult.confidence || d.confidence || 0,
                cross_encoder_score: matchingResult.cross_encoder_score || 0,
                hybrid_score: matchingResult.prerank_score || 0,
                relevant_logs: d.relevant_logs || matchingResult.log_features || [],
            };
        })
        : rcaResults.map((r: any, idx: number) => {
            const doc = r.doc?.raw || r.doc || r;
            return {
                rank: idx + 1,
                rca_id: doc.rca_id || doc._id || `rca-${idx}`,
                title: doc.title || doc.rca_id || 'Unknown',
                description: doc.description || '',
                root_cause_analysis: doc.root_cause_analysis || doc.description || '',
                confidence: r.confidence || r.cross_encoder_score || r.final_score || 0,
                hybrid_score: r.prerank_score || 0,
                cross_encoder_score: r.cross_encoder_score || 0,
                keywords: doc.keywords || [],
                hypotheses: doc.hypotheses || [],
                situation: doc.situation || {},
                metadata: doc.metadata || {},
                relevant_logs: r.relevant_logs || r.log_features || [],   // ← actual field name from API
                remedies: r.remedies || [],
                doc,
                ...r,
            };
        });

    const rawAnomalies = raw.anomalies || uiResponse.anomalies || raw.metric_facts || ragQuery.metric_facts || [];
    const anomalies = rawAnomalies.map((a: any) => ({
        metric: a.metric || '',
        entity: a.entity || '',
        direction: (a.direction || '').toLowerCase(),
        change_pct: a.change_pct !== undefined ? a.change_pct : (a.value || 0),
        z_score: a.z_score !== undefined ? a.z_score : (a.score || 0),
        ...a
    }));

    return {
        success: raw.success,
        search_results: rcaResults,
        results: rcaResults,
        diagnoses,
        total_rca_count: uiResponse.total_rca_count || diagnoses.length,
        elapsed_ms: Math.round((raw.elapsed_time || 0) * 1000),
        // Drain3 log clusters panel
        templates: allLogFeatures,
        log_features: allLogFeatures,
        // Query panels (correct field names from rag_query)
        query: {
            semantic_text: ragQuery.semantic_text || '',
            keyword_string: ragQuery.keyword_string || '',
            entities: ragQuery.entities || {},
            ...ragQuery,
        },
        entities: ragQuery.entities || {},
        // Other fields
        llm_usage: raw.llm_usage || uiResponse.llm_usage || {},
        anomalies,
        incident_summary: uiResponse.incident_summary || '',
        target_vendors: uiResponse.target_vendors || [],
        _raw: raw,
    };
};


export const fetchRAGKB = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/rag/kb/`);
    return response.data;
};

export const saveRAGKBEntry = async (entry: any, isNew: boolean) => {
    if (isNew) {
        const response = await axios.post(`${API_BASE_URL}/api/rag/kb/`, entry);
        return response.data;
    } else {
        const response = await axios.put(`${API_BASE_URL}/api/rag/kb/`, entry);
        return response.data;
    }
};

export const deleteRAGKBEntry = async (docId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/api/rag/kb/`, {
        params: { id: docId }
    });
    return response.data;
};

// ─── Remedy KB API ─────────────────────────────────────────────────────────────

export const fetchRemedyKB = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/remedy/kb/`);
    return response.data;
};

export const saveRemedyKBEntry = async (entry: any, isNew: boolean) => {
    if (isNew) {
        const response = await axios.post(`${API_BASE_URL}/api/remedy/kb/`, entry);
        return response.data;
    } else {
        const response = await axios.put(`${API_BASE_URL}/api/remedy/kb/`, entry);
        return response.data;
    }
};

export const deleteRemedyKBEntry = async (remedyId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/api/remedy/kb/`, {
        params: { id: remedyId }
    });
    return response.data;
};

