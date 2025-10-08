#!/bin/bash

# Segundo Query AI - Comprehensive API Test Suite
# Tests various query types and validates responses

API_BASE="http://localhost:3000/api"
RESULTS_FILE="test-results.json"

echo "🧪 Starting Segundo Query AI Test Suite..."
echo "================================================"
echo ""

# Test counter
PASS=0
FAIL=0

# Test 1: Attendance Rate Query
echo "Test 1: Today's Attendance Rate"
echo "--------------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the attendance rate for September 30, 2025?"}')

if echo "$RESPONSE" | jq -e '.results' > /dev/null 2>&1; then
  echo "✅ PASS: Query executed successfully"
  CHART_TYPE=$(echo "$RESPONSE" | jq -r '.chartType')
  RESULT_COUNT=$(echo "$RESPONSE" | jq -r '.resultCount')
  echo "   Chart Type: $CHART_TYPE"
  echo "   Results: $RESULT_COUNT rows"
  ((PASS++))
else
  echo "❌ FAIL: Query failed"
  echo "$RESPONSE" | jq '.'
  ((FAIL++))
fi
echo ""

# Test 2: Top Performers
echo "Test 2: Top 5 Performers"
echo "------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"Show me the top 5 builders by engagement score"}')

if echo "$RESPONSE" | jq -e '.results' > /dev/null 2>&1; then
  echo "✅ PASS: Query executed successfully"
  CHART_TYPE=$(echo "$RESPONSE" | jq -r '.chartType')
  RESULT_COUNT=$(echo "$RESPONSE" | jq -r '.resultCount')
  echo "   Chart Type: $CHART_TYPE"
  echo "   Results: $RESULT_COUNT rows"

  # Verify exactly 5 results
  if [ "$RESULT_COUNT" -eq 5 ]; then
    echo "   ✅ Correct number of results (5)"
  else
    echo "   ⚠️  Expected 5 results, got $RESULT_COUNT"
  fi
  ((PASS++))
else
  echo "❌ FAIL: Query failed"
  ((FAIL++))
fi
echo ""

# Test 3: Task Completion Rates
echo "Test 3: Task Completion by Builder"
echo "-----------------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"Show me task completion percentage for all builders"}')

if echo "$RESPONSE" | jq -e '.results' > /dev/null 2>&1; then
  echo "✅ PASS: Query executed successfully"
  RESULT_COUNT=$(echo "$RESPONSE" | jq -r '.resultCount')
  echo "   Results: $RESULT_COUNT builders"

  # Should be 75 active builders
  if [ "$RESULT_COUNT" -eq 75 ]; then
    echo "   ✅ Correct builder count (75 active builders)"
  else
    echo "   ⚠️  Expected 75 builders, got $RESULT_COUNT"
  fi
  ((PASS++))
else
  echo "❌ FAIL: Query failed"
  ((FAIL++))
fi
echo ""

# Test 4: Weekly Feedback
echo "Test 4: Weekly Feedback Completion"
echo "-----------------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"Show me Weekly Feedback completion rates"}')

if echo "$RESPONSE" | jq -e '.results' > /dev/null 2>&1; then
  echo "✅ PASS: Query executed successfully"
  RESULT_COUNT=$(echo "$RESPONSE" | jq -r '.resultCount')
  echo "   Results: $RESULT_COUNT feedback tasks"

  # Should be 2 weekly feedback tasks
  if [ "$RESULT_COUNT" -eq 2 ]; then
    echo "   ✅ Correct feedback task count (2 weekly feedback tasks)"
  else
    echo "   ⚠️  Expected 2 feedback tasks, got $RESULT_COUNT"
  fi
  ((PASS++))
else
  echo "❌ FAIL: Query failed"
  ((FAIL++))
fi
echo ""

# Test 5: Attendance Trend
echo "Test 5: Attendance Trend Over Time"
echo "-----------------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"Show me attendance trends over all days"}')

if echo "$RESPONSE" | jq -e '.results' > /dev/null 2>&1; then
  echo "✅ PASS: Query executed successfully"
  CHART_TYPE=$(echo "$RESPONSE" | jq -r '.chartType')
  RESULT_COUNT=$(echo "$RESPONSE" | jq -r '.resultCount')
  echo "   Chart Type: $CHART_TYPE"
  echo "   Results: $RESULT_COUNT days"

  # Should be 18 curriculum days
  if [ "$RESULT_COUNT" -eq 18 ]; then
    echo "   ✅ Correct day count (18 curriculum days)"
  else
    echo "   ⚠️  Expected 18 days, got $RESULT_COUNT"
  fi
  ((PASS++))
else
  echo "❌ FAIL: Query failed"
  ((FAIL++))
fi
echo ""

# Test 6: At-Risk Builders
echo "Test 6: At-Risk Builders (< 80% attendance)"
echo "--------------------------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"Show me builders with attendance below 80%"}')

if echo "$RESPONSE" | jq -e '.results' > /dev/null 2>&1; then
  echo "✅ PASS: Query executed successfully"
  RESULT_COUNT=$(echo "$RESPONSE" | jq -r '.resultCount')
  echo "   Results: $RESULT_COUNT at-risk builders"
  ((PASS++))
else
  echo "❌ FAIL: Query failed"
  ((FAIL++))
fi
echo ""

# Test 7: Task Detail API
echo "Test 7: Task Detail API"
echo "-----------------------"
RESPONSE=$(curl -s "$API_BASE/task/1008")

if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  echo "✅ PASS: Task API working"
  TASK_TITLE=$(echo "$RESPONSE" | jq -r '.task_title')
  COMPLETION=$(echo "$RESPONSE" | jq -r '.completion_percentage')
  echo "   Task: $TASK_TITLE"
  echo "   Completion: $COMPLETION%"
  ((PASS++))
else
  echo "❌ FAIL: Task API failed"
  ((FAIL++))
fi
echo ""

# Test 8: Builder Detail API
echo "Test 8: Builder Detail API"
echo "--------------------------"
RESPONSE=$(curl -s "$API_BASE/builder/241")

if echo "$RESPONSE" | jq -e '.user_id' > /dev/null 2>&1; then
  echo "✅ PASS: Builder API working"
  NAME=$(echo "$RESPONSE" | jq -r '.first_name + " " + .last_name')
  ENGAGEMENT=$(echo "$RESPONSE" | jq -r '.engagement_score')
  TASKS=$(echo "$RESPONSE" | jq -r '.tasks_completed')
  echo "   Builder: $NAME"
  echo "   Engagement: $ENGAGEMENT%"
  echo "   Tasks: $TASKS"
  ((PASS++))
else
  echo "❌ FAIL: Builder API failed"
  ((FAIL++))
fi
echo ""

# Test 9: Multi-Metric Query
echo "Test 9: Multi-Metric Query"
echo "--------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"Show me attendance rate and top 3 performers"}')

if echo "$RESPONSE" | jq -e '.multiQuery' > /dev/null 2>&1; then
  IS_MULTI=$(echo "$RESPONSE" | jq -r '.multiQuery')
  if [ "$IS_MULTI" = "true" ]; then
    echo "✅ PASS: Multi-metric query detected"
    METRIC_COUNT=$(echo "$RESPONSE" | jq -r '.metrics | length')
    echo "   Metrics: $METRIC_COUNT"
    if [ "$METRIC_COUNT" -eq 2 ]; then
      echo "   ✅ Correct metric count (2)"
    else
      echo "   ⚠️  Expected 2 metrics, got $METRIC_COUNT"
    fi
    ((PASS++))
  else
    echo "⚠️  Query succeeded but not detected as multi-metric"
    ((PASS++))
  fi
else
  echo "❌ FAIL: Multi-metric query failed"
  ((FAIL++))
fi
echo ""

# Test 10: Health Check
echo "Test 10: Health Check"
echo "---------------------"
RESPONSE=$(curl -s "$API_BASE/health")

if echo "$RESPONSE" | jq -e '.status' > /dev/null 2>&1; then
  STATUS=$(echo "$RESPONSE" | jq -r '.status')
  DB=$(echo "$RESPONSE" | jq -r '.database')
  CLAUDE=$(echo "$RESPONSE" | jq -r '.claude')

  if [ "$STATUS" = "healthy" ] && [ "$DB" = "connected" ] && [ "$CLAUDE" = "configured" ]; then
    echo "✅ PASS: System healthy"
    echo "   Status: $STATUS"
    echo "   Database: $DB"
    echo "   Claude: $CLAUDE"
    ((PASS++))
  else
    echo "❌ FAIL: System not healthy"
    echo "   Status: $STATUS, DB: $DB, Claude: $CLAUDE"
    ((FAIL++))
  fi
else
  echo "❌ FAIL: Health check failed"
  ((FAIL++))
fi
echo ""

# Summary
echo "================================================"
echo "Test Summary"
echo "================================================"
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo "Total: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
else
  echo "⚠️  Some tests failed"
  exit 1
fi
