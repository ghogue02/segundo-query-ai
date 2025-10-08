-- Migration: Task Pattern Analysis
-- Purpose: Store cohort-level text pattern insights
-- Run daily at 8am EST to analyze aggregate submission patterns

CREATE TABLE IF NOT EXISTS task_pattern_analysis (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id),
  cohort VARCHAR(50) NOT NULL,

  -- Metadata
  total_submissions INTEGER NOT NULL,
  analysis_date DATE NOT NULL,

  -- Pattern insights (JSON)
  interaction_patterns JSONB,
  -- Example: {
  --   "common_approaches": ["web-based MVP", "mobile app", "API-first"],
  --   "avg_word_count": 245,
  --   "response_length": {"min": 12, "max": 850, "median": 180},
  --   "submission_times": {"peak_hour": 20, "weekend_pct": 35}
  -- }

  understanding_distribution JSONB,
  -- Example: {
  --   "deep": {"count": 32, "percentage": 42, "indicators": ["examples provided", "critical analysis"]},
  --   "partial": {"count": 27, "percentage": 35, "indicators": ["surface level", "missing key concepts"]},
  --   "struggling": {"count": 13, "percentage": 18, "indicators": ["confusion evident", "off-topic"]}
  -- }

  quality_patterns JSONB,
  -- Example: {
  --   "high_quality_pct": 42,
  --   "medium_quality_pct": 35,
  --   "low_quality_pct": 18,
  --   "differentiators": ["depth of examples", "critical thinking", "completeness"]
  -- }

  red_flags JSONB,
  -- Example: {
  --   "short_responses": {"count": 12, "threshold": 50, "user_ids": [241, 252, ...]},
  --   "similar_wording": {"groups": 3, "similarity_threshold": 0.85},
  --   "common_misconceptions": [
  --     {"misconception": "MVP = incomplete product", "occurrence_count": 23},
  --     {"misconception": "validation = surveys only", "occurrence_count": 18}
  --   ],
  --   "ai_overuse_indicators": {"count": 8, "patterns": ["generic phrasing", "no personalization"]}
  -- }

  recommendations TEXT[],
  -- Example: ["Add MVP definition examples", "Clarify 'minimum' vs 'incomplete'", "Review with struggling builders"]

  -- AI Analysis metadata
  analyzed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  analysis_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
  ai_model VARCHAR(100) NOT NULL DEFAULT 'claude-3-5-sonnet-20241022',

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_task_cohort_date UNIQUE(task_id, cohort, analysis_date)
);

-- Indexes for performance
CREATE INDEX idx_pattern_task_cohort ON task_pattern_analysis(task_id, cohort);
CREATE INDEX idx_pattern_analysis_date ON task_pattern_analysis(analysis_date DESC);
CREATE INDEX idx_pattern_cohort ON task_pattern_analysis(cohort);

-- Enable automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_pattern_analysis_updated_at
  BEFORE UPDATE ON task_pattern_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE task_pattern_analysis IS 'Stores cohort-level text pattern analysis for tasks. Runs daily at 8am EST.';
COMMENT ON COLUMN task_pattern_analysis.interaction_patterns IS 'How builders interacted with the task (approaches, length, timing)';
COMMENT ON COLUMN task_pattern_analysis.understanding_distribution IS 'Distribution of deep/partial/struggling understanding across cohort';
COMMENT ON COLUMN task_pattern_analysis.quality_patterns IS 'Quality distribution and what differentiates high vs low quality';
COMMENT ON COLUMN task_pattern_analysis.red_flags IS 'Anomalies: short responses, similar wording, misconceptions, AI overuse';
COMMENT ON COLUMN task_pattern_analysis.recommendations IS 'Actionable suggestions for facilitators and curriculum designers';
