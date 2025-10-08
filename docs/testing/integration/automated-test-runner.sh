#!/bin/bash

# Integration Testing Automated Runner
# Tests TEAM 1 (Data Accuracy) + TEAM 2 (Accessibility/UX) integration

set -e  # Exit on error

echo "=========================================="
echo "INTEGRATION TESTING SUITE"
echo "Testing TEAM 1 + TEAM 2 Fixes"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results file
RESULTS_FILE="/Users/greghogue/Curricullum/segundo-query-ai/docs/testing/integration/test-results.txt"
> "$RESULTS_FILE"  # Clear previous results

# Function to log results
log_result() {
    local test_name="$1"
    local status="$2"
    local details="$3"

    echo "$status | $test_name | $details" >> "$RESULTS_FILE"

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $test_name - $details"
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: $test_name - $details"
    fi
}

# Check if server is running
echo "Checking development server..."
if curl -s http://localhost:3000 > /dev/null; then
    log_result "Dev Server Check" "PASS" "Server responding at localhost:3000"
else
    log_result "Dev Server Check" "FAIL" "Server not responding - start with 'npm run dev'"
    exit 1
fi

echo ""
echo "=========================================="
echo "PART 1: DATA ACCURACY TESTS"
echo "=========================================="
echo ""

# Test 1.1: Check Quality API returns data
echo "Test 1.1: Quality API endpoint..."
QUALITY_RESPONSE=$(curl -s "http://localhost:3000/api/metrics/quality?cohort=September%202025")
if echo "$QUALITY_RESPONSE" | grep -q "rubricBreakdown"; then
    log_result "Quality API Endpoint" "PASS" "Returns rubricBreakdown data"
else
    log_result "Quality API Endpoint" "FAIL" "Missing rubricBreakdown in response"
fi

# Test 1.2: Check KPIs API
echo "Test 1.2: KPIs API endpoint..."
KPI_RESPONSE=$(curl -s "http://localhost:3000/api/metrics/kpis?cohort=September%202025")
if echo "$KPI_RESPONSE" | grep -q "activeBuildersToday"; then
    log_result "KPIs API Endpoint" "PASS" "Returns KPI data"

    # Extract attendance rate and check it's <= 100
    ATTENDANCE_RATE=$(echo "$KPI_RESPONSE" | grep -o '"attendanceRate":[0-9]*' | cut -d':' -f2)
    if [ -n "$ATTENDANCE_RATE" ] && [ "$ATTENDANCE_RATE" -le 100 ]; then
        log_result "Attendance Rate Cap" "PASS" "Attendance rate is $ATTENDANCE_RATE% (≤100%)"
    else
        log_result "Attendance Rate Cap" "FAIL" "Attendance rate is $ATTENDANCE_RATE% (>100%)"
    fi
else
    log_result "KPIs API Endpoint" "FAIL" "Missing expected KPI fields"
fi

# Test 1.3: Check drill-down API for unique builder scores
echo "Test 1.3: Drill-down API for quality rubric..."
DRILLDOWN_RESPONSE=$(curl -s "http://localhost:3000/api/metrics/drill-down/quality-rubric?cohort=September%202025")
if echo "$DRILLDOWN_RESPONSE" | grep -q '"data"'; then
    # Count unique builder entries
    BUILDER_COUNT=$(echo "$DRILLDOWN_RESPONSE" | grep -o '"builder_id"' | wc -l | tr -d ' ')
    if [ "$BUILDER_COUNT" -ge 70 ]; then
        log_result "Quality Drill-down Data" "PASS" "Found $BUILDER_COUNT builder entries"
    else
        log_result "Quality Drill-down Data" "WARN" "Found only $BUILDER_COUNT builder entries (expected ~76)"
    fi
else
    log_result "Quality Drill-down Data" "FAIL" "No data returned from drill-down API"
fi

echo ""
echo "=========================================="
echo "PART 2: ACCESSIBILITY TESTS"
echo "=========================================="
echo ""

# Test 2.1: Check HTML has proper ARIA attributes
echo "Test 2.1: ARIA attributes in metrics page..."
METRICS_HTML=$(curl -s http://localhost:3000/metrics)

if echo "$METRICS_HTML" | grep -q 'role="button"'; then
    log_result "ARIA role=button" "PASS" "KPI cards have role=button"
else
    log_result "ARIA role=button" "FAIL" "Missing role=button on interactive elements"
fi

if echo "$METRICS_HTML" | grep -q 'aria-label'; then
    log_result "ARIA labels" "PASS" "ARIA labels present"
else
    log_result "ARIA labels" "FAIL" "Missing ARIA labels"
fi

if echo "$METRICS_HTML" | grep -q 'tabIndex'; then
    log_result "Keyboard Navigation" "PASS" "tabIndex attributes present"
else
    log_result "Keyboard Navigation" "WARN" "tabIndex may be missing (check rendered DOM)"
fi

echo ""
echo "=========================================="
echo "PART 3: API CONSISTENCY TESTS"
echo "=========================================="
echo ""

# Test 3.1: Verify 76 active builders consistently
echo "Test 3.1: Active builder count consistency..."
TOTAL_BUILDERS=$(echo "$KPI_RESPONSE" | grep -o '"totalBuilders":[0-9]*' | cut -d':' -f2)
if [ "$TOTAL_BUILDERS" = "76" ]; then
    log_result "Active Builder Count" "PASS" "totalBuilders = 76 (correct)"
elif [ "$TOTAL_BUILDERS" = "78" ]; then
    log_result "Active Builder Count" "FAIL" "totalBuilders = 78 (should be 76 - excluded users not filtered)"
else
    log_result "Active Builder Count" "WARN" "totalBuilders = $TOTAL_BUILDERS (expected 76)"
fi

# Test 3.2: Check H1 hypothesis data
echo "Test 3.2: H1 hypothesis chart data..."
H1_RESPONSE=$(curl -s "http://localhost:3000/api/metrics/hypotheses/h1?cohort=September%202025")
if echo "$H1_RESPONSE" | grep -q '"data"'; then
    # Check for attendance values >100
    if echo "$H1_RESPONSE" | grep -qE '"attendance":[0-9]{3,}'; then
        log_result "H1 Attendance Cap" "FAIL" "H1 chart may have attendance >100%"
    else
        log_result "H1 Attendance Cap" "PASS" "H1 chart attendance values appear valid"
    fi
else
    log_result "H1 API Endpoint" "FAIL" "No data returned from H1 API"
fi

echo ""
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo ""

# Count results
TOTAL_TESTS=$(wc -l < "$RESULTS_FILE" | tr -d ' ')
PASSED=$(grep "^PASS" "$RESULTS_FILE" | wc -l | tr -d ' ')
FAILED=$(grep "^FAIL" "$RESULTS_FILE" | wc -l | tr -d ' ')
WARNINGS=$(grep "^WARN" "$RESULTS_FILE" | wc -l | tr -d ' ')

echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

# Calculate pass rate
if [ "$TOTAL_TESTS" -gt 0 ]; then
    PASS_RATE=$((PASSED * 100 / TOTAL_TESTS))
    echo "Pass Rate: $PASS_RATE%"
else
    PASS_RATE=0
fi

echo ""
echo "Detailed results saved to: $RESULTS_FILE"
echo ""

# Exit with appropriate code
if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}❌ INTEGRATION TESTS FAILED${NC}"
    echo "Review failures above and in $RESULTS_FILE"
    exit 1
elif [ "$PASS_RATE" -ge 80 ]; then
    echo -e "${GREEN}✅ INTEGRATION TESTS PASSED${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  INTEGRATION TESTS PASSED WITH WARNINGS${NC}"
    exit 0
fi
