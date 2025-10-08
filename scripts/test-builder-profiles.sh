#!/bin/bash

# Comprehensive Builder Profile API Test Script
# Tests 25 builders across different engagement patterns

BASE_URL="https://segundo-query-mwytwa73y-gregs-projects-61e51c01.vercel.app"
RESULTS_FILE="/tmp/builder-profile-test-results.json"
SUMMARY_FILE="/tmp/builder-profile-test-summary.txt"

# Initialize results
echo "[]" > $RESULTS_FILE
echo "=== Builder Profile API Test Results ===" > $SUMMARY_FILE
echo "Started: $(date)" >> $SUMMARY_FILE
echo "" >> $SUMMARY_FILE

# Test categories
declare -a HIGH_ATTENDANCE=(241 246 257 261)
declare -a LOW_ATTENDANCE=(256 268 273 278 282)
declare -a MANY_SUBMISSIONS=(141)
declare -a FEW_SUBMISSIONS=(245 248 262 266 269)
declare -a MEDIUM_RANGE=(250 260 270 280 290 295 303 242 243 244 252 254 258 264 265)

# Counters
TOTAL_TESTS=0
SUCCESSFUL_TESTS=0
FAILED_TESTS=0
TIMEOUT_TESTS=0

# Function to test single builder
test_builder() {
  local user_id=$1
  local category=$2

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  echo -n "Testing builder $user_id ($category)... "

  # Make API request with timeout
  response=$(curl -s -w "\n%{http_code}\n%{time_total}" --max-time 30 \
    "$BASE_URL/api/builder/$user_id" 2>&1)

  exit_code=$?

  if [ $exit_code -eq 28 ]; then
    echo "TIMEOUT (>30s)"
    TIMEOUT_TESTS=$((TIMEOUT_TESTS + 1))
    echo "  - Builder $user_id: TIMEOUT" >> $SUMMARY_FILE
    return
  fi

  # Parse response
  body=$(echo "$response" | head -n -2)
  http_code=$(echo "$response" | tail -n 2 | head -n 1)
  time_total=$(echo "$response" | tail -n 1)

  # Check if successful
  if [ "$http_code" == "200" ]; then
    # Validate JSON structure
    has_user_id=$(echo "$body" | jq -e '.user_id' > /dev/null 2>&1; echo $?)
    has_completion=$(echo "$body" | jq -e '.completion_percentage' > /dev/null 2>&1; echo $?)
    has_attendance=$(echo "$body" | jq -e '.attendance_percentage' > /dev/null 2>&1; echo $?)

    if [ $has_user_id -eq 0 ] && [ $has_completion -eq 0 ] && [ $has_attendance -eq 0 ]; then
      echo "SUCCESS (${time_total}s)"
      SUCCESSFUL_TESTS=$((SUCCESSFUL_TESTS + 1))

      # Extract key metrics
      completion=$(echo "$body" | jq -r '.completion_percentage')
      attendance=$(echo "$body" | jq -r '.attendance_percentage')

      echo "  - Builder $user_id: SUCCESS - Completion: $completion%, Attendance: $attendance% (${time_total}s)" >> $SUMMARY_FILE
    else
      echo "FAILED (Invalid JSON structure)"
      FAILED_TESTS=$((FAILED_TESTS + 1))
      echo "  - Builder $user_id: FAILED - Missing required fields" >> $SUMMARY_FILE
    fi
  else
    echo "FAILED (HTTP $http_code)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    error_msg=$(echo "$body" | jq -r '.error' 2>/dev/null || echo "Unknown error")
    echo "  - Builder $user_id: FAILED - HTTP $http_code - $error_msg" >> $SUMMARY_FILE
  fi
}

# Test all categories
echo "Testing HIGH ATTENDANCE builders..."
for user_id in "${HIGH_ATTENDANCE[@]}"; do
  test_builder $user_id "high_attendance"
done

echo ""
echo "Testing LOW ATTENDANCE builders..."
for user_id in "${LOW_ATTENDANCE[@]}"; do
  test_builder $user_id "low_attendance"
done

echo ""
echo "Testing MANY SUBMISSIONS builders..."
for user_id in "${MANY_SUBMISSIONS[@]}"; do
  test_builder $user_id "many_submissions"
done

echo ""
echo "Testing FEW SUBMISSIONS builders..."
for user_id in "${FEW_SUBMISSIONS[@]}"; do
  test_builder $user_id "few_submissions"
done

echo ""
echo "Testing MEDIUM RANGE builders..."
for user_id in "${MEDIUM_RANGE[@]}"; do
  test_builder $user_id "medium_range"
done

# Calculate success rate
SUCCESS_RATE=$(echo "scale=1; $SUCCESSFUL_TESTS * 100 / $TOTAL_TESTS" | bc)

# Print summary
echo "" >> $SUMMARY_FILE
echo "=== SUMMARY ===" >> $SUMMARY_FILE
echo "Total Tests: $TOTAL_TESTS" >> $SUMMARY_FILE
echo "Successful: $SUCCESSFUL_TESTS" >> $SUMMARY_FILE
echo "Failed: $FAILED_TESTS" >> $SUMMARY_FILE
echo "Timeouts: $TIMEOUT_TESTS" >> $SUMMARY_FILE
echo "Success Rate: $SUCCESS_RATE%" >> $SUMMARY_FILE
echo "Completed: $(date)" >> $SUMMARY_FILE

echo ""
echo "=== TEST SUMMARY ==="
echo "Total Tests: $TOTAL_TESTS"
echo "Successful: $SUCCESSFUL_TESTS"
echo "Failed: $FAILED_TESTS"
echo "Timeouts: $TIMEOUT_TESTS"
echo "Success Rate: $SUCCESS_RATE%"
echo ""
echo "Full results saved to: $SUMMARY_FILE"
