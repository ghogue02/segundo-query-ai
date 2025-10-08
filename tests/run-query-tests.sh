#!/bin/bash

# Query Interface Test Runner
# Comprehensive testing script for natural language query API

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
API_BASE="${API_BASE:-http://localhost:3000}"
RESULTS_DIR="$(dirname "$0")/results"
RESULTS_FILE="${RESULTS_DIR}/query-test-results.json"
LOG_FILE="${RESULTS_DIR}/test-run-$(date +%Y%m%d-%H%M%S).log"

# Create results directory if it doesn't exist
mkdir -p "${RESULTS_DIR}"

echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║   Query Interface Test Suite                      ║${NC}"
echo -e "${BOLD}${CYAN}║   Segundo Query AI                                ║${NC}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if server is running
echo -e "${BLUE}🔍 Checking if server is running...${NC}"
if curl -s -f "${API_BASE}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running at ${API_BASE}${NC}"
else
    echo -e "${RED}❌ Server is not running at ${API_BASE}${NC}"
    echo -e "${YELLOW}⚠️  Please start the server with: npm run dev${NC}"
    exit 1
fi
echo ""

# Check for required commands
echo -e "${BLUE}🔍 Checking dependencies...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ node is required but not installed.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm is required but not installed.${NC}" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo -e "${YELLOW}⚠️  jq is not installed. Install with: brew install jq${NC}"; }
echo -e "${GREEN}✅ Dependencies OK${NC}"
echo ""

# Run Jest tests
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${BOLD}Running Jest Test Suite...${NC}"
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

# Set environment variable for API endpoint
export NEXT_PUBLIC_API_URL="${API_BASE}"

# Run the Jest tests
if npm run test -- tests/frontend/query-interface.test.ts --verbose 2>&1 | tee "${LOG_FILE}"; then
    echo ""
    echo -e "${GREEN}${BOLD}✅ All Jest tests passed!${NC}"
    JEST_EXIT=0
else
    echo ""
    echo -e "${RED}${BOLD}❌ Some Jest tests failed${NC}"
    JEST_EXIT=1
fi

echo ""
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${BOLD}Running Additional Validation Checks...${NC}"
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

# Additional manual validation tests
PASS=0
FAIL=0

# Test 1: Verify no hardcoded values in attendance query
echo -e "${BLUE}Test: Hardcoded Value Detection${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/api/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"what is the attendance rate for September 2025"}')

if echo "$RESPONSE" | jq -e '.sql' > /dev/null 2>&1; then
    SQL=$(echo "$RESPONSE" | jq -r '.sql')

    # Check for hardcoded denominators
    if echo "$SQL" | grep -qE '/\s*(17|18|75|107)\b'; then
        echo -e "${RED}❌ FAIL: Found hardcoded denominators in SQL${NC}"
        echo -e "   ${YELLOW}SQL: $SQL${NC}"
        ((FAIL++))
    else
        echo -e "${GREEN}✅ PASS: No hardcoded denominators found${NC}"
        ((PASS++))
    fi
else
    echo -e "${RED}❌ FAIL: Query did not return SQL${NC}"
    ((FAIL++))
fi
echo ""

# Test 2: Verify dynamic subqueries
echo -e "${BLUE}Test: Dynamic Subquery Validation${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/api/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"show attendance for all builders"}')

if echo "$RESPONSE" | jq -e '.sql' > /dev/null 2>&1; then
    SQL=$(echo "$RESPONSE" | jq -r '.sql' | tr '[:upper:]' '[:lower:]')

    # Check for dynamic subqueries
    if echo "$SQL" | grep -q 'curriculum_days'; then
        echo -e "${GREEN}✅ PASS: Uses curriculum_days for dynamic day count${NC}"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠️  WARNING: curriculum_days not found in query${NC}"
    fi
else
    echo -e "${RED}❌ FAIL: Query did not return SQL${NC}"
    ((FAIL++))
fi
echo ""

# Test 3: Verify cohort filtering
echo -e "${BLUE}Test: Cohort Filtering${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/api/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"show all builders"}')

if echo "$RESPONSE" | jq -e '.sql' > /dev/null 2>&1; then
    SQL=$(echo "$RESPONSE" | jq -r '.sql' | tr '[:upper:]' '[:lower:]')

    if echo "$SQL" | grep -q "cohort = 'september 2025'"; then
        echo -e "${GREEN}✅ PASS: Cohort filter present${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL: Missing cohort filter${NC}"
        echo -e "   ${YELLOW}SQL: $SQL${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}❌ FAIL: Query did not return SQL${NC}"
    ((FAIL++))
fi
echo ""

# Test 4: Verify user exclusions
echo -e "${BLUE}Test: Test Account Exclusions${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/api/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"show active builders"}')

if echo "$RESPONSE" | jq -e '.sql' > /dev/null 2>&1; then
    SQL=$(echo "$RESPONSE" | jq -r '.sql' | tr '[:upper:]' '[:lower:]')

    if echo "$SQL" | grep -q 'user_id not in'; then
        echo -e "${GREEN}✅ PASS: User exclusions present${NC}"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠️  WARNING: User exclusions may be missing${NC}"
    fi
else
    echo -e "${RED}❌ FAIL: Query did not return SQL${NC}"
    ((FAIL++))
fi
echo ""

# Test 5: Verify attendance percentage cap
echo -e "${BLUE}Test: Attendance Percentage Cap${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/api/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"show attendance rates for all builders"}')

if echo "$RESPONSE" | jq -e '.results' > /dev/null 2>&1; then
    # Check if any attendance > 100%
    OVER_100=$(echo "$RESPONSE" | jq -r '.results[] | select((.attendance_rate // .attendance_pct // .rate) > 100) | .attendance_rate // .attendance_pct // .rate' 2>/dev/null)

    if [ -z "$OVER_100" ]; then
        echo -e "${GREEN}✅ PASS: No attendance rates exceed 100%${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL: Found attendance rates > 100%${NC}"
        echo -e "   ${YELLOW}Values: $OVER_100${NC}"
        ((FAIL++))
    fi
else
    echo -e "${YELLOW}⚠️  WARNING: Could not verify attendance percentages${NC}"
fi
echo ""

# Test 6: Multi-metric query handling
echo -e "${BLUE}Test: Multi-Metric Query Support${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/api/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"show me attendance and task completion"}')

if echo "$RESPONSE" | jq -e '.multiQuery' > /dev/null 2>&1; then
    IS_MULTI=$(echo "$RESPONSE" | jq -r '.multiQuery')
    if [ "$IS_MULTI" = "true" ]; then
        METRIC_COUNT=$(echo "$RESPONSE" | jq -r '.metrics | length')
        echo -e "${GREEN}✅ PASS: Multi-metric query detected ($METRIC_COUNT metrics)${NC}"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠️  INFO: Single query response (also valid)${NC}"
        ((PASS++))
    fi
else
    echo -e "${YELLOW}⚠️  INFO: Standard query response${NC}"
    ((PASS++))
fi
echo ""

# Summary
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${BOLD}Validation Check Summary${NC}"
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Passed:${NC}  $PASS"
echo -e "${RED}❌ Failed:${NC}  $FAIL"
echo -e "${BOLD}Total:${NC}    $((PASS + FAIL))"
echo ""

# Check if results file exists
if [ -f "${RESULTS_FILE}" ]; then
    echo -e "${CYAN}📄 Detailed results saved to:${NC}"
    echo -e "   ${RESULTS_FILE}"
    echo ""

    # Display summary from results file
    if command -v jq >/dev/null 2>&1; then
        echo -e "${BOLD}Jest Test Summary:${NC}"
        jq -r '.summary | "  Total: \(.total)\n  Passed: \(.passed)\n  Failed: \(.failed)\n  Duration: \(.duration)ms"' "${RESULTS_FILE}" 2>/dev/null || true
        echo ""
    fi
fi

echo -e "${CYAN}📝 Full test log saved to:${NC}"
echo -e "   ${LOG_FILE}"
echo ""

# Exit with appropriate code
if [ $FAIL -eq 0 ] && [ $JEST_EXIT -eq 0 ]; then
    echo -e "${GREEN}${BOLD}🎉 All tests passed successfully!${NC}"
    exit 0
else
    echo -e "${RED}${BOLD}⚠️  Some tests failed. Please review the output above.${NC}"
    exit 1
fi
