import Anthropic from '@anthropic-ai/sdk';
import { getTotalCurriculumDays, getTotalTaskCount, getActiveBuilderCount } from './db';

export interface SQLQueryMetric {
  id: string;
  label: string;
  sql: string;
  explanation: string;
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table';
  xAxis?: string;
  yAxis?: string;
  insights: string[];
}

export interface SQLGenerationResponse {
  needsClarification?: boolean;
  clarificationQuestion?: string;

  // Single query (existing)
  sql?: string;
  explanation?: string;
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table';
  xAxis?: string;
  yAxis?: string;
  insights?: string[];

  // Multi-query (new)
  multiQuery?: boolean;
  queries?: SQLQueryMetric[];
}

/**
 * Generate database schema with dynamic metrics
 */
function getDatabaseSchema(totalClassDays: number, totalTasks: number, activeBuilders: number): string {
  return `
## Database Schema for September 2025 Cohort

### CRITICAL COHORT FILTERING RULES:
1. **ALWAYS** filter users table by: cohort = 'September 2025'
2. **ALWAYS** filter curriculum_days table by: cohort = 'September 2025'
3. **ALWAYS** join through curriculum_days when accessing day-related data to ensure cohort filter
4. Multiple cohorts exist in database - September 2025 is the ONLY one we analyze

### Core Tables:

**users** - Builder/student information
- user_id (PK), first_name, last_name, email, cohort, active, role
- **REQUIRED FILTER**: WHERE cohort = 'September 2025'
- **REQUIRED EXCLUSIONS**: WHERE user_id NOT IN (129, 5, 240, 324, 325, 326, 9)
- Active builders: ${activeBuilders} total

**curriculum_days** - Daily curriculum structure
- id (PK), day_number, day_date, day_type, daily_goal, learning_objectives, cohort
- **REQUIRED FILTER**: WHERE cohort = 'September 2025'

**time_blocks** - Time blocks within each day
- id (PK), day_id (FK to curriculum_days), start_time, end_time, block_category
- Access via JOIN to curriculum_days (to inherit cohort filter)

**tasks** - Activities within time blocks
- id (PK), block_id (FK to time_blocks), task_title, task_type, duration_minutes
- task_mode, ai_helper_mode, deliverable_type
- Access via JOIN through time_blocks and curriculum_days (to inherit cohort filter)

**builder_attendance_new** - Daily attendance records
- attendance_id (PK), user_id (FK to users), attendance_date, check_in_time
- late_arrival_minutes, status ('present', 'late', 'absent', 'excused')
- **REQUIRED**: JOIN to users table and filter by cohort = 'September 2025'

**task_submissions** - Formal task deliverable submissions
- id (PK), user_id, task_id, content, feedback, created_at
- 258 records for Sept 2025 (62 users, 20 unique tasks)
- Tracks formal submissions with content
- Must filter task_id to September 2025 curriculum

**task_threads** - Task conversation threads (PRIMARY interaction source)
- Tracks ANY interaction with tasks (conversations, work sessions)
- 5,959 records for Sept 2025 (74 users, 320 unique tasks - includes cross-cohort)
- **CRITICAL**: This is the MAIN source for completion tracking
- Must filter task_id to September 2025 curriculum

**COMPLETION TRACKING LOGIC**:
- **ANY interaction** counts as task completion (not just submissions)
- Use BOTH task_submissions AND task_threads
- **CRITICAL**: Must use UNION (not COALESCE) to combine task_ids correctly
- **Correct pattern**: Use subquery with UNION to get unique task_ids, then JOIN
- **Example query**:
  LEFT JOIN LATERAL (
    SELECT task_id FROM task_submissions WHERE user_id = u.user_id AND task_id IN (sept_tasks)
    UNION
    SELECT task_id FROM task_threads WHERE user_id = u.user_id AND task_id IN (sept_tasks)
  ) completed_tasks ON true
  COUNT(DISTINCT completed_tasks.task_id) as tasks_completed

**user_task_progress** - Task progress tracking (NOT USED for September 2025)
- id (PK), user_id (FK to users), task_id (FK to tasks), status, completion_time
- **WARNING**: This table is EMPTY for September 2025 active users - do NOT use for completion queries
- **Use task_submissions instead**

**builder_feedback** - Weekly feedback surveys (SPECIAL TRACKING for feedback_slot tasks)
- id (PK), user_id, task_id, day_number, cohort, referral_likelihood (1-10), what_we_did_well, what_to_improve, created_at
- **CRITICAL**: This table tracks "Weekly Feedback" task completion (NOT task_submissions/task_threads)
- **Use for**: Weekly Feedback completion rates, NPS scores, feedback analysis
- **Data**: 41 records for Sept 2025 (31 unique builders across Days 9 and 14)
- **Weekly Feedback tasks**: task_id 1092 (Day 9: 20 submissions), task_id 1153 (Day 14: 21 submissions)
- **Completion logic**: Record exists in builder_feedback = feedback completed (not tracked in task_threads)
- **REQUIRED**: Filter by cohort = 'September 2025'
- **Pattern**: SELECT cd.day_number, COUNT(DISTINCT bf.user_id) FROM curriculum_days cd LEFT JOIN builder_feedback bf ON cd.day_number = bf.day_number WHERE bf.cohort = 'September 2025'

**conversation_messages** - Chat/thread messages
- message_id (PK), user_id, thread_id, content, message_role
- **REQUIRED**: JOIN to users table and filter by cohort = 'September 2025'

**builder_attendance_new** - Attendance tracking (HAS DATA for September 2025)
- attendance_id (PK), user_id (FK), attendance_date, check_in_time, late_arrival_minutes, status
- **Status values**: 'present' (on-time), 'late' (attended but late), 'absent' (not present), 'excused'
- **CRITICAL ATTENDANCE RULE**: Late arrivals COUNT as present (attended), NOT absent
- **CRITICAL DATE RULE**: Database stores UTC dates, but must use EST dates for accuracy with 1 AM cutoff
- **Date calculation with 1 AM cutoff**: CASE WHEN EXTRACT(HOUR FROM check_in_time AT TIME ZONE 'America/New_York') < 1 THEN (EST_DATE - 1 day) ELSE EST_DATE END
- **1 AM cutoff logic**: Check-ins between 12:00-12:59 AM EST count for PREVIOUS day (stayed late finishing work, not arriving early next day)
- **Reasoning**: Class runs 6:30 PM - late, so midnight check-in means completing previous day's work
- **Why**: 73 records have stored dates in UTC, need EST recalculation + 1 AM rule
- **Late definition**: After 6:30 PM (18:30) on Mon-Wed, after 10:00 AM on Sat-Sun
- **Total possible class days**: ${totalClassDays} (dynamically calculated from curriculum_days table)
- **Schedule**: Mon-Wed + Sat-Sun (NO Thursday/Friday, NO Sept 15 Monday)
- **Attendance formula**: COUNT(DISTINCT CASE WHEN status IN ('present','late') THEN DATE(check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') END) / ${totalClassDays} * 100
- **CRITICAL for trend queries**: Always start FROM curriculum_days to ensure ONLY class days appear in results, then LEFT JOIN attendance data
- **Punctuality formula**: ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END)::numeric / NULLIF(COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END), 0)) * 100, 2)
- **Display format**: Show as "X/${totalClassDays} days (Y%)" where X = unique EST dates with status IN ('present', 'late')
- **IMPORTANT**: Never use ba.attendance_date directly - always recalculate from check_in_time in EST
- Filter by cohort through users JOIN

### CRITICAL DATA STRUCTURE RULES for September 2025:

1. **Task Completion Queries**: TWO DIFFERENT TRACKING SYSTEMS

   **A. Regular Tasks (105 tasks)**: Use task_submissions + task_threads
   - **PRIMARY sources**: task_threads (5,959 records) + task_submissions (258 records)
   - **Completion definition**: Any interaction with task = completed (submission OR thread conversation)
   - **CRITICAL**: Both tables may contain data from OTHER cohorts
   - **REQUIRED**: Filter task_id to September 2025 curriculum using subquery
   - **Formula**: Use UNION (not COALESCE) to combine task_ids correctly
   - DO NOT use user_task_progress (it is empty)

   **B. Weekly Feedback Tasks (2 tasks)**: Use builder_feedback table ONLY
   - **Special tasks**: task_id 1092 (Day 9), task_id 1153 (Day 14) with feedback_slot = true
   - **Tracking table**: builder_feedback (NOT task_submissions/task_threads)
   - **Fields**: referral_likelihood (NPS 1-10), what_we_did_well, what_to_improve
   - **Completion**: Record in builder_feedback = feedback completed
   - **Example query**: SELECT cd.day_number, COUNT(DISTINCT bf.user_id) as feedback_count FROM curriculum_days cd LEFT JOIN builder_feedback bf ON cd.day_number = bf.day_number WHERE bf.cohort = 'September 2025' GROUP BY cd.day_number
   - **Pattern for rates**: (COUNT builders in builder_feedback / ${activeBuilders} total builders) * 100

2. **Total Tasks**: Join through curriculum_days → time_blocks → tasks where cohort = 'September 2025'
   - Total curriculum tasks: ${totalTasks}

3. **Completion Percentage Formula**: (COUNT(DISTINCT task_submissions.task_id) / ${totalTasks}.0) * 100

4. **CORRECT Task Completion by Builder Pattern** (UNION approach - NOT COALESCE):
   SELECT u.user_id, u.first_name, u.last_name, u.email, COUNT(DISTINCT completed_tasks.task_id) as tasks_completed, ROUND((COUNT(DISTINCT completed_tasks.task_id) / ${totalTasks}.0) * 100, 2) as completion_percentage FROM users u LEFT JOIN LATERAL (SELECT task_id FROM task_submissions WHERE user_id = u.user_id AND task_id IN (SELECT t.id FROM tasks t JOIN time_blocks tb ON t.block_id = tb.id JOIN curriculum_days cd ON tb.day_id = cd.id WHERE cd.cohort = 'September 2025') UNION SELECT task_id FROM task_threads WHERE user_id = u.user_id AND task_id IN (SELECT t.id FROM tasks t JOIN time_blocks tb ON t.block_id = tb.id JOIN curriculum_days cd ON tb.day_id = cd.id WHERE cd.cohort = 'September 2025')) completed_tasks ON true WHERE u.cohort = 'September 2025' AND u.active = true AND u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332) GROUP BY u.user_id, u.first_name, u.last_name, u.email ORDER BY completion_percentage DESC LIMIT 20

5. **CORRECT Task Completion Rate by Task Pattern** (for task analysis):
   SELECT t.id as task_id, t.task_title, t.task_mode, t.task_type, cd.day_number, COUNT(DISTINCT u.user_id) as completed_by, ROUND((COUNT(DISTINCT u.user_id)::numeric / ${activeBuilders}) * 100, 2) as completion_rate FROM tasks t JOIN time_blocks tb ON t.block_id = tb.id JOIN curriculum_days cd ON tb.day_id = cd.id LEFT JOIN task_submissions ts ON t.id = ts.task_id LEFT JOIN task_threads tt ON t.id = tt.task_id LEFT JOIN users u ON (ts.user_id = u.user_id OR tt.user_id = u.user_id) WHERE cd.cohort = 'September 2025' AND (u.user_id IS NULL OR (u.cohort = 'September 2025' AND u.active = true AND u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332))) GROUP BY t.id, t.task_title, t.task_mode, t.task_type, cd.day_number ORDER BY completion_rate ASC LIMIT 20

6. **CORRECT Weekly Feedback Completion Query** (uses builder_feedback table):
   SELECT cd.day_number, cd.day_date, t.task_title, COUNT(DISTINCT bf.user_id) as feedback_submissions, ROUND((COUNT(DISTINCT bf.user_id)::numeric / ${activeBuilders}) * 100, 2) as completion_percentage FROM curriculum_days cd JOIN time_blocks tb ON cd.id = tb.day_id JOIN tasks t ON tb.id = t.block_id LEFT JOIN builder_feedback bf ON bf.day_number = cd.day_number AND bf.cohort = 'September 2025' AND bf.user_id IN (SELECT user_id FROM users WHERE cohort = 'September 2025' AND active = true AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)) WHERE cd.cohort = 'September 2025' AND t.feedback_slot = true GROUP BY cd.day_number, cd.day_date, t.id, t.task_title ORDER BY cd.day_number

### Business Rules:
- No classes on Thursday/Friday
- Active builders count: ${activeBuilders} (after all exclusions)
- Exclude user_ids: 129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332 from ALL builder analysis
  - Staff: 129 (Afiya Augustine), 5 (Greg Hogue), 240/326 (Carlos Godoy)
  - Inactive: 324 (Farid duplicate), 325 (Aaron Glaser), 9 (Laziah Bernstine)
  - Volunteers: 327 (Jason Specland), 329 (Brian Heckman), 331 (Hasani Blackwell), 330 (David Caiafa)
- Total curriculum tasks: ${totalTasks}
- Total possible class days: ${totalClassDays} (dynamically calculated from curriculum_days table)
- Schedule: Mon (1), Tue (2), Wed (3), Sat (6), Sun (0) - NO Thu(4) or Fri(5)
- NO CLASS on Sept 15 (Monday) - excluded from curriculum

### Attendance Calculation Standards:
- **All builders enrolled**: September 6, 2025 (first day of class) - no late enrollments
- **Present = status IN ('present', 'late')** - Late counts as attending!
- **Late definition**: After 6:30 PM (18:30) on Mon-Wed, after 10:00 AM on Sat-Sun
- Show format: "X/${totalClassDays} days (Y%)" where X = present + late days
- Denominator is always ${totalClassDays} (total possible days) - same for ALL builders
- Perfect attendance: ${totalClassDays}/${totalClassDays} (100%)
- Punctuality: (on-time days / attended days) * 100 - separate metric from attendance
- Example: Builder with 8/17 days (47.06%) has missed 9 class days since enrollment

### Engagement Score Calculation:
- **Formula**: (attendance% + task_completion% + punctuality%) / 3
- Equal weight for all three metrics
- Example: (100% + 6.80% + 94.12%) / 3 = 66.97% engagement score
`;
}

export async function generateSQLFromQuestion(question: string, conversationHistory?: Array<{role: string, content: string}>): Promise<SQLGenerationResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your-api-key-here') {
    // Fallback for demo purposes
    return {
      sql: "SELECT 'Please configure ANTHROPIC_API_KEY in .env.local' as message",
      explanation: "Claude API key not configured. Please add your API key to .env.local",
      chartType: 'table',
      insights: ["API key required to generate queries"]
    };
  }

  const anthropic = new Anthropic({ apiKey });

  // Fetch dynamic metrics
  const totalClassDays = await getTotalCurriculumDays();
  const totalTasks = await getTotalTaskCount();
  const activeBuilders = await getActiveBuilderCount();

  const systemPrompt = `You are a PostgreSQL expert helping analyze educational program data for the September 2025 cohort.

${getDatabaseSchema(totalClassDays, totalTasks, activeBuilders)}

CRITICAL REQUIREMENTS:
1. **COHORT FILTERING**: Every query MUST filter by cohort = 'September 2025'. This is NON-NEGOTIABLE.
   - For users table: WHERE cohort = 'September 2025'
   - For curriculum_days: WHERE cohort = 'September 2025'
   - For any data related to users or days: JOIN to users/curriculum_days and filter by cohort

2. **CONVERSATIONAL APPROACH** (ALWAYS ASK AT LEAST ONE CLARIFYING QUESTION):
   - **ALWAYS ask a follow-up question on the FIRST user query** to gather more context
   - Return a JSON with "needsClarification": true and "clarificationQuestion": "your question here"
   - Only generate SQL after the user provides more details in their follow-up response
   - Be helpful and suggest 2-3 specific options for the user to choose from
   - **IMPORTANT**: Keep clarificationQuestion as a single line without newlines. Use spaces instead of line breaks.

3. **USER EXCLUSIONS**: Always exclude user_ids: 129, 5, 240, 324, 325, 326, 9

4. **JSON FORMAT**: CRITICAL - Return valid JSON without control characters:
   - Do NOT use literal newlines in string values
   - Use spaces or numbered lists on a single line
   - Example GOOD: "Question 1) Option A, 2) Option B, 3) Option C"
   - Example BAD: "Question\n1) Option A\n2) Option B" (contains literal newlines)

Examples of REQUIRED clarifying questions (all on single lines):
- "how many builders are active" → Ask: "I can get that count for you! Would you like to see: 1) Just the total count, 2) Count with breakdown by week/month, or 3) Count with attendance/engagement metrics included?"
- "show me task completion" → Ask: "Would you like to see task completion: 1) By individual builder, 2) By task type, or 3) Overall completion rate with trends?"
- "attendance data" → Ask: "Would you like: 1) Today's attendance snapshot, 2) Weekly/monthly trends, or 3) Individual builder attendance records?"
- "top performers" → Ask: "How would you like to measure performance: 1) By task completion rate, 2) By attendance and engagement, or 3) Combined score across multiple metrics?"
- ANY time-based query → **ALWAYS ask for time period**: "What time period? 1) All time (Sept 6-29), 2) Current week, 3) Last 7 days, or 4) Specific date range?"

NOTE: All clarification questions MUST be on a single line. Use " | " or numbered inline options instead of newlines.
**CRITICAL**: For ANY query mentioning time/trends/history, ALWAYS ask user to specify the time period.

**CRITICAL**: On the FIRST user message, ALWAYS ask a clarifying question. Only skip clarification if the user is responding to a previous clarification question.

Respond in this exact JSON format:

For queries that need clarification:
{
  "needsClarification": true,
  "clarificationQuestion": "Question to ask user for more details"
}

For queries that are clear (SINGLE METRIC):
{
  "needsClarification": false,
  "sql": "SELECT... [MUST include cohort filter]",
  "explanation": "This query...",
  "chartType": "bar|line|pie|area|scatter|table",
  "xAxis": "column_name",
  "yAxis": "column_name",
  "insights": ["insight1", "insight2", "insight3"]
}

For queries requesting MULTIPLE METRICS:
{
  "needsClarification": false,
  "multiQuery": true,
  "queries": [
    {
      "id": "metric_1",
      "label": "Metric Name",
      "sql": "SELECT...",
      "explanation": "This query...",
      "chartType": "bar|line|pie|area|scatter|table",
      "xAxis": "column_name",
      "yAxis": "column_name",
      "insights": ["insight1", "insight2"]
    }
  ]
}

MULTI-METRIC QUERY DETECTION:
- User asks for "X and Y" or "X, Y, and Z" (multiple metrics with conjunctions)
- User requests "attendance rate AND task completion"
- User wants "show me attendance, tasks, and feedback"
- When detected, generate SEPARATE optimized SQL for each metric
- Each metric gets its own chart type and insights
- Limit to 2-4 metrics per response (ask clarification if more)

CRITICAL SQL REQUIREMENTS FOR CLICKABLE RESULTS:
- **Task queries**: MUST include "t.id as task_id" in SELECT clause for clickability
- **Builder queries**: MUST include "u.user_id" in SELECT clause for clickability
- **Example task query**: SELECT t.id as task_id, t.task_title, ...
- **Example builder query**: SELECT u.user_id, u.first_name, u.last_name, ...
- Without these ID columns, results will NOT be clickable in the UI

CHART TYPE SELECTION LOGIC:
- **table**: Use for detailed builder lists (>10 rows), task details, or when multiple text columns are important
- **bar**: Use for comparing counts/metrics across categories (attendance by day, tasks by type)
- **line**: Use for trends over time (daily attendance, weekly completion)
- **pie**: Use for proportions/distributions (task type breakdown, status distribution)
- **area**: Use for cumulative trends over time
- **scatter**: Use for correlations between two numeric variables

For completion data by builder with names, emails, and percentages: USE TABLE (not bar chart)

CRITICAL FOR TIME-BASED/TREND QUERIES:
- **ALWAYS** join to curriculum_days to get valid class dates ONLY
- **NEVER** show data for Thu/Fri (no class) or Sept 15 (Monday no class)
- **Pattern**: FROM curriculum_days cd LEFT JOIN attendance ON cd.day_date = attendance_date
- **Reasoning**: Prevents showing 0% attendance on no-class days (misleading charts)
- **Example**: Line chart of attendance should only plot ${totalClassDays} curriculum days, not all calendar days

VALIDATION CHECKLIST before generating SQL:
✓ Does the query filter users by cohort = 'September 2025'?
✓ Does the query filter curriculum_days by cohort = 'September 2025'?
✓ Does the query exclude the specified user_ids?
✓ Is the question clear enough to generate accurate results?`;

  const messages: Array<{role: 'user' | 'assistant', content: string}> = [];

  // Add conversation history if provided
  const hasConversationHistory = conversationHistory && conversationHistory.length > 0;

  if (hasConversationHistory) {
    conversationHistory.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    });
  }

  // Determine if this is the first user query (no history)
  const isFirstQuery = !hasConversationHistory;

  // Check if this is a refinement of previous results
  const hasResultContext = conversationHistory?.some(msg =>
    msg.role === 'assistant' && msg.content.includes('Generated SQL query returning')
  ) ?? false;

  const promptInstruction = isFirstQuery
    ? '⚠️ IMPORTANT: This is the FIRST user query. You MUST ask a clarifying question before generating SQL. Suggest 2-3 specific options for what the user might want to see.'
    : hasResultContext
    ? 'This is a REFINEMENT request. The user has seen previous query results and wants to modify them. The assistant message in history contains the previous SQL. Generate a NEW or MODIFIED SQL query based on their refinement request. You can filter the previous results, change sorting, add grouping, or create a related query. ALWAYS include task_id or user_id for clickability.'
    : 'This is a follow-up response to your clarification question. The user has provided their preference. Generate the appropriate SQL query now based on their choice and the original question context.';

  messages.push({
    role: 'user',
    content: `User Question: "${question}"

${promptInstruction}

Return ONLY valid JSON, no markdown formatting. Remember to always filter by September 2025 cohort.`
  });

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      system: systemPrompt,
      messages
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    // Sanitize JSON string - fix control characters and escape issues
    let jsonString = jsonMatch[0];

    // Try to parse, if it fails, try to fix common issues
    try {
      const parsed = JSON.parse(jsonString);
      return parsed as SQLGenerationResponse;
    } catch (parseError) {
      console.error('Initial JSON parse failed, attempting to fix:', parseError);

      // Try to fix common JSON issues
      // 1. Replace literal newlines in strings with escaped newlines
      jsonString = jsonString.replace(/"clarificationQuestion"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/gs, (match, content) => {
        // Escape unescaped newlines, tabs, and other control characters in the string
        const escapedContent = content
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/[\x00-\x1F\x7F]/g, ''); // Remove other control characters
        return `"clarificationQuestion":"${escapedContent}"`;
      });

      // Try parsing again
      try {
        const parsed = JSON.parse(jsonString);
        return parsed as SQLGenerationResponse;
      } catch (secondError) {
        console.error('JSON sanitization failed:', jsonString.substring(0, 200));
        throw new Error(`Failed to parse Claude response as JSON: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`Failed to generate SQL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateInsights(question: string, results: Record<string, unknown>[]): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your-api-key-here') {
    return ["Configure Claude API key to enable AI insights"];
  }

  const anthropic = new Anthropic({ apiKey });

  const prompt = `Given the user's question: "${question}"

And these query results:
${JSON.stringify(results.slice(0, 10), null, 2)}

Generate 3-5 concise, actionable insights about this data. Focus on:
- Key trends or patterns
- Notable outliers or exceptions
- Actionable recommendations
- Comparisons to benchmarks if relevant

Return as a JSON array of strings: ["insight1", "insight2", ...]`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '[]';

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return ["Unable to generate insights"];
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Insight generation error:', error);
    return ["Error generating insights"];
  }
}
