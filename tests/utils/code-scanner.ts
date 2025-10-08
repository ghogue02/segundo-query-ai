/**
 * Code Scanner Utility
 * Detects hardcoded values in TypeScript/TSX files that should be dynamically calculated
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ScanIssue {
  file: string;
  line: number;
  column: number;
  code: string;
  severity: 'error' | 'warning';
  message: string;
  pattern: string;
  suggestion?: string;
}

export interface ScanResult {
  issues: ScanIssue[];
  filesScanned: number;
  issuesFound: number;
  criticalIssues: number;
}

export interface WhitelistEntry {
  file: string;
  line?: number;
  pattern?: string;
  reason: string;
}

export class CodeScanner {
  private whitelist: WhitelistEntry[] = [];

  // Known hardcoded values to detect
  private readonly HARDCODED_VALUES = {
    activeBuilders: [75],
    classDays: [17, 18],
    totalTasks: [107],
  };

  // Patterns to detect hardcoded values
  private readonly PATTERNS = [
    // JSX prop denominators: {something / 75}
    {
      name: 'jsx-denominator',
      regex: /\{[^}]*\/\s*(17|18|75|107)\s*\}/g,
      severity: 'error' as const,
      message: 'Hardcoded denominator in JSX expression',
      suggestion: 'Use dynamic value from API: {value / stats.activeBuilders}',
    },
    // JSX max props: max={75}
    {
      name: 'jsx-max-prop',
      regex: /max=\{(17|18|75|107)\}/g,
      severity: 'error' as const,
      message: 'Hardcoded max prop value',
      suggestion: 'Use dynamic value: max={stats.activeBuilders}',
    },
    // useState with hardcoded defaults
    {
      name: 'useState-default',
      regex: /useState\s*<[^>]*>\s*\(\s*\{[^}]*(activeBuilders:\s*(75)|classDays:\s*(17|18)|totalTasks:\s*(107))[^}]*\}/g,
      severity: 'error' as const,
      message: 'Hardcoded default value in useState',
      suggestion: 'Initialize state from API data',
    },
    // SQL division by literal numbers
    {
      name: 'sql-division',
      regex: /\)\s*\/\s*(17|18|75|107)(?!\))/g,
      severity: 'error' as const,
      message: 'SQL query dividing by hardcoded number',
      suggestion: 'Use subquery: (SELECT COUNT(*) FROM ...) or parameter $N',
    },
    // ROUND with hardcoded division
    {
      name: 'sql-round-division',
      regex: /ROUND\s*\([^)]*\/\s*(17|18|75|107)/gi,
      severity: 'error' as const,
      message: 'SQL ROUND function with hardcoded divisor',
      suggestion: 'Replace with dynamic subquery',
    },
    // Direct variable assignments
    {
      name: 'variable-assignment',
      regex: /(?:const|let|var)\s+(?:activeBuilders|classDays|totalTasks)\s*=\s*(17|18|75|107)/g,
      severity: 'error' as const,
      message: 'Variable assigned hardcoded value',
      suggestion: 'Fetch from API or database',
    },
    // Object literal with hardcoded values
    {
      name: 'object-literal',
      regex: /\{[^}]*(activeBuilders|classDays|totalTasks)\s*:\s*(17|18|75|107)[^}]*\}/g,
      severity: 'warning' as const,
      message: 'Object literal contains hardcoded metric value',
      suggestion: 'Use dynamic values from state or API',
    },
  ];

  constructor(whitelistPath?: string) {
    if (whitelistPath && fs.existsSync(whitelistPath)) {
      this.loadWhitelist(whitelistPath);
    }
  }

  private loadWhitelist(whitelistPath: string): void {
    try {
      const content = fs.readFileSync(whitelistPath, 'utf-8');
      const parsed = JSON.parse(content);
      this.whitelist = parsed.whitelist || parsed;
      if (!Array.isArray(this.whitelist)) {
        console.warn(`Whitelist is not an array, initializing empty`);
        this.whitelist = [];
      }
    } catch (error) {
      console.warn(`Failed to load whitelist from ${whitelistPath}:`, error);
      this.whitelist = [];
    }
  }

  private isWhitelisted(file: string, line: number, pattern: string): boolean {
    return this.whitelist.some(entry => {
      const fileMatch = entry.file === file || file.includes(entry.file);
      const lineMatch = !entry.line || entry.line === line;
      const patternMatch = !entry.pattern || entry.pattern === pattern;
      return fileMatch && lineMatch && patternMatch;
    });
  }

  /**
   * Scan a single file for hardcoded values
   */
  public scanFile(filePath: string): ScanIssue[] {
    const issues: ScanIssue[] = [];

    // Skip non-TypeScript files
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(filePath))) {
      return issues;
    }

    // Skip test files, mock data, and node_modules
    if (
      filePath.includes('/node_modules/') ||
      filePath.includes('/.next/') ||
      filePath.includes('/tests/mocks/') ||
      filePath.includes('.test.') ||
      filePath.includes('.spec.')
    ) {
      return issues;
    }

    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.warn(`Failed to read file ${filePath}:`, error);
      return issues;
    }

    const lines = content.split('\n');

    // Check each pattern
    for (const pattern of this.PATTERNS) {
      let match: RegExpExecArray | null;
      pattern.regex.lastIndex = 0; // Reset regex state

      while ((match = pattern.regex.exec(content)) !== null) {
        const matchIndex = match.index;
        const lineNumber = content.substring(0, matchIndex).split('\n').length;
        const lineContent = lines[lineNumber - 1];
        const column = matchIndex - content.lastIndexOf('\n', matchIndex - 1);

        // Check if whitelisted
        if (this.isWhitelisted(filePath, lineNumber, pattern.name)) {
          continue;
        }

        issues.push({
          file: filePath,
          line: lineNumber,
          column,
          code: lineContent.trim(),
          severity: pattern.severity,
          message: pattern.message,
          pattern: pattern.name,
          suggestion: pattern.suggestion,
        });
      }
    }

    return issues;
  }

  /**
   * Recursively scan a directory
   */
  public scanDirectory(dirPath: string, extensions = ['.ts', '.tsx']): ScanResult {
    const issues: ScanIssue[] = [];
    let filesScanned = 0;

    const scanRecursive = (currentPath: string) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        // Skip excluded directories
        if (entry.isDirectory()) {
          if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
            scanRecursive(fullPath);
          }
          continue;
        }

        // Only scan specified extensions
        if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
          filesScanned++;
          issues.push(...this.scanFile(fullPath));
        }
      }
    };

    scanRecursive(dirPath);

    return {
      issues,
      filesScanned,
      issuesFound: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'error').length,
    };
  }

  /**
   * Generate HTML report
   */
  public generateHTMLReport(result: ScanResult, outputPath: string): void {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hardcoded Values Regression Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-card h3 {
      margin: 0 0 5px 0;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
    }
    .stat-card .value {
      font-size: 36px;
      font-weight: bold;
      color: #333;
    }
    .stat-card.error .value {
      color: #e53e3e;
    }
    .stat-card.warning .value {
      color: #ed8936;
    }
    .stat-card.success .value {
      color: #38a169;
    }
    .issue {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #e53e3e;
    }
    .issue.warning {
      border-left-color: #ed8936;
    }
    .issue-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    .issue-file {
      font-weight: bold;
      color: #667eea;
    }
    .issue-location {
      color: #666;
      font-size: 14px;
    }
    .issue-severity {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .issue-severity.error {
      background: #fed7d7;
      color: #742a2a;
    }
    .issue-severity.warning {
      background: #feebc8;
      color: #7c2d12;
    }
    .issue-code {
      background: #f7fafc;
      padding: 12px;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      overflow-x: auto;
      margin: 10px 0;
    }
    .issue-message {
      color: #e53e3e;
      margin: 5px 0;
    }
    .issue-suggestion {
      background: #f0fff4;
      border-left: 3px solid #38a169;
      padding: 10px;
      margin-top: 10px;
      font-size: 14px;
    }
    .issue-suggestion strong {
      color: #2f855a;
    }
    .no-issues {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 8px;
    }
    .no-issues h2 {
      color: #38a169;
      font-size: 32px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Hardcoded Values Regression Report</h1>
    <p>Automated scan for hardcoded metric values that should be dynamically calculated</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="summary">
    <div class="stat-card">
      <h3>Files Scanned</h3>
      <div class="value">${result.filesScanned}</div>
    </div>
    <div class="stat-card ${result.criticalIssues > 0 ? 'error' : 'success'}">
      <h3>Critical Issues</h3>
      <div class="value">${result.criticalIssues}</div>
    </div>
    <div class="stat-card ${result.issuesFound - result.criticalIssues > 0 ? 'warning' : 'success'}">
      <h3>Warnings</h3>
      <div class="value">${result.issuesFound - result.criticalIssues}</div>
    </div>
    <div class="stat-card ${result.issuesFound > 0 ? 'error' : 'success'}">
      <h3>Total Issues</h3>
      <div class="value">${result.issuesFound}</div>
    </div>
  </div>

  ${result.issues.length === 0 ? `
    <div class="no-issues">
      <h2>✅ No Hardcoded Values Detected!</h2>
      <p>All metric values are properly dynamically calculated.</p>
    </div>
  ` : `
    <h2>Issues Found (${result.issues.length})</h2>
    ${result.issues.map(issue => `
      <div class="issue ${issue.severity}">
        <div class="issue-header">
          <div>
            <div class="issue-file">${issue.file}</div>
            <div class="issue-location">Line ${issue.line}, Column ${issue.column}</div>
          </div>
          <span class="issue-severity ${issue.severity}">${issue.severity}</span>
        </div>
        <div class="issue-message">${issue.message}</div>
        <div class="issue-code">${this.escapeHtml(issue.code)}</div>
        ${issue.suggestion ? `
          <div class="issue-suggestion">
            <strong>💡 Suggestion:</strong> ${issue.suggestion}
          </div>
        ` : ''}
      </div>
    `).join('')}
  `}
</body>
</html>
    `.trim();

    fs.writeFileSync(outputPath, html, 'utf-8');
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Generate JSON report
   */
  public generateJSONReport(result: ScanResult, outputPath: string): void {
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
  }
}
