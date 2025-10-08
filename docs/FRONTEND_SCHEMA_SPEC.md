# Assessment Analysis System - Database Schema for Frontend Development

**Date**: September 18, 2025  
**Purpose**: Frontend integration specification for assessment analysis system  
**Developer**: Frontend team integration guide  

## Overview

The assessment analysis system has been enhanced with comprehensive AI-powered analysis and holistic feedback generation. This document outlines the new database schema, API endpoints, and data structures for frontend integration.

---

## 🗄️ Database Schema Changes

### New Tables Created

The system creates **4 new BigQuery tables** in the `pursuit-ops.pilot_agent_public` dataset:

#### 1. `comprehensive_assessment_analysis`
**Purpose**: Individual assessment results with AI analysis  
**Primary Key**: `submission_id`  
**Created By**: Comprehensive assessment analyzer  

```sql
CREATE TABLE `pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis` (
  submission_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  assessment_id INTEGER NOT NULL,
  assessment_type STRING,              -- "quiz", "project", "problem_solution", "video"
  assessment_name STRING,              -- Human-readable name
  submitted_at TIMESTAMP,
  user_first_name STRING,
  user_last_name STRING,
  user_email STRING,
  user_cohort STRING,
  user_role STRING,
  overall_score FLOAT,                 -- 0.0 to 1.0
  feedback STRING,                     -- AI-generated detailed feedback
  type_specific_data STRING,           -- JSON string with assessment-specific data
  analysis_timestamp TIMESTAMP,
  analyzer_version STRING
);
```

#### 2. `assessment_analysis` 
**Purpose**: Detailed quiz assessment results (Assessment 1 only)  
**Primary Key**: `submission_id`  
**Created By**: Assessment grader for quiz-type assessments  

```sql
CREATE TABLE `pursuit-ops.pilot_agent_public.assessment_analysis` (
  submission_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  assessment_id INTEGER,
  submitted_at TIMESTAMP,
  user_first_name STRING,
  user_last_name STRING,
  user_email STRING,
  user_cohort STRING,
  user_role STRING,
  overall_score FLOAT,                 -- 0.0 to 1.0
  section_scores STRING,               -- JSON: section-by-section breakdown
  question_scores STRING,              -- JSON: individual question results
  feedback STRING,                     -- Generated feedback text
  total_time_seconds FLOAT,
  section_times STRING,                -- JSON: timing per section
  question_times STRING,               -- JSON: timing per question
  response_data STRING,                -- Original response JSON
  analysis_timestamp TIMESTAMP,
  grading_version STRING
);
```

#### 3. `holistic_assessment_feedback`
**Purpose**: Cross-assessment holistic feedback summaries  
**Primary Key**: `user_id`  
**Created By**: Holistic feedback analyzer  

```sql
CREATE TABLE `pursuit-ops.pilot_agent_public.holistic_assessment_feedback` (
  user_id INTEGER NOT NULL,
  user_first_name STRING,
  user_last_name STRING,
  user_email STRING,
  user_cohort STRING,
  total_assessments INTEGER,
  average_score FLOAT,                 -- 0.0 to 1.0
  strengths_summary STRING,            -- "You consistently demonstrate..." paragraph
  growth_areas_summary STRING,        -- "The most exciting opportunity..." paragraph
  included_assessments STRING,        -- JSON array of assessment details
  assessment_scores STRING,           -- JSON object with individual scores
  analysis_timestamp TIMESTAMP,
  analyzer_version STRING
);
```

#### 4. `assessment_insights`
**Purpose**: Summary statistics and insights from analysis runs  
**Primary Key**: `analysis_run_id`  
**Created By**: Assessment evaluator for aggregate insights  

```sql
CREATE TABLE `pursuit-ops.pilot_agent_public.assessment_insights` (
  analysis_run_id STRING NOT NULL,
  total_assessments_analyzed INTEGER,
  average_overall_score FLOAT,
  min_overall_score FLOAT,
  max_overall_score FLOAT,
  score_distribution STRING,           -- JSON: score distribution data
  section_performance STRING,          -- JSON: section-level performance stats
  time_analysis STRING,                -- JSON: timing analysis
  analysis_timestamp TIMESTAMP
);
```

---

## 📊 Assessment Types & Data Structure

### Assessment Type Mapping
```javascript
const ASSESSMENT_TYPES = {
  1: {
    name: "Multiple Choice & Self-Assessment",
    type: "quiz",
    analyzer: "Quiz grader with rubric-based scoring"
  },
  2: {
    name: "Project Submission", 
    type: "project",
    analyzer: "AI analysis of code/files + conversation data"
  },
  3: {
    name: "Problem-Solution Analysis",
    type: "problem_solution", 
    analyzer: "AI analysis of text-based submissions"
  },
  4: {
    name: "Video Presentation",
    type: "video",
    analyzer: "AI analysis of Loom video transcripts"
  }
}
```

### Type-Specific Data Structures

#### Assessment 1 (Quiz) - `type_specific_data`
```json
{
  "section_breakdown": {
    "1": {"name": "Product & Business Thinking", "score": 0.85, "questions": 3},
    "2": {"name": "Professional & Learning Skills", "score": 0.72, "questions": 2},
    "3": {"name": "AI Direction & Collaboration", "score": 0.91, "questions": 2},
    "4": {"name": "Technical Concepts & Integration", "score": 0.68, "questions": 2}
  },
  "timing_analysis": {
    "total_time_seconds": 318.057,
    "average_time_per_question": 35.34,
    "section_times": {"1": 85.575, "2": 134.283, "3": 28.364, "4": 69.837}
  },
  "self_assessment_responses": {
    "question_1": {"text": "I demonstrate ability to identify...", "score": 4},
    "question_3": {"text": "I demonstrate strong time management...", "score": 5}
  }
}
```

#### Assessment 2 (Project) - `type_specific_data`
```json
{
  "submission_type": "github_and_files",
  "has_github": true,
  "github_url": "https://github.com/user/project",
  "file_count": 3,
  "conversation_length": 245,
  "technical_scores": {
    "technical_implementation": 0.85,
    "code_quality": 0.78,
    "functionality": 0.92,
    "user_experience": 0.73,
    "completeness": 0.88
  },
  "strengths": ["Clean code structure", "Good functionality"],
  "improvements": ["Better error handling", "Enhanced UX"]
}
```

#### Assessment 3 (Problem-Solution) - `type_specific_data`
```json
{
  "problem_statement_length": 156,
  "solution_length": 198,
  "business_scores": {
    "problem_clarity": 0.85,
    "solution_feasibility": 0.75,
    "innovation": 0.80,
    "business_value": 0.90,
    "technical_understanding": 0.70
  },
  "key_insights": ["Clear problem definition", "Innovative approach"],
  "suggestions": ["More technical detail needed", "Consider implementation challenges"]
}
```

#### Assessment 4 (Video) - `type_specific_data`
```json
{
  "loom_url": "https://www.loom.com/share/abc123",
  "video_title": "Business Pitch",
  "duration": "00:03:22",
  "transcript_length": 3062,
  "has_transcript": true,
  "creator": "John Smith",
  "upload_date": "2025-09-14",
  "communication_scores": {
    "content_quality": 0.90,
    "communication_clarity": 0.95,
    "professional_presentation": 0.85,
    "engagement_persuasiveness": 0.88,
    "completeness": 0.82
  },
  "key_points": ["Problem identification", "Solution presentation", "Business benefits"],
  "strengths": ["Clear communication", "Professional delivery"],
  "improvements": ["Stronger closing statement"]
}
```

---

## 🎯 Holistic Feedback System

### New Functionality: Cross-Assessment Analysis
The system now generates holistic feedback that analyzes patterns across all 4 assessments for each user.

#### Holistic Feedback Data Structure
```json
{
  "user_id": 141,
  "user_name": "John Smith",
  "total_assessments": 4,
  "average_score": 0.78,
  "strengths_summary": "You consistently demonstrate strong technical implementation skills across both foundational concepts and hands-on projects...",
  "growth_areas_summary": "The most exciting opportunity for your continued growth lies in strengthening your communication and presentation skills...",
  "analysis_timestamp": "2025-09-18T12:34:56Z"
}
```

---

## 🔧 Frontend Integration Points

### 1. User Dashboard Queries

#### Get User's Assessment Results
```sql
SELECT 
  assessment_id,
  assessment_name,
  overall_score,
  feedback,
  analysis_timestamp,
  type_specific_data
FROM `pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis`
WHERE user_id = @user_id
ORDER BY assessment_id;
```

#### Get User's Holistic Feedback
```sql
SELECT 
  user_id,
  user_first_name,
  user_last_name,
  total_assessments,
  average_score,
  strengths_summary,
  growth_areas_summary,
  included_assessments,
  assessment_scores,
  analysis_timestamp
FROM `pursuit-ops.pilot_agent_public.holistic_assessment_feedback`
WHERE user_id = @user_id;
```

#### Get Holistic Feedback with Assessment Details
```sql
SELECT 
  h.user_id,
  h.strengths_summary,
  h.growth_areas_summary,
  h.average_score,
  h.included_assessments,
  h.assessment_scores,
  c.assessment_name,
  c.overall_score,
  c.feedback
FROM `pursuit-ops.pilot_agent_public.holistic_assessment_feedback` h
LEFT JOIN `pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis` c
  ON h.user_id = c.user_id
WHERE h.user_id = @user_id
ORDER BY c.assessment_id;
```

### 2. Admin Dashboard Queries

#### Get Cohort Performance Overview
```sql
SELECT 
  user_cohort,
  COUNT(*) as total_assessments,
  AVG(overall_score) as avg_score,
  assessment_type,
  COUNT(DISTINCT user_id) as unique_users
FROM `pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis`
WHERE user_cohort = @cohort
GROUP BY user_cohort, assessment_type;
```

#### Get Assessment Insights
```sql
SELECT 
  analysis_run_id,
  total_assessments_analyzed,
  average_overall_score,
  score_distribution,
  analysis_timestamp
FROM `pursuit-ops.pilot_agent_public.assessment_insights`
ORDER BY analysis_timestamp DESC
LIMIT 10;
```

### 3. Detailed Assessment View

#### Get Individual Assessment Details
```sql
SELECT 
  ca.submission_id,
  ca.assessment_name,
  ca.overall_score,
  ca.feedback,
  ca.type_specific_data,
  s.submission_data,
  s.submitted_at
FROM `pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis` ca
LEFT JOIN `pursuit-ops.pilot_agent_public.assessment_submissions` s 
  ON ca.submission_id = s.submission_id
WHERE ca.submission_id = @submission_id;
```

---

## 📈 Score Interpretation Guide

### Score Ranges
- **0.90 - 1.00**: Excellent (90-100%)
- **0.80 - 0.89**: Good (80-89%)
- **0.70 - 0.79**: Satisfactory (70-79%)
- **0.60 - 0.69**: Needs Improvement (60-69%)
- **0.00 - 0.59**: Poor (0-59%)

### Performance Levels by Assessment Type
```javascript
const getPerformanceLevel = (score, assessmentType) => {
  if (score >= 0.85) return "Excellent";
  if (score >= 0.75) return "Good";
  if (score >= 0.65) return "Satisfactory";
  if (score >= 0.50) return "Needs Improvement";
  return "Poor";
};
```

---

## 🛠️ Additional Data Files

### Transcript Storage
Video transcripts are stored in JSON files:
- **Location**: `loom_transcripts_YYYYMMDD_HHMMSS.json`
- **Contents**: Full transcript text, VTT, SRT formats, metadata

### Log Files
Detailed processing logs:
- **Assessment Analysis**: `assessment_analysis_YYYYMMDD_HHMMSS.log`
- **Comprehensive Analysis**: `comprehensive_assessment_analysis_YYYYMMDD_HHMMSS.log`

---

## ⚠️ Known Issues & Considerations

### 1. Project Analysis Issue
**Problem**: Assessment 2 (Project) analysis may not properly read file contents  
**Impact**: Artificially low scores for project submissions  
**Status**: Under investigation  
**Workaround**: Manual review of project submissions recommended  

### 2. API Rate Limits
**Loom Transcript API**: Limited by Apify memory constraints (8GB limit)  
**OpenAI API**: Rate limited for GPT-4 calls  
**Recommendation**: Implement retry logic and batch processing  

### 3. Data Volume
**Expected Growth**: ~100 assessments per cohort, 4 assessments per user  
**Storage**: JSON fields can be large (transcripts: ~3KB, analysis: ~2KB)  
**Indexing**: Consider indexing on `user_id`, `assessment_id`, `user_cohort`  

---

## 🚀 Recommended Frontend Features

### 1. Student View
- **Assessment Dashboard**: Show all 4 assessments with scores and status
- **Individual Results**: Detailed feedback for each assessment
- **Holistic Feedback**: Cross-assessment strengths and growth areas
- **Progress Tracking**: Visual score progression over time

### 2. Instructor View
- **Cohort Overview**: Performance statistics and distributions
- **Individual Student**: Complete assessment history and analysis
- **Assessment Insights**: Aggregate performance by assessment type
- **Flagged Submissions**: Low scores or analysis issues requiring review

### 3. Admin View
- **System Health**: Analysis run status and error monitoring
- **Data Quality**: Assessment completion rates and analysis success rates
- **Performance Metrics**: Average processing times and API usage

---

## 📞 Technical Contact

For questions about implementation or schema changes:
- **Database Schema**: See `assessment_evaluator.py` and `comprehensive_assessment_analyzer.py`
- **API Integration**: Holistic feedback via `holistic_feedback_analyzer.py`
- **Data Processing**: Incremental saving via `test_comprehensive_analysis.py`

**Note**: All tables use `WRITE_APPEND` mode, so data accumulates over time. Consider implementing data retention policies for production use.
