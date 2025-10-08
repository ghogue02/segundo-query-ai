/**
 * Hardcoded Values Regression Test Suite
 * Prevents hardcoded metric values from being re-introduced into the codebase
 *
 * Tests:
 * A. Static Code Analysis - Scans for hardcoded values in source files
 * B. SQL Query Validation - Checks for hardcoded divisors in SQL queries
 * C. API Response Schema - Validates API endpoints return dynamic values
 * D. Component Props Validation - Ensures components have proper prop interfaces
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs';
import { CodeScanner } from '../utils/code-scanner';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const WHITELIST_PATH = path.join(__dirname, '../config/hardcoded-values-whitelist.json');

describe('Hardcoded Values Regression Tests', () => {
  let scanner: CodeScanner;

  beforeAll(() => {
    scanner = new CodeScanner(WHITELIST_PATH);
  });

  describe('A. Static Code Analysis Tests', () => {
    it('should not find hardcoded denominators in JSX expressions', () => {
      const result = scanner.scanDirectory(path.join(PROJECT_ROOT, 'components'));

      const jsxDenominatorIssues = result.issues.filter(
        issue => issue.pattern === 'jsx-denominator'
      );

      if (jsxDenominatorIssues.length > 0) {
        console.error('Found hardcoded JSX denominators:');
        jsxDenominatorIssues.forEach(issue => {
          console.error(`  ${issue.file}:${issue.line} - ${issue.code}`);
        });
      }

      expect(jsxDenominatorIssues).toHaveLength(0);
    });

    it('should not find hardcoded max prop values', () => {
      const result = scanner.scanDirectory(path.join(PROJECT_ROOT, 'components'));

      const maxPropIssues = result.issues.filter(
        issue => issue.pattern === 'jsx-max-prop'
      );

      if (maxPropIssues.length > 0) {
        console.error('Found hardcoded max props:');
        maxPropIssues.forEach(issue => {
          console.error(`  ${issue.file}:${issue.line} - ${issue.code}`);
        });
      }

      expect(maxPropIssues).toHaveLength(0);
    });

    it('should not find hardcoded values in useState defaults', () => {
      const result = scanner.scanDirectory(path.join(PROJECT_ROOT, 'components'));

      const useStateIssues = result.issues.filter(
        issue => issue.pattern === 'useState-default'
      );

      if (useStateIssues.length > 0) {
        console.error('Found hardcoded useState defaults:');
        useStateIssues.forEach(issue => {
          console.error(`  ${issue.file}:${issue.line} - ${issue.code}`);
        });
      }

      expect(useStateIssues).toHaveLength(0);
    });

    it('should not find hardcoded variable assignments in app code', () => {
      const result = scanner.scanDirectory(path.join(PROJECT_ROOT, 'app'));

      const assignmentIssues = result.issues.filter(
        issue => issue.pattern === 'variable-assignment'
      );

      if (assignmentIssues.length > 0) {
        console.error('Found hardcoded variable assignments:');
        assignmentIssues.forEach(issue => {
          console.error(`  ${issue.file}:${issue.line} - ${issue.code}`);
        });
      }

      expect(assignmentIssues).toHaveLength(0);
    });

    it('should scan all TypeScript files and report violations', () => {
      // Scan all major directories
      const directories = ['app', 'components', 'lib'];
      let totalIssues = 0;
      let criticalIssues = 0;

      directories.forEach(dir => {
        const dirPath = path.join(PROJECT_ROOT, dir);
        if (fs.existsSync(dirPath)) {
          const result = scanner.scanDirectory(dirPath);
          totalIssues += result.issuesFound;
          criticalIssues += result.criticalIssues;

          if (result.criticalIssues > 0) {
            console.error(`\n${dir}/ - Found ${result.criticalIssues} critical issues:`);
            result.issues
              .filter(i => i.severity === 'error')
              .forEach(issue => {
                console.error(`  ${issue.file}:${issue.line}`);
                console.error(`    ${issue.message}`);
                console.error(`    Code: ${issue.code}`);
                console.error(`    Fix: ${issue.suggestion || 'See documentation'}\n`);
              });
          }
        }
      });

      // Generate HTML report
      if (totalIssues > 0) {
        const reportDir = path.join(PROJECT_ROOT, 'tests/results');
        if (!fs.existsSync(reportDir)) {
          fs.mkdirSync(reportDir, { recursive: true });
        }

        const combinedResult = {
          issues: [],
          filesScanned: 0,
          issuesFound: totalIssues,
          criticalIssues,
        };

        // Re-scan to generate full report
        directories.forEach(dir => {
          const dirPath = path.join(PROJECT_ROOT, dir);
          if (fs.existsSync(dirPath)) {
            const result = scanner.scanDirectory(dirPath);
            combinedResult.issues.push(...result.issues);
            combinedResult.filesScanned += result.filesScanned;
          }
        });

        scanner.generateHTMLReport(
          combinedResult as any,
          path.join(reportDir, 'hardcoded-values-report.html')
        );

        console.log(`\n📊 HTML Report generated: tests/results/hardcoded-values-report.html`);
      }

      expect(criticalIssues).toBe(0);
    });
  });

  describe('B. SQL Query Validation Tests', () => {
    it('should not find hardcoded divisors in SQL queries', () => {
      const libPath = path.join(PROJECT_ROOT, 'lib/queries');

      if (!fs.existsSync(libPath)) {
        console.warn('lib/queries directory not found, skipping SQL tests');
        return;
      }

      const result = scanner.scanDirectory(libPath);

      const sqlIssues = result.issues.filter(
        issue => issue.pattern === 'sql-division' || issue.pattern === 'sql-round-division'
      );

      if (sqlIssues.length > 0) {
        console.error('Found hardcoded SQL divisors:');
        sqlIssues.forEach(issue => {
          console.error(`  ${issue.file}:${issue.line}`);
          console.error(`    ${issue.message}`);
          console.error(`    Code: ${issue.code}`);
          console.error(`    Fix: ${issue.suggestion}\n`);
        });
      }

      expect(sqlIssues).toHaveLength(0);
    });

    it('should verify SQL queries use subqueries or parameters for divisions', () => {
      const queryFiles = fs.readdirSync(path.join(PROJECT_ROOT, 'lib/queries'))
        .filter(f => f.endsWith('.ts'));

      const violations: string[] = [];

      queryFiles.forEach(file => {
        const filePath = path.join(PROJECT_ROOT, 'lib/queries', file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check for proper patterns
        const hasDivision = /\/\s*\d+/.test(content);
        const hasSubquery = /\(SELECT COUNT\(\*\) FROM/i.test(content);
        const hasParameter = /\$\d+/.test(content);

        if (hasDivision && !hasSubquery && !hasParameter) {
          // Check if the division is by a hardcoded value
          const hardcodedDivisions = content.match(/\/\s*(17|18|75|107)/g);
          if (hardcodedDivisions) {
            violations.push(
              `${file}: Found division by hardcoded value ${hardcodedDivisions.join(', ')}`
            );
          }
        }
      });

      if (violations.length > 0) {
        console.error('SQL Query Violations:');
        violations.forEach(v => console.error(`  ${v}`));
      }

      expect(violations).toHaveLength(0);
    });
  });

  describe('C. API Response Schema Tests', () => {
    it('should verify /api/stats returns required fields', async () => {
      // Mock test - in real scenario, this would make an actual API call
      // or import the route handler and test it directly

      const statsPath = path.join(PROJECT_ROOT, 'app/api/stats/route.ts');
      expect(fs.existsSync(statsPath)).toBe(true);

      const content = fs.readFileSync(statsPath, 'utf-8');

      // Check that the response includes dynamic calculations
      expect(content).toContain('activeBuilders');
      expect(content).toContain('classDays');
      expect(content).toContain('totalTasks');

      // Ensure it's not returning hardcoded values
      expect(content).not.toMatch(/activeBuilders:\s*75/);
      expect(content).not.toMatch(/classDays:\s*(17|18)/);
      expect(content).not.toMatch(/totalTasks:\s*107/);

      // Check for proper database queries
      expect(content).toContain('COUNT(');
      expect(content).toContain('executeQuery');
    });

    it('should verify builder API returns dynamic total_days and total_tasks', () => {
      const builderQueriesPath = path.join(PROJECT_ROOT, 'lib/queries/builderQueries.ts');
      expect(fs.existsSync(builderQueriesPath)).toBe(true);

      const content = fs.readFileSync(builderQueriesPath, 'utf-8');

      // Check interface definitions
      expect(content).toContain('total_days: number');
      expect(content).toContain('total_tasks: number');

      // Ensure no hardcoded values in return statements
      expect(content).not.toMatch(/total_days:\s*(17|18)/);
      expect(content).not.toMatch(/total_tasks:\s*107/);

      // Should use subqueries
      expect(content).toContain('SELECT COUNT');
    });

    it('should verify task API returns dynamic active_builder_count', () => {
      const taskQueriesPath = path.join(PROJECT_ROOT, 'lib/queries/taskQueries.ts');
      expect(fs.existsSync(taskQueriesPath)).toBe(true);

      const content = fs.readFileSync(taskQueriesPath, 'utf-8');

      // Check interface definitions
      expect(content).toContain('active_builder_count: number');

      // Ensure no hardcoded values
      expect(content).not.toMatch(/active_builder_count:\s*75/);

      // Should use subquery or CTE
      expect(content).toMatch(/active_builder_count\s+AS/i);
    });
  });

  describe('D. Component Props Validation Tests', () => {
    it('should verify BuilderProfile interface has dynamic fields', () => {
      const builderQueriesPath = path.join(PROJECT_ROOT, 'lib/queries/builderQueries.ts');
      expect(fs.existsSync(builderQueriesPath)).toBe(true);

      const content = fs.readFileSync(builderQueriesPath, 'utf-8');

      // Check interface completeness
      expect(content).toMatch(/export\s+interface\s+BuilderProfile/);
      expect(content).toContain('total_days: number');
      expect(content).toContain('total_tasks: number');
      expect(content).toContain('attendance_percentage: number');
      expect(content).toContain('completion_percentage: number');
    });

    it('should verify TaskDetail interface has active_builder_count', () => {
      const taskQueriesPath = path.join(PROJECT_ROOT, 'lib/queries/taskQueries.ts');
      expect(fs.existsSync(taskQueriesPath)).toBe(true);

      const content = fs.readFileSync(taskQueriesPath, 'utf-8');

      // Check interface completeness
      expect(content).toMatch(/export\s+interface\s+TaskDetail/);
      expect(content).toContain('active_builder_count: number');
      expect(content).toContain('completion_percentage: number');
    });

    it('should verify components receive props from API data', () => {
      // Scan component files for proper prop usage
      const componentPath = path.join(PROJECT_ROOT, 'components');

      if (!fs.existsSync(componentPath)) {
        console.warn('components directory not found, skipping component tests');
        return;
      }

      const result = scanner.scanDirectory(componentPath);

      // Check for object literals with hardcoded values
      const objectLiteralIssues = result.issues.filter(
        issue => issue.pattern === 'object-literal'
      );

      if (objectLiteralIssues.length > 0) {
        console.warn('Found potential hardcoded values in object literals:');
        objectLiteralIssues.forEach(issue => {
          console.warn(`  ${issue.file}:${issue.line} - ${issue.code}`);
        });
      }

      // This is a warning, not an error, as some object literals are legitimate
      // But we log them for review
      expect(objectLiteralIssues.length).toBeLessThanOrEqual(5);
    });
  });

  describe('E. Integration Tests', () => {
    it('should pass full codebase scan with zero critical issues', () => {
      const directories = ['app', 'components', 'lib'];
      const results: any[] = [];

      directories.forEach(dir => {
        const dirPath = path.join(PROJECT_ROOT, dir);
        if (fs.existsSync(dirPath)) {
          const result = scanner.scanDirectory(dirPath);
          results.push({ directory: dir, ...result });
        }
      });

      const totalCritical = results.reduce((sum, r) => sum + r.criticalIssues, 0);
      const totalIssues = results.reduce((sum, r) => sum + r.issuesFound, 0);

      console.log('\n=== Regression Test Summary ===');
      results.forEach(r => {
        console.log(`${r.directory}/`);
        console.log(`  Files Scanned: ${r.filesScanned}`);
        console.log(`  Critical Issues: ${r.criticalIssues}`);
        console.log(`  Total Issues: ${r.issuesFound}`);
      });
      console.log(`\nTOTAL CRITICAL ISSUES: ${totalCritical}`);
      console.log(`TOTAL ISSUES: ${totalIssues}`);
      console.log('================================\n');

      expect(totalCritical).toBe(0);
    });
  });
});
