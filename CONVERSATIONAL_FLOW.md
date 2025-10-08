# Conversational AI Flow - How It Works

## Overview

Second Query AI uses a **conversational approach** where the AI asks at least one clarifying question before generating SQL queries. This ensures accurate results and helps users think through what they really want to see.

---

## How It Works

### Step 1: User Asks Initial Question

User types a question like:
- "how many builders are active"
- "show me task completion"
- "attendance data"
- "who are the top performers"

### Step 2: AI Asks for Clarification (ALWAYS on first query)

Instead of immediately generating SQL, the AI asks a clarifying question:

**Example 1:**
```
User: "how many builders are active"

AI: "I can help get that information for you! Would you like to see:
1) Just the total count of active builders,
2) Count broken down by weekly attendance status, or
3) Count with basic engagement metrics like task completion rates included?"
```

**Example 2:**
```
User: "show me task completion"

AI: "Would you like to see task completion:
1) By individual builder,
2) By task type, or
3) Overall completion rate with trends?"
```

### Step 3: User Provides More Context

User responds with their preference:
- "just the total count"
- "by individual builder"
- "overall completion rate"

### Step 4: AI Generates SQL and Runs Query

AI now generates the appropriate SQL query with:
- ✅ September 2025 cohort filter
- ✅ Excluded test user IDs
- ✅ Appropriate aggregations and filters

---

## Why This Approach?

### Benefits:

1. **Prevents Ambiguity**
   - "show me attendance" could mean today's snapshot, weekly trends, or individual records
   - Clarifying questions ensure users get exactly what they want

2. **Educates Users**
   - Users see what's possible with the data
   - Suggests dimensions they might not have considered

3. **Reduces Errors**
   - Less chance of generating incorrect SQL
   - Users confirm their intent before querying

4. **Better UX**
   - Feels like chatting with a data analyst
   - More engaging than a simple search box

---

## Technical Implementation

### Detection Logic

```typescript
const hasConversationHistory = conversationHistory && conversationHistory.length > 0;
const isFirstQuery = !hasConversationHistory;
```

**First Query** (no history):
- AI MUST ask a clarifying question
- Returns: `{ needsClarification: true, clarificationQuestion: "..." }`

**Follow-up** (has history):
- AI generates SQL query
- Returns: `{ needsClarification: false, sql: "...", results: [...] }`

### Prompt Engineering

The AI is explicitly instructed:
```
⚠️ IMPORTANT: This is the FIRST user query.
You MUST ask a clarifying question before generating SQL.
Suggest 2-3 specific options for what the user might want to see.
```

---

## Example Conversations

### Conversation 1: Active Builders Count

```
👤 User: "how many builders are active"

🤖 AI: "I can help get that information for you! Would you like to see:
       1) Just the total count of active builders,
       2) Count broken down by weekly attendance status, or
       3) Count with basic engagement metrics?"

👤 User: "just the total count"

🤖 AI: [Generates SQL and shows result: 75 active builders]
```

### Conversation 2: Task Completion Analysis

```
👤 User: "show me task completion"

🤖 AI: "Would you like to see task completion:
       1) By individual builder,
       2) By task type, or
       3) Overall completion rate with trends?"

👤 User: "by individual builder"

🤖 AI: [Generates SQL and shows bar chart of completion rates per builder]
```

### Conversation 3: Attendance Tracking

```
👤 User: "attendance data"

🤖 AI: "Would you like:
       1) Today's attendance snapshot,
       2) Weekly/monthly trends, or
       3) Individual builder attendance records?"

👤 User: "weekly trends"

🤖 AI: [Generates SQL and shows line chart of weekly attendance rates]
```

---

## Customization

### Adding New Clarification Patterns

Edit `lib/claude.ts` and add examples to the prompt:

```typescript
Examples of REQUIRED clarifying questions:
- "your query pattern" → Ask: "Suggestion 1, 2, or 3?"
```

### Disabling Clarifications (Not Recommended)

If you want to skip clarifications for specific query types, modify the `isFirstQuery` logic:

```typescript
const isFirstQuery = !hasConversationHistory && !question.includes("today");
```

This would skip clarification for queries containing "today".

---

## Testing

Test the conversational flow:

```bash
# Test initial query (should ask for clarification)
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"how many builders are active"}'

# Test follow-up (should generate SQL)
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"just the total count","conversationHistory":[...]}'
```

Expected behavior:
- ✅ First request returns `needsClarification: true`
- ✅ Second request returns SQL and results

---

## Future Enhancements

Potential improvements:
- [ ] Multi-turn conversations (ask multiple clarifying questions)
- [ ] Remember user preferences across sessions
- [ ] Suggest related queries after showing results
- [ ] Natural language explanations of SQL queries
- [ ] Voice input/output for hands-free querying
