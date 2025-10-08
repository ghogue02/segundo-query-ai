#!/bin/bash

# Hardcoded Values Regression Test Runner
# Run this script locally before pushing code to catch hardcoded values early

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_FILE="tests/regression/hardcoded-values.test.ts"
REPORT_DIR="tests/results"
HTML_REPORT="$REPORT_DIR/hardcoded-values-report.html"
JSON_REPORT="$REPORT_DIR/hardcoded-values-report.json"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Hardcoded Values Regression Test Suite              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  echo -e "${RED}❌ Error: Must run from project root${NC}"
  exit 1
fi

# Check if test file exists
if [ ! -f "$PROJECT_ROOT/$TEST_FILE" ]; then
  echo -e "${RED}❌ Error: Test file not found: $TEST_FILE${NC}"
  exit 1
fi

# Create report directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/$REPORT_DIR"

# Function to display usage
usage() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help          Show this help message"
  echo "  -v, --verbose       Run tests with verbose output"
  echo "  -w, --watch         Run tests in watch mode"
  echo "  -c, --coverage      Run tests with coverage report"
  echo "  -q, --quiet         Run tests with minimal output"
  echo "  --no-report         Skip HTML report generation"
  echo "  --open-report       Open HTML report in browser after completion"
  echo ""
  echo "Examples:"
  echo "  $0                  Run tests normally"
  echo "  $0 -v               Run with verbose output"
  echo "  $0 --open-report    Run and open report in browser"
  echo ""
  exit 0
}

# Parse command line arguments
VERBOSE=""
WATCH=""
COVERAGE=""
QUIET=""
NO_REPORT=""
OPEN_REPORT=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      usage
      ;;
    -v|--verbose)
      VERBOSE="--verbose"
      shift
      ;;
    -w|--watch)
      WATCH="--watch"
      shift
      ;;
    -c|--coverage)
      COVERAGE="--coverage"
      shift
      ;;
    -q|--quiet)
      QUIET="--silent"
      shift
      ;;
    --no-report)
      NO_REPORT="true"
      shift
      ;;
    --open-report)
      OPEN_REPORT="true"
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      usage
      ;;
  esac
done

# Check for dependencies
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
  npm install
fi

# Run the tests
echo -e "${BLUE}🧪 Running regression tests...${NC}"
echo ""

TEST_COMMAND="npm test -- $TEST_FILE $VERBOSE $WATCH $COVERAGE $QUIET"

if $TEST_COMMAND; then
  TEST_RESULT=0
  echo ""
  echo -e "${GREEN}✅ All regression tests passed!${NC}"
  echo -e "${GREEN}No hardcoded values detected in the codebase.${NC}"
else
  TEST_RESULT=$?
  echo ""
  echo -e "${RED}❌ Regression tests failed!${NC}"
  echo -e "${RED}Hardcoded values detected in the codebase.${NC}"
fi

# Check if HTML report was generated
if [ -f "$PROJECT_ROOT/$HTML_REPORT" ] && [ -z "$NO_REPORT" ]; then
  echo ""
  echo -e "${BLUE}📊 Reports generated:${NC}"
  echo -e "   HTML: ${YELLOW}$HTML_REPORT${NC}"

  if [ -f "$PROJECT_ROOT/$JSON_REPORT" ]; then
    echo -e "   JSON: ${YELLOW}$JSON_REPORT${NC}"
  fi

  # Open report in browser if requested
  if [ -n "$OPEN_REPORT" ]; then
    echo ""
    echo -e "${BLUE}🌐 Opening HTML report in browser...${NC}"
    if command -v open &> /dev/null; then
      # macOS
      open "$PROJECT_ROOT/$HTML_REPORT"
    elif command -v xdg-open &> /dev/null; then
      # Linux
      xdg-open "$PROJECT_ROOT/$HTML_REPORT"
    elif command -v start &> /dev/null; then
      # Windows
      start "$PROJECT_ROOT/$HTML_REPORT"
    else
      echo -e "${YELLOW}⚠️  Could not detect browser. Please open manually:${NC}"
      echo -e "   file://$PROJECT_ROOT/$HTML_REPORT"
    fi
  else
    echo ""
    echo -e "${BLUE}💡 Tip: View detailed report in your browser:${NC}"
    echo -e "   file://$PROJECT_ROOT/$HTML_REPORT"
    echo ""
    echo -e "${BLUE}Or run with --open-report to open automatically.${NC}"
  fi
fi

# Summary
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${BLUE}║  ${GREEN}✓ Test Suite Passed${BLUE}                                ║${NC}"
  echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${GREEN}✨ Code is ready for commit!${NC}"
else
  echo -e "${BLUE}║  ${RED}✗ Test Suite Failed${BLUE}                                ║${NC}"
  echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${RED}⚠️  Please fix the issues before committing:${NC}"
  echo ""
  echo -e "${YELLOW}Common fixes:${NC}"
  echo -e "  1. Replace hardcoded divisors with API values"
  echo -e "     ${RED}Bad:${NC}  {value / 75}"
  echo -e "     ${GREEN}Good:${NC} {value / stats.activeBuilders}"
  echo ""
  echo -e "  2. Use subqueries in SQL instead of literals"
  echo -e "     ${RED}Bad:${NC}  ... / 75"
  echo -e "     ${GREEN}Good:${NC} ... / (SELECT COUNT(*) FROM users WHERE ...)"
  echo ""
  echo -e "  3. Initialize state from API data, not hardcoded defaults"
  echo -e "     ${RED}Bad:${NC}  useState({ activeBuilders: 75 })"
  echo -e "     ${GREEN}Good:${NC} useState({ activeBuilders: 0 }); // Load from API"
  echo ""
  echo -e "${BLUE}📖 For more details, see:${NC}"
  echo -e "   tests/regression/hardcoded-values.test.ts"
fi

echo ""

exit $TEST_RESULT
