/**
 * Unit tests for SQL validator
 * Tests detection and fixing of hardcoded denominators
 */

import { validateAndFixSQL, hasHardcodedDenominators, validateSQLBatch } from '@/lib/sql-validator';

describe('SQL Validator', () => {
  describe('validateAndFixSQL', () => {
    it('should detect and fix hardcoded class day count (24)', () => {
      const sql = `
        SELECT
          COUNT(*) / 24 * 100 AS attendance_rate
        FROM attendance
        WHERE cohort = 'September 2025'
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.fixes.length).toBe(1);
      expect(result.fixes[0]).toContain('class day count');
      expect(result.fixes[0]).toContain('24');
      expect(result.sql).toContain('SELECT COUNT(*) FROM curriculum_days');
      expect(result.sql).not.toContain('/ 24');
    });

    it('should detect and fix hardcoded builder count (75)', () => {
      const sql = `
        SELECT
          COUNT(DISTINCT user_id) / 75 * 100 AS completion_rate
        FROM completed_by
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.fixes.length).toBe(1);
      expect(result.fixes[0]).toContain('active builder count');
      expect(result.fixes[0]).toContain('75');
      expect(result.sql).toContain('SELECT COUNT(*) FROM users');
      expect(result.sql).not.toContain('/ 75');
    });

    it('should detect and fix hardcoded task count (143)', () => {
      const sql = `
        SELECT
          COUNT(*) / 143 * 100 AS task_completion
        FROM tasks
        WHERE completed = true
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.fixes.length).toBe(1);
      expect(result.fixes[0]).toContain('task count');
      expect(result.fixes[0]).toContain('143');
      expect(result.sql).toContain('SELECT COUNT(*) FROM tasks t JOIN time_blocks');
      expect(result.sql).not.toContain('/ 143');
    });

    it('should handle multiple hardcoded values in one query', () => {
      const sql = `
        SELECT
          COUNT(*) / 24 AS days,
          SUM(completed) / 75 AS users,
          AVG(score) / 143 AS tasks
        FROM metrics
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.fixes.length).toBeGreaterThanOrEqual(2); // Should catch multiple
      expect(result.sql).not.toContain('/ 24');
      expect(result.sql).not.toContain('/ 75');
    });

    it('should not replace numbers in WHERE clauses', () => {
      const sql = `
        SELECT COUNT(*)
        FROM curriculum_days
        WHERE day_number = 24
          AND active = true
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(false);
      expect(result.fixes.length).toBe(0);
      expect(result.sql).toContain('day_number = 24');
    });

    it('should not replace numbers in LIMIT clauses', () => {
      const sql = `
        SELECT *
        FROM users
        ORDER BY created_at DESC
        LIMIT 75
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(false);
      expect(result.fixes.length).toBe(0);
      expect(result.sql).toContain('LIMIT 75');
    });

    it('should handle division with multiplication (percentage calculations)', () => {
      const sql = `
        SELECT
          COUNT(*) / 75 * 100 AS percentage
        FROM tasks
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.sql).toContain('SELECT COUNT(*) FROM');
      expect(result.sql).not.toContain('/ 75');
    });

    it('should handle division followed by AS alias', () => {
      const sql = `
        SELECT COUNT(*) / 24 AS completion_rate
        FROM attendance
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.sql).not.toContain('/ 24 AS');
      expect(result.sql).toContain('AS completion_rate');
    });

    it('should return original SQL when no issues found', () => {
      const sql = `
        SELECT COUNT(*)
        FROM users
        WHERE active = true
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(false);
      expect(result.fixes.length).toBe(0);
      expect(result.sql).toBe(sql);
    });

    it('should handle decimal numbers (143.0)', () => {
      const sql = `
        SELECT COUNT(*) / 143.0 * 100 AS rate
        FROM tasks
      `;

      const result = validateAndFixSQL(sql);

      // Currently doesn't match decimals (by design in regex)
      // If we want to handle decimals, we need to update the regex
      expect(result.sql).toBe(sql);
    });

    it('should handle various spacing around division operator', () => {
      const sql1 = `SELECT COUNT(*)/75 * 100 FROM users`;
      const sql2 = `SELECT COUNT(*)  /  75 * 100 FROM users`;
      const sql3 = `SELECT COUNT(*) /75 * 100 FROM users`;

      const result1 = validateAndFixSQL(sql1);
      const result2 = validateAndFixSQL(sql2);
      const result3 = validateAndFixSQL(sql3);

      // All should match with new regex (/ without requiring space before)
      expect(result1.hadIssues).toBe(true);
      expect(result2.hadIssues).toBe(true);
      expect(result3.hadIssues).toBe(true);
    });

    it('should use context to determine correct denominator type', () => {
      // Attendance context should use classDay pattern for 24, but 75 matches builder
      const attendanceSQL = `
        SELECT COUNT(*) / 24 * 100 AS rate
        FROM attendance
      `;

      const result = validateAndFixSQL(attendanceSQL);

      expect(result.hadIssues).toBe(true);
      expect(result.sql).toContain('curriculum_days'); // Should detect attendance context
    });

    it('should handle nested subqueries', () => {
      const sql = `
        SELECT
          (SELECT COUNT(*) FROM completed) / 75 AS rate
        FROM metrics
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.sql).not.toContain('/ 75');
    });

    it('should handle CTEs (Common Table Expressions)', () => {
      const sql = `
        WITH totals AS (
          SELECT COUNT(*) as cnt FROM tasks
        )
        SELECT cnt / 143 AS rate
        FROM totals
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.sql).not.toContain('/ 143');
    });
  });

  describe('hasHardcodedDenominators', () => {
    it('should return true when hardcoded denominators exist', () => {
      const sql = `SELECT COUNT(*) / 75 * 100 FROM users`;
      expect(hasHardcodedDenominators(sql)).toBe(true);
    });

    it('should return false when no hardcoded denominators exist', () => {
      const sql = `SELECT COUNT(*) FROM users WHERE id = 75`;
      expect(hasHardcodedDenominators(sql)).toBe(false);
    });

    it('should ignore LIMIT clauses', () => {
      const sql = `SELECT * FROM users LIMIT 75`;
      expect(hasHardcodedDenominators(sql)).toBe(false);
    });
  });

  describe('validateSQLBatch', () => {
    it('should validate multiple queries at once', () => {
      const queries = [
        { id: 'q1', sql: 'SELECT COUNT(*) / 24 * 100 FROM days' },
        { id: 'q2', sql: 'SELECT COUNT(*) / 75 * 100 FROM users' },
        { id: 'q3', sql: 'SELECT COUNT(*) FROM tasks' }
      ];

      const results = validateSQLBatch(queries);

      expect(results.length).toBe(3);
      expect(results[0].hadIssues).toBe(true);
      expect(results[0].id).toBe('q1');
      expect(results[1].hadIssues).toBe(true);
      expect(results[1].id).toBe('q2');
      expect(results[2].hadIssues).toBe(false);
      expect(results[2].id).toBe('q3');
    });

    it('should preserve query IDs in results', () => {
      const queries = [
        { id: 'metric-1', sql: 'SELECT COUNT(*) / 75 FROM users' },
        { id: 'metric-2', sql: 'SELECT COUNT(*) FROM tasks' }
      ];

      const results = validateSQLBatch(queries);

      expect(results[0].id).toBe('metric-1');
      expect(results[1].id).toBe('metric-2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle SQL with comments', () => {
      const sql = `
        -- Calculate completion rate
        SELECT COUNT(*) / 75 /* total builders */ * 100 AS rate
        FROM users
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.sql).not.toContain('/ 75 ');
      expect(result.sql).toContain('SELECT COUNT(*) FROM users');
    });

    it('should handle case insensitive keywords', () => {
      const sql = `
        select COUNT(*) / 75 as rate
        from USERS
        where ACTIVE = TRUE
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.sql).not.toContain('/ 75');
    });

    it('should handle multiple divisions in complex expressions', () => {
      const sql = `
        SELECT
          (COUNT(*) / 75) / (COUNT(DISTINCT day) / 24) AS normalized_rate
        FROM metrics
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.fixes.length).toBeGreaterThanOrEqual(1);
      // At least one denominator should be replaced
      expect(result.sql).toContain('SELECT COUNT(*)');
    });

    it('should handle window functions', () => {
      const sql = `
        SELECT
          user_id,
          COUNT(*) OVER (PARTITION BY cohort) / 75 AS rate
        FROM users
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.sql).not.toContain('/ 75');
    });

    it('should handle UNION queries', () => {
      const sql = `
        SELECT COUNT(*) / 75 AS rate FROM users WHERE active = true
        UNION
        SELECT COUNT(*) / 75 AS rate FROM users WHERE active = false
      `;

      const result = validateAndFixSQL(sql);

      expect(result.hadIssues).toBe(true);
      expect(result.fixes.length).toBe(2); // Should fix both
      expect(result.sql).not.toContain('/ 75');
    });
  });
});
