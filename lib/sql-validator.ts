/**
 * SQL Validator - Detects and fixes hardcoded denominators in AI-generated SQL
 *
 * This module scans SQL queries for hardcoded numeric denominators used in percentage
 * calculations and automatically replaces them with dynamic subqueries that adapt
 * to the actual data.
 *
 * Common Issues Fixed:
 * - Hardcoded class day counts (/ 24, / 17, / 18)
 * - Hardcoded builder counts (/ 79, / 75)
 * - Hardcoded task counts (/ 143, / 107)
 */

export interface SQLValidationResult {
  sql: string;
  hadIssues: boolean;
  fixes: string[];
}

/**
 * Replacement patterns for different types of denominators
 */
const REPLACEMENT_PATTERNS = {
  classDay: {
    regex: /\/\s*(24|17|18)(?=\s*\)|\s*\*|\s*$|\s*,|\s+AS|\s+as|\s+\/)/gi,
    subquery: `(SELECT COUNT(*) FROM curriculum_days WHERE cohort = 'September 2025' AND EXTRACT(DOW FROM day_date) NOT IN (4, 5) AND day_date <= CURRENT_DATE)`,
    description: 'class day count'
  },
  builder: {
    regex: /\/\s*(79|75)(?=\s*\)|\s*\*|\s*$|\s*,|\s+AS|\s+as|\s+\/)/gi,
    subquery: `(SELECT COUNT(*) FROM users WHERE cohort = 'September 2025' AND active = true AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332))`,
    description: 'active builder count'
  },
  task: {
    regex: /\/\s*(143|107)(?=\s*\)|\s*\*|\s*$|\s*,|\s+AS|\s+as|\s+\/)/gi,
    subquery: `(SELECT COUNT(*) FROM tasks t JOIN time_blocks tb ON t.block_id = tb.id JOIN curriculum_days cd ON tb.day_id = cd.id WHERE cd.cohort = 'September 2025')`,
    description: 'task count'
  }
};

/**
 * Keywords that indicate which type of denominator is likely needed
 */
const CONTEXT_KEYWORDS = {
  classDay: ['attendance', 'days_attended', 'curriculum_days', 'day_date', 'class_day'],
  builder: ['completed_by', 'builders', 'users', 'user_id', 'participants'],
  task: ['tasks', 'task_id', 'time_blocks', 'block_id', 'assignments']
};

/**
 * Determines which type of denominator replacement is needed based on SQL context
 * Returns all matching types with priority scores
 *
 * NOTE: Currently unused - we now check all patterns and replace all matches.
 * Keeping this function for potential future context-aware optimization.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function detectDenominatorTypes(sql: string): Array<{ type: 'classDay' | 'builder' | 'task'; priority: number }> {
  const lowerSQL = sql.toLowerCase();
  const results: Array<{ type: 'classDay' | 'builder' | 'task'; priority: number }> = [];

  // Count matches for each type to determine priority
  const classDayMatches = CONTEXT_KEYWORDS.classDay.filter(keyword => lowerSQL.includes(keyword)).length;
  const builderMatches = CONTEXT_KEYWORDS.builder.filter(keyword => lowerSQL.includes(keyword)).length;
  const taskMatches = CONTEXT_KEYWORDS.task.filter(keyword => lowerSQL.includes(keyword)).length;

  if (classDayMatches > 0) {
    results.push({ type: 'classDay', priority: classDayMatches });
  }
  if (builderMatches > 0) {
    results.push({ type: 'builder', priority: builderMatches });
  }
  if (taskMatches > 0) {
    results.push({ type: 'task', priority: taskMatches });
  }

  // Sort by priority (highest first)
  results.sort((a, b) => b.priority - a.priority);

  // If no context detected, default to builder
  if (results.length === 0) {
    results.push({ type: 'builder', priority: 0 });
  }

  return results;
}

/**
 * Checks if a position in the SQL is within a WHERE or LIMIT clause
 * We don't want to replace numbers in these contexts
 */
function isInExcludedContext(sql: string, position: number): boolean {
  const beforeMatch = sql.substring(0, position).toLowerCase();

  // Check if we're in a WHERE clause
  const lastWhere = beforeMatch.lastIndexOf('where');
  const lastFrom = beforeMatch.lastIndexOf('from');
  const lastSelect = beforeMatch.lastIndexOf('select');

  if (lastWhere > Math.max(lastFrom, lastSelect)) {
    // We're potentially in a WHERE clause
    // Check if there's a closing condition before this position
    const afterWhere = sql.substring(lastWhere, position);
    const hasGroupBy = afterWhere.toLowerCase().includes('group by');
    const hasOrderBy = afterWhere.toLowerCase().includes('order by');
    const hasLimit = afterWhere.toLowerCase().includes('limit');

    if (!hasGroupBy && !hasOrderBy && !hasLimit) {
      return true; // Likely in WHERE clause
    }
  }

  // Check if we're in a LIMIT clause
  const lastLimit = beforeMatch.lastIndexOf('limit');
  if (lastLimit > -1) {
    const afterLimit = sql.substring(lastLimit, position);
    if (afterLimit.length < 20) { // LIMIT clause is usually short
      return true;
    }
  }

  return false;
}

/**
 * Validates and fixes hardcoded denominators in SQL queries
 *
 * @param sql - The SQL query to validate and fix
 * @param cohort - The cohort name (default: 'September 2025')
 * @returns Object containing fixed SQL, whether issues were found, and list of fixes applied
 *
 * @example
 * const result = validateAndFixSQL("SELECT COUNT(*) / 75 * 100 AS completion_rate FROM tasks");
 * // result.hadIssues === true
 * // result.fixes === ['Replaced hardcoded active builder count (75) with dynamic subquery']
 */
export function validateAndFixSQL(sql: string, _cohort: string = 'September 2025'): SQLValidationResult {
  let fixedSQL = sql;
  const fixes: string[] = [];

  // Collect ALL matches from all patterns first, then sort and replace
  interface Match {
    value: string;
    position: number;
    matchText: string;
    subquery: string;
    description: string;
  }

  const allMatches: Match[] = [];

  // Check all pattern types
  Object.entries(REPLACEMENT_PATTERNS).forEach(([_type, pattern]) => {
    // Reset regex
    pattern.regex.lastIndex = 0;

    let match;
    while ((match = pattern.regex.exec(sql)) !== null) {
      // Check if this match is in an excluded context
      if (!isInExcludedContext(sql, match.index)) {
        allMatches.push({
          value: match[1],
          position: match.index,
          matchText: match[0],
          subquery: pattern.subquery,
          description: pattern.description
        });
      }
    }
  });

  // Sort by position (descending) to replace from end to start
  allMatches.sort((a, b) => b.position - a.position);

  // Replace all matches
  allMatches.forEach(({ value, position, matchText, subquery, description }) => {
    const before = fixedSQL.substring(0, position);
    const after = fixedSQL.substring(position + matchText.length);

    // Preserve the division operator
    const divOperator = matchText.startsWith(' /') ? ' /' : '/';
    fixedSQL = before + `${divOperator} ${subquery}` + after;
    fixes.push(`Replaced hardcoded ${description} (${value}) with dynamic subquery`);
  });

  return {
    sql: fixedSQL,
    hadIssues: fixes.length > 0,
    fixes
  };
}

/**
 * Validates a batch of SQL queries (useful for multi-query responses)
 *
 * @param queries - Array of SQL queries to validate
 * @param cohort - The cohort name
 * @returns Array of validation results
 */
export function validateSQLBatch(
  queries: Array<{ sql: string; id?: string }>,
  cohort: string = 'September 2025'
): Array<SQLValidationResult & { id?: string }> {
  return queries.map(query => ({
    id: query.id,
    ...validateAndFixSQL(query.sql, cohort)
  }));
}

/**
 * Checks if SQL contains any hardcoded denominators without fixing them
 * Useful for logging/monitoring purposes
 */
export function hasHardcodedDenominators(sql: string): boolean {
  const patterns = Object.values(REPLACEMENT_PATTERNS).map(p => p.regex);

  return patterns.some(regex => {
    regex.lastIndex = 0; // Reset regex
    let match;
    while ((match = regex.exec(sql)) !== null) {
      if (!isInExcludedContext(sql, match.index)) {
        return true;
      }
    }
    return false;
  });
}
