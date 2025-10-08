/**
 * SQL Validator Unit Tests
 * Tests the runtime SQL validator that fixes hardcoded denominators
 */

import { describe, it, expect } from '@jest/globals';
import { validateAndFixSQL, hasHardcodedDenominators, validateSQLBatch } from '@/lib/sql-validator';

describe('SQL Validator - Runtime Fixes', () => {
  describe('validateAndFixSQL()', () => {
    describe('Attendance Queries (Class Day Denominators)', () => {
      it('should fix hardcoded /24 with curriculum_days subquery', () => {
        const input = `
          SELECT
            user_id,
            COUNT(DISTINCT attendance_date) / 24 * 100 as attendance_percentage
          FROM builder_attendance_new
          WHERE cohort = 'September 2025'
          GROUP BY user_id
        `;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(true);
        expect(result.fixes).toHaveLength(1);
        expect(result.fixes[0]).toContain('class day count');
        expect(result.fixes[0]).toContain('24');
        expect(result.sql).toContain('SELECT COUNT(*) FROM curriculum_days');
        expect(result.sql).not.toMatch(/\/\s*24\b/);
      });

      it('should fix hardcoded /17 with curriculum_days subquery', () => {
        const input = `SELECT COUNT(*) / 17 * 100 FROM attendance`;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(true);
        expect(result.fixes[0]).toContain('class day count (17)');
        expect(result.sql).toContain('SELECT COUNT(*) FROM curriculum_days');
      });

      it('should fix hardcoded /18 with curriculum_days subquery', () => {
        const input = `SELECT COUNT(*) / 18 * 100 FROM attendance`;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(true);
        expect(result.fixes[0]).toContain('class day count (18)');
        expect(result.sql).toContain('SELECT COUNT(*) FROM curriculum_days');
      });
    });

    describe('Task Completion Queries (Builder Count Denominators)', () => {
      it('should fix hardcoded /75 with users subquery', () => {
        const input = `
          SELECT
            task_id,
            task_title,
            COUNT(DISTINCT user_id) / 75 * 100 as completion_rate
          FROM task_submissions
          GROUP BY task_id, task_title
        `;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(true);
        expect(result.fixes).toHaveLength(1);
        expect(result.fixes[0]).toContain('active builder count');
        expect(result.fixes[0]).toContain('75');
        expect(result.sql).toContain('SELECT COUNT(*) FROM users');
        expect(result.sql).toContain('active = true');
        expect(result.sql).toContain('user_id NOT IN');
        expect(result.sql).not.toMatch(/\/\s*75\b/);
      });

      it('should fix hardcoded /79 with users subquery', () => {
        const input = `SELECT COUNT(*) / 79 * 100 FROM builders`;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(true);
        expect(result.fixes[0]).toContain('active builder count (79)');
        expect(result.sql).toContain('SELECT COUNT(*) FROM users');
      });
    });

    describe('Builder Progress Queries (Task Count Denominators)', () => {
      it('should fix hardcoded /107 with tasks subquery', () => {
        const input = `
          SELECT
            user_id,
            first_name,
            last_name,
            COUNT(DISTINCT task_id) / 107 * 100 as completion_percentage
          FROM task_submissions
          GROUP BY user_id, first_name, last_name
        `;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(true);
        expect(result.fixes).toHaveLength(1);
        expect(result.fixes[0]).toContain('task count');
        expect(result.fixes[0]).toContain('107');
        expect(result.sql).toContain('SELECT COUNT(*) FROM tasks');
        expect(result.sql).toContain('JOIN time_blocks');
        expect(result.sql).toContain('JOIN curriculum_days');
        expect(result.sql).not.toMatch(/\/\s*107\b/);
      });

      it('should fix hardcoded /143 with tasks subquery', () => {
        const input = `SELECT COUNT(*) / 143 * 100 FROM progress`;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(true);
        expect(result.fixes[0]).toContain('task count (143)');
        expect(result.sql).toContain('SELECT COUNT(*) FROM tasks');
      });
    });

    describe('Edge Cases - Should NOT Modify', () => {
      it('should NOT modify WHERE day_number = 24', () => {
        const input = `
          SELECT * FROM curriculum_days
          WHERE day_number = 24
        `;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(false);
        expect(result.fixes).toHaveLength(0);
        expect(result.sql).toBe(input);
      });

      it('should NOT modify LIMIT 24', () => {
        const input = `
          SELECT * FROM tasks
          ORDER BY task_title
          LIMIT 24
        `;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(false);
        expect(result.fixes).toHaveLength(0);
        expect(result.sql).toBe(input);
      });

      it('should NOT modify / 100 (percentage conversion)', () => {
        const input = `
          SELECT
            SUM(late_arrivals) / 100 as late_percentage
          FROM attendance
        `;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(false);
        expect(result.fixes).toHaveLength(0);
        expect(result.sql).toBe(input);
      });

      it('should NOT modify WHERE user_id = 75', () => {
        const input = `
          SELECT * FROM users WHERE user_id = 75
        `;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(false);
        expect(result.sql).toBe(input);
      });

      it('should NOT modify WHERE task_id IN (107, 143)', () => {
        const input = `
          SELECT * FROM tasks WHERE task_id IN (107, 143)
        `;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(false);
        expect(result.sql).toBe(input);
      });
    });

    describe('Multiple Fixes in One Query', () => {
      it('should fix multiple hardcoded denominators of different types', () => {
        const input = `
          SELECT
            u.user_id,
            COUNT(DISTINCT a.attendance_date) / 24 * 100 as attendance_pct,
            COUNT(DISTINCT t.task_id) / 107 * 100 as completion_pct
          FROM users u
          LEFT JOIN attendance a ON u.user_id = a.user_id
          LEFT JOIN task_submissions t ON u.user_id = t.user_id
          GROUP BY u.user_id
        `;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(true);
        expect(result.fixes.length).toBeGreaterThanOrEqual(2);
        expect(result.sql).not.toMatch(/\/\s*24\b/);
        expect(result.sql).not.toMatch(/\/\s*107\b/);
        expect(result.sql).toContain('curriculum_days');
        expect(result.sql).toContain('FROM tasks');
      });

      it('should fix multiple instances of the same denominator', () => {
        const input = `
          SELECT
            task_id,
            COUNT(*) / 75 * 100 as rate1,
            SUM(completed) / 75 * 100 as rate2
          FROM submissions
          GROUP BY task_id
        `;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(true);
        expect(result.fixes).toHaveLength(2);
        expect(result.sql).not.toMatch(/\/\s*75\b/);
        // Should have two instances of the subquery
        const subqueryCount = (result.sql.match(/SELECT COUNT\(\*\) FROM users/g) || []).length;
        expect(subqueryCount).toBe(2);
      });
    });

    describe('Context Detection', () => {
      it('should detect attendance context and use curriculum_days subquery', () => {
        const input = `
          SELECT
            builder_attendance_new.user_id,
            COUNT(*) / 24 * 100
          FROM builder_attendance_new
        `;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(true);
        expect(result.sql).toContain('curriculum_days');
      });

      it('should detect task context and use tasks subquery for /75', () => {
        const input = `
          SELECT
            task_id,
            COUNT(DISTINCT users.user_id) / 75 * 100 as completion_rate
          FROM tasks
          LEFT JOIN task_submissions ON tasks.id = task_submissions.task_id
          LEFT JOIN users ON task_submissions.user_id = users.user_id
        `;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(true);
        // Should use builder count because it's counting users per task
        expect(result.sql).toContain('FROM users WHERE');
      });

      it('should use builder subquery as default when context is unclear', () => {
        const input = `SELECT COUNT(*) / 75 * 100 FROM data`;

        const result = validateAndFixSQL(input);

        expect(result.hadIssues).toBe(true);
        expect(result.sql).toContain('FROM users WHERE');
      });
    });

    describe('SQL Formatting Preservation', () => {
      it('should preserve spacing around division operator', () => {
        const input = `SELECT COUNT(*) / 24 * 100`;
        const result = validateAndFixSQL(input);

        expect(result.sql).toMatch(/\/\s+\(SELECT/);
      });

      it('should preserve line breaks and indentation', () => {
        const input = `
          SELECT
            user_id,
            COUNT(*) / 24 * 100 as percentage
          FROM attendance
        `;

        const result = validateAndFixSQL(input);

        // Should still be multiline
        expect(result.sql).toContain('\n');
        expect(result.sql).toContain('percentage');
      });
    });
  });

  describe('hasHardcodedDenominators()', () => {
    it('should detect hardcoded /24', () => {
      const sql = `SELECT COUNT(*) / 24 * 100 FROM attendance`;
      expect(hasHardcodedDenominators(sql)).toBe(true);
    });

    it('should detect hardcoded /75', () => {
      const sql = `SELECT COUNT(*) / 75 * 100 FROM tasks`;
      expect(hasHardcodedDenominators(sql)).toBe(true);
    });

    it('should detect hardcoded /107', () => {
      const sql = `SELECT COUNT(*) / 107 * 100 FROM progress`;
      expect(hasHardcodedDenominators(sql)).toBe(true);
    });

    it('should NOT detect WHERE clauses', () => {
      const sql = `SELECT * FROM curriculum_days WHERE day_number = 24`;
      expect(hasHardcodedDenominators(sql)).toBe(false);
    });

    it('should NOT detect LIMIT clauses', () => {
      const sql = `SELECT * FROM tasks LIMIT 24`;
      expect(hasHardcodedDenominators(sql)).toBe(false);
    });

    it('should NOT detect / 100 (percentage)', () => {
      const sql = `SELECT SUM(value) / 100 FROM data`;
      expect(hasHardcodedDenominators(sql)).toBe(false);
    });
  });

  describe('validateSQLBatch()', () => {
    it('should validate multiple queries in parallel', () => {
      const queries = [
        { id: 'attendance', sql: 'SELECT COUNT(*) / 24 * 100 FROM attendance' },
        { id: 'completion', sql: 'SELECT COUNT(*) / 107 * 100 FROM tasks' },
        { id: 'rate', sql: 'SELECT COUNT(*) / 75 * 100 FROM builders' }
      ];

      const results = validateSQLBatch(queries);

      expect(results).toHaveLength(3);
      expect(results[0].hadIssues).toBe(true);
      expect(results[0].id).toBe('attendance');
      expect(results[1].hadIssues).toBe(true);
      expect(results[1].id).toBe('completion');
      expect(results[2].hadIssues).toBe(true);
      expect(results[2].id).toBe('rate');
    });

    it('should handle mix of valid and invalid queries', () => {
      const queries = [
        { id: 'bad', sql: 'SELECT COUNT(*) / 24 * 100 FROM attendance' },
        { id: 'good', sql: 'SELECT * FROM users WHERE user_id = 24' }
      ];

      const results = validateSQLBatch(queries);

      expect(results[0].hadIssues).toBe(true);
      expect(results[1].hadIssues).toBe(false);
    });
  });

  describe('Real-World Query Examples', () => {
    it('should fix complex attendance query with DISTINCT and EST timezone', () => {
      const input = `
        SELECT
          u.user_id,
          u.first_name,
          u.last_name,
          COUNT(DISTINCT CASE
            WHEN ba.status IN ('present', 'late')
            THEN DATE(ba.check_in_time AT TIME ZONE 'America/New_York')
          END) as days_attended,
          ROUND(
            COUNT(DISTINCT CASE
              WHEN ba.status IN ('present', 'late')
              THEN DATE(ba.check_in_time AT TIME ZONE 'America/New_York')
            END)::numeric / 24 * 100,
            2
          ) as attendance_percentage
        FROM users u
        LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
        WHERE u.cohort = 'September 2025'
        GROUP BY u.user_id, u.first_name, u.last_name
      `;

      const result = validateAndFixSQL(input);

      expect(result.hadIssues).toBe(true);
      expect(result.sql).not.toMatch(/\/\s*24\b/);
      expect(result.sql).toContain('curriculum_days');
      expect(result.sql).toContain('attendance'); // Should detect attendance context
    });

    it('should fix task completion query with UNION approach', () => {
      const input = `
        SELECT
          u.user_id,
          u.first_name,
          u.last_name,
          COUNT(DISTINCT completed_tasks.task_id) as tasks_completed,
          ROUND(
            COUNT(DISTINCT completed_tasks.task_id)::numeric / 107 * 100,
            2
          ) as completion_percentage
        FROM users u
        LEFT JOIN LATERAL (
          SELECT task_id FROM task_submissions
          WHERE user_id = u.user_id
          UNION
          SELECT task_id FROM task_threads
          WHERE user_id = u.user_id
        ) completed_tasks ON true
        WHERE u.cohort = 'September 2025'
        GROUP BY u.user_id, u.first_name, u.last_name
      `;

      const result = validateAndFixSQL(input);

      expect(result.hadIssues).toBe(true);
      expect(result.sql).not.toMatch(/\/\s*107\b/);
      expect(result.sql).toContain('FROM tasks');
      expect(result.sql).toContain('JOIN time_blocks');
    });

    it('should fix multi-metric dashboard query', () => {
      const input = `
        SELECT
          'attendance' as metric,
          COUNT(*) / 24 * 100 as value
        FROM attendance
        UNION ALL
        SELECT
          'completion' as metric,
          COUNT(*) / 107 * 100 as value
        FROM tasks
        UNION ALL
        SELECT
          'participation' as metric,
          COUNT(*) / 75 * 100 as value
        FROM builders
      `;

      const result = validateAndFixSQL(input);

      expect(result.hadIssues).toBe(true);
      expect(result.fixes.length).toBeGreaterThanOrEqual(3);
      expect(result.sql).not.toMatch(/\/\s*24\b/);
      expect(result.sql).not.toMatch(/\/\s*107\b/);
      expect(result.sql).not.toMatch(/\/\s*75\b/);
    });

    it('should handle nested subqueries with hardcoded values', () => {
      const input = `
        SELECT
          task_id,
          (
            SELECT COUNT(*) / 75 * 100
            FROM task_submissions
            WHERE task_submissions.task_id = tasks.id
          ) as completion_rate
        FROM tasks
      `;

      const result = validateAndFixSQL(input);

      expect(result.hadIssues).toBe(true);
      expect(result.sql).not.toMatch(/\/\s*75\b/);
    });
  });

  describe('Error Cases', () => {
    it('should handle empty SQL string', () => {
      const result = validateAndFixSQL('');

      expect(result.hadIssues).toBe(false);
      expect(result.fixes).toHaveLength(0);
      expect(result.sql).toBe('');
    });

    it('should handle SQL with no divisions', () => {
      const input = `SELECT * FROM users WHERE cohort = 'September 2025'`;
      const result = validateAndFixSQL(input);

      expect(result.hadIssues).toBe(false);
      expect(result.sql).toBe(input);
    });

    it('should handle SQL with valid divisions only', () => {
      const input = `
        SELECT
          total_points / total_attempts as average,
          revenue / 100.0 as dollars
        FROM stats
      `;

      const result = validateAndFixSQL(input);

      expect(result.hadIssues).toBe(false);
      expect(result.sql).toBe(input);
    });
  });
});
