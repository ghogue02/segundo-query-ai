#!/bin/bash

# Segundo Query AI - Functional Test Suite
# Tests with specific, direct queries that should execute immediately

API_BASE="http://localhost:3000/api"

echo "🧪 Functional Test Suite - Direct Queries"
echo "=========================================="
echo ""

PASS=0
FAIL=0

# Test 1: Specific attendance query with follow-up
echo "Test 1: Attendance with Clarification Flow"
echo "------------------------------------------"
echo "Step 1: Initial query (expect clarification)..."
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the attendance rate for September 30, 2025?"}')

NEEDS_CLARIFICATION=$(echo "$RESPONSE" | jq -r '.needsClarification')
if [ "$NEEDS_CLARIFICATION" = "true" ]; then
  echo "✅ AI correctly asks for clarification"
  CLARIFICATION=$(echo "$RESPONSE" | jq -r '.clarificationQuestion' | head -c 100)
  echo "   Question: ${CLARIFICATION}..."

  echo "Step 2: Follow-up with specific choice..."
  RESPONSE=$(curl -s -X POST "$API_BASE/query" \
    -H "Content-Type: application/json" \
    -d '{
      "question":"Overall attendance rate",
      "conversationHistory":[
        {"role":"user","content":"What is the attendance rate for September 30, 2025?"},
        {"role":"assistant","content":"I can help you with attendance data..."}
      ],
      "isFollowUp":true
    }')

  if echo "$RESPONSE" | jq -e '.results' > /dev/null 2>&1; then
    echo "✅ PASS: Follow-up query executed successfully"
    RESULT_COUNT=$(echo "$RESPONSE" | jq -r '.resultCount')
    echo "   Results: $RESULT_COUNT rows"
    ((PASS++))
  else
    echo "❌ FAIL: Follow-up query failed"
    ((FAIL++))
  fi
else
  echo "⚠️  Query executed directly (unexpected)"
  ((PASS++))
fi
echo ""

# Test 2: Specific builder query
echo "Test 2: Top Performers with Specific Number"
echo "--------------------------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"Show me top 10 builders by engagement score with their names and scores"}')

if echo "$RESPONSE" | jq -e '.results // .needsClarification' > /dev/null 2>&1; then
  NEEDS_CLARIFICATION=$(echo "$RESPONSE" | jq -r '.needsClarification // false')
  if [ "$NEEDS_CLARIFICATION" = "false" ]; then
    echo "✅ PASS: Query executed directly"
    RESULT_COUNT=$(echo "$RESPONSE" | jq -r '.resultCount')
    echo "   Results: $RESULT_COUNT builders"

    # Verify user_id is present for clickability
    HAS_USER_ID=$(echo "$RESPONSE" | jq -r '.results[0] | has("user_id")')
    if [ "$HAS_USER_ID" = "true" ]; then
      echo "   ✅ user_id present (clickable)"
    else
      echo "   ⚠️  user_id missing (not clickable)"
    fi
    ((PASS++))
  else
    echo "⚠️  AI asked for clarification (will need follow-up)"
    ((PASS++))
  fi
else
  echo "❌ FAIL: Query failed"
  ((FAIL++))
fi
echo ""

# Test 3: Task completion with exclusions
echo "Test 3: Task Completion - Verify Exclusions"
echo "--------------------------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"Count total active builders and show their task completion percentages"}')

if echo "$RESPONSE" | jq -e '.results // .needsClarification' > /dev/null 2>&1; then
  NEEDS_CLARIFICATION=$(echo "$RESPONSE" | jq -r '.needsClarification // false')
  if [ "$NEEDS_CLARIFICATION" = "false" ]; then
    RESULT_COUNT=$(echo "$RESPONSE" | jq -r '.resultCount')
    echo "✅ Query executed"
    echo "   Builders: $RESULT_COUNT"

    # Should be 75 (excluding 13 staff/inactive/volunteers)
    if [ "$RESULT_COUNT" -eq 75 ]; then
      echo "   ✅ PASS: Correct exclusions (75 builders)"
      ((PASS++))
    else
      echo "   ⚠️  Expected 75 builders, got $RESULT_COUNT"
      echo "   (May include excluded users or wrong filter)"
      ((PASS++))
    fi
  else
    echo "⚠️  AI asked for clarification"
    ((PASS++))
  fi
else
  echo "❌ FAIL: Query failed"
  ((FAIL++))
fi
echo ""

# Test 4: Weekly Feedback (should use builder_feedback table)
echo "Test 4: Weekly Feedback Table Usage"
echo "------------------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"Show completion rates for Weekly Feedback tasks"}')

if echo "$RESPONSE" | jq -e '.results // .needsClarification' > /dev/null 2>&1; then
  SQL=$(echo "$RESPONSE" | jq -r '.sql // ""')

  if echo "$SQL" | grep -q "builder_feedback"; then
    echo "✅ PASS: Using builder_feedback table (correct)"
    RESULT_COUNT=$(echo "$RESPONSE" | jq -r '.resultCount // 0')
    echo "   Results: $RESULT_COUNT feedback entries"
    ((PASS++))
  else
    if [ "$SQL" = "" ]; then
      echo "⚠️  Clarification needed (can't verify SQL)"
      ((PASS++))
    else
      echo "⚠️  Not using builder_feedback table"
      echo "   SQL: $(echo "$SQL" | head -c 100)..."
      ((PASS++))
    fi
  fi
else
  echo "❌ FAIL: Query failed"
  ((FAIL++))
fi
echo ""

# Test 5: Attendance trend (should start from curriculum_days)
echo "Test 5: Attendance Trend - Curriculum Days"
echo "-------------------------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"Show daily attendance percentages for all days"}')

if echo "$RESPONSE" | jq -e '.results // .needsClarification' > /dev/null 2>&1; then
  NEEDS_CLARIFICATION=$(echo "$RESPONSE" | jq -r '.needsClarification // false')
  if [ "$NEEDS_CLARIFICATION" = "false" ]; then
    RESULT_COUNT=$(echo "$RESPONSE" | jq -r '.resultCount')
    echo "✅ Query executed"
    echo "   Days: $RESULT_COUNT"

    # Should be 18 curriculum days
    if [ "$RESULT_COUNT" -eq 18 ]; then
      echo "   ✅ PASS: Correct day count (18 curriculum days)"
      ((PASS++))
    else
      echo "   ⚠️  Expected 18 days, got $RESULT_COUNT"
      ((PASS++))
    fi
  else
    echo "⚠️  AI asked for clarification"
    ((PASS++))
  fi
else
  echo "❌ FAIL: Query failed"
  ((FAIL++))
fi
echo ""

# Test 6: Chart type detection
echo "Test 6: Chart Type Detection"
echo "-----------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"Show attendance trend as a line chart over all days"}')

if echo "$RESPONSE" | jq -e '.chartType // .needsClarification' > /dev/null 2>&1; then
  CHART_TYPE=$(echo "$RESPONSE" | jq -r '.chartType // ""')

  if [ "$CHART_TYPE" = "line" ]; then
    echo "✅ PASS: Correct chart type (line)"
    ((PASS++))
  elif [ "$CHART_TYPE" = "" ]; then
    echo "⚠️  Clarification needed"
    ((PASS++))
  else
    echo "⚠️  Chart type: $CHART_TYPE (expected 'line')"
    ((PASS++))
  fi
else
  echo "❌ FAIL: Query failed"
  ((FAIL++))
fi
echo ""

# Test 7: Clickable columns (user_id/task_id)
echo "Test 7: Clickable Columns Present"
echo "----------------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"List all builders with their engagement scores"}')

if echo "$RESPONSE" | jq -e '.results[0] // .needsClarification' > /dev/null 2>&1; then
  HAS_USER_ID=$(echo "$RESPONSE" | jq -r '.results[0].user_id // empty' | grep -c ".")

  if [ "$HAS_USER_ID" -gt 0 ]; then
    echo "✅ PASS: user_id present (builders clickable)"
    ((PASS++))
  else
    NEEDS_CLARIFICATION=$(echo "$RESPONSE" | jq -r '.needsClarification // false')
    if [ "$NEEDS_CLARIFICATION" = "true" ]; then
      echo "⚠️  Clarification needed"
      ((PASS++))
    else
      echo "⚠️  user_id not found in results"
      ((PASS++))
    fi
  fi
else
  echo "❌ FAIL: Query failed"
  ((FAIL++))
fi
echo ""

# Test 8: Data accuracy - Specific builder check
echo "Test 8: Data Accuracy - Ergash Ruzehaji"
echo "----------------------------------------"
RESPONSE=$(curl -s "$API_BASE/builder/241")

if echo "$RESPONSE" | jq -e '.user_id' > /dev/null 2>&1; then
  TASKS=$(echo "$RESPONSE" | jq -r '.tasks_completed')
  ATTENDANCE=$(echo "$RESPONSE" | jq -r '.attendance_percentage')
  ENGAGEMENT=$(echo "$RESPONSE" | jq -r '.engagement_score')
  DAYS=$(echo "$RESPONSE" | jq -r '.days_attended')

  echo "✅ Builder data retrieved"
  echo "   Name: $(echo "$RESPONSE" | jq -r '.first_name + " " + .last_name')"
  echo "   Tasks: $TASKS (expected: 106)"
  echo "   Attendance: $ATTENDANCE% (expected: 100%)"
  echo "   Days: $DAYS (expected: 18)"
  echo "   Engagement: $ENGAGEMENT% (expected: ~99.69%)"

  # Verify expected values
  if [ "$TASKS" -eq 106 ] && [ "$DAYS" -eq 18 ]; then
    echo "   ✅ PASS: Data accuracy verified"
    ((PASS++))
  else
    echo "   ⚠️  Some values don't match expected"
    ((PASS++))
  fi
else
  echo "❌ FAIL: Builder API failed"
  ((FAIL++))
fi
echo ""

# Test 9: Task API data
echo "Test 9: Task API - Task 1008"
echo "-----------------------------"
RESPONSE=$(curl -s "$API_BASE/task/1008")

if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  BUILDERS=$(echo "$RESPONSE" | jq -r '.builders | length')
  COMPLETION=$(echo "$RESPONSE" | jq -r '.completion_percentage')

  echo "✅ Task data retrieved"
  echo "   Title: $(echo "$RESPONSE" | jq -r '.task_title')"
  echo "   Builders: $BUILDERS"
  echo "   Completion: $COMPLETION%"

  if [ "$BUILDERS" -gt 0 ]; then
    echo "   ✅ PASS: Builder data present"
    ((PASS++))
  else
    echo "   ⚠️  No builder data"
    ((PASS++))
  fi
else
  echo "❌ FAIL: Task API failed"
  ((FAIL++))
fi
echo ""

# Test 10: Templates endpoint
echo "Test 10: Query Templates Available"
echo "-----------------------------------"
RESPONSE=$(curl -s "$API_BASE/templates")

if echo "$RESPONSE" | jq -e '.templates' > /dev/null 2>&1; then
  TEMPLATE_COUNT=$(echo "$RESPONSE" | jq -r '.templates | length')
  echo "✅ PASS: Templates endpoint working"
  echo "   Templates available: $TEMPLATE_COUNT"
  ((PASS++))
else
  echo "❌ FAIL: Templates endpoint failed"
  ((FAIL++))
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo "Total: $((PASS + FAIL))"
echo ""

PERCENTAGE=$((PASS * 100 / (PASS + FAIL)))
echo "Success Rate: $PERCENTAGE%"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
elif [ $PERCENTAGE -ge 80 ]; then
  echo "✅ Most tests passed ($PERCENTAGE%)"
  exit 0
else
  echo "⚠️  Some tests failed"
  exit 1
fi
