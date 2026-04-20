-- 1. Ensure vector extension is enabled FIRST (before table creation)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the table
CREATE TABLE historical_rca_cases (
    id UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),      -- for time-series + freshness
    incident_id TEXT NOT NULL,                          -- e.g., "NET-2025-1142"
    device      TEXT NOT NULL,                          -- e.g., "core-router-dc1"
    interface   TEXT,                                   -- e.g., "Gi0/1/0" (nullable for non-interface issues)
    situation_summary TEXT NOT NULL,                    -- concise LLM-generated summary for embedding
    root_cause_prediction TEXT NOT NULL,                 -- the inferred/predicted root cause
    embedding VECTOR(768) NOT NULL,                     -- from text-embedding model (e.g., OpenAI)
    intent      TEXT NOT NULL,                          -- e.g., "performance"
    subintent   TEXT NOT NULL,                          -- e.g., "congestion"
    remediation TEXT NOT NULL,                          -- what fixed it (used by Remediator LLM)
    confidence_score FLOAT NOT NULL,
    resolved_at TIMESTAMPTZ,
    metadata JSONB,                                     -- additional context if needed
    PRIMARY KEY (id, created_at)    
);

-- Optional:
-- if recieve error type vector does not exist then run:
-- Inside your database, enable the vector extension and then try again to create table
CREATE EXTENSION vector;

-- 3. Convert to hypertable (MUST happen before creating indexes on time-partitioned data)
SELECT create_hypertable('historical_rca_cases', 'created_at');

-- 4. B-tree indexes for fast filtering
CREATE INDEX idx_rca_device_interface ON historical_rca_cases (device, interface) WHERE interface IS NOT NULL;
CREATE INDEX idx_rca_intent_subintent ON historical_rca_cases (intent, subintent);
-- CREATE INDEX idx_rca_confidence ON historical_rca_cases (confidence_score DESC);

-- 🧠 Vector index for similarity search
CREATE INDEX idx_rca_embedding ON historical_rca_cases 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 8); -- Adjust 'lists' based on dataset size for performance